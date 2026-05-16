"use client";

import { motion } from "framer-motion";
import { Shield, Tag, Truck, Star } from "lucide-react";

const ITEMS = [
  { Icon: Shield, title: "Child Safe", sub: "NEERI certified quality" },
  { Icon: Tag, title: "Best Prices", sub: "Up to 70% off MRP" },
  { Icon: Truck, title: "Free Delivery", sub: "On orders above ₹3000" },
  { Icon: Star, title: "15+ Years Trust", sub: "Established since 2010" },
];

export default function TrustBadges() {
  return (
    <section className="py-6 bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {ITEMS.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-cream border border-border hover:border-blue/40 hover:shadow-sm transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-navy/10 flex items-center justify-center flex-shrink-0">
                <item.Icon size={18} className="text-navy" />
              </div>
              <div>
                <div className="font-bold text-sm text-foreground">{item.title}</div>
                <div className="text-xs text-muted-foreground">{item.sub}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
