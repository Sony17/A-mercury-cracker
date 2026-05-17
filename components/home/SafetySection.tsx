"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Shield, Flame, AlertTriangle, Eye } from "lucide-react";

const SAFETY_TIPS = [
  {
    icon: Eye,
    title: "Supervise Children",
    body: "Always have an adult present when children are near fireworks. Kids should never handle fireworks alone.",
    img: "https://images.unsplash.com/photo-1452369692417-d4d77d95bf7f?w=800&q=80&auto=format&fit=crop",
    alt: "Child holding a sparkler at night",
  },
  {
    icon: Shield,
    title: "Safe Distance",
    body: "Maintain a safe distance. Never lean over fireworks while lighting them. Use a long lighter or incense stick.",
    img: "https://images.unsplash.com/photo-1545505567-7327366a634d?w=800&q=80&auto=format&fit=crop",
    alt: "Fireworks bursting in the night sky at a safe distance",
  },
  {
    icon: Flame,
    title: "Safe Lighting",
    body: "Light one firework at a time. Move away quickly after lighting. Never re-light a firework that fails to ignite.",
    img: "https://images.unsplash.com/photo-1515283736202-cbe98351a5d8?w=800&q=80&auto=format&fit=crop",
    alt: "Close-up of a lit matchstick",
  },
  {
    icon: AlertTriangle,
    title: "Store Safely",
    body: "Keep fireworks in a cool, dry place away from heat sources. Never store near flammable materials.",
    img: "https://images.unsplash.com/photo-1700165644892-3dd6b67b25bc?w=800&q=80&auto=format&fit=crop",
    alt: "Stacked cardboard storage boxes",
  },
];

export default function SafetySection() {
  return (
    <section className="section-pad bg-cream">
      <div className="container-xl">
        <div className="text-center mb-6 sm:mb-10">
          <span className="section-tag">Safety First</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-navy mb-3">Safety Guidelines</h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Your family&apos;s safety is our first priority. Follow these guidelines for a safe celebration.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {SAFETY_TIPS.map((tip, i) => (
            <motion.div
              key={tip.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white border border-border rounded-2xl overflow-hidden hover:shadow-md hover:border-blue/30 transition-all"
            >
              <div className="relative h-36 w-full overflow-hidden bg-navy/5">
                <Image
                  src={tip.img}
                  alt={tip.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-3 left-3 w-10 h-10 rounded-xl bg-white/95 backdrop-blur flex items-center justify-center shadow-sm">
                  <tip.icon size={20} className="text-navy" />
                </div>
              </div>
              <div className="p-4 sm:p-6 pt-4 sm:pt-5">
                <h4 className="font-bold text-navy mb-2">{tip.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{tip.body}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4 text-center">
          <p className="text-amber-800 text-sm font-medium">
            ⚠️ Sale of fireworks regulated under Explosives Act 1884. Strictly for persons 18 years and above.
            HSN: 3604. Use only as per safety instructions on packaging.
          </p>
        </div>
      </div>
    </section>
  );
}
