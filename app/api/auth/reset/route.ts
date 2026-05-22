import { NextResponse, type NextRequest } from "next/server";
import { read, write } from "@/lib/db";
import { generateTempPassword, hashPassword } from "@/lib/passwords";
import type { User } from "@/lib/types";

export const dynamic = "force-dynamic";

// Admin-only action: approve a reset request and issue a temp password.
// The temp password is returned ONCE so the admin can read it to the customer
// over the phone — it is not stored in plaintext anywhere.
//
// Auth posture matches the rest of /api: open by network, gated by the admin
// shell (only the admin UI calls this). If we ever add real sessions, gate
// this on role === "admin".
export async function POST(req: NextRequest) {
  let body: { requestId?: string; action?: "approve" | "reject"; note?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const requestId = (body.requestId ?? "").trim();
  const action = body.action ?? "approve";
  if (!requestId) {
    return NextResponse.json({ error: "Missing requestId" }, { status: 400 });
  }

  const requests = await read("resetRequests");
  const idx = requests.findIndex((r) => r.id === requestId);
  if (idx < 0) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }
  const reqRow = requests[idx];
  if (reqRow.status !== "pending") {
    return NextResponse.json(
      { error: `Request already ${reqRow.status}` },
      { status: 409 },
    );
  }

  const now = Date.now();

  if (action === "reject") {
    requests[idx] = {
      ...reqRow,
      status: "rejected",
      resolvedAt: now,
      note: body.note?.trim() || undefined,
    };
    await write("resetRequests", requests);
    return NextResponse.json({ ok: true });
  }

  // Approve: generate temp, hash it, attach to the user (creating a stub if
  // they're not yet in the server users list).
  const temp = generateTempPassword(10);
  const hash = await hashPassword(temp);

  const users = await read("users");
  const uIdx = users.findIndex(
    (u) => u.email.toLowerCase() === reqRow.email.toLowerCase(),
  );

  if (uIdx >= 0) {
    const existing = users[uIdx];
    users[uIdx] = {
      ...existing,
      passwordHash: hash,
      mustChangePassword: true,
      // Clear any legacy plaintext password so it can't be used to log in.
      password: undefined,
      // Backfill phone from the recovery request if missing.
      phone: existing.phone || reqRow.phone,
    };
  } else {
    const stub: User = {
      name: reqRow.email.split("@")[0],
      email: reqRow.email,
      phone: reqRow.phone,
      passwordHash: hash,
      mustChangePassword: true,
      role: "customer",
      createdAt: now,
    };
    users.push(stub);
  }
  await write("users", users);

  requests[idx] = {
    ...reqRow,
    status: "completed",
    resolvedAt: now,
    note: body.note?.trim() || undefined,
  };
  await write("resetRequests", requests);

  return NextResponse.json({ ok: true, tempPassword: temp });
}
