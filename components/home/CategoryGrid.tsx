"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { CATEGORY_CARDS } from "@/lib/data";
import { useRouter } from "next/navigation";

export default function CategoryGrid() {
  const router = useRouter();

  return (
    <section className="section-pad bg-cream">
      <div className="container-xl">
        <div className="text-center mb-10">
          <span className="section-tag">Categories</span>
          <h2 className="text-3xl md:text-4xl font-black text-navy mb-3">Shop by Category</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Explore our full range of fancy crackers, sparklers, sound bombs and gift boxes
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {CATEGORY_CARDS.map((cat, i) => (
            <motion.button
              key={cat.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              whileHover={{ y: -6, scale: 1.02 }}
              onClick={() => router.push(`/products?category=${encodeURIComponent(cat.n)}`)}
              className="group flex flex-col items-center gap-3 p-4 rounded-2xl bg-white border-2 border-border hover:border-blue hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-sky/30 group-hover:border-blue transition-all">
                <Image
                  src={cat.img}
                  alt={cat.n}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="text-center">
                <div className="font-bold text-sm text-foreground group-hover:text-navy transition-colors">{cat.n}</div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
