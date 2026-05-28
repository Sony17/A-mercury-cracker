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
      if (hydratedPayloads.current[entity] === payload) return; // already in sync
      const timers = saveTimers.current;
      if (timers[entity]) clearTimeout(timers[entity]);
      timers[entity] = setTimeout(() => void saveNow(entity, payload), 250);
    },
    [saveNow],
  );

  // Initial hydrate: load local-only collections + fetch server-backed collections.
  useEffect(() => {
    setCart(localGet<CartItem[]>("cart", []));
    setWishlist(localGet<WishlistItem[]>("wishlist", []));
    setUser(localGet<User | null>("currentUser", null));

    let cancelled = false;
    (async () => {
      await migrateLegacyLocalStorage();
      if (cancelled) return;
      const [p, c, o, s, ce, b2b, ac] = await Promise.all([
        apiGet<Product[]>("products", DEFAULT_PRODUCTS),
        apiGet<SiteContent>("company", DEFAULT_CONTENT),
        apiGet<Order[]>("orders", []),
        apiGet<Subscriber[]>("subscribers", []),
        apiGet<CustomerEnquiry[]>("customerEnquiries", []),
        apiGet<B2BInquiry[]>("b2bInquiries", []),
        apiGet<AbandonedCart[]>("abandonedCarts", []),
      ]);
      if (cancelled) return;
      // Don't clobber any entries the user may have added between mount and
      // when the fetch finished — only fill in if the local state is still
      // the initial seed (products) or empty (everything else).
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
      // Drop null/undefined entries that may exist in legacy Upstash data —
      // map/forEach over these arrays crashes admin views (StatsGrid etc).
      const ok = <T,>(arr: T[]): T[] => arr.filter((x): x is NonNullable<T> => x != null) as T[];
      setOrders((prev) => {
        if (prev.length !== 0) return prev;
        const next = ok(o);
        hydratedPayloads.current.orders = next;
        return next;
      });
      setSubscribers((prev) => {
        if (prev.length !== 0) return prev;
        const next = ok(s);
        hydratedPayloads.current.subscribers = next;
        return next;
      });
      setCustomerEnquiries((prev) => {
        if (prev.length !== 0) return prev;
        const next = ok(ce);
        hydratedPayloads.current.customerEnquiries = next;
        return next;
      });
      setB2BInquiries((prev) => {
        if (prev.length !== 0) return prev;
        const next = ok(b2b);
        hydratedPayloads.current.b2bInquiries = next;
        return next;
      });
      setAbandonedCarts((prev) => {
        if (prev.length !== 0) return prev;
        const next = ok(ac);
        hydratedPayloads.current.abandonedCarts = next;
        return next;
      });
      hydrated.current = true;
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Local-only persistence for cart/wishlist (per-visitor state).
  useEffect(() => {
    localSet("cart", cart);
  }, [cart]);

  useEffect(() => {
    localSet("wishlist", wishlist);
  }, [wishlist]);

  // Server-backed persistence (debounced PUT) for each managed collection.
  useEffect(() => {
    scheduleSave("products", products);
  }, [products, scheduleSave]);

  useEffect(() => {
    scheduleSave("orders", orders);
  }, [orders, scheduleSave]);

  useEffect(() => {
    scheduleSave("subscribers", subscribers);
  }, [subscribers, scheduleSave]);

  useEffect(() => {
    scheduleSave("customerEnquiries", customerEnquiries);
  }, [customerEnquiries, scheduleSave]);

  useEffect(() => {
    scheduleSave("b2bInquiries", b2bInquiries);
  }, [b2bInquiries, scheduleSave]);

  useEffect(() => {
    scheduleSave("abandonedCarts", abandonedCarts);
  }, [abandonedCarts, scheduleSave]);

  useEffect(() => {
    scheduleSave("company", company);
  }, [company, scheduleSave]);

  // Capture a snapshot of any non-empty cart belonging to a signed-in customer
  // a few seconds after their last change, so the owner can follow up on carts
  // that never reach checkout. Guests are skipped (no contact details to reach).
  useEffect(() => {
    if (!hydrated.current) return;
    if (!user || user.role === "admin") return;
    if (cart.length === 0) return;
    const u = user;
    const items = cart;
    const t = setTimeout(() => {
      const total = items.reduce((s, i) => s + i.price * i.qty, 0);
      setAbandonedCarts((prev) => {
        const id = `cart_${u.email.toLowerCase()}`;
        const existing = prev.find((a) => a.id === id);
        const record: AbandonedCart = {
          id,
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
          status: "active",
          createdAt: existing?.createdAt ?? Date.now(),
          updatedAt: Date.now(),
        };
        const updated = existing
          ? prev.map((a) => (a.id === id ? record : a))
          : [record, ...prev];
        void saveNow("abandonedCarts", updated);
        return updated;
      });
    }, 5000);
    return () => clearTimeout(t);
  }, [cart, user, saveNow]);

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

  const login = useCallback((u: User) => {
    setUser(u);
    localSet("currentUser", u);
    setAuthOpen(false);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localSet("currentUser", null);
  }, []);

  const updateUser = useCallback((patch: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      localSet("currentUser", next);
      // For non-admin customers, mirror the change into the server users list.
      if (prev.role !== "admin") {
        (async () => {
          try {
            const list = await apiGet<User[]>("users", []);
            const idx = list.findIndex((u) => u.email === prev.email);
            if (idx >= 0) {
              const updated = [...list];
              updated[idx] = { ...updated[idx], ...patch };
              await fetch(`/api/db/users`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updated),
              });
            }
          } catch {
            // ignored: best-effort mirror
          }
        })();
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
      setB2BInquiries((prev) => {
        const updated = [next, ...prev];
        void saveNow("b2bInquiries", updated);
        return updated;
      });
      return next;
    },
    [saveNow]
  );

  const updateB2BInquiry = useCallback((id: string, patch: Partial<B2BInquiry>) => {
    setB2BInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }, []);

  const setB2BInquiryStatus = useCallback((id: string, status: B2BStatus) => {
    setB2BInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
  }, []);

  const deleteB2BInquiry = useCallback((id: string) => {
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
      setCustomerEnquiries((prev) => {
        const updated = [next, ...prev];
        void saveNow("customerEnquiries", updated);
        return updated;
      });
      return next;
    },
    [saveNow]
  );

  const setCustomerEnquiryStatus = useCallback((id: string, status: CustomerEnquiryStatus) => {
    setCustomerEnquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
  }, []);

  const deleteCustomerEnquiry = useCallback((id: string) => {
    setCustomerEnquiries((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const addOrder = useCallback(
    (order: Omit<Order, "status" | "createdAt"> & { status?: OrderStatus }) => {
      const next: Order = {
        ...order,
        status: order.status ?? "pending",
        createdAt: Date.now(),
      };
      setOrders((prev) => {
        const updated = [next, ...prev];
        void saveNow("orders", updated);
        return updated;
      });
      return next;
    },
    [saveNow]
  );

  const setOrderStatus = useCallback((id: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status, updatedAt: Date.now() } : o))
    );
  }, []);

  const updateOrder = useCallback((id: string, patch: Partial<Order>) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...patch, updatedAt: Date.now() } : o))
    );
  }, []);

  const deleteOrder = useCallback((id: string) => {
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
        const updated = [next, ...prev];
        void saveNow("subscribers", updated);
        return updated;
      });
      return added;
    },
    [saveNow]
  );

  const deleteSubscriber = useCallback((id: string) => {
    setSubscribers((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const markCartRecovered = useCallback(
    (orderId: string) => {
      if (!user) return;
      const id = `cart_${user.email.toLowerCase()}`;
      setAbandonedCarts((prev) => {
        if (!prev.some((a) => a.id === id)) return prev;
        const updated = prev.map((a) =>
          a.id === id
            ? { ...a, status: "recovered" as const, recoveredOrderId: orderId, updatedAt: Date.now() }
            : a
        );
        void saveNow("abandonedCarts", updated);
        return updated;
      });
    },
    [user, saveNow]
  );

  const setAbandonedCartStatus = useCallback((id: string, status: AbandonedCartStatus) => {
    setAbandonedCarts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status, updatedAt: Date.now() } : a))
    );
  }, []);

  const deleteAbandonedCart = useCallback((id: string) => {
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
