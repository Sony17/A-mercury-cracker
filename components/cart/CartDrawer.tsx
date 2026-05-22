"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import { ShoppingCart, Minus, Plus, Trash2, Package, Copy, Check } from "lucide-react";

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
  } = useStore();
  const c = company;
  const upiVpa = company.upiVpa?.trim() || "amercurycrackers@upi";
  const upiPayeeName = company.upiPayeeName?.trim() || company.brand || "A Mercury Crackers";
  const customQrUrl = company.upiQrImageUrl?.trim() || "";

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  const freeShippingGap = 3000 - total;

  const [payOpen, setPayOpen] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [txnId, setTxnId] = useState("");
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);

  const orderLines = useMemo(
    () =>
      cart
        .map((i) => {
          let line = `${i.name} × ${i.qty} = ${formatPrice(i.price * i.qty)}`;
          if (i.bundleItems?.length) line += `\n   Includes: ${i.bundleItems.join(", ")}`;
          return line;
        })
        .join("\n\n"),
    [cart]
  );

  const qrUrl = orderId
    ? customQrUrl ||
      `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
        `upi://pay?pa=${upiVpa}&pn=${encodeURIComponent(upiPayeeName)}&am=${total}&tn=${orderId}`
      )}`
    : "";

  const openPayment = () => {
    if (!user) {
      showToast("Please login to place order", "warn");
      setCartOpen(false);
      setAuthOpen(true);
      return;
    }
    setOrderId(`AMC-${Date.now().toString(36).toUpperCase()}`);
    setTxnId("");
    setCopied(false);
    setCartOpen(false);
    setPayOpen(true);
  };

  const copyVpa = async () => {
    try {
      await navigator.clipboard.writeText(upiVpa);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      showToast("Copy failed", "warn");
    }
  };

  const sendToOwner = () => {
    if (!user) return;
    const trimmed = txnId.trim();
    if (trimmed.length < 6) {
      showToast("Enter a valid transaction / UTR ID", "warn");
      return;
    }
    if (!user.phone || !/^\d{10}$/.test(user.phone)) {
      showToast("Add a 10-digit phone in your profile before ordering", "warn");
      setPayOpen(false);
      return;
    }
    setSending(true);
    const paidVia = `UPI (${upiVpa})`;
    const addr = user.address;
    const addrText = addr?.line1
      ? `${addr.line1}${addr.line2 ? ", " + addr.line2 : ""}, ${addr.city}, ${addr.state} - ${addr.pincode}`
      : "—";
    const ownerMsg = encodeURIComponent(
      `🎆 *NEW PAID ORDER* 🎆\n\n*Order ID:* ${orderId}\n*Txn / UTR ID:* ${trimmed}\n*Paid via:* ${paidVia}\n\n*Items:*\n${orderLines}\n\n────────────\n*Total Paid:* ${formatPrice(total)}\n\n*Customer:*\nName: ${user.name}\nPhone: ${user.phone}\nEmail: ${user.email}\nAddress: ${addrText}\n\nTrack order *${orderId}* in the admin dashboard.`
    );
    addOrder({
      id: orderId,
      txnId: trimmed,
      total,
      items: cart.map((i) => ({
        id: i.id,
        name: i.name,
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
      paidVia,
    });
    window.open(`https://wa.me/91${c.whatsapp}?text=${ownerMsg}`, "_blank");
    decrementStockFromCart();
    clearCart();
    setSending(false);
    setPayOpen(false);
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
                    <div className="font-semibold text-sm text-foreground truncate">{item.name}</div>
                    <div className="text-xs text-muted-foreground mb-2">
                      {formatPrice(item.price)} each
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
                    <span className="font-bold text-navy text-sm">
                      {formatPrice(item.price * item.qty)}
                    </span>
                  </div>
                </div>
                );
              })}
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
                onClick={openPayment}
                className="w-full bg-[#25D366] hover:bg-[#1aa550] text-white font-bold"
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

      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <DialogHeader className="px-5 pt-5 pb-3 border-b border-border">
            <DialogTitle className="text-navy">Complete Payment</DialogTitle>
            <DialogDescription>
              Scan the QR with any UPI app, then paste your Transaction / UTR ID below.
            </DialogDescription>
          </DialogHeader>

          <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Order ID</span>
              <span className="font-mono font-bold text-navy">{orderId}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-black text-navy text-lg">{formatPrice(total)}</span>
            </div>

            <div className="flex flex-col items-center gap-2 py-2">
              {qrUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrUrl}
                  alt="UPI QR"
                  width={220}
                  height={220}
                  className="rounded-lg border border-border bg-white"
                />
              )}
              <button
                type="button"
                onClick={copyVpa}
                className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1.5 rounded-md border border-border hover:bg-cream"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />} {upiVpa}
              </button>
              <p className="text-[11px] text-muted-foreground text-center">
                After paying, copy the Transaction ID / UTR from your UPI app.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">
                Transaction / UTR ID <span className="text-destructive">*</span>
              </label>
              <Input
                value={txnId}
                onChange={(e) => setTxnId(e.target.value.trim())}
                placeholder="e.g. 4502xxxxxxxx"
                inputMode="text"
                autoComplete="off"
                className="font-mono"
              />
              <p className="text-[11px] text-muted-foreground">
                Required — owner will verify this before confirming dispatch.
              </p>
            </div>
          </div>

          <div className="px-5 py-4 border-t border-border bg-white space-y-2">
            <Button
              onClick={sendToOwner}
              disabled={sending || txnId.trim().length < 6}
              className="w-full bg-[#25D366] hover:bg-[#1aa550] text-white font-bold disabled:opacity-50"
            >
              {WA_ICON} Send Order + Txn ID to Owner
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-transparent border-gold text-gold-premium hover:bg-gold hover:text-navy"
              onClick={() => setPayOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
}
