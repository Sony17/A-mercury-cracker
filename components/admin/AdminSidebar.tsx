"use client";

import { cn } from "@/lib/utils";
import { LayoutDashboard, Package, ShoppingBag, ShoppingCart, Settings, LogOut, Sparkles, Users, FileText, MessageSquare, Building2, ImagePlay, Gift, Film, Mail, Tag, LayoutGrid, PartyPopper, KeyRound, Lock } from "lucide-react";
import { useStore } from "@/lib/store";

const NAV = [
  { label: "Dashboard", icon: LayoutDashboard, id: "dashboard" },
  { label: "Hero Slider", icon: ImagePlay, id: "hero" },
  { label: "Products", icon: Package, id: "products" },
  { label: "Categories", icon: LayoutGrid, id: "categories" },
  { label: "Brands", icon: Tag, id: "brands" },
  { label: "Occasions", icon: PartyPopper, id: "occasions" },
  { label: "Bundles", icon: Gift, id: "bundles" },
  { label: "Media", icon: Film, id: "media" },
  { label: "Orders", icon: ShoppingBag, id: "orders" },
  { label: "Abandoned Carts", icon: ShoppingCart, id: "abandoned" },
  { label: "Customers", icon: Users, id: "customers" },
  { label: "Password Resets", icon: KeyRound, id: "resets" },
  { label: "Subscribers", icon: Mail, id: "subscribers" },
  { label: "B2B Inquiries", icon: Building2, id: "b2b" },
  { label: "Policies", icon: FileText, id: "policies" },
  { label: "Chatbot", icon: MessageSquare, id: "chatbot" },
  { label: "Change Password", icon: Lock, id: "password" },
  { label: "Settings", icon: Settings, id: "settings" },
];

interface AdminSidebarProps {
  active: string;
  onChange: (id: string) => void;
}

export default function AdminSidebar({ active, onChange }: AdminSidebarProps) {
  const { logout } = useStore();

  return (
    <aside className="w-60 sm:w-56 max-w-[80vw] bg-navy text-white flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <Sparkles size={16} className="text-sky" />
          </div>
          <div>
            <div className="font-black text-sm text-white">Mercury Admin</div>
            <div className="text-white/75 text-[10px]">Dashboard</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-4 space-y-1">
        {NAV.map((item) => (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
              active === item.id
                ? "bg-white/15 text-white"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            )}
          >
            <item.icon size={16} />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="flex-shrink-0 px-3 py-4 border-t border-white/10">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/80 hover:text-white hover:bg-white/10 transition-all"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
