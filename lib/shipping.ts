import type { ShippingTier } from "./types";

// Open-ended (upTo === null) bands always sort last; finite bounds ascending.
function sortTiers(tiers: ShippingTier[]): ShippingTier[] {
  return [...tiers].sort((a, b) => {
    if (a.upTo === null) return 1;
    if (b.upTo === null) return -1;
    return a.upTo - b.upTo;
  });
}

// Shipping fee for a cart subtotal. 0 = free. No tiers configured = free.
export function computeShipping(subtotal: number, tiers: ShippingTier[] | undefined): number {
  if (!tiers?.length) return 0;
  for (const t of sortTiers(tiers)) {
    if (t.upTo === null || subtotal < t.upTo) return Math.max(0, t.fee || 0);
  }
  return 0;
}

// Plain-language rate bands for showing customers the full shipping schedule.
export function describeTiers(
  tiers: ShippingTier[] | undefined
): { id: string; range: string; fee: number }[] {
  if (!tiers?.length) return [];
  const sorted = sortTiers(tiers);
  return sorted.map((t, idx) => {
    const lower = idx === 0 ? 0 : sorted[idx - 1].upTo ?? 0;
    let range: string;
    if (t.upTo === null) {
      range = lower > 0 ? `₹${lower.toLocaleString("en-IN")} & above` : "All orders";
    } else if (lower === 0) {
      range = `Under ₹${t.upTo.toLocaleString("en-IN")}`;
    } else {
      range = `₹${lower.toLocaleString("en-IN")} – under ₹${t.upTo.toLocaleString("en-IN")}`;
    }
    return { id: t.id, range, fee: Math.max(0, t.fee || 0) };
  });
}

// Subtotal a customer must reach for shipping to become free.
// null = no free band exists (so there's nothing to nudge toward).
export function freeShippingThreshold(tiers: ShippingTier[] | undefined): number | null {
  if (!tiers?.length) return null;
  let prevBound = 0;
  for (const t of sortTiers(tiers)) {
    if ((t.fee || 0) <= 0) return prevBound;
    if (t.upTo === null) return null;
    prevBound = t.upTo;
  }
  return null;
}
