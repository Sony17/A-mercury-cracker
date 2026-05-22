import type { Metadata } from "next";
import FestivalLanding from "@/components/festival/FestivalLanding";
import { DEFAULT_CONTENT, PIC } from "@/lib/data";

export const metadata: Metadata = {
  title: "IPL Season Crackers — Match-Day Celebration Packs",
  description:
    "Win, scream, celebrate. Match-day sparklers, century crackers and mega shots from A Mercury Crackers — premium bundles for IPL season victories.",
};

export default function IplSeasonPage() {
  return (
    <FestivalLanding
      slug="IPL Season"
      title="IPL Season"
      tagline="Celebrate Every Six"
      intro="Whether your team takes the title or just smashes a century — keep the celebrations loaded. Mega shots, century crackers, and rapid-fire sparklers built for match nights."
      heroImage={PIC.hero5}
      highlights={[
        { label: "60+ Match Nights", sub: "Stocked for the season" },
        { label: "Mega Shots", sub: "Sixer-worthy bursts" },
        { label: "₹499+", sub: "Match-day combos" },
        { label: "Instant Restock", sub: "Same-day pickup" },
      ]}
      picks={[
        { name: "Century Crackers Box", cat: "Century Crackers" },
        { name: "Sixer Mega Shots", cat: "Mega Shots" },
        { name: "Boundary Fancy Rocket", cat: "Fancy Rocket" },
        { name: "Powerplay Multi-Colour", cat: "Multi-Colour Shots" },
        { name: "V-Cakes Stadium Edition", cat: "V-Cakes" },
        { name: "Aerial Cake Final Over", cat: "Fancy Aerial Cakes" },
        { name: "Handy Match-Day Pack", cat: "Handy Crackers" },
        { name: "Trophy Night Hamper", cat: "Mix Category" },
      ]}
      ctaWhatsappMsg="Hi! Please share the IPL season crackers price list."
      whatsappNumber={DEFAULT_CONTENT.whatsapp}
    />
  );
}
