import type { Referral } from "./types";

// Server-only: imported by lib/db.ts to seed storage on first read. Kept out of
// lib/data.ts on purpose — that module is pulled into the client bundle by
// lib/store.tsx, and referral codes are the storefront's business logic, not
// client-side content.

// Diwali 2026 referral codes, seeded on first read so the storefront ships with
// a working set. Two 5% codes and two 10% codes; everything else about them —
// the minimum order value a code needs, any cap on the rupees off, usage limits
// and the expiry — is left for the owner to set in Admin → Referrals rather than
// being decided here.
const DIWALI_2026_EXPIRY = new Date("2026-11-16T23:59:59+05:30").getTime();

export const DEFAULT_REFERRALS: Referral[] = [
  {
    id: "ref-infinityrohit5",
    code: "INFINITYROHIT5",
    display: "InfinityRohit5",
    label: "Rohit — Diwali 5%",
    type: "percent",
    value: 5,
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
    uses: 0,
    expiresAt: DIWALI_2026_EXPIRY,
    active: true,
    createdAt: 0,
  },
  {
    id: "ref-diwali5",
    code: "DIWALI5",
    display: "Diwali5",
    label: "Diwali 2026 — 5%",
    type: "percent",
    value: 5,
    uses: 0,
    expiresAt: DIWALI_2026_EXPIRY,
    active: true,
    createdAt: 0,
  },
  {
    id: "ref-diwali10",
    code: "DIWALI10",
    display: "Diwali10",
    label: "Diwali 2026 — 10%",
    type: "percent",
    value: 10,
    uses: 0,
    expiresAt: DIWALI_2026_EXPIRY,
    active: true,
    createdAt: 0,
  },
];
