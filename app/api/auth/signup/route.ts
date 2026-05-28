import { NextResponse, type NextRequest } from "next/server";
import { read, upsertItem } from "@/lib/db";
import { hashPassword } from "@/lib/passwords";
import { SESSION_COOKIE, SESSION_COOKIE_OPTIONS, signSession } from "@/lib/session";
import type { User, UserAddress } from "@/lib/types";

export const dynamic = "force-dynamic";

// Server-side account creation: persists the user (with a scrypt hash, never
// plaintext) and issues a session. Replaces the old localStorage-only signup.
export async function POST(req: NextRequest) {
  let body: {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    address?: UserAddress;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const phone = (body.phone ?? "").trim();
  const password = body.password ?? "";

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Fill name, email and password" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 },
    );
  }

  const users = await read("users");
  if (users.some((u) => u.email.toLowerCase() === email)) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const user: User = {
    name,
    email,
    phone,
    role: "customer",
    passwordHash: await hashPassword(password),
    createdAt: Date.now(),
    address: body.address,
  };
  await upsertItem("users", user);

  const safe = { ...user };
  delete safe.passwordHash;
  delete safe.password;

  const res = NextResponse.json({ ok: true, user: safe });
  const token = signSession({ email, role: "customer" });
  if (token) res.cookies.set(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);
  return res;
}
