import { NextResponse, type NextRequest } from "next/server";
import { read, write } from "@/lib/db";
import { genResetId } from "@/lib/passwords";
import type { ResetRequest } from "@/lib/types";

export const dynamic = "force-dynamic";

// Pending requests older than this are treated as stale and replaced when the
// same email submits a new one — keeps the admin queue from filling with dupes.
const STALE_MS = 1000 * 60 * 60 * 24 * 14;

export async function POST(req: NextRequest) {
  let body: { email?: string; phone?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const phone = (body.phone ?? "").trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  }
  if (!/^\d{10}$/.test(phone)) {
    return NextResponse.json(
      { error: "Enter a valid 10-digit phone number" },
      { status: 400 },
    );
  }

  const requests = await read("resetRequests");

  const now = Date.now();
  const existing = requests.find(
    (r) =>
      r.email.toLowerCase() === email &&
      r.status === "pending" &&
      now - r.requestedAt < STALE_MS,
  );
  if (existing) {
    // Keep the older request; just refresh its phone in case it changed.
    if (existing.phone !== phone) {
      existing.phone = phone;
      await write("resetRequests", requests);
    }
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const fresh: ResetRequest = {
    id: genResetId(),
    email,
    phone,
    requestedAt: now,
    status: "pending",
  };
  requests.push(fresh);
  await write("resetRequests", requests);

  return NextResponse.json({ ok: true });
}
