import HeroSlider from "@/components/home/HeroSlider";
import TopStrip from "@/components/layout/TopStrip";
import SlidingRibbon from "@/components/home/SlidingRibbon";
import ProductsSection from "@/components/home/ProductsSection";
import {
  CATEGORY_CARDS,
  OCCASION_ITEMS,
  DEFAULT_PRODUCTS,
  FAQ_ITEMS,
} from "@/lib/data";
import { SITE_URL } from "@/lib/seo";

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

const productCatalogJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "@id": `${SITE_URL}/#product-catalog`,
  name: "Featured Crackers — A Mercury Crackers Bareilly",
  itemListElement: DEFAULT_PRODUCTS.filter((p) => p.featured).map((p, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "Product",
      name: p.name,
      sku: p.sku,
      category: p.cat,
      brand: { "@type": "Brand", name: p.brand ?? "A Mercury Crackers" },
      image: p.img,
      description: `${p.name} — ${p.cat} (${p.pack}) from A Mercury Crackers, Bareilly.`,
      offers: {
        "@type": "Offer",
        price: p.price,
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
        url: `${SITE_URL}/products`,
        priceValidUntil: "2026-12-31",
        seller: { "@type": "Organization", name: "A Mercury Crackers" },
      },
    },
  })),
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    {
      "@type": "ListItem",
      position: 2,
      name: "Products",
      item: `${SITE_URL}/products`,
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productCatalogJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
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
