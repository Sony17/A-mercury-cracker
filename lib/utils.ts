import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return "₹" + amount.toLocaleString("en-IN");
}

export function getDiscount(price: number, mrp: number): number {
  return Math.round((1 - price / mrp) * 100);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * Product label with its brand prefixed — "Cock Brand Sky Shot 25 Shots".
 * Use anywhere an item is rendered as plain text (WhatsApp messages, CSV
 * exports, invoices) so the customer and the shop see the same name. Skips the
 * prefix when the brand is missing (bundles) or already starts the name.
 */
export function itemLabel(item: { name: string; brand?: string }): string {
  const brand = item.brand?.trim();
  if (!brand) return item.name;
  if (item.name.toLowerCase().startsWith(brand.toLowerCase())) return item.name;
  return `${brand} ${item.name}`;
}
