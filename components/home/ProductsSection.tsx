"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { getAvailable, useStore } from "@/lib/store";
import { formatPrice, getDiscount, cn } from "@/lib/utils";
import { ShoppingCart, CheckCircle2, Minus, Plus, Star, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/types";
import { FEATURED_LIMIT } from "@/lib/types";
import { triggerAddToCartFx } from "@/components/ui/AddToCartFx";

export default function ProductsSection() {
  const { addToCart, changeQty, cart, showToast, products, toggleWishlist, isWishlisted } = useStore();

  const featured = products.filter((p) => p.featured);
  const list = (featured.length > 0 ? featured : products).slice(0, FEATURED_LIMIT);

  const handleAdd = (p: Product, e: React.MouseEvent) => {
    addToCart({ id: p.id, name: p.name, price: p.price, mrp: p.mrp, img: p.img, pack: p.pack });
    triggerAddToCartFx(e);
    showToast(`${p.name} added to cart`);
  };

  const handleWishlist = (p: Product) => {
    const added = toggleWishlist({
      id: p.id,
      name: p.name,
      price: p.price,
      mrp: p.mrp,
      img: p.img,
      pack: p.pack,
      cat: p.cat,
    });
    showToast(added ? `${p.name} added to wishlist` : `${p.name} removed from wishlist`);
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
            const wished = isWishlisted(p.id);
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className={cn(
                  "group relative card-luxury rounded-2xl overflow-hidden hover:border-gold hover:shadow-[0_18px_44px_rgba(212,175,55,0.18)] transition-all duration-300 flex flex-col",
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
                        "absolute top-2.5 left-2.5 h-auto py-1 text-[10px] leading-none font-bold shadow max-w-[60%] text-white",
                        p.tag === "Sale" ? "bg-red-500" : p.tag === "Best Seller" ? "bg-navy" : "bg-blue"
                      )}
                    >
                      {p.tag}
                    </Badge>
                  )}
                  <Badge
                    className={cn(
                      "absolute top-2.5 right-2.5 h-auto py-1 text-[10px] leading-none font-bold shadow text-white",
                      isOut ? "bg-red-500" : "bg-green-600"
                    )}
                  >
                    {isOut ? "Out of Stock" : `${off}% OFF`}
                  </Badge>
                  {lowStock && !isOut && (
                    <Badge className="absolute bottom-2.5 left-2.5 h-auto py-1 text-[10px] leading-none font-bold shadow bg-amber-500 text-[#000814]">
                      Only {available} left
                    </Badge>
                  )}

                  {/* Wishlist toggle */}
                  <button
                    type="button"
                    onClick={() => handleWishlist(p)}
                    aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
                    aria-pressed={wished}
                    className={cn(
                      "absolute bottom-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110",
                      wished ? "bg-red-500 text-white" : "bg-white/90 text-[#000814] hover:bg-white"
                    )}
                  >
                    <Heart size={15} className={cn(wished && "fill-current")} strokeWidth={2.2} />
                  </button>

                  {/* Quick add hover overlay */}
                  {!isOut && inCart === 0 && (
                    <div className="absolute inset-0 bg-[#000814]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={(e) => handleAdd(p, e)}
                        className="btn-gold font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 scale-90 group-hover:scale-100 transition-transform duration-200"
                      >
                        <ShoppingCart size={14} /> Quick Add
                      </button>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3 sm:p-4 flex flex-col flex-1">
                  <div className="flex items-center gap-1 mb-1">
                    {p.brand && (
                      <span className="text-[10px] text-gold font-semibold uppercase tracking-wide">{p.brand}</span>
                    )}
                    {p.featured && (
                      <Star size={11} className="fill-amber-400 text-amber-400 ml-auto" aria-label="Featured" />
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-white mb-1 line-clamp-2 leading-snug">{p.name}</h4>
                  <div className="flex items-center justify-between text-[10px] text-white/75 mb-2">
                    <span>{p.cat} · {p.pack}</span>
                    {p.sku && <span className="font-mono">#{p.sku}</span>}
                  </div>

                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-base sm:text-xl font-black text-gold-spark">{formatPrice(p.price)}</span>
                    <span className="text-xs text-white/65 line-through">{formatPrice(p.mrp)}</span>
                  </div>

                  {isOut ? (
                    <Button
                      size="sm"
                      disabled
                      className="mt-auto w-full font-bold text-xs bg-[#0a1f3a] text-white/70 cursor-not-allowed"
                    >
                      Out of Stock
                    </Button>
                  ) : inCart > 0 ? (
                    <div className="mt-auto flex items-center justify-between gap-2 btn-gold rounded-md h-8 px-1">
                      <button
                        type="button"
                        aria-label={`Decrease ${p.name} quantity`}
                        onClick={() => changeQty(p.id, -1)}
                        className="w-7 h-7 rounded flex items-center justify-center hover:bg-black/10 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-xs font-bold tabular-nums">{inCart} in cart</span>
                      <button
                        type="button"
                        aria-label={`Increase ${p.name} quantity`}
                        onClick={() => changeQty(p.id, 1)}
                        disabled={atMax}
                        className="w-7 h-7 rounded flex items-center justify-center hover:bg-black/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      onClick={(e) => handleAdd(p, e)}
                      className="mt-auto w-full font-bold text-xs btn-gold"
                    >
                      <ShoppingCart size={13} /> Add to Cart
                    </Button>
                  )}
                </div>

                {/* Ring on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl ring-2 ring-gold/40" />
              </motion.div>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-gold text-gold hover:bg-gold hover:text-navy font-bold"
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
