import { NextResponse, type NextRequest } from "next/server";
import { read } from "@/lib/db";
import {
  CODE_MAX_LENGTH,
  checkReferral,
  findReferral,
  normalizeCode,
} from "@/lib/referrals";

export const dynamic = "force-dynamic";

// Public: checks one referral code a customer typed, and returns the discount it
// would give this cart. Deliberately POST-only and single-code — the referral
// collection itself is admin-only (/api/db/referrals), so nobody can enumerate
// codes through here. The discount returned is informational: order creation
// recomputes it server-side from the same helper, so a tampered client can't
// pay less than the code allows.
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Expected an object" }, { status: 400 });
  }

  const raw = (body as { code?: unknown }).code;
  if (typeof raw !== "string" || raw.length > CODE_MAX_LENGTH * 4) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }
  const code = normalizeCode(raw);
  if (!code) {
    return NextResponse.json(
      { ok: false, reason: "empty", message: "Enter a referral code.", discount: 0 },
      { status: 200 },
    );
  }

  const subtotalInput = Number((body as { subtotal?: unknown }).subtotal);
  const subtotal = Number.isFinite(subtotalInput) ? Math.max(0, subtotalInput) : 0;

  const referrals = await read("referrals");
  const result = checkReferral(findReferral(referrals, code), subtotal);

  // Always 200: "this code doesn't apply" is a normal answer, not a transport error.
  return NextResponse.json(result);
}
