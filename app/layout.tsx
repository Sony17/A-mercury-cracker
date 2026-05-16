import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import TopStrip from "@/components/layout/TopStrip";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import CartDrawer from "@/components/cart/CartDrawer";
import AuthModal from "@/components/ui/AuthModal";
import Chatbot from "@/components/ui/Chatbot";
import ToastDisplay from "@/components/ui/ToastDisplay";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "A Mercury Crackers — Different from Others | Bareilly",
  description:
    "Bareilly's premium fancy crackers store. Unmatched variety, child-safe quality, best rates. Owner S.K Agarwal. Established 2010. Delivering all over India.",
  keywords:
    "crackers, fireworks, Diwali crackers, Bareilly, A Mercury Crackers, fancy crackers, sparklers",
  openGraph: {
    title: "A Mercury Crackers — Different from Others",
    description:
      "Premium fancy crackers store in Bareilly. Child-safe quality, unmatched variety, best rates.",
    type: "website",
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
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <StoreProvider>
          <TopStrip />
          <Navbar />
          <main className="flex-1 pb-16 md:pb-0">{children}</main>
          <Footer />
          <MobileNav />
          <CartDrawer />
          <AuthModal />
          <Chatbot />
          <ToastDisplay />
        </StoreProvider>
      </body>
    </html>
  );
}
