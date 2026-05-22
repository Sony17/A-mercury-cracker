import HeroSlider from "@/components/home/HeroSlider";
import DiwaliFx from "@/components/ui/DiwaliFx";
import TopStrip from "@/components/layout/TopStrip";
import SlidingRibbon from "@/components/home/SlidingRibbon";
import ProductsSection from "@/components/home/ProductsSection";
import {
  DEFAULT_CONTENT,
  DEFAULT_PRODUCTS,
  FAQ_ITEMS,
} from "@/lib/data";
import { SITE_URL } from "@/lib/seo";
import { read } from "@/lib/db";
import BundlesSection from "@/components/home/BundlesSection";
import AboutSection from "@/components/home/AboutSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import InstagramSection from "@/components/home/InstagramSection";
import SafetySection from "@/components/home/SafetySection";
import NewsletterSection from "@/components/home/NewsletterSection";
import ContactSection from "@/components/home/ContactSection";

export const dynamic = "force-dynamic";

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

export default async function HomePage() {
  const company = await read("company");
  const CATEGORY_RIBBON = (company.categories ?? []).map((c) => ({
    label: c.n,
    href: `/products?category=${encodeURIComponent(c.n)}`,
    img: c.img,
  }));
  const brands = company.brands?.length ? company.brands : DEFAULT_CONTENT.brands;
  const BRAND_RIBBON = brands.map((b) => ({
    label: b.label,
    href: `/products?brand=${encodeURIComponent(b.label)}`,
    img: b.img,
  }));
  const occasions = company.occasions?.length
    ? company.occasions
    : DEFAULT_CONTENT.occasions;
  const OCCASION_RIBBON = occasions.map((o) => ({
    label: o.n,
    href: o.href ?? `/products?occasion=${encodeURIComponent(o.n)}`,
    icon: o.ic,
  }));
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
      <DiwaliFx />
      <TopStrip />
      {BRAND_RIBBON.length > 0 && (
        <SlidingRibbon title="Shop by Brand" items={BRAND_RIBBON} direction="left" logoOnly tone="brand" />
      )}
      <SlidingRibbon title="Shop by Occasion" items={OCCASION_RIBBON} direction="right" tone="occasion" />
      <SlidingRibbon title="Shop by Category" items={CATEGORY_RIBBON} direction="left" tone="category" />
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
