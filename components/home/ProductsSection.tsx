"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { DEFAULT_PRODUCTS, CATEGORIES } from "@/lib/data";
import { useStore } from "@/lib/store";
import { formatPrice, getDiscount, cn } from "@/lib/utils";
import { ShoppingCart, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ProductsSection() {
  const [filter, setFilter] = useState("All");
  const { addToCart, showToast, setCartOpen } = useStore();

  const list = filter === "All" ? DEFAULT_PRODUCTS.slice(0, 8) : DEFAULT_PRODUCTS.filter((p) => p.cat === filter).slice(0, 8);

  const handleAdd = (p: (typeof DEFAULT_PRODUCTS)[0]) => {
    addToCart({ id: p.id, name: p.name, price: p.price, mrp: p.mrp, img: p.img, pack: p.pack });
    showToast(`${p.name} added to cart`);
  };

  return (
    <section id="products" className="section-pad bg-white">
      <div className="container-xl">
        <div className="text-center mb-8">
          <span className="section-tag">Products</span>
          <h2 className="text-3xl md:text-4xl font-black text-navy mb-3">Featured Crackers</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Hand-picked best sellers loved by families across Bareilly
          </p>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200",
                filter === c
                  ? "bg-navy text-white border-navy"
                  : "bg-white text-muted-foreground border-border hover:border-blue hover:text-navy"
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {list.map((p, i) => {
            const off = getDiscount(p.price, p.mrp);
            const isOut = p.stock === false;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className={cn(
                  "group relative bg-white rounded-2xl overflow-hidden border border-border hover:border-blue/40 hover:shadow-xl transition-all duration-300 flex flex-col",
                  isOut && "opacity-60"
                )}
              >
                {/* Image */}
                <div className="relative h-44 bg-cream overflow-hidden">
                  <Image
                    src={p.img}
                    alt={p.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, 25vw"
                    loading="lazy"
                  />
                  {/* Badges */}
                  {p.tag && (
                    <Badge
                      className={cn(
                        "absolute top-2 left-2 text-[10px] font-bold",
                        p.tag === "Sale" ? "bg-red-500" : p.tag === "Best Seller" ? "bg-navy" : "bg-blue"
                      )}
                    >
                      {p.tag}
                    </Badge>
                  )}
                  <Badge
                    className={cn(
                      "absolute top-2 right-2 text-[10px] font-bold",
                      isOut ? "bg-red-500" : "bg-green-600"
                    )}
                  >
                    {isOut ? "Out of Stock" : `${off}% OFF`}
                  </Badge>
                </div>

                {/* Info */}
                <div className="p-3 flex flex-col flex-1">
                  <div className="text-[10px] text-muted-foreground mb-1">{p.brand} · {p.cat}</div>
                  <h4 className="font-bold text-sm text-foreground mb-1 line-clamp-2 leading-snug">{p.name}</h4>
                  <div className="text-[10px] text-muted-foreground mb-2">{p.pack} · SKU: {p.sku}</div>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-lg font-black text-navy">{formatPrice(p.price)}</span>
                    <span className="text-xs text-muted-foreground line-through">{formatPrice(p.mrp)}</span>
                  </div>
                  <Button
                    size="sm"
                    disabled={isOut}
                    onClick={() => handleAdd(p)}
                    className={cn(
                      "mt-auto w-full font-bold text-xs transition-all",
                      isOut
                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                        : "bg-navy hover:bg-blue text-white"
                    )}
                  >
                    {isOut ? (
                      "Out of Stock"
                    ) : (
                      <>
                        <ShoppingCart size={13} /> Add to Cart
                      </>
                    )}
                  </Button>
                </div>

                {/* Glass hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl ring-2 ring-blue/30" />
              </motion.div>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-navy text-navy hover:bg-navy hover:text-white font-bold"
          >
            <Link href="/products">
              <CheckCircle2 size={16} />
              View All Products
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
