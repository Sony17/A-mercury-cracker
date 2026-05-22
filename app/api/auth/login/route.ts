import { NextResponse, type NextRequest } from "next/server";
import { read, write } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/passwords";

export const dynamic = "force-dynamic";

// Server-side credential check. Used by the AuthModal to verify against the
// server users entity (which is the only source of truth for temp/reset
// passwords). Legacy plaintext passwords in the server list are accepted once
// and upgraded to a scrypt hash in place.
export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  if (!email || !password) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }

  const users = await read("users");
  const idx = users.findIndex((u) => u.email.toLowerCase() === email);
  if (idx < 0) {
    return NextResponse.json({ error: "INVALID" }, { status: 401 });
  }
  const u = users[idx];

  let ok = false;
  if (u.passwordHash) {
    ok = await verifyPassword(password, u.passwordHash);
  } else if (u.password) {
    // Legacy plaintext path: accept once, upgrade in place.
    ok = u.password === password;
    if (ok) {
      const upgraded = { ...u, passwordHash: await hashPassword(password) };
      delete upgraded.password;
      users[idx] = upgraded;
      await write("users", users);
    }
  }

  if (!ok) {
    return NextResponse.json({ error: "INVALID" }, { status: 401 });
  }

  // Never leak the stored hash back to the client.
  const safe = { ...users[idx] };
  delete safe.passwordHash;
  delete safe.password;
  return NextResponse.json({ ok: true, user: safe });
}
