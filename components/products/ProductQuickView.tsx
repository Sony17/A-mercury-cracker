"use client";

import { useState } from "react";
import Image from "@/components/ui/SmartImage";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getAvailable, useStore } from "@/lib/store";
import { cn, formatPrice, getDiscount } from "@/lib/utils";
import { triggerAddToCartFx } from "@/components/ui/AddToCartFx";
import { Heart, Minus, Plus, ShoppingCart, X } from "lucide-react";
import type { Product } from "@/lib/types";

interface ProductQuickViewProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const whatsappSVG = (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
    <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24z" />
  </svg>
);

/**
 * Product detail popup opened by clicking a product card.
 *
 * The dialog surface is light (`bg-white` + `.on-light`), so `text-white`
 * would be repainted navy by the royal readability guards in globals.css.
 * Labels on coloured chips therefore use literal `text-[#FFFFFF]`, which no
 * `.on-light` rule targets.
 */
export default function ProductQuickView({ product, open, onOpenChange }: ProductQuickViewProps) {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl"
      >
        {/* Keyed + mounted only while open, so the quantity picker starts at 1
            on every open without a state-resetting effect. */}
        <QuickViewBody key={product.id} product={product} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function QuickViewBody({ product: p, onClose }: { product: Product; onClose: () => void }) {
  const { addToCart, changeQty, cart, showToast, toggleWishlist, isWishlisted, company } = useStore();
  const [qty, setQty] = useState(1);

  const off = getDiscount(p.price, p.mrp);
  const save = p.mrp - p.price;
  const available = getAvailable(p);
  const isOut = available === 0;
  const lowStock = available !== null && available > 0 && available <= 10;
  const inCart = cart.find((c) => c.id === p.id)?.qty ?? 0;
  const maxAdd = available === null ? 99 : Math.max(0, available - inCart);
  const atMax = !isOut && maxAdd === 0;
  const wished = isWishlisted(p.id);

  const handleAdd = (e: React.MouseEvent) => {
    if (isOut || atMax) return;
    // addToCart puts one unit in; the rest of the chosen quantity is applied as
    // a delta, which re-uses the store's stock clamping.
    addToCart({ id: p.id, name: p.name, brand: p.brand, price: p.price, mrp: p.mrp, img: p.img, pack: p.pack });
    if (qty > 1) changeQty(p.id, qty - 1);
    triggerAddToCartFx(e);
    showToast(`${qty} × ${p.name} added to cart`);
    onClose();
  };

  const handleWishlist = () => {
    const added = toggleWishlist({
      id: p.id,
      name: p.name,
      brand: p.brand,
      price: p.price,
      mrp: p.mrp,
      img: p.img,
      pack: p.pack,
      cat: p.cat,
    });
    showToast(added ? `${p.name} added to wishlist` : `${p.name} removed from wishlist`);
  };

  const enquireOnWA = () => {
    const txt = encodeURIComponent(
      `Hi ${company.brand},\n\nI'd like to know more about:\n★ ${p.name}${p.sku ? ` (#${p.sku})` : ""}\n• Pack: ${p.pack}\n• Price: ₹${p.price} (MRP ₹${p.mrp})\n\nIs it available?`
    );
    window.open(`https://wa.me/91${company.whatsapp}?text=${txt}`, "_blank");
  };

  const specs: { label: string; value: string }[] = [
    { label: "Category", value: p.cat },
    { label: "Pack size", value: p.pack },
    ...(p.brand ? [{ label: "Brand", value: p.brand }] : []),
    ...(p.sku ? [{ label: "SKU", value: p.sku }] : []),
  ];

  return (
    <>
      <DialogClose asChild>
        <button
          type="button"
          aria-label="Close product details"
          className="absolute top-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[#001D3D] shadow-md transition-colors hover:bg-white"
        >
          <X size={17} strokeWidth={2.4} />
        </button>
      </DialogClose>

      <div className="grid md:grid-cols-2">
        {/* Image */}
        {/* object-contain, not cover: the popup shows the whole product image
            rather than a crop of it. */}
        <div className="relative h-64 bg-slate-100 sm:h-80 md:h-auto md:min-h-[26rem]">
          <Image
            src={p.img}
            alt={p.name}
            fill
            className="object-contain p-3 sm:p-4"
            sizes="(max-width: 768px) 100vw, 384px"
          />
          {p.tag && (
            <span
              className={cn(
                "absolute top-3 left-3 rounded-md px-2 py-1 text-[10px] leading-none font-bold text-[#FFFFFF] shadow",
                p.tag === "Sale" ? "bg-red-500" : p.tag === "Best Seller" ? "bg-[#001D3D]" : "bg-[#0353A4]"
              )}
            >
              {p.tag}
            </span>
          )}
          {!isOut && off > 0 && (
            <span className="absolute bottom-3 left-3 rounded-md bg-green-600 px-2 py-1 text-[11px] leading-none font-bold text-[#FFFFFF] shadow">
              {off}% OFF
            </span>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col p-5 sm:p-6">
          {p.brand && (
            <div className="mb-1 text-[11px] font-semibold tracking-wide text-gold uppercase">{p.brand}</div>
          )}
          <DialogTitle className="pr-8 text-xl leading-tight font-black text-[#001D3D] sm:text-2xl">
            {p.name}
          </DialogTitle>
          <DialogDescription className="mt-1 text-xs text-slate-600">
            {p.cat} · {p.pack}
          </DialogDescription>

          {/* Price */}
          <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-xl bg-slate-100 px-4 py-3">
            <span className="text-2xl font-black text-[#001D3D] sm:text-3xl">{formatPrice(p.price)}</span>
            <span className="text-sm text-slate-500 line-through">{formatPrice(p.mrp)}</span>
            {save > 0 && (
              <span className="ml-auto rounded bg-green-100 px-2 py-0.5 text-xs font-bold text-green-800">
                Save {formatPrice(save)}
              </span>
            )}
          </div>

          {/* Stock */}
          <div className="mt-3 text-xs font-semibold">
            {isOut ? (
              <span className="text-red-600">● Out of stock</span>
            ) : lowStock ? (
              <span className="text-amber-700">● Hurry — only {available} left</span>
            ) : (
              <span className="text-green-700">● In stock</span>
            )}
            {inCart > 0 && <span className="ml-2 font-normal text-slate-600">({inCart} already in cart)</span>}
          </div>

          {/* Description */}
          {p.description && <p className="mt-3 text-sm leading-relaxed text-slate-700">{p.description}</p>}

          {/* Specs */}
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-slate-200 pt-4 text-xs">
            {specs.map((s) => (
              <div key={s.label}>
                <dt className="text-slate-500">{s.label}</dt>
                <dd className="font-semibold text-[#001D3D]">{s.value}</dd>
              </div>
            ))}
          </dl>

          {/* Quantity */}
          {!isOut && (
            <div className="mt-5 flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-600">Quantity</span>
              <div className="flex items-center rounded-lg border border-slate-300 bg-white">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  className="flex h-9 w-9 items-center justify-center rounded-l-lg text-[#001D3D] transition-colors hover:bg-slate-100 disabled:opacity-35 disabled:hover:bg-transparent"
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center text-sm font-bold tabular-nums text-[#001D3D]">{qty}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQty((q) => Math.min(Math.max(1, maxAdd), q + 1))}
                  disabled={qty >= maxAdd}
                  className="flex h-9 w-9 items-center justify-center rounded-r-lg text-[#001D3D] transition-colors hover:bg-slate-100 disabled:opacity-35 disabled:hover:bg-transparent"
                >
                  <Plus size={14} />
                </button>
              </div>
              <span className="text-sm font-bold text-[#001D3D]">= {formatPrice(p.price * qty)}</span>
            </div>
          )}

          {/* Actions */}
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Button
              onClick={handleAdd}
              disabled={isOut || atMax}
              className={cn(
                "flex-1 font-bold",
                isOut || atMax ? "cursor-not-allowed bg-slate-200 text-slate-500" : "btn-gold"
              )}
            >
              {isOut ? (
                "Out of Stock"
              ) : atMax ? (
                "Max quantity in cart"
              ) : (
                <>
                  <ShoppingCart size={15} /> Add {qty > 1 ? `${qty} ` : ""}to Cart
                </>
              )}
            </Button>
            <Button
              onClick={handleWishlist}
              aria-pressed={wished}
              className={cn(
                "font-bold sm:w-auto",
                wished
                  ? "bg-red-500 text-[#FFFFFF] hover:bg-red-600"
                  : "border border-slate-300 bg-white text-[#001D3D] hover:bg-slate-100"
              )}
            >
              <Heart size={15} className={cn(wished && "fill-current")} />
              <span className="sm:hidden">{wished ? "Saved" : "Wishlist"}</span>
            </Button>
          </div>

          {company.whatsapp && (
            <Button
              onClick={enquireOnWA}
              className="mt-2 w-full bg-[#25D366] font-bold text-[#FFFFFF] hover:bg-[#1aa550]"
            >
              {whatsappSVG} Ask about this product
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
