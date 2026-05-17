"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { getAvailable, useStore } from "@/lib/store";
import { formatPrice, getDiscount, cn } from "@/lib/utils";
import { ShoppingCart, CheckCircle2, Minus, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/types";
import { FEATURED_LIMIT } from "@/lib/types";

export default function ProductsSection() {
  const { addToCart, changeQty, cart, showToast, products } = useStore();

  const featured = products.filter((p) => p.featured);
  const list = (featured.length > 0 ? featured : products).slice(0, FEATURED_LIMIT);

  const handleAdd = (p: Product) => {
    addToCart({ id: p.id, name: p.name, price: p.price, mrp: p.mrp, img: p.img, pack: p.pack });
    showToast(`${p.name} added to cart`);
  };

  return (
    <section id="products" className="section-pad bg-white">
      <div className="container-xl">
        <div className="text-center mb-6 sm:mb-8">
          <span className="section-tag">Products</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-navy mb-3">Featured Crackers</h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Hand-picked best sellers loved by families across Bareilly
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mt-6 sm:mt-8">
          {list.map((p, i) => {
            const off = getDiscount(p.price, p.mrp);
            const available = getAvailable(p);
            const isOut = available === 0;
            const inCart = cart.find((c) => c.id === p.id)?.qty ?? 0;
            const atMax = available !== null && inCart >= available;
            const lowStock = available !== null && available > 0 && available <= 10;
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
                <div className="relative h-32 sm:h-40 md:h-44 bg-cream overflow-hidden">
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
                  {lowStock && !isOut && (
                    <Badge className="absolute bottom-2 left-2 text-[10px] font-bold bg-amber-500">
                      Only {available} left
                    </Badge>
                  )}
                </div>

                {/* Info */}
                <div className="p-3 flex flex-col flex-1">
                  <div className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1">
                    <span>{p.brand} · {p.cat}</span>
                    {p.featured && (
                      <Star size={11} className="fill-amber-400 text-amber-400 ml-auto" aria-label="Featured" />
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-foreground mb-1 line-clamp-2 leading-snug">{p.name}</h4>
                  <div className="text-[10px] text-muted-foreground mb-2">{p.pack} · SKU: {p.sku}</div>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-lg font-black text-navy">{formatPrice(p.price)}</span>
                    <span className="text-xs text-muted-foreground line-through">{formatPrice(p.mrp)}</span>
                  </div>
                  {isOut ? (
                    <Button
                      size="sm"
                      disabled
                      className="mt-auto w-full font-bold text-xs bg-muted text-muted-foreground cursor-not-allowed"
                    >
                      Out of Stock
                    </Button>
                  ) : inCart > 0 ? (
                    <div className="mt-auto flex items-center justify-between gap-2 bg-navy text-white rounded-md h-8 px-1">
                      <button
                        type="button"
                        aria-label={`Decrease ${p.name} quantity`}
                        onClick={() => changeQty(p.id, -1)}
                        className="w-7 h-7 rounded flex items-center justify-center hover:bg-blue/40 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-xs font-bold tabular-nums">{inCart} in cart</span>
                      <button
                        type="button"
                        aria-label={`Increase ${p.name} quantity`}
                        onClick={() => changeQty(p.id, 1)}
                        disabled={atMax}
                        className="w-7 h-7 rounded flex items-center justify-center hover:bg-blue/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleAdd(p)}
                      className="mt-auto w-full font-bold text-xs bg-navy hover:bg-blue text-white transition-all"
                    >
                      <ShoppingCart size={13} /> Quick Add
                    </Button>
                  )}
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
