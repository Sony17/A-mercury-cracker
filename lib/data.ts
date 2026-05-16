import type { Product, Bundle, SiteContent, CategoryItem, OccasionItem } from "./types";

export const PIC = {
  hero1: "https://images.unsplash.com/photo-1592843997881-cab3860b1067?w=1600&q=80&auto=format&fit=crop",
  hero2: "https://images.unsplash.com/photo-1636986541043-edeab0b36bda?w=1600&q=80&auto=format&fit=crop",
  hero3: "https://images.unsplash.com/photo-1574380965762-d7af37362e0c?w=1600&q=80&auto=format&fit=crop",
  hero4: "https://images.unsplash.com/photo-1659955535241-bbffde69c778?w=1600&q=80&auto=format&fit=crop",
  hero5: "https://images.unsplash.com/photo-1700623066384-555c048e50e2?w=1600&q=80&auto=format&fit=crop",
  p1: "https://images.unsplash.com/photo-1700623066384-555c048e50e2?w=600&q=80&auto=format&fit=crop",
  p2: "https://images.unsplash.com/photo-1700623065993-9e62198d187f?w=600&q=80&auto=format&fit=crop",
  p3: "https://images.unsplash.com/photo-1574380965762-d7af37362e0c?w=600&q=80&auto=format&fit=crop",
  p4: "https://images.unsplash.com/photo-1739066598673-c81259c52277?w=600&q=80&auto=format&fit=crop",
  p5: "https://images.unsplash.com/photo-1605294574666-e81471719e17?w=600&q=80&auto=format&fit=crop",
  p6: "https://images.unsplash.com/photo-1636986541043-edeab0b36bda?w=600&q=80&auto=format&fit=crop",
  p7: "https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=600&q=80&auto=format&fit=crop",
  p8: "https://images.unsplash.com/photo-1659955535241-bbffde69c778?w=600&q=80&auto=format&fit=crop",
  p9: "https://images.unsplash.com/photo-1687829652051-1f65aed5ebd3?w=600&q=80&auto=format&fit=crop",
  about: "https://images.unsplash.com/photo-1636986541043-edeab0b36bda?w=900&q=80&auto=format&fit=crop",
};

export const DEFAULT_CONTENT: SiteContent = {
  brand: "A Mercury Crackers",
  tagline: "Different from others",
  ownerName: "S.K Agarwal",
  est: "2010",
  about:
    "Discover a dazzling range of fancy crackers, all under one roof! Keeping your children's safety in mind, we offer the finest variety, each one better than the last. Unmatched variety and rates—something you won't find anywhere else in the market. Your child's happiness is our greatest joy!",
  phone: "9557149655",
  whatsapp: "9557149655",
  email: "Amercurycrackers@gmail.com",
  address:
    "Opp transport nagar, before 1km invertis university, transformer wali gali, Bareilly",
  hours: "10 AM - 4 PM (Open all days)",
  instagram: "https://www.instagram.com/mercuryignite23",
  google: "https://share.google/rPCxWYpcsAr3oVMdE",
  heroTitle: "Different from others",
  heroSub:
    "Bareilly's premium destination for fancy crackers — unmatched variety, child-safe quality, and the best rates in the market. Your child's happiness is our greatest joy!",
  gstin: "",
  peso: "",
  fssai: "",
};

export const HERO_SLIDES = [PIC.hero1, PIC.hero2, PIC.hero3, PIC.hero4, PIC.hero5];

export const DEFAULT_PRODUCTS: Product[] = [
  { id: 1, name: "Premium Fuljhadi 10cm", cat: "Sparklers", pack: "10 pcs", mrp: 80, price: 25, img: PIC.p1, tag: "Best Seller", brand: "Mercury", sku: "SP-001" },
  { id: 2, name: "Color Sparklers 15cm", cat: "Sparklers", pack: "10 pcs", mrp: 120, price: 39, img: PIC.p3, tag: "", brand: "Standard Fire", sku: "SP-002" },
  { id: 3, name: "Crackling Stars 30cm", cat: "Sparklers", pack: "5 pcs", mrp: 150, price: 49, img: PIC.p1, tag: "Sale", brand: "Mercury", sku: "SP-003" },
  { id: 4, name: "Mega Ground Chakkar", cat: "Chakkars", pack: "5 pcs", mrp: 250, price: 75, img: PIC.p4, tag: "", brand: "Cock Brand", sku: "CK-001" },
  { id: 5, name: "Spinning Wheel Pro", cat: "Chakkars", pack: "5 pcs", mrp: 200, price: 60, img: PIC.p4, tag: "", brand: "Cock Brand", sku: "CK-002" },
  { id: 6, name: "Premium Anar Pot", cat: "Flower Pots", pack: "5 pcs", mrp: 350, price: 99, img: PIC.p2, tag: "Best Seller", brand: "Sony", sku: "FP-001" },
  { id: 7, name: "Color Koti Anar", cat: "Flower Pots", pack: "10 pcs", mrp: 400, price: 120, img: PIC.p2, tag: "", brand: "Sony", sku: "FP-002" },
  { id: 8, name: "Whistling Rocket", cat: "Rockets", pack: "10 pcs", mrp: 220, price: 65, img: PIC.p5, tag: "", brand: "Wunderbar", sku: "RK-001" },
  { id: 9, name: "3-Sound Rocket Big", cat: "Rockets", pack: "5 pcs", mrp: 300, price: 89, img: PIC.p5, tag: "Sale", brand: "Wunderbar", sku: "RK-002" },
  { id: 10, name: "Lakshmi Atom Bomb", cat: "Bombs", pack: "10 pcs", mrp: 200, price: 60, img: PIC.p6, tag: "", brand: "Standard Fire", sku: "BM-001" },
  { id: 11, name: "Hydro Bomb XL", cat: "Bombs", pack: "10 pcs", mrp: 280, price: 79, img: PIC.p6, tag: "Best Seller", brand: "Standard Fire", sku: "BM-002" },
  { id: 12, name: "Sky Shot 25 Shots", cat: "Aerial", pack: "1 pc", mrp: 1100, price: 299, img: PIC.p7, tag: "Sale", brand: "Cock Brand", sku: "AE-001" },
  { id: 13, name: "Aerial Display 50 Shots", cat: "Aerial", pack: "1 pc", mrp: 2200, price: 599, img: PIC.p7, tag: "", brand: "Cock Brand", sku: "AE-002" },
  { id: 14, name: "Color Smoke Pot", cat: "Aerial", pack: "5 pcs", mrp: 180, price: 45, img: PIC.p9, tag: "", brand: "Mercury", sku: "AE-003" },
  { id: 15, name: "Royal Family Gift Box", cat: "Gift Boxes", pack: "100+ items", mrp: 5500, price: 1499, img: PIC.p8, tag: "Best Seller", brand: "Mercury", sku: "GB-001" },
  { id: 16, name: "Premium Diwali Combo", cat: "Gift Boxes", pack: "60+ items", mrp: 3500, price: 899, img: PIC.p8, tag: "Sale", brand: "Mercury", sku: "GB-002" },
];

export const BUNDLES: Bundle[] = [
  {
    id: "B1", name: "Family Diwali Special", cat: "Bundles",
    img: PIC.p1, price: 2000, mrp: 6500, save: 4500, tag: "Best Value",
    short: "35-40 items · Mix across all categories · Kid-safe options",
    items: ["5× Premium Anar Flower Pots (big)", "10× Color Fuljhadi packs (10 pcs)", "4× Ground Chakkars", "5× Color Smoke Pots", "2× Sky Shot 25-shots", "5× Lakshmi Atom Bombs", "3× Whistling Rockets", "2× Twinkling Star packs", "FREE 12 Designer Diyas"],
  },
  {
    id: "B2", name: "Kids Safe Edition", cat: "Bundles",
    img: PIC.p3, price: 2000, mrp: 6000, save: 4000, tag: "Most Popular",
    short: "For families with kids 5-12 · No bombs, no loud rockets",
    items: ["20× Color Fuljhadi packs (10 pcs)", "8× Ground Chakkars", "6× Color Smoke Pots", "5× Premium Flower Pots", "1× Cap Gun + 100 caps", "4× Twinkling Star packs", "FREE LED Diyas pack"],
  },
  {
    id: "B3", name: "Aerial Wow Combo", cat: "Bundles",
    img: PIC.p7, price: 2000, mrp: 6800, save: 4800, tag: "Premium",
    short: "For maximum show · Sky shots & aerial display focus",
    items: ["4× Sky Shot 25-shots", "1× Aerial Display 50-shots", "5× Color Smoke Pots", "3× Niagara Falls", "5× Fancy Showers", "2× Color Koti Anar"],
  },
  {
    id: "B4", name: "Wedding / Reception Pack", cat: "Bundles",
    img: PIC.p2, price: 2000, mrp: 6200, save: 4200, tag: "Visual Heavy",
    short: "Low noise, high visuals · Safe for guests",
    items: ["10× Premium Anar (big)", "8× Color Koti Anar", "5× Color Smoke Pots", "4× Ground Chakkars", "6× Fancy Showers", "2× Niagara Falls"],
  },
  {
    id: "B5", name: "Karthigai / Tradition Pack", cat: "Bundles",
    img: PIC.p9, price: 2000, mrp: 5800, save: 3800, tag: "Cultural",
    short: "South-Indian / religious focus · Diyas + traditional sparklers",
    items: ["30× Designer Diyas", "15× Twinkling Star sparklers", "6× Premium Flower Pots", "5× Color Sparklers 30cm", "4× Color Smoke Pots", "FREE Brass Diya Set (6 pcs)"],
  },
  {
    id: "B6", name: "Retailer Sample Kit (B2B)", cat: "Bundles",
    img: PIC.p8, price: 2000, mrp: 5500, save: 3500, tag: "B2B Only",
    short: "1 of every category · Test quality before bulk order",
    items: ["1× Each Sparkler variety (4 types)", "2× Each Chakkar variety", "2× Each Flower Pot variety", "2× Each Rocket variety", "2× Each Bomb variety", "2× Each Aerial variety", "Sample Diya pack", "Printed price list with MOQ table"],
  },
];

export const CATEGORIES: string[] = ["All", "Sparklers", "Chakkars", "Flower Pots", "Rockets", "Bombs", "Aerial", "Gift Boxes"];

export const CATEGORY_CARDS: CategoryItem[] = [
  { n: "Sparklers", img: PIC.p1 },
  { n: "Chakkars", img: PIC.p4 },
  { n: "Flower Pots", img: PIC.p2 },
  { n: "Rockets", img: PIC.p5 },
  { n: "Bombs", img: PIC.p6 },
  { n: "Aerial", img: PIC.p7 },
  { n: "Gift Boxes", img: PIC.p8 },
];

export const OCCASION_ITEMS: OccasionItem[] = [
  { ic: "🪔", n: "Diwali", t: "Festival", c: "Festival favourites & fancy aerials" },
  { ic: "💐", n: "Weddings", t: "Bulk", c: "Wholesale combos & gift hampers" },
  { ic: "🎂", n: "Birthdays", t: "Family", c: "Kid-safe sparklers & poppers" },
  { ic: "🕯️", n: "Karthigai", t: "Tradition", c: "Traditional diyas & lamps" },
  { ic: "🎉", n: "New Year", t: "Party", c: "Sky shots & celebration kits" },
  { ic: "🏢", n: "Corporate", t: "Events", c: "Premium gift packs & branding" },
];

export const BRANDS = ["Mercury", "Standard Fire", "Cock Brand", "Sony", "Wunderbar"];

export const ADMIN_EMAIL = "admin@amercurycrackers.com";
export const ADMIN_PASS = "admin123";

export const TRUST_ITEMS = [
  { icon: "Shield", title: "Child Safe", sub: "NEERI certified" },
  { icon: "Tag", title: "Best Prices", sub: "70% off MRP" },
  { icon: "Truck", title: "Free Delivery", sub: "On orders above ₹3000" },
  { icon: "Star", title: "15+ Years Trust", sub: "Since 2010" },
];

export const HERO_STATS = [
  { value: "15+", label: "Years of Trust" },
  { value: "500+", label: "Happy Families" },
  { value: "200+", label: "Cracker Varieties" },
  { value: "100%", label: "Child-Safe" },
];

export const FAQ_ITEMS = [
  { q: "Do you deliver outside Bareilly?", a: "Yes! We deliver all over India. Delivery charges and timelines depend on your location. Contact us on WhatsApp for shipping details." },
  { q: "Are your crackers child-safe?", a: "Absolutely. We carefully curate products keeping children's safety in mind. Our 'Kids Safe Edition' bundle has zero loud crackers." },
  { q: "Can I place a bulk / wholesale order?", a: "Yes! We offer special wholesale pricing for orders above ₹25,000. Download our price list PDF or WhatsApp us for tier pricing." },
  { q: "How do I pay for my order?", a: "We accept UPI, bank transfer, and cash on delivery (local). WhatsApp us your order and we'll share payment details." },
  { q: "What is your return policy?", a: "Due to the nature of fireworks, we do not accept returns once delivered. Please verify your order before confirming." },
  { q: "When is the best time to visit your store?", a: "We are open 10 AM – 4 PM all days. During Diwali season, stock goes fast — pre-order via WhatsApp to reserve yours." },
];

export const TESTIMONIALS = [
  { name: "Rahul Sharma", city: "Bareilly", text: "Best crackers in Bareilly! Got the Family Diwali Special bundle — absolutely worth it. Kids loved every piece.", rating: 5, date: "Diwali 2024" },
  { name: "Priya Agarwal", city: "Delhi", text: "Ordered online and received on time. Quality is genuinely different from regular market crackers. Highly recommended!", rating: 5, date: "Oct 2024" },
  { name: "Amit Verma", city: "Lucknow", text: "S.K sir personally helped me select the right bundle for my daughter's birthday. Outstanding service and genuine prices.", rating: 5, date: "Dec 2024" },
  { name: "Sunita Joshi", city: "Bareilly", text: "The Kids Safe Edition was perfect for our toddler. No bombs, only beautiful sparklers and flower pots. Will order again!", rating: 5, date: "Nov 2024" },
];
