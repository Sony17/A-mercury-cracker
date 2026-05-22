import type { Metadata } from "next";
import FestivalLanding from "@/components/festival/FestivalLanding";
import { DEFAULT_CONTENT, PIC } from "@/lib/data";

export const metadata: Metadata = {
  title: "Ganesh Chaturthi Crackers — Premium Festive Combos",
  description:
    "Celebrate Ganesh Chaturthi with premium sparklers, aerial cakes, and gift combos from A Mercury Crackers. Wholesale rates, child-safe quality, delivery all over India.",
};

export default function GaneshChaturthiPage() {
  return (
    <FestivalLanding
      slug="Ganesh Chaturthi"
      title="Ganesh Chaturthi"
      tagline="Festival of Beginnings"
      intro="Welcome Vighnaharta with light. Hand-picked sparklers, twinkling stars, and aerial cakes curated for the 10-day festivities — premium quality at wholesale rates."
      heroImage={PIC.hero3}
      highlights={[
        { label: "10 Days", sub: "Festive coverage" },
        { label: "200+", sub: "Curated picks" },
        { label: "₹2000+", sub: "Bundles available" },
        { label: "Same Day", sub: "Bareilly dispatch" },
      ]}
      picks={[
        { name: "Twinkling Star Sparklers", cat: "Twinkling Star" },
        { name: "Modak Sparkler Combo", cat: "Handy Crackers" },
        { name: "Visarjan Aerial Cake", cat: "Fancy Aerial Cakes" },
        { name: "Multi-Colour Shots Pack", cat: "Multi-Colour Shots" },
        { name: "Fancy 3 PCS Set", cat: "Fancy 3 PCS" },
        { name: "Century Crackers Box", cat: "Century Crackers" },
        { name: "V-Cakes Premium", cat: "V-Cakes" },
        { name: "Ganpati Gift Hamper", cat: "Mix Category" },
      ]}
      ctaWhatsappMsg="Hi! I'd like the Ganesh Chaturthi price list please."
      whatsappNumber={DEFAULT_CONTENT.whatsapp}
    />
  );
}
