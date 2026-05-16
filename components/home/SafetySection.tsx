"use client";

import { motion } from "framer-motion";
import { Shield, Flame, AlertTriangle, Eye } from "lucide-react";

const SAFETY_TIPS = [
  { icon: Eye, title: "Supervise Children", body: "Always have an adult present when children are near fireworks. Kids should never handle fireworks alone." },
  { icon: Shield, title: "Safe Distance", body: "Maintain a safe distance. Never lean over fireworks while lighting them. Use a long lighter or incense stick." },
  { icon: Flame, title: "Safe Lighting", body: "Light one firework at a time. Move away quickly after lighting. Never re-light a firework that fails to ignite." },
  { icon: AlertTriangle, title: "Store Safely", body: "Keep fireworks in a cool, dry place away from heat sources. Never store near flammable materials." },
];

export default function SafetySection() {
  return (
    <section className="section-pad bg-cream">
      <div className="container-xl">
        <div className="text-center mb-10">
          <span className="section-tag">Safety First</span>
          <h2 className="text-3xl md:text-4xl font-black text-navy mb-3">Safety Guidelines</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Your family&apos;s safety is our first priority. Follow these guidelines for a safe celebration.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SAFETY_TIPS.map((tip, i) => (
            <motion.div
              key={tip.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white border border-border rounded-2xl p-6 hover:shadow-md hover:border-blue/30 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-navy/10 flex items-center justify-center mb-4">
                <tip.icon size={22} className="text-navy" />
              </div>
              <h4 className="font-bold text-navy mb-2">{tip.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{tip.body}</p>
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
