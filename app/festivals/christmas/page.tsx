import type { Metadata } from "next";
import FestivalLanding from "@/components/festival/FestivalLanding";
import { DEFAULT_CONTENT, PIC } from "@/lib/data";

export const metadata: Metadata = {
  title: "Christmas Fireworks — Holiday Sparkler & Cake Specials",
  description:
    "Make Christmas dazzle. Premium sparklers, fancy rockets, and aerial cakes from A Mercury Crackers — wholesale rates, festive bundles, delivered all over Uttar Pradesh.",
};

export default function ChristmasPage() {
  return (
    <FestivalLanding
      slug="Christmas"
      title="Christmas"
      tagline="Silver Bells & Golden Sparks"
      intro="From midnight mass to New Year's Eve — light up the season with twinkling sparklers, fancy rockets, and family-safe combos curated for Christmas celebrations."
      heroImage={PIC.hero2}
      highlights={[
        { label: "Family Safe", sub: "Kid-friendly options" },
        { label: "Midnight Ready", sub: "After-dark combos" },
        { label: "₹999+", sub: "Christmas bundles" },
        { label: "UP-Wide", sub: "B2B delivery available" },
      ]}
      picks={[
        { name: "Frosty Sparklers Bundle", cat: "Twinkling Star" },
        { name: "Christmas Eve Fancy Rocket", cat: "Fancy Rocket" },
        { name: "Snowburst Aerial Cake", cat: "Fancy Aerial Cakes" },
        { name: "Carol Night Multi-Colour", cat: "Multi-Colour Shots" },
        { name: "Santa V-Cake Special", cat: "V-Cakes" },
        { name: "Midnight Mega Shots", cat: "Mega Shots" },
        { name: "Handy Sparkler Stocking", cat: "Handy Crackers" },
        { name: "Family Christmas Hamper", cat: "Mix Category" },
      ]}
      ctaWhatsappMsg="Hi! Please share the Christmas crackers price list."
      whatsappNumber={DEFAULT_CONTENT.whatsapp}
    />
  );
}
