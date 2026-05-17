"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Users, TrendingUp, Package } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";

export default function StatsGrid() {
  const { orders, products } = useStore();

  const { revenue, orderCount, customerCount, productCount } = useMemo(() => {
    const live = orders.filter((o) => o.status !== "cancelled");
    const rev = live.reduce((s, o) => s + o.total, 0);
    const emails = new Set(orders.map((o) => o.customer.email.toLowerCase()));
    return {
      revenue: rev,
      orderCount: orders.length,
      customerCount: emails.size,
      productCount: products.length,
    };
  }, [orders, products]);

  const STATS = [
    {
      label: "Total Revenue",
      value: formatPrice(revenue),
      icon: TrendingUp,
      color: "bg-navy",
      trend: orderCount > 0 ? "Live" : "—",
    },
    {
      label: "Total Orders",
      value: String(orderCount),
      icon: ShoppingBag,
      color: "bg-blue",
      trend: orderCount > 0 ? "Live" : "—",
    },
    {
      label: "Customers",
      value: String(customerCount),
      icon: Users,
      color: "bg-sky",
      trend: customerCount > 0 ? "Live" : "—",
    },
    {
      label: "Products",
      value: String(productCount),
      icon: Package,
      color: "bg-[#355872]",
      trend: "Active",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {STATS.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="bg-white rounded-2xl p-3 sm:p-5 border border-border shadow-sm relative overflow-hidden"
        >
          <div className={`w-9 h-9 sm:w-10 sm:h-10 ${s.color} rounded-xl flex items-center justify-center mb-2 sm:mb-3`}>
            <s.icon size={18} className="text-white" />
          </div>
          <div className="text-lg sm:text-2xl font-black text-foreground mb-0.5">{s.value}</div>
          <div className="text-[11px] sm:text-xs text-muted-foreground">{s.label}</div>
          <div className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-green-100 text-green-700">
            {s.trend}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
