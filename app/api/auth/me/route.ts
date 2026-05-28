import { NextResponse, type NextRequest } from "next/server";
import { read } from "@/lib/db";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

// Returns the signed-in user (from the httpOnly session cookie), the server's
// authoritative view of identity + role. Used by the client to rehydrate after
// a refresh instead of trusting localStorage.
export async function GET(req: NextRequest) {
  const session = getSession(req);
  if (!session) return NextResponse.json({ user: null });

  const users = await read("users");
  const u = users.find((x) => x.email.toLowerCase() === session.email.toLowerCase());
  if (!u) return NextResponse.json({ user: null });

  const safe = { ...u };
  delete safe.passwordHash;
  delete safe.password;
  return NextResponse.json({ user: safe });
}
