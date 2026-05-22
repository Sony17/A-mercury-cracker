import type { Metadata } from "next";
import { Poppins, Outfit, Montserrat } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import CartDrawer from "@/components/cart/CartDrawer";
import WishlistDrawer from "@/components/wishlist/WishlistDrawer";
import AuthModal from "@/components/ui/AuthModal";
import Chatbot from "@/components/ui/Chatbot";
import ToastDisplay from "@/components/ui/ToastDisplay";
import OpeningAnimation from "@/components/ui/OpeningAnimation";
import AddToCartFx from "@/components/ui/AddToCartFx";
import ContrastAuditor from "@/components/dev/ContrastAuditor";
import { SITE_URL, BUSINESS } from "@/lib/seo";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["600", "700", "900"],
  display: "swap",
  preload: false,
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["600", "700", "900"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "A Mercury Crackers — Buy Fancy Crackers Online in Bareilly | Wholesale Fireworks",
    template: "%s | A Mercury Crackers Bareilly",
  },
  description:
    "Bareilly's premium fancy crackers shop. Buy sparklers, chakkars, flower pots, rockets, bombs, aerial shots & gift boxes online at wholesale rates. Child-safe quality, owner S.K Agarwal, established 1994. Delivering all over India.",
  applicationName: "A Mercury Crackers",
  authors: [{ name: "A Mercury Crackers" }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "A Mercury Crackers — Bareilly's Premium Fancy Crackers Store",
    description:
      "Sparklers, chakkars, flower pots, rockets, gift boxes — child-safe quality at best wholesale rates. Delivering all over India.",
    url: SITE_URL,
    siteName: "A Mercury Crackers",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/Amercury.jpeg",
        width: 1200,
        height: 630,
        alt: "A Mercury Crackers — Bareilly",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "A Mercury Crackers — Bareilly's Premium Fancy Crackers Store",
    description:
      "Sparklers, chakkars, flower pots, rockets, gift boxes — wholesale rates, delivering all over India.",
    images: ["/Amercury.jpeg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/icon",
    apple: "/Amercury.jpeg",
  },
  category: "shopping",
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  "@id": `${SITE_URL}/#store`,
  name: BUSINESS.name,
  image: [`${SITE_URL}/Amercury.jpeg`, `${SITE_URL}/about.jpg`],
  url: SITE_URL,
  telephone: `+91${BUSINESS.phone}`,
  email: BUSINESS.email,
  description:
    "Bareilly's premium fancy crackers store. Sparklers, chakkars, flower pots, rockets, bombs, aerial shots & gift boxes at wholesale rates.",
  address: {
    "@type": "PostalAddress",
    streetAddress:
      "Opp Transport Nagar, before 1km Invertis University, Transformer Wali Gali",
    addressLocality: "Bareilly",
    addressRegion: "Uttar Pradesh",
    postalCode: "243123",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 28.347,
    longitude: 79.4304,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "10:00",
      closes: "16:00",
    },
  ],
  priceRange: "₹25 – ₹5,500",
  founder: { "@type": "Person", name: BUSINESS.owner },
  foundingDate: BUSINESS.founded,
  areaServed: { "@type": "Country", name: "India" },
  sameAs: [
    "https://www.instagram.com/mercuryignite23",
    "https://share.google/rPCxWYpcsAr3oVMdE",
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "500",
    bestRating: "5",
    worstRating: "1",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: BUSINESS.name,
  url: SITE_URL,
  inLanguage: "en-IN",
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/products?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${poppins.variable} ${outfit.variable} ${montserrat.variable} h-full antialiased royal`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <StoreProvider>
          <Navbar />
          <main className="flex-1 pb-16 md:pb-0">{children}</main>
          <Footer />
          <MobileNav />
          <CartDrawer />
          <WishlistDrawer />
          <AuthModal />
          <Chatbot />
          <ToastDisplay />
          <OpeningAnimation />
          <AddToCartFx />
          <ContrastAuditor />
        </StoreProvider>
      </body>
    </html>
  );
}
