"use client";

import Image from "next/image";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import { ShoppingCart, Minus, Plus, Trash2, Package } from "lucide-react";
import { DEFAULT_CONTENT } from "@/lib/data";

const WA_ICON = (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
    <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24z" />
  </svg>
);

export default function CartDrawer() {
  const { cart, cartOpen, setCartOpen, changeQty, clearCart, user, setAuthOpen, showToast } =
    useStore();
  const c = DEFAULT_CONTENT;

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  const freeShippingGap = 3000 - total;

  const handleWhatsApp = () => {
    if (!user) {
      showToast("Please login to place order", "warn");
      setCartOpen(false);
      setAuthOpen(true);
      return;
    }
    const lines = cart
      .map((i) => {
        let line = `${i.name} × ${i.qty} = ${formatPrice(i.price * i.qty)}`;
        if (i.bundleItems?.length) line += `\n   Includes: ${i.bundleItems.join(", ")}`;
        return line;
      })
      .join("\n\n");
    const msg = encodeURIComponent(
      `Hi A Mercury Crackers, I want to order:\n\n${lines}\n\n────────────\nTotal: ${formatPrice(total)}\n\nName: ${user.name}\nPhone: ${user.phone ?? ""}\n\nPlease confirm availability & share UPI/payment details.`
    );
    window.open(`https://wa.me/91${c.whatsapp}?text=${msg}`, "_blank");
    showToast("Order sent on WhatsApp!");
  };

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3 border-b border-border">
          <SheetTitle className="flex items-center gap-2 text-navy">
            <ShoppingCart size={18} />
            Your Cart
            {totalQty > 0 && (
              <span className="bg-navy text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {totalQty}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-5 text-muted-foreground">
            <Package size={48} className="opacity-30" />
            <h4 className="font-bold text-foreground">Your cart is empty</h4>
            <p className="text-sm text-center">Add some amazing crackers to get started!</p>
            <Button
              onClick={() => setCartOpen(false)}
              className="bg-navy hover:bg-blue text-white font-bold"
            >
              Browse Products
            </Button>
          </div>
        ) : (
          <>
            {/* Free shipping progress */}
            {freeShippingGap > 0 && (
              <div className="px-4 sm:px-5 py-3 bg-sky/15 border-b border-border text-xs text-navy">
                Add <strong>{formatPrice(freeShippingGap)}</strong> more for{" "}
                <strong>free shipping</strong>
                <div className="mt-1.5 h-1.5 bg-sky/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-navy rounded-full transition-all"
                    style={{ width: `${Math.min((total / 3000) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
            {freeShippingGap <= 0 && (
              <div className="px-4 sm:px-5 py-2 bg-green-50 border-b border-border text-xs text-green-700 font-semibold">
                ✓ Free shipping included on this order!
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-3 space-y-3">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 py-3 border-b border-border last:border-0"
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-cream">
                    <Image
                      src={item.img}
                      alt={item.name}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-foreground truncate">{item.name}</div>
                    <div className="text-xs text-muted-foreground mb-2">
                      {formatPrice(item.price)} each
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => changeQty(item.id, -1)}
                        className="w-6 h-6 rounded-md border border-border flex items-center justify-center hover:bg-cream transition-colors"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="w-6 text-center text-sm font-bold">{item.qty}</span>
                      <button
                        onClick={() => changeQty(item.id, 1)}
                        className="w-6 h-6 rounded-md border border-border flex items-center justify-center hover:bg-cream transition-colors"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end justify-between">
                    <button
                      onClick={() => changeQty(item.id, -item.qty)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                    <span className="font-bold text-navy text-sm">
                      {formatPrice(item.price * item.qty)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals + Actions */}
            <div className="px-4 sm:px-5 py-4 border-t border-border space-y-3 bg-white">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="font-bold text-navy">{formatPrice(total)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="font-bold">Total</span>
                <span className="text-xl font-black text-navy">{formatPrice(total)}</span>
              </div>
              <Button
                onClick={handleWhatsApp}
                className="w-full bg-[#25D366] hover:bg-[#1aa550] text-white font-bold"
              >
                {WA_ICON} Order on WhatsApp
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-muted-foreground"
                onClick={() => {
                  clearCart();
                  showToast("Cart cleared", "warn");
                }}
              >
                Clear Cart
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
