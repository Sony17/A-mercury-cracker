import { NextResponse, type NextRequest } from "next/server";
import { read, upsertItem } from "@/lib/db";
import { getSession } from "@/lib/session";
import type { UserAddress } from "@/lib/types";

export const dynamic = "force-dynamic";

// Update only the signed-in user's own profile fields. Email, role and password
// can never be changed here (email/role are identity; password has its own route).
export async function PATCH(req: NextRequest) {
  const session = getSession(req);
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: { name?: string; phone?: string; address?: UserAddress };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const users = await read("users");
  const idx = users.findIndex(
    (u) => u.email.toLowerCase() === session.email.toLowerCase(),
  );
  if (idx < 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const u = users[idx];
  if (typeof body.name === "string" && body.name.trim()) u.name = body.name.trim();
  if (typeof body.phone === "string") u.phone = body.phone.trim();
  if (body.address && typeof body.address === "object") {
    u.address = {
      line1: String(body.address.line1 ?? ""),
      line2: body.address.line2 ? String(body.address.line2) : "",
      city: String(body.address.city ?? ""),
      state: String(body.address.state ?? ""),
      pincode: String(body.address.pincode ?? ""),
    };
  }
  await upsertItem("users", u);

  const safe = { ...u };
  delete safe.passwordHash;
  delete safe.password;
  return NextResponse.json({ ok: true, user: safe });
}
