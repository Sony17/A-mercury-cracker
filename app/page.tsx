import HeroSlider from "@/components/home/HeroSlider";
import TopStrip from "@/components/layout/TopStrip";
import SlidingRibbon from "@/components/home/SlidingRibbon";
import ProductsSection from "@/components/home/ProductsSection";
import { CATEGORY_CARDS, OCCASION_ITEMS } from "@/lib/data";

const BRAND_ITEMS = [
  { label: "A Mercury Crackers", img: "/Amercury.jpeg" },
  { label: "Ajanta Fireworks", img: "/Ajanta.png" },
  { label: "Vanitha", img: "/Vabitha.png" },
  { label: "Sony", img: "/Sony.png" },
  { label: "Elephant", img: "/elephant.png" },
  { label: "LIMA", img: "/LIMA.png" },
  { label: "Ayyan Fireworks", img: "/Ayyan.png" },
  { label: "Standard", img: "/peacock.png" },
  { label: "Cock Brand", img: "/cock.png" },
  { label: "LIYA", img: "/Liya.png" },
  { label: "Ananda's", img: "/Anandas.png" },
  { label: "Cornation", img: "/Cornation.png" },
].map(({ label, img }) => ({
  label,
  href: `/products?brand=${encodeURIComponent(label)}`,
  img,
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
      <SlidingRibbon title="Shop by Brand" items={BRAND_ITEMS} direction="left" logoOnly />
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
