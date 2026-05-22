"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { DEFAULT_CONTENT, PIC } from "@/lib/data";
import { ShieldCheck, Tag, Truck, Award, Sparkles, Store } from "lucide-react";

const FEATURES = [
  { icon: ShieldCheck, title: "Child Safe", body: "NEERI certified quality" },
  { icon: Tag, title: "Best Prices", body: "Up to 70% off MRP" },
  { icon: Truck, title: "Free Delivery", body: "On orders above ₹3000" },
  { icon: Award, title: "32+ Years Trust", body: "Established since 1994" },
];

const HIGHLIGHTS = [
  { icon: Sparkles, title: "Unbeatable rates", body: "Best prices you won't find anywhere else" },
  { icon: Store, title: "One-stop fancy crackers store", body: "Dazzling range under one roof" },
];

export default function AboutSection() {
  const c = DEFAULT_CONTENT;
  const yearsOfTrust = 2026 - parseInt(c.est);

  return (
    <section id="about" className="section-pad bg-white">
      <div className="container-xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          {/* Image side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden aspect-[5/4] shadow-2xl">
              <Image
                src={PIC.about}
                alt="Diwali fireworks"
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            {/* Est badge */}
            <div className="absolute -bottom-4 -right-4 bg-white border border-border shadow-xl rounded-2xl px-5 py-4">
              <div className="text-3xl font-black text-navy leading-none">{yearsOfTrust}+</div>
              <div className="text-xs text-muted-foreground font-medium">Years of Trust</div>
            </div>
          </motion.div>

          {/* Text side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="section-tag">About Us</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-navy mb-4">{c.tagline}</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6">{c.about}</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {FEATURES.map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.title}
                    className="flex items-start gap-3 rounded-xl p-3 bg-[#001D3D] bg-gradient-to-br from-navy via-blue to-blue/80 text-white shadow-lg"
                  >
                    <div className="w-9 h-9 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                      <Icon size={18} className="text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm leading-tight">{f.title}</div>
                      <div className="text-xs text-white/80 mt-0.5">{f.body}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {HIGHLIGHTS.map((h) => {
                const Icon = h.icon;
                return (
                  <div
                    key={h.title}
                    className="flex items-start gap-3 rounded-xl p-4 bg-[#001D3D] bg-gradient-to-br from-navy via-blue to-blue/80 text-white shadow-lg"
                  >
                    <div className="w-9 h-9 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                      <Icon size={18} className="text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm leading-tight">{h.title}</div>
                      <div className="text-xs text-white/80 mt-0.5">{h.body}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Owner card */}
            <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="relative w-14 h-14 rounded-full overflow-hidden bg-[#001D3D] bg-gradient-to-br from-navy to-blue flex-shrink-0 ring-2 ring-white shadow">
                <Image
                  src="/founder.png"
                  alt={c.ownerName}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>
              <div>
                <div className="font-bold text-[#001D3D]">{c.ownerName}</div>
                <div className="text-xs text-slate-600">Owner & Founder · Established {c.est}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
