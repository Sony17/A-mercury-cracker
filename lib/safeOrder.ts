import type { Order, OrderLine } from "./types";

// Production data contains legacy orders with missing or malformed nested
// fields (no customer object, undefined items array, etc). Every admin
// surface that reads orders must go through this so a single bad row can't
// crash the whole page.
export type SafeOrder = Omit<Order, "customer" | "items"> & {
  customer: {
    name: string;
    email: string;
    phone: string;
    address?: Order["customer"]["address"];
  };
  items: OrderLine[];
};

export function safeOrder(o: Order): SafeOrder {
  const c = o.customer ?? ({} as Order["customer"]);
  return {
    ...o,
    customer: {
      name: typeof c.name === "string" ? c.name : "",
      email: typeof c.email === "string" ? c.email : "",
      phone: typeof c.phone === "string" ? c.phone : "",
      address: c.address,
    },
    items: Array.isArray(o.items) ? o.items.filter((i): i is OrderLine => i != null) : [],
  };
}
