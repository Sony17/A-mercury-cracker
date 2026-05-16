"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { CartItem, User } from "./types";

interface StoreState {
  cart: CartItem[];
  user: User | null;
  cartOpen: boolean;
  authOpen: boolean;
  adminOpen: boolean;
  toast: { msg: string; type?: string } | null;
  addToCart: (item: Omit<CartItem, "qty">) => void;
  removeFromCart: (id: number | string) => void;
  changeQty: (id: number | string, delta: number) => void;
  clearCart: () => void;
  setCartOpen: (v: boolean) => void;
  setAuthOpen: (v: boolean) => void;
  setAdminOpen: (v: boolean) => void;
  login: (u: User) => void;
  logout: () => void;
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
  const [user, setUser] = useState<User | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type?: string } | null>(null);

  useEffect(() => {
    setCart(storageGet<CartItem[]>("cart", []));
    setUser(storageGet<User | null>("currentUser", null));
  }, []);

  useEffect(() => {
    storageSet("cart", cart);
  }, [cart]);

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

  const login = useCallback((u: User) => {
    setUser(u);
    storageSet("currentUser", u);
    setAuthOpen(false);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    storageSet("currentUser", null);
  }, []);

  const showToast = useCallback((msg: string, type?: string) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  }, []);

  return (
    <StoreContext.Provider
      value={{
        cart,
        user,
        cartOpen,
        authOpen,
        adminOpen,
        toast,
        addToCart,
        removeFromCart,
        changeQty,
        clearCart,
        setCartOpen,
        setAuthOpen,
        setAdminOpen,
        login,
        logout,
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
