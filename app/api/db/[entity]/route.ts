import { NextResponse, type NextRequest } from "next/server";
import {
  isAtomized,
  isEntity,
  isListEntity,
  read,
  removeItem,
  upsertItem,
  write,
  type AtomizedEntity,
  type EntityKey,
} from "@/lib/db";
import { getSession } from "@/lib/session";
import { computeShipping } from "@/lib/shipping";
import type {
  AbandonedCart,
  B2BInquiry,
  CustomerEnquiry,
  Order,
  Subscriber,
  User,
} from "@/lib/types";

export const dynamic = "force-dynamic";

// Entities the public storefront is allowed to READ without an admin session.
const PUBLIC_READ: ReadonlySet<EntityKey> = new Set(["products", "company"]);

async function resolveEntity(
  ctx: RouteContext<"/api/db/[entity]">,
): Promise<EntityKey | null> {
  const { entity } = await ctx.params;
  return isEntity(entity) ? entity : null;
}

function stripSecrets<T>(entity: EntityKey, data: T): T {
  if (entity !== "users") return data;
  return (data as unknown as User[]).map((u) => {
    const safe = { ...u };
    delete safe.passwordHash;
    delete safe.password;
    return safe;
  }) as unknown as T;
}

export async function GET(req: NextRequest, ctx: RouteContext<"/api/db/[entity]">) {
  const entity = await resolveEntity(ctx);
  if (!entity) {
    return NextResponse.json({ error: "Unknown entity" }, { status: 404 });
  }
  if (!PUBLIC_READ.has(entity) && getSession(req)?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const data = await read(entity);
  return NextResponse.json(stripSecrets(entity, data));
}

// Whole-array overwrite — admin only. Customer writes go through POST.
export async function PUT(req: NextRequest, ctx: RouteContext<"/api/db/[entity]">) {
  const entity = await resolveEntity(ctx);
  if (!entity) {
    return NextResponse.json({ error: "Unknown entity" }, { status: 404 });
  }
  if (getSession(req)?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (isListEntity(entity)) {
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Expected an array" }, { status: 400 });
    }
    await write(entity, body as never);
  } else {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Expected an object" }, { status: 400 });
    }
    await write(entity, body as never);
  }
  return NextResponse.json({ ok: true });
}

// Append a single customer-generated record. Public for orders/subscribers/
// enquiries/b2b; abandonedCarts requires a session (keyed to the signed-in user).
export async function POST(req: NextRequest, ctx: RouteContext<"/api/db/[entity]">) {
  const entity = await resolveEntity(ctx);
  if (!entity) {
    return NextResponse.json({ error: "Unknown entity" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Expected an object" }, { status: 400 });
  }

  if (entity === "orders") return appendOrder(body as Partial<Order>);
  if (entity === "subscribers") return appendSubscriber(body as Partial<Subscriber>);
  if (entity === "customerEnquiries")
    return appendEnquiry(body as Partial<CustomerEnquiry>);
  if (entity === "b2bInquiries") return appendB2B(body as Partial<B2BInquiry>);
  if (entity === "abandonedCarts") return upsertAbandoned(req, body as Partial<AbandonedCart>);

  return NextResponse.json({ error: "Not appendable" }, { status: 405 });
}

// Atomic single-record update — admin only. Used by the admin editors for
// status changes / edits so they no longer rewrite the whole collection.
export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/db/[entity]">) {
  const entity = await resolveEntity(ctx);
  if (!entity) {
    return NextResponse.json({ error: "Unknown entity" }, { status: 404 });
  }
  if (getSession(req)?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!isAtomized(entity)) {
    return NextResponse.json({ error: "Not patchable" }, { status: 405 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Expected an object" }, { status: 400 });
  }

  const key = entity === "users" ? "email" : "id";
  if (!(body as Record<string, unknown>)[key]) {
    return NextResponse.json({ error: `Record missing ${key}` }, { status: 400 });
  }

  await upsertItem(entity as AtomizedEntity, body as never);
  return NextResponse.json({ ok: true });
}

// Atomic single-record delete — admin only. id from `?id=`.
export async function DELETE(req: NextRequest, ctx: RouteContext<"/api/db/[entity]">) {
  const entity = await resolveEntity(ctx);
  if (!entity) {
    return NextResponse.json({ error: "Unknown entity" }, { status: 404 });
  }
  if (getSession(req)?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!isAtomized(entity)) {
    return NextResponse.json({ error: "Not deletable" }, { status: 405 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  await removeItem(entity as AtomizedEntity, id);
  return NextResponse.json({ ok: true });
}

// Recompute prices/totals from server products so a tampered client can't
// set its own prices. Fixes the lost-update / price-tampering hole.
async function appendOrder(input: Partial<Order>) {
  if (!input.id || !Array.isArray(input.items) || input.items.length === 0) {
    return NextResponse.json({ error: "Invalid order" }, { status: 400 });
  }
  const [products, company] = await Promise.all([
    read("products"),
    read("company"),
  ]);
  const byId = new Map(products.map((p) => [p.id, p]));

  let subtotal = 0;
  let items: Order["items"];
  try {
    items = input.items.map((line) => {
    // Numeric ids map to catalogue products and must match the server price.
    if (typeof line.id === "number") {
      const p = byId.get(line.id);
      if (!p) throw badLine(`Unknown product ${line.id}`);
      if (p.stock === false || p.stock === 0) throw badLine(`${p.name} is out of stock`);
      const qty = Math.max(1, Math.floor(Number(line.qty) || 0));
      subtotal += p.price * qty;
      return { id: p.id, name: p.name, qty, price: p.price, img: p.img };
    }
    // Bundle lines (string id) aren't in the catalogue; trust the provided price
    // but coerce qty/price to safe numbers.
    const qty = Math.max(1, Math.floor(Number(line.qty) || 0));
    const price = Math.max(0, Number(line.price) || 0);
    subtotal += price * qty;
    return {
      id: String(line.id),
      name: String(line.name ?? "Item"),
      qty,
      price,
      img: line.img,
      bundleItems: line.bundleItems,
    };
    });
  } catch (err) {
    if (err instanceof LineError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }

  const shipping = computeShipping(subtotal, company.shippingTiers);
  const order: Order = {
    id: String(input.id),
    txnId: String(input.txnId ?? ""),
    items,
    subtotal,
    shipping,
    total: subtotal + shipping,
    customer: {
      name: String(input.customer?.name ?? ""),
      email: String(input.customer?.email ?? ""),
      phone: input.customer?.phone,
      address: input.customer?.address,
    },
    status: "pending",
    paidVia: String(input.paidVia ?? ""),
    createdAt: Date.now(),
  };
  await upsertItem("orders", order);
  return NextResponse.json({ ok: true, record: order });
}

class LineError extends Error {}
function badLine(msg: string) {
  return new LineError(msg);
}

async function appendSubscriber(input: Partial<Subscriber>) {
  const channel = input.channel === "phone" ? "phone" : input.channel === "email" ? "email" : null;
  if (!channel || typeof input.value !== "string") {
    return NextResponse.json({ error: "Invalid subscriber" }, { status: 400 });
  }
  const value =
    channel === "phone" ? input.value.replace(/\D/g, "") : input.value.trim().toLowerCase();
  if (!value) return NextResponse.json({ error: "Invalid subscriber" }, { status: 400 });

  const list = await read("subscribers");
  const existing = list.find((s) => s.channel === channel && s.value === value);
  if (existing) return NextResponse.json({ ok: true, record: existing });

  const record: Subscriber = {
    id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    channel,
    value,
    createdAt: Date.now(),
  };
  await upsertItem("subscribers", record);
  return NextResponse.json({ ok: true, record });
}

async function appendEnquiry(input: Partial<CustomerEnquiry>) {
  if (typeof input.question !== "string" || !input.question.trim()) {
    return NextResponse.json({ error: "Invalid enquiry" }, { status: 400 });
  }
  const record: CustomerEnquiry = {
    id: `enq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    question: input.question.trim(),
    reply: typeof input.reply === "string" ? input.reply : "",
    name: input.name,
    email: input.email,
    phone: input.phone,
    status: "new",
    createdAt: Date.now(),
  };
  await upsertItem("customerEnquiries", record);
  return NextResponse.json({ ok: true, record });
}

async function appendB2B(input: Partial<B2BInquiry>) {
  if (typeof input.name !== "string" || typeof input.phone !== "string") {
    return NextResponse.json({ error: "Invalid inquiry" }, { status: 400 });
  }
  const record: B2BInquiry = {
    id: `b2b_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: input.name,
    phone: input.phone,
    email: input.email,
    businessName: String(input.businessName ?? ""),
    businessType: String(input.businessType ?? ""),
    gstin: input.gstin,
    city: String(input.city ?? ""),
    qty: String(input.qty ?? ""),
    interest: String(input.interest ?? ""),
    message: String(input.message ?? ""),
    status: "pending",
    createdAt: Date.now(),
  };
  await upsertItem("b2bInquiries", record);
  return NextResponse.json({ ok: true, record });
}

// Snapshot of a signed-in customer's live cart, keyed by their session email so
// the client can't impersonate another customer or overwrite arbitrary records.
async function upsertAbandoned(req: NextRequest, input: Partial<AbandonedCart>) {
  const session = getSession(req);
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const id = `cart_${session.email.toLowerCase()}`;
  const list = await read("abandonedCarts");
  const existing = list.find((a) => a.id === id);

  // A status update (e.g. "recovered") may arrive with no items; preserve the
  // snapshot in that case.
  const items = Array.isArray(input.items) ? input.items : existing?.items ?? [];
  const status: AbandonedCart["status"] =
    input.status === "recovered" || input.status === "dismissed"
      ? input.status
      : existing?.status && existing.status !== "active"
        ? existing.status
        : "active";

  const record: AbandonedCart = {
    id,
    customer: existing?.customer ?? input.customer ?? { email: session.email },
    items,
    total:
      typeof input.total === "number"
        ? input.total
        : items.reduce((s, i) => s + i.price * i.qty, 0),
    status,
    recoveredOrderId: input.recoveredOrderId ?? existing?.recoveredOrderId,
    createdAt: existing?.createdAt ?? Date.now(),
    updatedAt: Date.now(),
  };
  await upsertItem("abandonedCarts", record);
  return NextResponse.json({ ok: true, record });
}
