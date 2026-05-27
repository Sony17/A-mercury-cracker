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

export interface BrandLogo {
  id: string;
  label: string;
  img: string;
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
  mapEmbedUrl: string;
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
  brands: BrandLogo[];
  reels: ReelMedia[];
  youtubeIds: string[];
  upiVpa: string;
  upiPayeeName: string;
  upiQrImageUrl: string;
  paymentSafetyNotes: string;
  categories: CategoryItem[];
  occasions: OccasionItem[];
  b2bLinks?: B2BLink[];
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

export interface UserAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface User {
  name: string;
  email: string;
  phone?: string;
  password?: string; // legacy plaintext (localStorage era); migrated to passwordHash on first server login
  passwordHash?: string;
  mustChangePassword?: boolean;
  role: "admin" | "customer";
  createdAt?: number;
  address?: UserAddress;
}

export type ResetRequestStatus = "pending" | "completed" | "rejected";

export interface ResetRequest {
  id: string;
  email: string;
  phone: string;
  requestedAt: number;
  status: ResetRequestStatus;
  resolvedAt?: number;
  note?: string;
}

export interface OccasionItem {
  ic: string;
  n: string;
  t: string;
  c: string;
  href?: string;
}

export interface CategoryItem {
  n: string;
  img: string;
}

export type OrderStatus = "pending" | "dispatched" | "delivered" | "cancelled";

export interface OrderLine {
  id: number | string;
  name: string;
  qty: number;
  price: number;
  img?: string;
  bundleItems?: string[];
}

export interface OrderTracking {
  courier?: string;
  number?: string;
  url?: string;
  instructions?: string;
  updatedAt?: number;
}

export interface OrderProofOfDelivery {
  note?: string;
  attachmentUrl?: string;
  attachmentLabel?: string;
  recordedAt: number;
}

export interface Order {
  id: string;
  txnId: string;
  total: number;
  items: OrderLine[];
  customer: {
    name: string;
    email: string;
    phone?: string;
    address?: UserAddress;
  };
  status: OrderStatus;
  paidVia: string;
  createdAt: number;
  updatedAt?: number;
  tracking?: OrderTracking;
  pod?: OrderProofOfDelivery;
}

export type CustomerEnquiryStatus = "new" | "resolved";

export interface CustomerEnquiry {
  id: string;
  question: string;
  reply: string;
  name?: string;
  email?: string;
  phone?: string;
  status: CustomerEnquiryStatus;
  createdAt: number;
}

export type SubscriberChannel = "phone" | "email";

export interface Subscriber {
  id: string;
  channel: SubscriberChannel;
  value: string;
  createdAt: number;
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
  links?: B2BLink[];
  sentAt?: number;
  createdAt: number;
}

export interface B2BLink {
  id: string;
  url: string;
  label: string;
}
