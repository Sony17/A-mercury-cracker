"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingBag, User, Menu, X, LogOut, LayoutDashboard, Heart, UserCircle } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/layout/ThemeToggle";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "All Products", href: "/products" },
  { label: "B2B / Bulk", href: "/b2b" },
  { label: "Contact", href: "/#contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { cart, wishlist, user, setCartOpen, setWishlistOpen, setAuthOpen, logout } = useStore();
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const wishCount = wishlist.length;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Translucent navy/glass look only on the home hero at the top of the page.
  // Anywhere else — including the home page once scrolled — use a solid white
  // header with dark text.
  const transparent = pathname === "/" && !scrolled;
  const overlapHero = transparent;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!userMenuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [userMenuOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-colors duration-300",
        transparent
          ? "bg-navy/40 backdrop-blur-md border-b border-white/15 shadow-lg"
          : "bg-white border-b border-border shadow-sm",
        overlapHero && "-mb-20"
      )}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center group flex-shrink-0 min-w-0"
            aria-label="A Mercury Crackers — Home"
          >
            <Image
              src="/logo.png"
              alt="A Mercury Crackers"
              width={740}
              height={326}
              priority
              className="h-10 sm:h-12 md:h-14 w-auto object-contain group-hover:opacity-90 transition-opacity"
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
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            <ThemeToggle transparent={transparent} />

            {/* Wishlist */}
            <button
              onClick={() => setWishlistOpen(true)}
              className={cn(
                "relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border transition-all hover:scale-105",
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
                "relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border transition-all hover:scale-105",
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
              <div className="hidden md:flex items-center gap-1 relative" ref={userMenuRef}>
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
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((o) => !o)}
                  title={user.name}
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                  className={cn(
                    "w-9 h-9 flex items-center justify-center rounded-full text-xs font-bold transition-all",
                    transparent
                      ? "bg-white text-navy hover:bg-sky hover:text-white"
                      : "bg-navy text-white hover:bg-blue"
                  )}
                >
                  {getInitials(user.name)}
                </button>
                {userMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-white shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150 z-50"
                  >
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-xs text-muted-foreground">Signed in as</p>
                      <p className="text-sm font-semibold text-navy truncate">{user.name}</p>
                    </div>
                    <Link
                      href="/account"
                      role="menuitem"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-navy hover:bg-secondary transition-colors"
                    >
                      <UserCircle size={16} /> Profile
                    </Link>
                    <button
                      role="menuitem"
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
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
                "md:hidden w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border transition-all hover:scale-105",
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
          <div className="border-t border-border mt-2 pt-3 flex flex-col gap-1">
            {user ? (
              <>
                <div className="px-4 py-2">
                  <p className="text-xs text-muted-foreground">Signed in as</p>
                  <p className="text-sm font-semibold text-navy truncate">{user.name}</p>
                </div>
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-navy hover:bg-secondary"
                  >
                    <LayoutDashboard size={16} /> Admin
                  </Link>
                )}
                <Link
                  href="/account"
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-navy hover:bg-secondary"
                >
                  <UserCircle size={16} /> Profile
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 text-left"
                >
                  <LogOut size={16} /> Logout
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
