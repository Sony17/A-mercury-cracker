"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";

export default function CategoryGrid() {
  const router = useRouter();
  const { company } = useStore();
  const cards = company.categories ?? [];
  if (cards.length === 0) return null;

  return (
    <section className="section-pad bg-cream">
      <div className="container-xl">
        <div className="text-center mb-6 sm:mb-10">
          <span className="section-tag">Categories</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-3">Shop by Category</h2>
          <p className="text-sm sm:text-base text-white/75 max-w-xl mx-auto">
            Explore our full range of fancy crackers, sparklers, sound bombs and gift boxes
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-4">
          {cards.map((cat, i) => (
            <motion.button
              key={cat.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              whileHover={{ y: -6, scale: 1.02 }}
              onClick={() => router.push(`/products?category=${encodeURIComponent(cat.n)}`)}
              className="on-light group flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-2xl bg-white border-2 border-[rgba(139,105,20,0.35)] hover:border-[#6B4F0F] hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-[#8B6914]/50 group-hover:border-[#6B4F0F] transition-all">
                <Image
                  src={cat.img}
                  alt={cat.n}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="text-center">
                <div className="font-bold text-xs sm:text-sm text-[#001D3D] group-hover:text-[#6B4F0F] transition-colors leading-tight">{cat.n}</div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
