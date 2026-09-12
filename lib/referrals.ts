import type { Referral, ReferralType } from "./types";

export const CODE_MAX_LENGTH = 32;

// Codes are matched case-insensitively and without whitespace so "infinityrohit5",
// "InfinityRohit5" and " INFINITY ROHIT 5 " all resolve to the same record. The
// normalised form is what gets stored on the order.
export function normalizeCode(code: string): string {
  return code.replace(/\s+/g, "").toUpperCase().slice(0, CODE_MAX_LENGTH);
}

// What a customer may learn about a code — enough for the cart to recompute the
// discount as items change, and nothing about other codes or redemption counts.
export interface PublicReferral {
  code: string;
  display: string;
  label?: string;
  type: ReferralType;
  value: number;
  minSubtotal?: number;
  maxDiscount?: number;
}

export function publicReferral(r: Referral): PublicReferral {
  return {
    code: r.code,
    display: r.display || r.code,
    label: r.label,
    type: r.type,
    value: r.value,
    minSubtotal: r.minSubtotal,
    maxDiscount: r.maxDiscount,
  };
}

// Rupees off a given subtotal. Rounded to whole rupees, capped by maxDiscount,
// and never more than the subtotal itself (a code can't make an order negative).
export function computeDiscount(
  subtotal: number,
  r: Pick<PublicReferral, "type" | "value" | "maxDiscount">,
): number {
  if (!(subtotal > 0)) return 0;
  const value = Math.max(0, Number(r.value) || 0);
  const raw = r.type === "percent" ? (subtotal * value) / 100 : value;
  let discount = Math.round(raw);
  if (r.maxDiscount && r.maxDiscount > 0) discount = Math.min(discount, r.maxDiscount);
  return Math.max(0, Math.min(discount, subtotal));
}

export type ReferralState = "active" | "inactive" | "expired" | "exhausted";

export function referralState(r: Referral, now: number = Date.now()): ReferralState {
  if (!r.active) return "inactive";
  if (r.expiresAt && r.expiresAt < now) return "expired";
  if (r.maxUses && r.maxUses > 0 && (r.uses || 0) >= r.maxUses) return "exhausted";
  return "active";
}

// null = unlimited.
export function remainingUses(r: Referral): number | null {
  if (!r.maxUses || r.maxUses <= 0) return null;
  return Math.max(0, r.maxUses - (r.uses || 0));
}

export function findReferral(list: Referral[], code: string): Referral | undefined {
  const wanted = normalizeCode(code);
  if (!wanted) return undefined;
  return list.find((r) => r != null && normalizeCode(r.code) === wanted);
}

export type RejectReason =
  | "empty"
  | "unknown"
  | "inactive"
  | "expired"
  | "exhausted"
  | "min-subtotal";

export interface ReferralCheck {
  ok: boolean;
  discount: number;
  reason?: RejectReason;
  message?: string;
  referral?: PublicReferral;
}

// Single source of truth for "may this cart use this code, and for how much" —
// used by the public validate endpoint, by order creation (authoritative), and
// indirectly by the cart, so the price a customer sees is the price they get.
export function checkReferral(
  referral: Referral | undefined,
  subtotal: number,
  now: number = Date.now(),
): ReferralCheck {
  if (!referral) {
    return { ok: false, discount: 0, reason: "unknown", message: "That code isn't valid." };
  }
  const state = referralState(referral, now);
  if (state === "inactive") {
    return {
      ok: false,
      discount: 0,
      reason: "inactive",
      message: "That code is no longer active.",
    };
  }
  if (state === "expired") {
    return { ok: false, discount: 0, reason: "expired", message: "That code has expired." };
  }
  if (state === "exhausted") {
    return {
      ok: false,
      discount: 0,
      reason: "exhausted",
      message: "That code has been fully redeemed.",
    };
  }
  const min = referral.minSubtotal && referral.minSubtotal > 0 ? referral.minSubtotal : 0;
  if (min > 0 && subtotal < min) {
    return {
      ok: false,
      discount: 0,
      reason: "min-subtotal",
      message: `Add ₹${(min - subtotal).toLocaleString("en-IN")} more to use this code (min order ₹${min.toLocaleString("en-IN")}).`,
      referral: publicReferral(referral),
    };
  }
  return {
    ok: true,
    discount: computeDiscount(subtotal, referral),
    referral: publicReferral(referral),
  };
}

// Short human label for the discount itself, e.g. "10% off" / "₹250 off".
export function describeDiscount(
  r: Pick<PublicReferral, "type" | "value" | "maxDiscount">,
): string {
  const base =
    r.type === "percent"
      ? `${r.value}% off`
      : `₹${Math.max(0, r.value).toLocaleString("en-IN")} off`;
  if (r.type === "percent" && r.maxDiscount && r.maxDiscount > 0) {
    return `${base} (up to ₹${r.maxDiscount.toLocaleString("en-IN")})`;
  }
  return base;
}

// A code the customer already applied, re-measured against the live cart. Used
// by the cart so editing quantities updates the discount (and warns when the
// cart slips back under the code's minimum) without another round trip.
export function cartDiscount(
  r: PublicReferral | null | undefined,
  subtotal: number,
): { discount: number; shortfall: number } {
  if (!r) return { discount: 0, shortfall: 0 };
  const min = r.minSubtotal && r.minSubtotal > 0 ? r.minSubtotal : 0;
  if (min > 0 && subtotal < min) return { discount: 0, shortfall: min - subtotal };
  return { discount: computeDiscount(subtotal, r), shortfall: 0 };
}
