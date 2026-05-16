"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { DEFAULT_CONTENT, PIC } from "@/lib/data";
import { CheckCircle2 } from "lucide-react";

const FEATURES = [
  { title: "Finest variety, child-safe quality", body: "Each product carefully selected for safety" },
  { title: "Unbeatable rates", body: "Best prices you won't find anywhere else" },
  { title: "One-stop fancy crackers store", body: "Dazzling range under one roof" },
];

export default function AboutSection() {
  const c = DEFAULT_CONTENT;
  const yearsOfTrust = 2026 - parseInt(c.est);
  const initials = c.ownerName.split(" ").map((s: string) => s[0]).join("").slice(0, 2).toUpperCase();

  return (
    <section id="about" className="section-pad bg-white">
      <div className="container-xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
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
            <h2 className="text-3xl md:text-4xl font-black text-navy mb-4">{c.tagline}</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">{c.about}</p>

            <div className="space-y-4 mb-6">
              {FEATURES.map((f) => (
                <div key={f.title} className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-navy mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-sm text-foreground">{f.title}</div>
                    <div className="text-xs text-muted-foreground">{f.body}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Owner card */}
            <div className="flex items-center gap-4 bg-cream border border-border rounded-xl p-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-navy to-blue flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                {initials}
              </div>
              <div>
                <div className="font-bold text-foreground">{c.ownerName}</div>
                <div className="text-xs text-muted-foreground">Owner & Founder · Established {c.est}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
