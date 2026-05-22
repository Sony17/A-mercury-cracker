"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingBag, User, Menu, X, LogOut, LayoutDashboard, Heart, UserCircle } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
        "sticky top-0 z-40 w-full transition-all duration-300",
        transparent
          ? "bg-navy/30 backdrop-blur-md border-b border-white/10"
          : "bg-navy/95 backdrop-blur-xl border-b border-gold/30 shadow-[0_4px_24px_rgba(0,8,20,0.4)]",
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
                      ? "text-gold"
                      : "text-white/90 hover:text-gold"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            {/* Wishlist */}
            <button
              onClick={() => setWishlistOpen(true)}
              className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border border-gold-spark/70 bg-gold-spark/15 !text-gold-spark hover:bg-gold-spark/25 hover:border-gold-spark transition-all hover:scale-105 [&_svg]:!text-gold-spark"
              aria-label={`Wishlist (${wishCount} item${wishCount === 1 ? "" : "s"})`}
            >
              <Heart
                size={20}
                strokeWidth={2.25}
                className={cn(wishCount > 0 && "fill-gold-spark")}
              />
              {wishCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full text-[11px] font-bold flex items-center justify-center ring-2 ring-navy bg-gold-spark text-navy">
                  {wishCount > 99 ? "99+" : wishCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border border-gold-spark/70 bg-gold-spark/15 !text-gold-spark hover:bg-gold-spark/25 hover:border-gold-spark transition-all hover:scale-105 [&_svg]:!text-gold-spark"
              aria-label={`Cart (${cartCount} item${cartCount === 1 ? "" : "s"})`}
            >
              <ShoppingBag size={20} strokeWidth={2.25} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full text-[11px] font-bold flex items-center justify-center ring-2 ring-navy bg-gold-spark text-navy">
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
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-gold hover:text-navy transition-all"
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
                  className="w-9 h-9 flex items-center justify-center rounded-full text-xs font-bold bg-gold text-navy hover:bg-gold-spark transition-all"
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
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-navy hover:bg-slate-100 transition-colors"
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
                className="hidden md:flex bg-gold text-navy hover:bg-gold-spark font-semibold"
                onClick={() => setAuthOpen(true)}
              >
                <User size={14} />
                Login
              </Button>
            )}

            {/* Mobile Hamburger */}
            <button
              className="md:hidden w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-gold/20 hover:border-gold/50 transition-all hover:scale-105"
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
        <div className="md:hidden bg-navy border-t border-gold/30 px-4 py-4 flex flex-col gap-1 shadow-lg animate-in slide-in-from-top-2 duration-200">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-4 py-3 rounded-xl text-sm font-medium transition-all",
                pathname === link.href
                  ? "text-gold font-bold bg-gold/10"
                  : "text-white/90 hover:bg-white/10"
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-white/10 mt-2 pt-3 flex flex-col gap-1">
            {user ? (
              <>
                <div className="px-4 py-2">
                  <p className="text-xs text-white/75">Signed in as</p>
                  <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                </div>
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-white/90 hover:bg-white/10"
                  >
                    <LayoutDashboard size={16} /> Admin
                  </Link>
                )}
                <Link
                  href="/account"
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-white/90 hover:bg-white/10"
                >
                  <UserCircle size={16} /> Profile
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 text-left"
                >
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <Button
                size="sm"
                className="w-full bg-gold hover:bg-gold-spark text-navy font-semibold"
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
