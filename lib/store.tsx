"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import type { AbandonedCart, AbandonedCartStatus, B2BInquiry, B2BStatus, CartItem, CustomerEnquiry, CustomerEnquiryStatus, Order, OrderStatus, Product, SiteContent, Subscriber, SubscriberChannel, User, WishlistItem } from "./types";
import { DEFAULT_CONTENT, DEFAULT_PRODUCTS } from "./data";

// Returns remaining units for a product, or null if stock is unlimited.
export function getAvailable(p: Product | undefined): number | null {
  if (!p) return 0;
  if (p.stock === false) return 0;
  if (typeof p.stock === "number") return Math.max(0, p.stock);
  return null;
}

interface StoreState {
  products: Product[];
  cart: CartItem[];
  wishlist: WishlistItem[];
  user: User | null;
  company: SiteContent;
  b2bInquiries: B2BInquiry[];
  customerEnquiries: CustomerEnquiry[];
  orders: Order[];
  subscribers: Subscriber[];
  abandonedCarts: AbandonedCart[];
  cartOpen: boolean;
  wishlistOpen: boolean;
  authOpen: boolean;
  adminOpen: boolean;
  toast: { msg: string; type?: string } | null;
  setProductsList: (list: Product[]) => void;
  updateProduct: (id: number, patch: Partial<Product>) => void;
  getAvailableFor: (id: number | string) => number | null;
  decrementStockFromCart: () => void;
  addToCart: (item: Omit<CartItem, "qty">) => void;
  removeFromCart: (id: number | string) => void;
  changeQty: (id: number | string, delta: number) => void;
  clearCart: () => void;
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: number | string) => void;
  toggleWishlist: (item: WishlistItem) => boolean;
  isWishlisted: (id: number | string) => boolean;
  clearWishlist: () => void;
  moveWishlistToCart: (id: number | string) => void;
  setCartOpen: (v: boolean) => void;
  setWishlistOpen: (v: boolean) => void;
  setAuthOpen: (v: boolean) => void;
  setAdminOpen: (v: boolean) => void;
  login: (u: User) => void;
  logout: () => void;
  updateUser: (patch: Partial<User>) => void;
  updateCompany: (patch: Partial<SiteContent>) => void;
  resetCompany: () => void;
  addB2BInquiry: (inq: Omit<B2BInquiry, "id" | "status" | "createdAt">) => B2BInquiry;
  updateB2BInquiry: (id: string, patch: Partial<B2BInquiry>) => void;
  setB2BInquiryStatus: (id: string, status: B2BStatus) => void;
  deleteB2BInquiry: (id: string) => void;
  addCustomerEnquiry: (inq: Omit<CustomerEnquiry, "id" | "status" | "createdAt">) => CustomerEnquiry;
  setCustomerEnquiryStatus: (id: string, status: CustomerEnquiryStatus) => void;
  deleteCustomerEnquiry: (id: string) => void;
  addOrder: (order: Omit<Order, "status" | "createdAt"> & { status?: OrderStatus }) => Order;
  setOrderStatus: (id: string, status: OrderStatus) => void;
  updateOrder: (id: string, patch: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  addSubscriber: (channel: SubscriberChannel, value: string) => Subscriber | null;
  deleteSubscriber: (id: string) => void;
  markCartRecovered: (orderId: string) => void;
  setAbandonedCartStatus: (id: string, status: AbandonedCartStatus) => void;
  deleteAbandonedCart: (id: string) => void;
  showToast: (msg: string, type?: string) => void;
}

const StoreContext = createContext<StoreState | null>(null);

function localGet<T>(k: string, d: T): T {
  if (typeof window === "undefined") return d;
  try {
    const v = localStorage.getItem("mc_" + k);
    return v ? (JSON.parse(v) as T) : d;
  } catch {
    return d;
  }
}

function localSet<T>(k: string, v: T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("mc_" + k, JSON.stringify(v));
  } catch {}
}

// Server-backed entity persistence: fire-and-forget PUT, debounced per entity.
type ServerEntity =
  | "products"
  | "orders"
  | "users"
  | "subscribers"
  | "customerEnquiries"
  | "b2bInquiries"
  | "abandonedCarts"
  | "company";

async function apiGet<T>(entity: ServerEntity, fallback: T): Promise<T> {
  try {
    const res = await fetch(`/api/db/${entity}`, { cache: "no-store" });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

async function apiGetPath<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

// Append a single customer-generated record via the scoped POST endpoint. The
// server validates + assigns the authoritative record; returns it on success.
async function apiPost<T>(entity: ServerEntity, record: unknown): Promise<T | null> {
  try {
    const res = await fetch(`/api/db/${entity}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { record?: T };
    return data.record ?? null;
  } catch {
    return null;
  }
}

// Atomic single-record update (admin). PATCHes one record instead of rewriting
// the whole collection, so it can't clobber concurrently-created records.
async function apiPatch(entity: ServerEntity, record: unknown): Promise<boolean> {
  try {
    const res = await fetch(`/api/db/${entity}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Atomic single-record delete (admin).
async function apiDelete(entity: ServerEntity, id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/db/${entity}?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    return res.ok;
  } catch {
    return false;
  }
}

// One-time migration from the pre-Upstash era when admin data lived in
// localStorage under `mc_<entity>`. Reads each legacy key, PUTs it into the
// server-backed store, then deletes the local copy. The `mc_migrated_v1`
// flag ensures we only run this once per browser.
const LEGACY_LS_MIGRATION: { ls: string; entity: ServerEntity }[] = [
  { ls: "mc_orders", entity: "orders" },
  { ls: "mc_subscribers", entity: "subscribers" },
  { ls: "mc_customerEnquiries", entity: "customerEnquiries" },
  { ls: "mc_b2bInquiries", entity: "b2bInquiries" },
  { ls: "mc_products", entity: "products" },
  { ls: "mc_company", entity: "company" },
];

async function migrateLegacyLocalStorage(): Promise<void> {
  if (typeof window === "undefined") return;
  if (localStorage.getItem("mc_migrated_v1") === "1") return;
  for (const { ls, entity } of LEGACY_LS_MIGRATION) {
    const raw = localStorage.getItem(ls);
    if (!raw) continue;
    try {
      const data = JSON.parse(raw);
      const empty =
        data == null ||
        (Array.isArray(data) && data.length === 0) ||
        (typeof data === "object" && !Array.isArray(data) && Object.keys(data).length === 0);
      if (empty) {
        localStorage.removeItem(ls);
        continue;
      }
      const res = await fetch(`/api/db/${entity}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) localStorage.removeItem(ls);
    } catch {
      // Leave the legacy key in place so it can be retried next load.
    }
  }
  localStorage.setItem("mc_migrated_v1", "1");
}

function genId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<SiteContent>(DEFAULT_CONTENT);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type?: string } | null>(null);
  const [b2bInquiries, setB2BInquiries] = useState<B2BInquiry[]>([]);
  const [customerEnquiries, setCustomerEnquiries] = useState<CustomerEnquiry[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCart[]>([]);
  const hydrated = useRef(false);
  // Whole-array writes (the debounced auto-save below) are admin-only. Customers
  // never overwrite server collections — their writes go through scoped POSTs.
  const adminRef = useRef(false);
  const saveTimers = useRef<Partial<Record<ServerEntity, ReturnType<typeof setTimeout>>>>({});

  // Remembers the exact reference we wrote into state during initial hydration
  // for each entity, so the save-effect can recognise "this is just the value
  // we read from the server" and skip the redundant write-back.
  const hydratedPayloads = useRef<Partial<Record<ServerEntity, unknown>>>({});

  const saveNow = useCallback(async (entity: ServerEntity, payload: unknown) => {
    try {
      const res = await fetch(`/api/db/${entity}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`save ${entity} failed`);
    } catch {
      setToast({ msg: `Failed to save ${entity}`, type: "error" });
      setTimeout(() => setToast(null), 2800);
    }
  }, []);

  const scheduleSave = useCallback(
    (entity: ServerEntity, payload: unknown) => {
      if (!hydrated.current) return; // don't write back the seed
      if (!adminRef.current) return; // only admins may overwrite whole collections
      if (hydratedPayloads.current[entity] === payload) return; // already in sync
      const timers = saveTimers.current;
      if (timers[entity]) clearTimeout(timers[entity]);
      timers[entity] = setTimeout(() => void saveNow(entity, payload), 250);
    },
    [saveNow],
  );

  // Drop null/undefined entries that may exist in legacy Upstash data —
  // map/forEach over these arrays crashes admin views (StatsGrid etc).
  const ok = useCallback(
    <T,>(arr: T[]): T[] => arr.filter((x): x is NonNullable<T> => x != null) as T[],
    [],
  );

  // Fetch the server collections appropriate to the caller's role. Admins get
  // every collection; customers get only their own orders; guests get nothing
  // beyond the public catalogue (loaded separately).
  const loadServerCollections = useCallback(
    async (role: "admin" | "customer" | null) => {
      adminRef.current = role === "admin";
      if (role === "admin") {
        const [o, s, ce, b2b, ac] = await Promise.all([
          apiGet<Order[]>("orders", []),
          apiGet<Subscriber[]>("subscribers", []),
          apiGet<CustomerEnquiry[]>("customerEnquiries", []),
          apiGet<B2BInquiry[]>("b2bInquiries", []),
          apiGet<AbandonedCart[]>("abandonedCarts", []),
        ]);
        hydratedPayloads.current.orders = ok(o);
        hydratedPayloads.current.subscribers = ok(s);
        hydratedPayloads.current.customerEnquiries = ok(ce);
        hydratedPayloads.current.b2bInquiries = ok(b2b);
        hydratedPayloads.current.abandonedCarts = ok(ac);
        setOrders(ok(o));
        setSubscribers(ok(s));
        setCustomerEnquiries(ok(ce));
        setB2BInquiries(ok(b2b));
        setAbandonedCarts(ok(ac));
      } else if (role === "customer") {
        const mine = await apiGetPath<Order[]>("/api/account/orders", []);
        setOrders(ok(mine));
        setSubscribers([]);
        setCustomerEnquiries([]);
        setB2BInquiries([]);
        setAbandonedCarts([]);
      } else {
        setOrders([]);
        setSubscribers([]);
        setCustomerEnquiries([]);
        setB2BInquiries([]);
        setAbandonedCarts([]);
      }
    },
    [ok],
  );

  // Initial hydrate: load local-only collections + fetch server-backed collections.
  useEffect(() => {
    setCart(localGet<CartItem[]>("cart", []));
    setWishlist(localGet<WishlistItem[]>("wishlist", []));

    let cancelled = false;
    (async () => {
      await migrateLegacyLocalStorage();
      if (cancelled) return;
      // The httpOnly session cookie is authoritative for identity + role.
      const me = await apiGetPath<{ user: User | null }>("/api/auth/me", { user: null });
      if (cancelled) return;
      const serverUser = me.user;
      if (serverUser) {
        setUser(serverUser);
        localSet("currentUser", serverUser);
      } else {
        // No valid session — clear any stale local identity.
        setUser(null);
        localSet("currentUser", null);
      }

      const [p, c] = await Promise.all([
        apiGet<Product[]>("products", DEFAULT_PRODUCTS),
        apiGet<SiteContent>("company", DEFAULT_CONTENT),
      ]);
      if (cancelled) return;
      setProducts((prev) => {
        if (prev !== DEFAULT_PRODUCTS) return prev;
        hydratedPayloads.current.products = p;
        return p;
      });
      setCompany((prev) => {
        if (prev !== DEFAULT_CONTENT) return prev;
        const next = { ...DEFAULT_CONTENT, ...c };
        hydratedPayloads.current.company = next;
        return next;
      });

      await loadServerCollections(serverUser?.role ?? null);
      if (cancelled) return;
      hydrated.current = true;
    })();
    return () => {
      cancelled = true;
    };
  }, [loadServerCollections]);

  // Local-only persistence for cart/wishlist (per-visitor state).
  useEffect(() => {
    localSet("cart", cart);
  }, [cart]);

  useEffect(() => {
    localSet("wishlist", wishlist);
  }, [wishlist]);

  // Server-backed persistence (debounced PUT) for products + company only —
  // these are full-document, admin-managed and order-sensitive. The list
  // entities (orders, subscribers, enquiries, b2b, carts) persist per-record
  // via apiPost/apiPatch/apiDelete in their mutators, so a whole-array write
  // here can never clobber a concurrently-created record.
  useEffect(() => {
    scheduleSave("products", products);
  }, [products, scheduleSave]);

  useEffect(() => {
    scheduleSave("company", company);
  }, [company, scheduleSave]);

  // Capture a snapshot of any non-empty cart belonging to a signed-in customer
  // a few seconds after their last change, so the owner can follow up on carts
  // that never reach checkout. The server upserts by session email and preserves
  // a prior recovered/dismissed status, so re-adding items never reactivates a
  // closed cart. Guests are skipped (no session / contact details to reach).
  useEffect(() => {
    if (!hydrated.current) return;
    if (!user || user.role === "admin") return;
    if (cart.length === 0) return;
    const u = user;
    const items = cart;
    const t = setTimeout(() => {
      const total = items.reduce((s, i) => s + i.price * i.qty, 0);
      void apiPost("abandonedCarts", {
        customer: { name: u.name, email: u.email, phone: u.phone },
        items: items.map((i) => ({
          id: i.id,
          name: i.name,
          qty: i.qty,
          price: i.price,
          img: i.img,
          bundleItems: i.bundleItems,
        })),
        total,
      });
    }, 5000);
    return () => clearTimeout(t);
  }, [cart, user]);

  const getAvailableFor = useCallback(
    (id: number | string) => {
      if (typeof id !== "number") return null;
      return getAvailable(products.find((p) => p.id === id));
    },
    [products]
  );

  const addToCart = useCallback(
    (item: Omit<CartItem, "qty">) => {
      const available =
        typeof item.id === "number"
          ? getAvailable(products.find((p) => p.id === item.id))
          : null;
      if (available === 0) {
        setToast({ msg: `${item.name} is out of stock`, type: "error" });
        setTimeout(() => setToast(null), 2800);
        return;
      }
      setCart((prev) => {
        const existing = prev.find((i) => i.id === item.id);
        const currentQty = existing?.qty ?? 0;
        if (available !== null && currentQty + 1 > available) {
          setToast({
            msg: `Only ${available} left of ${item.name}`,
            type: "warn",
          });
          setTimeout(() => setToast(null), 2800);
          return prev;
        }
        if (existing) {
          return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
        }
        return [...prev, { ...item, qty: 1 }];
      });
    },
    [products]
  );

  const removeFromCart = useCallback((id: number | string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const changeQty = useCallback(
    (id: number | string, delta: number) => {
      const available =
        typeof id === "number" ? getAvailable(products.find((p) => p.id === id)) : null;
      setCart((prev) =>
        prev
          .map((i) => {
            if (i.id !== id) return i;
            const next = i.qty + delta;
            if (delta > 0 && available !== null && next > available) {
              setToast({ msg: `Only ${available} left of ${i.name}`, type: "warn" });
              setTimeout(() => setToast(null), 2800);
              return { ...i, qty: available };
            }
            return { ...i, qty: next };
          })
          .filter((i) => i.qty > 0)
      );
    },
    [products]
  );

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const setProductsList = useCallback((list: Product[]) => {
    setProducts(list);
  }, []);

  const updateProduct = useCallback((id: number, patch: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, []);

  const decrementStockFromCart = useCallback(() => {
    setProducts((prev) =>
      prev.map((p) => {
        if (typeof p.stock !== "number") return p;
        const line = cart.find((c) => c.id === p.id);
        if (!line) return p;
        return { ...p, stock: Math.max(0, p.stock - line.qty) };
      })
    );
  }, [cart]);

  const addToWishlist = useCallback((item: WishlistItem) => {
    setWishlist((prev) =>
      prev.find((i) => i.id === item.id) ? prev : [...prev, item]
    );
  }, []);

  const removeFromWishlist = useCallback((id: number | string) => {
    setWishlist((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const toggleWishlist = useCallback((item: WishlistItem) => {
    let added = false;
    setWishlist((prev) => {
      if (prev.find((i) => i.id === item.id)) {
        return prev.filter((i) => i.id !== item.id);
      }
      added = true;
      return [...prev, item];
    });
    return added;
  }, []);

  const isWishlisted = useCallback(
    (id: number | string) => wishlist.some((i) => i.id === id),
    [wishlist]
  );

  const clearWishlist = useCallback(() => {
    setWishlist([]);
  }, []);

  const moveWishlistToCart = useCallback((id: number | string) => {
    setWishlist((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) {
        setCart((c) => {
          const existing = c.find((i) => i.id === item.id);
          if (existing) {
            return c.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
          }
          return [...c, { ...item, qty: 1 }];
        });
      }
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const login = useCallback(
    (u: User) => {
      setUser(u);
      localSet("currentUser", u);
      setAuthOpen(false);
      // Pull the collections this role is now allowed to see (admin lists, or a
      // customer's own orders). The session cookie was just set by the API.
      void loadServerCollections(u.role ?? "customer");
    },
    [loadServerCollections],
  );

  const logout = useCallback(() => {
    setUser(null);
    localSet("currentUser", null);
    adminRef.current = false;
    void fetch("/api/auth/logout", { method: "POST" });
    void loadServerCollections(null);
  }, [loadServerCollections]);

  const updateUser = useCallback((patch: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      localSet("currentUser", next);
      // Persist profile changes via the session-scoped endpoint (a customer can
      // only edit their own record; admins manage users through the admin API).
      if (prev.role !== "admin") {
        void fetch("/api/account/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: patch.name,
            phone: patch.phone,
            address: patch.address,
          }),
        });
      }
      return next;
    });
  }, []);

  const updateCompany = useCallback((patch: Partial<SiteContent>) => {
    setCompany((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetCompany = useCallback(() => {
    setCompany(DEFAULT_CONTENT);
  }, []);

  const addB2BInquiry = useCallback(
    (inq: Omit<B2BInquiry, "id" | "status" | "createdAt">) => {
      const next: B2BInquiry = {
        ...inq,
        id: genId("b2b"),
        status: "pending",
        createdAt: Date.now(),
      };
      void apiPost("b2bInquiries", next);
      setB2BInquiries((prev) => [next, ...prev]);
      return next;
    },
    []
  );

  const updateB2BInquiry = useCallback((id: string, patch: Partial<B2BInquiry>) => {
    setB2BInquiries((prev) => {
      const idx = prev.findIndex((i) => i.id === id);
      if (idx < 0) return prev;
      const updated = { ...prev[idx], ...patch };
      void apiPatch("b2bInquiries", updated);
      const next = prev.slice();
      next[idx] = updated;
      return next;
    });
  }, []);

  const setB2BInquiryStatus = useCallback((id: string, status: B2BStatus) => {
    setB2BInquiries((prev) => {
      const idx = prev.findIndex((i) => i.id === id);
      if (idx < 0) return prev;
      const updated = { ...prev[idx], status };
      void apiPatch("b2bInquiries", updated);
      const next = prev.slice();
      next[idx] = updated;
      return next;
    });
  }, []);

  const deleteB2BInquiry = useCallback((id: string) => {
    void apiDelete("b2bInquiries", id);
    setB2BInquiries((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const addCustomerEnquiry = useCallback(
    (inq: Omit<CustomerEnquiry, "id" | "status" | "createdAt">) => {
      const next: CustomerEnquiry = {
        ...inq,
        id: genId("enq"),
        status: "new",
        createdAt: Date.now(),
      };
      void apiPost("customerEnquiries", next);
      setCustomerEnquiries((prev) => [next, ...prev]);
      return next;
    },
    []
  );

  const setCustomerEnquiryStatus = useCallback((id: string, status: CustomerEnquiryStatus) => {
    setCustomerEnquiries((prev) => {
      const idx = prev.findIndex((i) => i.id === id);
      if (idx < 0) return prev;
      const updated = { ...prev[idx], status };
      void apiPatch("customerEnquiries", updated);
      const next = prev.slice();
      next[idx] = updated;
      return next;
    });
  }, []);

  const deleteCustomerEnquiry = useCallback((id: string) => {
    void apiDelete("customerEnquiries", id);
    setCustomerEnquiries((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const addOrder = useCallback(
    (order: Omit<Order, "status" | "createdAt"> & { status?: OrderStatus }) => {
      const next: Order = {
        ...order,
        status: order.status ?? "pending",
        createdAt: Date.now(),
      };
      // Optimistic local add; the server validates prices/stock and returns the
      // authoritative record, which we swap in once it resolves.
      setOrders((prev) => [next, ...prev]);
      void apiPost<Order>("orders", next).then((saved) => {
        if (saved) setOrders((prev) => prev.map((o) => (o.id === saved.id ? saved : o)));
      });
      return next;
    },
    []
  );

  const setOrderStatus = useCallback((id: string, status: OrderStatus) => {
    setOrders((prev) => {
      const idx = prev.findIndex((o) => o.id === id);
      if (idx < 0) return prev;
      const updated = { ...prev[idx], status, updatedAt: Date.now() };
      void apiPatch("orders", updated);
      const next = prev.slice();
      next[idx] = updated;
      return next;
    });
  }, []);

  const updateOrder = useCallback((id: string, patch: Partial<Order>) => {
    setOrders((prev) => {
      const idx = prev.findIndex((o) => o.id === id);
      if (idx < 0) return prev;
      const updated = { ...prev[idx], ...patch, updatedAt: Date.now() };
      void apiPatch("orders", updated);
      const next = prev.slice();
      next[idx] = updated;
      return next;
    });
  }, []);

  const deleteOrder = useCallback((id: string) => {
    void apiDelete("orders", id);
    setOrders((prev) => prev.filter((o) => o.id !== id));
  }, []);

  const addSubscriber = useCallback(
    (channel: SubscriberChannel, value: string): Subscriber | null => {
      const cleaned = channel === "phone" ? value.replace(/\D/g, "") : value.trim().toLowerCase();
      if (!cleaned) return null;
      let added: Subscriber | null = null;
      setSubscribers((prev) => {
        if (prev.some((s) => s.channel === channel && s.value === cleaned)) {
          added = prev.find((s) => s.channel === channel && s.value === cleaned) ?? null;
          return prev;
        }
        const next: Subscriber = {
          id: genId("sub"),
          channel,
          value: cleaned,
          createdAt: Date.now(),
        };
        added = next;
        void apiPost("subscribers", next);
        return [next, ...prev];
      });
      return added;
    },
    []
  );

  const deleteSubscriber = useCallback((id: string) => {
    void apiDelete("subscribers", id);
    setSubscribers((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const markCartRecovered = useCallback(
    (orderId: string) => {
      if (!user || user.role === "admin") return;
      // POST unconditionally: the server upserts by session email, so a fast
      // checkout (before the 5s snapshot fired) still records a recovered cart.
      void apiPost("abandonedCarts", {
        status: "recovered",
        recoveredOrderId: orderId,
      });
    },
    [user]
  );

  const setAbandonedCartStatus = useCallback((id: string, status: AbandonedCartStatus) => {
    setAbandonedCarts((prev) => {
      const idx = prev.findIndex((a) => a.id === id);
      if (idx < 0) return prev;
      const updated = { ...prev[idx], status, updatedAt: Date.now() };
      void apiPatch("abandonedCarts", updated);
      const next = prev.slice();
      next[idx] = updated;
      return next;
    });
  }, []);

  const deleteAbandonedCart = useCallback((id: string) => {
    void apiDelete("abandonedCarts", id);
    setAbandonedCarts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const showToast = useCallback((msg: string, type?: string) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  }, []);

  return (
    <StoreContext.Provider
      value={{
        products,
        cart,
        wishlist,
        user,
        company,
        b2bInquiries,
        customerEnquiries,
        orders,
        subscribers,
        abandonedCarts,
        cartOpen,
        wishlistOpen,
        authOpen,
        adminOpen,
        toast,
        setProductsList,
        updateProduct,
        getAvailableFor,
        decrementStockFromCart,
        addToCart,
        removeFromCart,
        changeQty,
        clearCart,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isWishlisted,
        clearWishlist,
        moveWishlistToCart,
        setCartOpen,
        setWishlistOpen,
        setAuthOpen,
        setAdminOpen,
        login,
        logout,
        updateUser,
        updateCompany,
        resetCompany,
        addB2BInquiry,
        updateB2BInquiry,
        setB2BInquiryStatus,
        deleteB2BInquiry,
        addCustomerEnquiry,
        setCustomerEnquiryStatus,
        deleteCustomerEnquiry,
        addOrder,
        setOrderStatus,
        updateOrder,
        deleteOrder,
        addSubscriber,
        deleteSubscriber,
        markCartRecovered,
        setAbandonedCartStatus,
        deleteAbandonedCart,
        showToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
