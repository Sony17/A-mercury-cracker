"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { BUNDLES, DEFAULT_CONTENT } from "@/lib/data";
import type { Bundle } from "@/lib/types";
import { useStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import { ShoppingCart, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const whatsappSVG = (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
    <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24z" />
  </svg>
);

export default function BundlesSection() {
  const c = DEFAULT_CONTENT;
  const { addToCart, showToast } = useStore();
  const [bundles, setBundles] = useState<Bundle[]>(BUNDLES);
  const [showAll, setShowAll] = useState(false);
  const visibleBundles = showAll ? bundles : bundles.slice(0, 3);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("mc_bundles");
      if (raw) {
        const stored = JSON.parse(raw) as Bundle[];
        if (Array.isArray(stored) && stored.length > 0) setBundles(stored);
      }
    } catch {}
  }, []);

  const orderViaWA = (b: Bundle) => {
    const txt = encodeURIComponent(
      `Hi A Mercury Crackers,\n\nI want to order:\n★ ${b.name} — ₹${b.price} (MRP ₹${b.mrp}, save ₹${b.save})\n\nIncludes:\n${b.items.map((i) => "• " + i).join("\n")}\n\nPlease confirm availability and share payment details.`
    );
    window.open(`https://wa.me/91${c.whatsapp}?text=${txt}`, "_blank");
    showToast("Order sent on WhatsApp!");
  };

  return (
    <section id="bundles" className="section-pad bg-cream relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-sky/10 -translate-y-1/2 translate-x-1/4 pointer-events-none" />

      <div className="container-xl relative z-10">
        <div className="text-center mb-6 sm:mb-8">
          <span className="section-tag">★ Best Value · ₹2000 Combos</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-navy mb-3">
            Ready-to-Order ₹2000 Bundles
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Curated cracker combos for every occasion · Worth up to ₹6800 MRP · Save up to 70%
          </p>
        </div>

        {/* Bulk CTA banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 bg-navy text-white px-4 sm:px-6 py-4 rounded-2xl mb-6 sm:mb-8 shadow-lg">
          <div>
            <div className="font-bold text-sm sm:text-base mb-0.5">Want bulk wholesale rates?</div>
            <div className="text-white/75 text-xs sm:text-sm">Download our price list with MOQ + tier pricing for retailers & corporates</div>
          </div>
          <Link href="/b2b" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-white text-navy hover:bg-cream font-bold flex-shrink-0">
              <Download size={15} />
              Get Price List
            </Button>
          </Link>
        </div>

        {/* Bundle Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {visibleBundles.map((b, i) => {
            const pct = Math.round((b.save / b.mrp) * 100);
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
                whileHover={{ y: -6 }}
                className="bg-white rounded-2xl overflow-hidden border-2 border-border hover:border-blue/40 hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden bg-cream">
                  <Image
                    src={b.img}
                    alt={b.name}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, 33vw"
                    loading="lazy"
                  />
                  <Badge className="absolute top-3 left-3 bg-red-500 text-[10px] font-bold">{b.tag}</Badge>
                  <div className="absolute top-3 right-3 bg-green-600 text-white text-xs font-black px-2 py-1 rounded-lg text-center leading-tight">
                    SAVE<br />₹{b.save.toLocaleString()}
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 flex-1 flex flex-col">
                  <h4 className="font-black text-base text-navy mb-1">{b.name}</h4>
                  <p className="text-xs text-muted-foreground mb-3">{b.short}</p>

                  {/* Price row */}
                  <div className="flex items-baseline gap-3 bg-cream rounded-xl px-3 py-2 mb-3">
                    <span className="text-2xl font-black text-navy">{formatPrice(b.price)}</span>
                    <span className="text-sm text-muted-foreground line-through">{formatPrice(b.mrp)}</span>
                    <span className="ml-auto text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded">{pct}% OFF</span>
                  </div>

                  {/* Items */}
                  <ul className="space-y-1 mb-4 flex-1 max-h-36 overflow-y-auto pr-1">
                    {b.items.map((it, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                        {it}
                      </li>
                    ))}
                  </ul>

                  {/* Actions */}
                  <div className="flex gap-2 mt-auto">
                    <Button
                      size="sm"
                      className="flex-1 bg-navy hover:bg-blue text-white font-bold text-xs"
                      onClick={() => {
                        addToCart({ id: b.id, name: b.name, price: b.price, mrp: b.mrp, img: b.img, bundleItems: b.items, isBundle: true });
                        showToast(`${b.name} added to cart!`);
                      }}
                    >
                      <ShoppingCart size={13} /> Add to Cart
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-[#25D366] hover:bg-[#1aa550] text-white font-bold text-xs"
                      onClick={() => orderViaWA(b)}
                    >
                      {whatsappSVG} WhatsApp
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {bundles.length > 3 && (
          <div className="flex justify-center mt-8">
            <Button
              onClick={() => setShowAll((v) => !v)}
              className="bg-navy hover:bg-blue text-white font-bold px-8"
            >
              {showAll ? "Show Less" : `View More (${bundles.length - 3})`}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
