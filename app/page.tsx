import HeroSlider from "@/components/home/HeroSlider";
import TopStrip from "@/components/layout/TopStrip";
import SlidingRibbon from "@/components/home/SlidingRibbon";
import ProductsSection from "@/components/home/ProductsSection";
import { CATEGORY_CARDS, OCCASION_ITEMS, PIC } from "@/lib/data";

const BRAND_PHOTOS = [PIC.p1, PIC.p2, PIC.p3, PIC.p4, PIC.p5, PIC.p6, PIC.p7, PIC.p8, PIC.p9, PIC.p1];
const BRAND_ITEMS = [
  "Mercury Ignite",
  "Sivakasi Royale",
  "Standard Fire",
  "Cock Brand",
  "Sony Crackers",
  "Wunderbar",
  "Ajanta Fireworks",
  "Vinayaga Sparks",
  "Lakshmi Crackers",
  "Coronation",
].map((label, i) => ({
  label,
  href: `/products?brand=${encodeURIComponent(label)}`,
  img: BRAND_PHOTOS[i],
}));

const OCCASION_RIBBON = OCCASION_ITEMS.map((o) => ({
  label: o.n,
  href: `/products?occasion=${encodeURIComponent(o.n)}`,
  icon: o.ic,
}));

const CATEGORY_RIBBON = CATEGORY_CARDS.map((c) => ({
  label: c.n,
  href: `/products?category=${encodeURIComponent(c.n)}`,
  img: c.img,
}));

import BundlesSection from "@/components/home/BundlesSection";
import AboutSection from "@/components/home/AboutSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import InstagramSection from "@/components/home/InstagramSection";
import SafetySection from "@/components/home/SafetySection";
import NewsletterSection from "@/components/home/NewsletterSection";
import ContactSection from "@/components/home/ContactSection";

export default function HomePage() {
  return (
    <>
      <HeroSlider />
      <TopStrip />
      <SlidingRibbon title="Shop by Brand" items={BRAND_ITEMS} direction="left" />
      <SlidingRibbon title="Shop by Occasion" items={OCCASION_RIBBON} direction="right" />
      <SlidingRibbon title="Shop by Category" items={CATEGORY_RIBBON} direction="left" />
      <ProductsSection />
      <BundlesSection />
      <AboutSection />
      <TestimonialsSection />
      <InstagramSection />
      <SafetySection />
      <NewsletterSection />
      <ContactSection />
    </>
  );
}
