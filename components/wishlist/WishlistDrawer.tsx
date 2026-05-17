"use client";

import Image from "next/image";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import { Heart, Trash2, ShoppingCart } from "lucide-react";

export default function WishlistDrawer() {
  const {
    wishlist,
    wishlistOpen,
    setWishlistOpen,
    removeFromWishlist,
    clearWishlist,
    moveWishlistToCart,
    showToast,
  } = useStore();

  const count = wishlist.length;

  const handleMove = (id: number | string, name: string) => {
    moveWishlistToCart(id);
    showToast(`${name} moved to cart`);
  };

  return (
    <Sheet open={wishlistOpen} onOpenChange={setWishlistOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3 border-b border-border">
          <SheetTitle className="flex items-center gap-2 text-navy">
            <Heart size={18} />
            Your Wishlist
            {count > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {count}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {count === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 sm:px-5 text-muted-foreground">
            <Heart size={48} className="opacity-30" />
            <h4 className="font-bold text-foreground">Your wishlist is empty</h4>
            <p className="text-sm text-center">
              Tap the heart on any product to save it for later.
            </p>
            <Button
              onClick={() => setWishlistOpen(false)}
              className="bg-navy hover:bg-blue text-white font-bold"
            >
              Browse Products
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-3 space-y-3">
              {wishlist.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 py-3 border-b border-border last:border-0"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-cream">
                    <Image
                      src={item.img}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-foreground line-clamp-2">
                      {item.name}
                    </div>
                    {item.pack && (
                      <div className="text-[11px] text-muted-foreground mb-1">{item.pack}</div>
                    )}
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="font-bold text-navy text-sm">
                        {formatPrice(item.price)}
                      </span>
                      <span className="text-[11px] text-muted-foreground line-through">
                        {formatPrice(item.mrp)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleMove(item.id, item.name)}
                        className="flex items-center gap-1 text-[11px] font-bold text-white bg-navy hover:bg-blue px-2.5 py-1.5 rounded-md transition-colors"
                      >
                        <ShoppingCart size={11} /> Add to Cart
                      </button>
                      <button
                        onClick={() => {
                          removeFromWishlist(item.id);
                          showToast(`${item.name} removed from wishlist`, "warn");
                        }}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1.5"
                        aria-label="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-4 sm:px-5 py-4 border-t border-border space-y-2 bg-white">
              <Button
                onClick={() => setWishlistOpen(false)}
                className="w-full bg-navy hover:bg-blue text-white font-bold"
              >
                Continue Shopping
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-muted-foreground"
                onClick={() => {
                  clearWishlist();
                  showToast("Wishlist cleared", "warn");
                }}
              >
                Clear Wishlist
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
