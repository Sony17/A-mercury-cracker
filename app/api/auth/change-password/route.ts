import { NextResponse, type NextRequest } from "next/server";
import { read, write } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/passwords";

export const dynamic = "force-dynamic";

// Used both for a normal "change my password" action and to clear the
// mustChangePassword flag after a temp-password login. The caller proves
// identity by sending the current (or temp) password.
export async function POST(req: NextRequest) {
  let body: {
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const current = body.currentPassword ?? "";
  const next = body.newPassword ?? "";

  if (!email || !current || !next) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (next.length < 6) {
    return NextResponse.json(
      { error: "New password must be at least 6 characters" },
      { status: 400 },
    );
  }
  if (next === current) {
    return NextResponse.json(
      { error: "New password must differ from current password" },
      { status: 400 },
    );
  }

  const users = await read("users");
  const idx = users.findIndex((u) => u.email.toLowerCase() === email);
  if (idx < 0) {
    return NextResponse.json({ error: "INVALID" }, { status: 401 });
  }
  const u = users[idx];

  let ok = false;
  if (u.passwordHash) {
    ok = await verifyPassword(current, u.passwordHash);
  } else if (u.password) {
    ok = u.password === current;
  }
  if (!ok) {
    return NextResponse.json({ error: "INVALID" }, { status: 401 });
  }

  const updated = {
    ...u,
    passwordHash: await hashPassword(next),
    mustChangePassword: false,
  };
  delete updated.password;
  users[idx] = updated;
  await write("users", users);

  const safe = { ...users[idx] };
  delete safe.passwordHash;
  delete safe.password;
  return NextResponse.json({ ok: true, user: safe });
}
