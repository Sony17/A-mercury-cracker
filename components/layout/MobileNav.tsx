"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, ShoppingCart, User } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Products", href: "/products", icon: Package },
  { label: "Cart", href: "#cart", icon: ShoppingCart, action: "cart" },
  { label: "Account", href: "#auth", icon: User, action: "auth" },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { cart, setCartOpen, setAuthOpen } = useStore();
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/90 backdrop-blur-lg border-t border-border shadow-lg">
      <div className="flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.href !== "#cart" && item.href !== "#auth" && pathname === item.href;

          const handleClick = () => {
            if (item.action === "cart") setCartOpen(true);
            if (item.action === "auth") setAuthOpen(true);
          };

          const baseClass = cn(
            "flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all duration-200 relative",
            isActive ? "text-navy" : "text-muted-foreground"
          );

          if (item.action) {
            return (
              <button key={item.label} onClick={handleClick} className={baseClass}>
                <div className="relative">
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                  {item.action === "cart" && cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                      {cartCount > 9 ? "9+" : cartCount}
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
