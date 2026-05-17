import HeroSlider from "@/components/home/HeroSlider";
import TopStrip from "@/components/layout/TopStrip";
import TrustBadges from "@/components/home/TrustBadges";
import CategoryGrid from "@/components/home/CategoryGrid";
import ShopByBrand from "@/components/home/ShopByBrand";
import ProductsSection from "@/components/home/ProductsSection";
import BundlesSection from "@/components/home/BundlesSection";
import OccasionSection from "@/components/home/OccasionSection";
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
      <ShopByBrand />
      <TrustBadges />
      <CategoryGrid />
      <ProductsSection />
      <BundlesSection />
      <OccasionSection />
      <AboutSection />
      <TestimonialsSection />
      <InstagramSection />
      <SafetySection />
      <NewsletterSection />
      <ContactSection />
    </>
  );
}
