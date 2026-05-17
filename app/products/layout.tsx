import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Buy Crackers Online — Sparklers, Chakkars, Rockets, Gift Boxes | Bareilly",
  description:
    "Shop A Mercury Crackers' full range — sparklers, chakkars, flower pots, rockets, bombs, aerial shots and gift boxes. 70% off MRP, child-safe quality, free delivery above ₹3000. Bareilly's trusted fancy crackers store, delivering all over India.",
  alternates: { canonical: "/products" },
  openGraph: {
    title: "Buy Fancy Crackers Online — A Mercury Crackers Bareilly",
    description:
      "Sparklers, chakkars, flower pots, rockets, gift boxes — wholesale rates from Bareilly's premium crackers store.",
    url: "/products",
    type: "website",
  },
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
