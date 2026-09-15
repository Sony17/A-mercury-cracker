"use client";

import { useState, useMemo } from "react";
import Image from "@/components/ui/SmartImage";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/lib/store";
import { formatPrice, itemLabel } from "@/lib/utils";
import { PACKING_CARRIAGE } from "@/lib/shipping";
import { cartDiscount, describeDiscount } from "@/lib/referrals";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Minus, Plus, Trash2, Package, TicketPercent, X } from "lucide-react";

const WA_ICON = (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
    <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24z" />
  </svg>
);

export default function CartDrawer() {
  const {
    cart,
    cartOpen,
    setCartOpen,
    changeQty,
    clearCart,
    user,
    setAuthOpen,
    showToast,
    decrementStockFromCart,
    getAvailableFor,
    company,
    addOrder,
    markCartRecovered,
    referral,
    applyReferral,
    clearReferral,
  } = useStore();
  const c = company;

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  // Client rule: packing & carriage is a flat, compulsory charge on every order,
  // whatever the value — no tiers, no free threshold. The admin shipping tiers
  // are deliberately left alone; the cart just doesn't read them any more.
  const shipping = PACKING_CARRIAGE;
  // A referral code discounts the subtotal only — packing & carriage is never
  // discounted, so a code can't eat into it.
  const { discount, shortfall } = useMemo(
    () => cartDiscount(referral, subtotal),
    [referral, subtotal]
  );
  const total = subtotal - discount + shipping;
  const [sending, setSending] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [codeBusy, setCodeBusy] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);

  const handleApplyCode = async () => {
    setCodeBusy(true);
    setCodeError(null);
    const result = await applyReferral(codeInput);
    setCodeBusy(false);
    if (result.ok) {
      setCodeInput("");
      showToast(`Code applied — ${formatPrice(result.discount)} off`, "success");
    } else {
      setCodeError(result.message ?? "That code isn't valid.");
    }
  };

  const handleRemoveCode = () => {
    clearReferral();
    setCodeError(null);
    setCodeInput("");
  };

  const orderLines = useMemo(
    () =>
      cart
        .map((i) => {
          let line = `${itemLabel(i)} × ${i.qty} = ${formatPrice(i.price * i.qty)}`;
          if (i.bundleItems?.length) line += `\n   Includes: ${i.bundleItems.join(", ")}`;
          return line;
        })
        .join("\n\n"),
    [cart]
  );

  const placeOrder = async () => {
    if (!user) {
      showToast("Please login to place order", "warn");
      setCartOpen(false);
      setAuthOpen(true);
      return;
    }
    if (!user.phone || !/^\d{10}$/.test(user.phone)) {
      showToast("Add a 10-digit phone in your profile before ordering", "warn");
      return;
    }
    setSending(true);

    // Re-check the code against live server state before committing, but only
    // when the cart is actually claiming a discount — a code parked on a cart
    // that's under its minimum already shows full price, so it just rides along
    // unused. The server recomputes the discount when saving and refuses one it
    // can't honour, so confirming here keeps the shown total honest.
    let finalDiscount = 0;
    if (referral && discount > 0) {
      const recheck = await applyReferral(referral.code);
      if (!recheck.ok || recheck.discount <= 0) {
        clearReferral();
        setCodeError(recheck.message ?? "That code can no longer be used.");
        showToast(recheck.message ?? "Referral code no longer valid", "error");
        setSending(false);
        return;
      }
      finalDiscount = recheck.discount;
    }
    const finalTotal = subtotal - finalDiscount + shipping;

    const orderId = `AMC-${Date.now().toString(36).toUpperCase()}`;
    const addr = user.address;
    const addrText = addr?.line1
      ? `${addr.line1}${addr.line2 ? ", " + addr.line2 : ""}, ${addr.city}, ${addr.state} - ${addr.pincode}`
      : "—";
    const discountLine =
      referral && finalDiscount > 0
        ? `\n*Referral (${referral.display}):* -${formatPrice(finalDiscount)}`
        : "";
    const ownerMsg = encodeURIComponent(
      `🎆 *NEW ORDER* 🎆\n\n*Order ID:* ${orderId}\n\n*Items:*\n${orderLines}\n\n────────────\n*Subtotal:* ${formatPrice(subtotal)}${discountLine}\n*Packing & Carriage:* ${formatPrice(shipping)}\n*Order Total:* ${formatPrice(finalTotal)}\n\n*Customer:*\nName: ${user.name}\nPhone: ${user.phone}\nEmail: ${user.email}\nAddress: ${addrText}\n\nTrack order *${orderId}* in the admin dashboard.`
    );
    addOrder({
      id: orderId,
      total: finalTotal,
      subtotal,
      shipping,
      discount: finalDiscount,
      referralCode: finalDiscount > 0 ? referral?.code : undefined,
      items: cart.map((i) => ({
        id: i.id,
        name: i.name,
        brand: i.brand,
        qty: i.qty,
        price: i.price,
        img: i.img,
        bundleItems: i.bundleItems,
      })),
      customer: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: addr,
      },
    });
    window.open(`https://wa.me/91${c.whatsapp}?text=${ownerMsg}`, "_blank");
    markCartRecovered(orderId);
    decrementStockFromCart();
    clearCart();
    setSending(false);
    setCartOpen(false);
    showToast(`Order ${orderId} placed — track it in your Orders tab`);
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
              className="bg-gold hover:bg-gold-spark text-navy font-bold border border-gold"
            >
              Browse Products
            </Button>
          </div>
        ) : (
          <>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-3 space-y-3">
              {cart.map((item) => {
                const available = getAvailableFor(item.id);
                const atMax = available !== null && item.qty >= available;
                return (
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
                    {item.brand && (
                      <div className="text-[10px] text-gold font-semibold uppercase tracking-wide">
                        {item.brand}
                      </div>
                    )}
                    <div className="font-semibold text-sm text-foreground truncate">{item.name}</div>
                    <div className="text-xs text-muted-foreground mb-2">
                      {formatPrice(item.price)}
                      {item.mrp > item.price && (
                        <span className="line-through ml-1">{formatPrice(item.mrp)}</span>
                      )}
                      {" "}each
                      {item.mrp > item.price && (
                        <span className="ml-1.5 text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded">
                          {Math.round((1 - item.price / item.mrp) * 100)}% OFF
                        </span>
                      )}
                      {available !== null && (
                        <span className={atMax ? "text-amber-700 ml-2" : "ml-2"}>
                          · {available} left
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => changeQty(item.id, -1)}
                        className="w-8 h-8 rounded-md border border-slate-300 flex items-center justify-center text-[#001D3D] hover:bg-slate-100 hover:border-[#001D3D] focus-visible:ring-2 focus-visible:ring-[#FFD166] transition-colors"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="w-6 text-center text-sm font-bold">{item.qty}</span>
                      <button
                        onClick={() => changeQty(item.id, 1)}
                        disabled={atMax}
                        className="w-8 h-8 rounded-md border border-slate-300 flex items-center justify-center text-[#001D3D] hover:bg-slate-100 hover:border-[#001D3D] focus-visible:ring-2 focus-visible:ring-[#FFD166] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
                    <div className="flex flex-col items-end">
                      {item.mrp > item.price && (
                        <span className="text-[11px] text-muted-foreground line-through">
                          {formatPrice(item.mrp * item.qty)}
                        </span>
                      )}
                      <span className="font-bold text-navy text-sm">
                        {formatPrice(item.price * item.qty)}
                      </span>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>

            {/* Totals + Actions */}
            <div className="px-4 sm:px-5 py-4 border-t border-border space-y-3 bg-white">
              {/* Referral code */}
              {referral ? (
                <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2.5">
                  <div className="flex items-start gap-2">
                    <TicketPercent size={15} className="text-green-700 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-green-800 font-mono">
                          {referral.display}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wide text-green-700 bg-green-100 px-1.5 py-0.5 rounded">
                          {describeDiscount(referral)}
                        </span>
                      </div>
                      {shortfall > 0 ? (
                        <p className="text-[11px] text-amber-700 mt-0.5">
                          Add {formatPrice(shortfall)} more to use this code.
                        </p>
                      ) : (
                        <p className="text-[11px] text-green-700 mt-0.5">
                          Saving {formatPrice(discount)} on this order.
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCode}
                      className="text-green-700 hover:text-red-600 transition-colors flex-shrink-0"
                      aria-label="Remove referral code"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label
                    htmlFor="referral-code"
                    className="text-[11px] font-bold uppercase tracking-wide text-navy flex items-center gap-1.5"
                  >
                    <TicketPercent size={13} />
                    Referral code
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="referral-code"
                      value={codeInput}
                      onChange={(e) => {
                        setCodeInput(e.target.value);
                        setCodeError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !codeBusy) void handleApplyCode();
                      }}
                      autoComplete="off"
                      autoCapitalize="characters"
                      spellCheck={false}
                      className="h-9 bg-white text-navy placeholder:text-slate-400 border-slate-300"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => void handleApplyCode()}
                      disabled={codeBusy || !codeInput.trim()}
                      className="h-9 bg-gold hover:bg-gold-spark text-navy font-bold px-4 disabled:opacity-50"
                    >
                      {codeBusy ? "…" : "Apply"}
                    </Button>
                  </div>
                  {codeError && <p className="text-[11px] text-red-600">{codeError}</p>}
                </div>
              )}

              <Separator />

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="font-bold text-navy">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && referral && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Discount
                    <span className="ml-1 font-mono text-[11px] text-green-700">
                      {referral.display}
                    </span>
                  </span>
                  <span className="font-bold text-green-700">-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Packing &amp; Carriage</span>
                <span className="font-bold text-navy">{formatPrice(shipping)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="font-bold">Total</span>
                <span className="text-xl font-black text-navy">{formatPrice(total)}</span>
              </div>
              <Button
                onClick={() => void placeOrder()}
                disabled={sending}
                className="w-full bg-[#25D366] hover:bg-[#1aa550] text-white font-bold disabled:opacity-50"
              >
                {WA_ICON} Order on WhatsApp
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-transparent border-gold text-gold-premium hover:bg-gold hover:text-navy"
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
