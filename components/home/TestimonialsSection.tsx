"use client";

import { motion } from "framer-motion";
import { TESTIMONIALS } from "@/lib/data";
import { Star } from "lucide-react";

export default function TestimonialsSection() {
  return (
    <section className="section-pad bg-navy overflow-hidden relative">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 text-9xl">★</div>
        <div className="absolute bottom-10 right-10 text-9xl">★</div>
      </div>

      <div className="container-xl relative z-10">
        <div className="text-center mb-10">
          <span className="inline-block bg-white/10 text-sky px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-3">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
            What Families Say
          </h2>
          <p className="text-white/65 max-w-xl mx-auto">
            Trusted by 500+ happy families across India every festive season
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-5 hover:bg-white/15 transition-all"
            >
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={14} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-white/85 text-sm leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue to-sky flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {t.name[0]}
                </div>
                <div>
                  <div className="font-bold text-white text-sm">{t.name}</div>
                  <div className="text-white/50 text-xs">{t.city} · {t.date}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
