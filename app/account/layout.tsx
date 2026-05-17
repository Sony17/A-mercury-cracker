import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Account",
  description: "Manage your A Mercury Crackers orders, wishlist and profile.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/account" },
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
