import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Wholesale & B2B Crackers — Bulk Orders, Retailer Pricing | A Mercury Crackers",
  description:
    "Wholesale crackers and fireworks for retailers, distributors and event planners across India. Tier pricing for bulk orders, sample kits, MOQ tables and printed price lists. Owner S.K Agarwal, established 1994.",
  alternates: { canonical: "/b2b" },
  openGraph: {
    title: "Wholesale Crackers — B2B Bulk Orders | A Mercury Crackers Bareilly",
    description:
      "Tier pricing for retailers and distributors. Sample kits and bulk fireworks orders shipped all over India.",
    url: "/b2b",
    type: "website",
  },
};

export default function B2BLayout({ children }: { children: React.ReactNode }) {
  return children;
}
