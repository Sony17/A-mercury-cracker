"use client";

import { useStore } from "@/lib/store";
import SlidingRibbon from "./SlidingRibbon";

export default function BrandsRibbon() {
  const { company } = useStore();
  const brands = company.brands ?? [];
  if (!brands.length) return null;

  const items = brands.map((b) => ({
    label: b.label,
    img: b.img,
    href: `/products?brand=${encodeURIComponent(b.label)}`,
  }));

  return <SlidingRibbon title="Shop by Brand" items={items} direction="left" logoOnly tone="brand" />;
}
