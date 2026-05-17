"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingBag, User, Menu, X, LogOut, LayoutDashboard, Heart } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/layout/ThemeToggle";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "All Products", href: "/products" },
  { label: "My Account", href: "/account" },
  { label: "Contact", href: "/#contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { cart, wishlist, user, setCartOpen, setWishlistOpen, setAuthOpen, logout } = useStore();
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const wishCount = wishlist.length;
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Only merge into the hero on routes that actually have one.
  const overHero = pathname === "/";
  const transparent = overHero && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        transparent
          ? "bg-navy/40 backdrop-blur-md border-b border-white/15 shadow-lg -mb-20"
          : "bg-white/95 backdrop-blur-md shadow-sm border-b border-border"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center group flex-shrink-0"
            aria-label="A Mercury Crackers — Home"
          >
            <Image
              src="/logo.png"
              alt="A Mercury Crackers"
              width={740}
              height={326}
              priority
              className="h-12 sm:h-14 w-auto object-contain group-hover:opacity-90 transition-opacity"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-base font-semibold transition-colors duration-200",
                    active
                      ? transparent
                        ? "text-sky"
                        : "text-blue"
                      : transparent
                      ? "text-white hover:text-sky"
                      : "text-navy hover:text-blue"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle transparent={transparent} />

            {/* Wishlist */}
            <button
              onClick={() => setWishlistOpen(true)}
              className={cn(
                "relative w-10 h-10 flex items-center justify-center rounded-full border transition-all hover:scale-105",
                transparent
                  ? "bg-white/15 border-white/30 text-white hover:bg-white/25"
                  : "bg-secondary border-border text-navy hover:bg-navy/10"
              )}
              aria-label={`Wishlist (${wishCount} item${wishCount === 1 ? "" : "s"})`}
            >
              <Heart
                size={20}
                strokeWidth={2}
                className={cn(wishCount > 0 && "fill-red-500 text-red-500")}
              />
              {wishCount > 0 && (
                <span
                  className={cn(
                    "absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full text-[11px] font-bold flex items-center justify-center ring-2",
                    transparent
                      ? "bg-sky text-navy ring-navy/40"
                      : "bg-red-500 text-white ring-white"
                  )}
                >
                  {wishCount > 99 ? "99+" : wishCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className={cn(
                "relative w-10 h-10 flex items-center justify-center rounded-full border transition-all hover:scale-105",
                transparent
                  ? "bg-white/15 border-white/30 text-white hover:bg-white/25"
                  : "bg-secondary border-border text-navy hover:bg-navy/10"
              )}
              aria-label={`Cart (${cartCount} item${cartCount === 1 ? "" : "s"})`}
            >
              <ShoppingBag size={20} strokeWidth={2} />
              {cartCount > 0 && (
                <span
                  className={cn(
                    "absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full text-[11px] font-bold flex items-center justify-center ring-2",
                    transparent
                      ? "bg-sky text-navy ring-navy/40"
                      : "bg-red-500 text-white ring-white"
                  )}
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>

            {/* User */}
            {user ? (
              <div className="hidden md:flex items-center gap-1">
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className={cn(
                      "w-9 h-9 flex items-center justify-center rounded-full transition-all",
                      transparent
                        ? "bg-white/15 hover:bg-white hover:text-navy text-white"
                        : "bg-navy/10 hover:bg-navy hover:text-white text-navy"
                    )}
                  >
                    <LayoutDashboard size={16} />
                  </Link>
                )}
                <Link
                  href="/account"
                  title={`${user.name} — My account`}
                  className={cn(
                    "w-9 h-9 flex items-center justify-center rounded-full text-xs font-bold transition-all",
                    transparent
                      ? "bg-white text-navy hover:bg-sky hover:text-white"
                      : "bg-navy text-white hover:bg-blue"
                  )}
                >
                  {getInitials(user.name)}
                </Link>
              </div>
            ) : (
              <Button
                size="sm"
                className={cn(
                  "hidden md:flex",
                  transparent
                    ? "bg-white text-navy hover:bg-sky hover:text-white"
                    : "bg-navy hover:bg-blue text-white"
                )}
                onClick={() => setAuthOpen(true)}
              >
                <User size={14} />
                Login
              </Button>
            )}

            {/* Mobile Hamburger */}
            <button
              className={cn(
                "md:hidden w-10 h-10 flex items-center justify-center rounded-full border transition-all hover:scale-105",
                transparent
                  ? "bg-white/15 border-white/30 text-white hover:bg-white/25"
                  : "bg-secondary border-border text-navy hover:bg-navy/10"
              )}
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-border px-4 py-4 flex flex-col gap-1 shadow-lg animate-in slide-in-from-top-2 duration-200">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-4 py-3 rounded-xl text-sm font-medium transition-all",
                pathname === link.href
                  ? "text-blue font-bold bg-sky/10"
                  : "text-foreground hover:bg-secondary"
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-border mt-2 pt-3 flex items-center gap-2">
            {user ? (
              <>
                <Link
                  href="/account"
                  className="text-sm text-muted-foreground flex-1 hover:text-navy"
                >
                  Hi, {user.name}
                </Link>
                {user.role === "admin" && (
                  <Link href="/admin" className="btn-xs">
                    <LayoutDashboard size={14} /> Admin
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="flex items-center gap-1 text-sm text-destructive"
                >
                  <LogOut size={14} /> Logout
                </button>
              </>
            ) : (
              <Button
                size="sm"
                className="w-full bg-navy hover:bg-blue text-white"
                onClick={() => {
                  setMobileOpen(false);
                  setAuthOpen(true);
                }}
              >
                Login / Sign Up
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
