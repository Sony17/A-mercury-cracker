"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Users, TrendingUp, Package } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const STATS = [
  { label: "Total Revenue", value: formatPrice(84250), icon: TrendingUp, color: "bg-navy", trend: "+18%", up: true },
  { label: "Total Orders", value: "143", icon: ShoppingBag, color: "bg-blue", trend: "+12%", up: true },
  { label: "Customers", value: "98", icon: Users, color: "bg-sky", trend: "+5%", up: true },
  { label: "Products", value: "16", icon: Package, color: "bg-[#355872]", trend: "Active", up: true },
];

export default function StatsGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {STATS.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="bg-white rounded-2xl p-5 border border-border shadow-sm relative overflow-hidden"
        >
          <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center mb-3`}>
            <s.icon size={18} className="text-white" />
          </div>
          <div className="text-2xl font-black text-foreground mb-0.5">{s.value}</div>
          <div className="text-xs text-muted-foreground">{s.label}</div>
          <div className={`absolute top-4 right-4 text-xs font-bold px-2 py-0.5 rounded-full ${s.up ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {s.trend}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
