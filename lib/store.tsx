"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { B2BInquiry, B2BStatus, CartItem, SiteContent, User, WishlistItem } from "./types";
import { DEFAULT_CONTENT } from "./data";

interface StoreState {
  cart: CartItem[];
  wishlist: WishlistItem[];
  user: User | null;
  company: SiteContent;
  b2bInquiries: B2BInquiry[];
  cartOpen: boolean;
  wishlistOpen: boolean;
  authOpen: boolean;
  adminOpen: boolean;
  toast: { msg: string; type?: string } | null;
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
  showToast: (msg: string, type?: string) => void;
}

const StoreContext = createContext<StoreState | null>(null);

function storageGet<T>(k: string, d: T): T {
  if (typeof window === "undefined") return d;
  try {
    const v = localStorage.getItem("mc_" + k);
    return v ? (JSON.parse(v) as T) : d;
  } catch {
    return d;
  }
}

function storageSet<T>(k: string, v: T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("mc_" + k, JSON.stringify(v));
  } catch {}
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
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

  useEffect(() => {
    setCart(storageGet<CartItem[]>("cart", []));
    setWishlist(storageGet<WishlistItem[]>("wishlist", []));
    setUser(storageGet<User | null>("currentUser", null));
    setB2BInquiries(storageGet<B2BInquiry[]>("b2bInquiries", []));
    const stored = storageGet<Partial<SiteContent> | null>("company", null);
    if (stored) setCompany({ ...DEFAULT_CONTENT, ...stored });
  }, []);

  useEffect(() => {
    storageSet("b2bInquiries", b2bInquiries);
  }, [b2bInquiries]);

  useEffect(() => {
    storageSet("cart", cart);
  }, [cart]);

  useEffect(() => {
    storageSet("wishlist", wishlist);
  }, [wishlist]);

  const addToCart = useCallback((item: Omit<CartItem, "qty">) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { ...item, qty: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((id: number | string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const changeQty = useCallback((id: number | string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

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
    storageSet("currentUser", u);
    setAuthOpen(false);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    storageSet("currentUser", null);
  }, []);

  const updateUser = useCallback((patch: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      storageSet("currentUser", next);
      if (prev.role !== "admin") {
        const users = storageGet<User[]>("users", []);
        const idx = users.findIndex((u) => u.email === prev.email);
        if (idx >= 0) {
          users[idx] = { ...users[idx], ...patch };
          storageSet("users", users);
        }
      }
      return next;
    });
  }, []);

  const updateCompany = useCallback((patch: Partial<SiteContent>) => {
    setCompany((prev) => {
      const next = { ...prev, ...patch };
      storageSet("company", next);
      return next;
    });
  }, []);

  const resetCompany = useCallback(() => {
    setCompany(DEFAULT_CONTENT);
    storageSet("company", null);
  }, []);

  const addB2BInquiry = useCallback(
    (inq: Omit<B2BInquiry, "id" | "status" | "createdAt">) => {
      const next: B2BInquiry = {
        ...inq,
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `b2b_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        status: "pending",
        createdAt: Date.now(),
      };
      setB2BInquiries((prev) => [next, ...prev]);
      return next;
    },
    []
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

  const showToast = useCallback((msg: string, type?: string) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  }, []);

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        user,
        company,
        b2bInquiries,
        cartOpen,
        wishlistOpen,
        authOpen,
        adminOpen,
        toast,
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
