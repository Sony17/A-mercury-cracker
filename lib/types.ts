export interface Product {
  id: number;
  name: string;
  cat: string;
  pack: string;
  mrp: number;
  price: number;
  img: string;
  tag: string;
  brand?: string;
  sku?: string;
  stock?: boolean | number;
  description?: string;
  featured?: boolean;
}

export const FEATURED_LIMIT = 12;

export interface Bundle {
  id: string;
  name: string;
  cat: string;
  img: string;
  price: number;
  mrp: number;
  save: number;
  tag: string;
  short: string;
  items: string[];
  bundleItems?: string[];
}

export interface CartItem {
  id: number | string;
  name: string;
  price: number;
  mrp: number;
  img: string;
  qty: number;
  pack?: string;
  bundleItems?: string[];
  isBundle?: boolean;
}

export interface WishlistItem {
  id: number | string;
  name: string;
  price: number;
  mrp: number;
  img: string;
  pack?: string;
  cat?: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  label: string;
  url: string;
  iconUrl?: string;
  color?: string;
}

export interface SiteContent {
  brand: string;
  tagline: string;
  ownerName: string;
  est: string;
  about: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  hours: string;
  instagram: string;
  google: string;
  heroTitle: string;
  heroSub: string;
  heroSlides: string[];
  gstin: string;
  peso: string;
  fssai: string;
  socials: SocialLink[];
  reels: ReelMedia[];
  youtubeIds: string[];
}

export interface ReelMedia {
  shortcode: string;
  kind: "reel" | "p";
}

export interface Reel {
  id?: string;
  url?: string;
  embed?: string;
  cap?: string;
  title?: string;
}

export interface User {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: "admin" | "customer";
  createdAt?: number;
}

export interface OccasionItem {
  ic: string;
  n: string;
  t: string;
  c: string;
}

export interface CategoryItem {
  n: string;
  img: string;
}

export type B2BStatus = "pending" | "approved" | "rejected";

export interface B2BInquiry {
  id: string;
  name: string;
  phone: string;
  email?: string;
  businessName: string;
  businessType: string;
  gstin?: string;
  city: string;
  qty: string;
  interest: string;
  message: string;
  status: B2BStatus;
  pdfUrl?: string;
  pdfLabel?: string;
  sentAt?: number;
  createdAt: number;
}
