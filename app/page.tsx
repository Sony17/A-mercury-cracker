import HeroSlider from "@/components/home/HeroSlider";
import TrustBadges from "@/components/home/TrustBadges";
import CategoryGrid from "@/components/home/CategoryGrid";
import ProductsSection from "@/components/home/ProductsSection";
import BundlesSection from "@/components/home/BundlesSection";
import OccasionSection from "@/components/home/OccasionSection";
import AboutSection from "@/components/home/AboutSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import InstagramSection from "@/components/home/InstagramSection";
import SafetySection from "@/components/home/SafetySection";
import FAQSection from "@/components/home/FAQSection";
import NewsletterSection from "@/components/home/NewsletterSection";
import ContactSection from "@/components/home/ContactSection";

export default function HomePage() {
  return (
    <>
      <HeroSlider />
      <TrustBadges />
      <CategoryGrid />
      <ProductsSection />
      <BundlesSection />
      <OccasionSection />
      <AboutSection />
      <TestimonialsSection />
      <InstagramSection />
      <SafetySection />
      <FAQSection />
      <NewsletterSection />
      <ContactSection />
    </>
  );
}
