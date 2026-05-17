"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { useStore } from "@/lib/store";
import { formatPrice, getDiscount, cn } from "@/lib/utils";
import { ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-border">
      <Skeleton className="h-48 w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-8 w-full mt-3" />
      </div>
    </div>
  );
}

export default function ProductCard({ product: p, index = 0 }: ProductCardProps) {
  const { addToCart, toggleWishlist, isWishlisted, showToast } = useStore();
  const off = getDiscount(p.price, p.mrp);
  const isOut = p.stock === false;
  const wished = isWishlisted(p.id);

  const handleAdd = () => {
    addToCart({ id: p.id, name: p.name, price: p.price, mrp: p.mrp, img: p.img, pack: p.pack });
    showToast(`${p.name} added to cart`);
  };

  const handleWishlist = () => {
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      className={cn(
        "group relative bg-white rounded-2xl overflow-hidden border border-border hover:border-blue/40 hover:shadow-xl transition-all duration-300 flex flex-col",
        isOut && "opacity-60"
      )}
    >
      {/* Image */}
      <div className="relative h-52 bg-cream overflow-hidden">
        <Image
          src={p.img}
          alt={p.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          loading="lazy"
        />
        {p.tag && (
          <Badge
            className={cn(
              "absolute top-2.5 left-2.5 text-[10px] font-bold shadow",
              p.tag === "Sale" ? "bg-red-500" : p.tag === "Best Seller" ? "bg-navy" : "bg-blue"
            )}
          >
            {p.tag}
          </Badge>
        )}
        <Badge
          className={cn(
            "absolute top-2.5 right-2.5 text-[10px] font-bold shadow",
            isOut ? "bg-red-500" : "bg-green-600"
          )}
        >
          {isOut ? "Out of Stock" : `${off}% OFF`}
        </Badge>

        {/* Wishlist toggle */}
        <button
          type="button"
          onClick={handleWishlist}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wished}
          className={cn(
            "absolute bottom-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110",
            wished ? "bg-red-500 text-white" : "bg-white/90 text-navy hover:bg-white"
          )}
        >
          <Heart size={15} className={cn(wished && "fill-current")} strokeWidth={2.2} />
        </button>

        {/* Quick add hover overlay */}
        {!isOut && (
          <div className="absolute inset-0 bg-navy/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <button
              onClick={handleAdd}
              className="bg-white text-navy font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-cream transition-colors scale-90 group-hover:scale-100 transition-transform duration-200"
            >
              <ShoppingCart size={14} /> Quick Add
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        {p.brand && (
          <div className="text-[10px] text-blue font-semibold uppercase tracking-wide mb-1">{p.brand}</div>
        )}
        <h4 className="font-bold text-sm text-foreground mb-1 line-clamp-2 leading-snug">{p.name}</h4>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-2">
          <span>{p.cat} · {p.pack}</span>
          {p.sku && <span className="font-mono">#{p.sku}</span>}
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-xl font-black text-navy">{formatPrice(p.price)}</span>
          <span className="text-xs text-muted-foreground line-through">{formatPrice(p.mrp)}</span>
        </div>

        <Button
          size="sm"
          disabled={isOut}
          onClick={handleAdd}
          className={cn(
            "mt-auto w-full font-bold text-xs",
            isOut
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-navy hover:bg-blue text-white"
          )}
        >
          {isOut ? "Out of Stock" : <><ShoppingCart size={13} /> Add to Cart</>}
        </Button>
      </div>

      {/* Ring on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl ring-2 ring-blue/20" />
    </motion.div>
  );
}
