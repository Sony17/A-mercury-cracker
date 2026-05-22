"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, Heart, ShoppingCart, User } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Products", href: "/products", icon: Package },
  { label: "Wishlist", href: "#wishlist", icon: Heart, action: "wishlist" },
  { label: "Cart", href: "#cart", icon: ShoppingCart, action: "cart" },
  { label: "Account", href: "#auth", icon: User, action: "auth" },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { cart, wishlist, user, setCartOpen, setWishlistOpen, setAuthOpen } = useStore();
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const wishCount = wishlist.length;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/90 backdrop-blur-lg border-t border-border shadow-lg">
      <div className="flex items-center justify-around px-1 py-2 safe-area-inset-bottom">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            !item.action && pathname === item.href;

          const handleClick = () => {
            if (item.action === "cart") setCartOpen(true);
            if (item.action === "wishlist") setWishlistOpen(true);
            if (item.action === "auth") setAuthOpen(true);
          };

          const baseClass = cn(
            "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 relative flex-1 min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]/50",
            isActive ? "text-[#001D3D]" : "text-slate-600 hover:text-[#001D3D]"
          );

          if (item.action === "auth" && user) {
            return (
              <Link key={item.label} href="/account" className={baseClass}>
                <Icon size={22} strokeWidth={1.8} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          }

          if (item.action) {
            const badgeCount =
              item.action === "cart"
                ? cartCount
                : item.action === "wishlist"
                ? wishCount
                : 0;
            return (
              <button key={item.label} onClick={handleClick} className={baseClass}>
                <div className="relative">
                  <Icon
                    size={22}
                    strokeWidth={1.8}
                    className={cn(
                      item.action === "wishlist" && wishCount > 0 && "fill-red-500 text-red-500"
                    )}
                  />
                  {badgeCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                      {badgeCount > 9 ? "9+" : badgeCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          }

          return (
            <Link key={item.label} href={item.href} className={baseClass}>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-navy rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
