"use client";

import { motion } from "framer-motion";
import { OCCASION_ITEMS } from "@/lib/data";
import { useRouter } from "next/navigation";

export default function OccasionSection() {
  const router = useRouter();

  return (
    <section id="occasion" className="section-pad bg-white">
      <div className="container-xl">
        <div className="text-center mb-6 sm:mb-10">
          <span className="section-tag">Curated for every celebration</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-navy mb-3">Shop by Occasion</h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            From festivals to weddings — find the right pack for the moment you are celebrating
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4">
          {OCCASION_ITEMS.map((item, i) => (
            <motion.button
              key={item.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              whileHover={{ y: -8, scale: 1.03 }}
              onClick={() => router.push(`/products?occasion=${encodeURIComponent(item.n)}`)}
              className="group flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-5 rounded-2xl bg-cream border-2 border-border hover:border-blue hover:shadow-lg transition-all duration-300 relative overflow-hidden"
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-navy to-blue scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />

              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-navy to-blue flex items-center justify-center text-xl sm:text-2xl shadow-md group-hover:scale-110 group-hover:rotate-12 transition-all duration-400">
                {item.ic}
              </div>
              <div className="text-center">
                <div className="font-bold text-xs sm:text-sm text-navy">{item.n}</div>
                <div className="text-[10px] text-muted-foreground hidden sm:block">{item.t}</div>
              </div>
              <span className="text-[10px] font-bold text-navy bg-sky/20 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full group-hover:bg-navy group-hover:text-white transition-all duration-300">
                Shop Now →
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
