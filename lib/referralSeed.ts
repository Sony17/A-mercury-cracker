import type { Referral } from "./types";

// Server-only: imported by lib/db.ts to seed storage on first read. Kept out of
// lib/data.ts on purpose — that module is pulled into the client bundle by
// lib/store.tsx, and referral codes are the storefront's business logic, not
// client-side content.
// Diwali 2026 referral codes, seeded on first read so the storefront ships with
// a working set. All four are admin-editable (Admin → Referrals) — including the
// expiry below, which is set just past Diwali (8 Nov 2026).
const DIWALI_2026_EXPIRY = new Date("2026-11-16T23:59:59+05:30").getTime();

export const DEFAULT_REFERRALS: Referral[] = [
  {
    id: "ref-infinityrohit5",
    code: "INFINITYROHIT5",
    display: "InfinityRohit5",
    label: "Rohit — Diwali 5%",
    type: "percent",
    value: 5,
    minSubtotal: 500,
    maxDiscount: 500,
    uses: 0,
    expiresAt: DIWALI_2026_EXPIRY,
    active: true,
    createdAt: 0,
  },
  {
    id: "ref-infinityrohit10",
    code: "INFINITYROHIT10",
    display: "InfinityRohit10",
    label: "Rohit — Diwali 10%",
    type: "percent",
    value: 10,
    minSubtotal: 1500,
    maxDiscount: 1000,
    uses: 0,
    expiresAt: DIWALI_2026_EXPIRY,
    active: true,
    createdAt: 0,
  },
  {
    id: "ref-infinityrohit15",
    code: "INFINITYROHIT15",
    display: "InfinityRohit15",
    label: "Rohit — Diwali 15%",
    type: "percent",
    value: 15,
    minSubtotal: 3000,
    maxDiscount: 2000,
    uses: 0,
    expiresAt: DIWALI_2026_EXPIRY,
    active: true,
    createdAt: 0,
  },
  {
    id: "ref-infinityrohit20",
    code: "INFINITYROHIT20",
    display: "InfinityRohit20",
    label: "Rohit — Diwali 20%",
    type: "percent",
    value: 20,
    minSubtotal: 5000,
    maxDiscount: 3000,
    uses: 0,
    expiresAt: DIWALI_2026_EXPIRY,
    active: true,
    createdAt: 0,
  },
];
