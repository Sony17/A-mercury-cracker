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

// Subtotal a customer must reach for shipping to become *and stay* free, so the
// "spend X more for free shipping" nudge never over-promises. Returns null when
// no such point exists — e.g. an open-ended top band that still charges, or a
// free band sandwiched between paid ones (free isn't guaranteed for larger
// orders, so there's nothing honest to nudge toward).
export function freeShippingThreshold(tiers: ShippingTier[] | undefined): number | null {
  if (!tiers?.length) return null;
  const sorted = sortTiers(tiers);
  const top = sorted[sorted.length - 1];
  // Free must hold for arbitrarily large orders, i.e. the open-ended band is free.
  if (top.upTo !== null || (top.fee || 0) > 0) return null;
  // Scan down from the top: the threshold is the upper bound of the highest
  // paid band (where the contiguous free range begins). All free → free from 0.
  for (let i = sorted.length - 1; i >= 0; i--) {
    if ((sorted[i].fee || 0) > 0) return sorted[i].upTo ?? 0;
  }
  return 0;
}
