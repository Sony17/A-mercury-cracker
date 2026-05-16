"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, User, Menu, X, Sparkles, LogOut, LayoutDashboard, Search } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "₹2000 Bundles", href: "/#bundles", highlight: true },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { cart, user, setCartOpen, setAuthOpen, logout } = useStore();
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-border"
          : "bg-white border-b border-border"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-navy text-white flex items-center justify-center font-black text-sm shadow-md group-hover:bg-blue transition-colors duration-200">
              <Sparkles size={18} />
            </div>
            <div className="hidden sm:block">
              <div className="font-black text-navy text-sm leading-tight tracking-tight">
                A Mercury Crackers
              </div>
              <div className="text-[10px] text-muted-foreground font-medium tracking-wide">
                Different from others
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  link.highlight
                    ? "text-navy font-bold bg-sky/20 hover:bg-sky/30"
                    : pathname === link.href
                    ? "text-navy bg-secondary"
                    : "text-foreground/70 hover:text-navy hover:bg-secondary"
                )}
              >
                {link.highlight && <span className="mr-1">★</span>}
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search (desktop) */}
            <Link
              href="/products"
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary text-muted-foreground hover:text-navy hover:bg-blue/10 transition-all text-sm"
            >
              <Search size={15} />
              <span className="text-xs">Search crackers…</span>
            </Link>

            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative w-9 h-9 flex items-center justify-center rounded-full bg-secondary hover:bg-blue/20 text-navy transition-all hover:scale-105"
              aria-label="Cart"
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-4.5 h-4.5 flex items-center justify-center rounded-full leading-none px-0.5">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>

            {/* User */}
            {user ? (
              <div className="hidden md:flex items-center gap-1">
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-navy/10 hover:bg-navy hover:text-white text-navy transition-all"
                  >
                    <LayoutDashboard size={16} />
                  </Link>
                )}
                <button
                  onClick={logout}
                  title={`${user.name} — Click to logout`}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-navy text-white text-xs font-bold hover:bg-blue transition-all"
                >
                  {getInitials(user.name)}
                </button>
              </div>
            ) : (
              <Button
                size="sm"
                className="hidden md:flex bg-navy hover:bg-blue text-white"
                onClick={() => setAuthOpen(true)}
              >
                <User size={14} />
                Login
              </Button>
            )}

            {/* Mobile Hamburger */}
            <button
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-secondary text-navy"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
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
                link.highlight
                  ? "text-navy font-bold bg-sky/10"
                  : "text-foreground hover:bg-secondary"
              )}
            >
              {link.highlight && "★ "}
              {link.label}
            </Link>
          ))}
          <div className="border-t border-border mt-2 pt-3 flex items-center gap-2">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground flex-1">
                  Hi, {user.name}
                </span>
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
