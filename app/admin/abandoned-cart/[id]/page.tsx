"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import { Download, ArrowLeft, Lock, Loader2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function AbandonedCartPdfPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const decodedId = decodeURIComponent(id);
  const { abandonedCarts, company, user } = useStore();
  const [mounted, setMounted] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [didAutoDownload, setDidAutoDownload] = useState(false);
  const docRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cart = useMemo(
    () => abandonedCarts.find((a) => a && a.id === decodedId),
    [abandonedCarts, decodedId]
  );

  const handleDownload = async () => {
    if (!docRef.current || downloading) return;
    setDownloading(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const safeName = (cart?.customer.email || cart?.id || "cart").replace(/[^a-z0-9._-]+/gi, "-");
      const filename = `Abandoned-Cart-${safeName}.pdf`;
      await html2pdf()
        .from(docRef.current)
        .set({
          margin: [10, 10, 10, 10],
          filename,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff",
            // html2canvas chokes on `oklch(...)` colors used by Tailwind v4
            // defaults. Re-render the clone with explicit safe colors so the
            // canvas pass never sees an unsupported color function.
            onclone: (doc: Document) => {
              const style = doc.createElement("style");
              style.textContent = `
                .pdf-export, .pdf-export * {
                  color: #000814 !important;
                  background-color: transparent !important;
                  border-color: #d4af37 !important;
                  box-shadow: none !important;
                }
                .pdf-export { background-color: #ffffff !important; }
                .pdf-export .text-muted-foreground { color: #6b7280 !important; }
                .pdf-export .text-navy { color: #000814 !important; }
                .pdf-export .text-foreground { color: #000814 !important; }
                .pdf-export .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace !important; }
              `;
              doc.head.appendChild(style);
            },
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .save();
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    if (!mounted || !cart || didAutoDownload) return;
    const auto = new URLSearchParams(window.location.search).get("download") === "1";
    if (!auto) return;
    const t = setTimeout(() => {
      handleDownload();
      setDidAutoDownload(true);
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, cart, didAutoDownload]);

  if (!mounted) return null;

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-14 h-14 rounded-2xl bg-navy/10 flex items-center justify-center">
          <Lock size={24} className="text-navy" />
        </div>
        <h1 className="text-xl font-black text-navy">Admin Access Required</h1>
        <p className="text-sm text-muted-foreground">
          Login as admin to view abandoned carts.
        </p>
      </div>
    );
  }

  if (!cart) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-3 px-4">
        <h1 className="text-xl font-black text-navy">Abandoned cart not found</h1>
        <p className="text-sm text-muted-foreground font-mono">{decodedId}</p>
        <Button variant="outline" onClick={() => window.close()} className="mt-2">
          Close
        </Button>
      </div>
    );
  }

  const subtotal = cart.items.reduce((s, i) => s + i.price * i.qty, 0);
  const totalQty = cart.items.reduce((s, i) => s + i.qty, 0);

  const captured = new Date(cart.createdAt);
  const updated = new Date(cart.updatedAt);
  const fmt = (d: Date) =>
    `${d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })} · ${d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;

  return (
    <div className="admin-shell bg-cream min-h-screen py-6 print:py-0 print:bg-white">
      {/* Toolbar — hidden on print */}
      <div className="max-w-3xl mx-auto px-4 mb-4 flex items-center justify-between gap-3 print:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (window.history.length > 1) window.history.back();
            else window.close();
          }}
        >
          <ArrowLeft size={14} /> Back
        </Button>
        <Button
          size="sm"
          disabled={downloading}
          className="bg-gold hover:bg-gold-spark text-navy font-bold disabled:opacity-70"
          onClick={handleDownload}
        >
          {downloading ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Generating…
            </>
          ) : (
            <>
              <Download size={14} /> Download PDF
            </>
          )}
        </Button>
      </div>

      <div
        ref={docRef}
        className="pdf-export max-w-3xl mx-auto bg-white border border-border shadow-sm rounded-xl print:shadow-none print:border-0 print:rounded-none"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-border flex items-start justify-between gap-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
              Abandoned Cart Summary
            </div>
            <h1 className="text-2xl font-black text-navy">{company.brand}</h1>
            {company.tagline && (
              <p className="text-xs text-muted-foreground mt-1">{company.tagline}</p>
            )}
            <div className="text-[11px] text-muted-foreground mt-2 leading-relaxed whitespace-pre-line">
              {company.address || "—"}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              {company.phone && <>Phone: {company.phone} · </>}
              {company.email}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Captured
            </div>
            <div className="text-sm text-foreground">{fmt(captured)}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-3">
              Last updated
            </div>
            <div className="text-sm text-foreground">{fmt(updated)}</div>
            <div className="mt-3 inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border border-border bg-cream/60 text-navy">
              {cart.status}
            </div>
            {cart.recoveredOrderId && (
              <div className="text-[11px] text-muted-foreground mt-2 font-mono">
                Order: {cart.recoveredOrderId}
              </div>
            )}
          </div>
        </div>

        {/* Customer */}
        <div className="px-8 py-5 border-b border-border">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
            Customer
          </div>
          <div className="text-sm font-bold text-foreground">
            {cart.customer.name || "Unknown customer"}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {cart.customer.email || "no email"}
            {cart.customer.phone && <> · +91 {cart.customer.phone}</>}
          </div>
        </div>

        {/* Line items */}
        <div className="px-8 py-5">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border">
                <th className="text-left font-bold py-2">#</th>
                <th className="text-left font-bold py-2">Item</th>
                <th className="text-right font-bold py-2">Qty</th>
                <th className="text-right font-bold py-2">Rate</th>
                <th className="text-right font-bold py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {cart.items.map((it, idx) => (
                <tr key={String(it.id) + idx} className="border-b border-border/60 align-top">
                  <td className="py-2.5 text-muted-foreground">{idx + 1}</td>
                  <td className="py-2.5">
                    <div className="font-semibold text-foreground">{it.name}</div>
                    {it.bundleItems?.length ? (
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        Includes: {it.bundleItems.join(", ")}
                      </div>
                    ) : null}
                  </td>
                  <td className="py-2.5 text-right">{it.qty}</td>
                  <td className="py-2.5 text-right">{formatPrice(it.price)}</td>
                  <td className="py-2.5 text-right font-semibold text-navy">
                    {formatPrice(it.price * it.qty)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} className="pt-3 text-[11px] text-muted-foreground">
                  Total items: {totalQty}
                </td>
                <td colSpan={2} className="pt-3 text-right text-xs text-muted-foreground">
                  Subtotal
                </td>
                <td className="pt-3 text-right text-sm font-semibold text-foreground">
                  {formatPrice(subtotal)}
                </td>
              </tr>
              <tr>
                <td colSpan={4} className="pt-2 text-right text-xs font-bold uppercase tracking-widest text-navy">
                  Cart Value
                </td>
                <td className="pt-2 text-right text-lg font-black text-navy">
                  {formatPrice(cart.total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-border text-[11px] text-muted-foreground space-y-1">
          <div>
            This is an internal follow-up summary for an unfinished cart. Reach out to the customer
            on WhatsApp{company.whatsapp ? ` (+91 ${company.whatsapp})` : ""} or by email to help
            them complete checkout.
          </div>
          <div className="pt-2 text-[10px] uppercase tracking-widest">
            System-generated · not a tax invoice. Prices reflect the cart at capture time and may
            change.
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 14mm;
          }
          html,
          body {
            background: #ffffff !important;
          }
          body header,
          body footer,
          body nav.fixed {
            display: none !important;
          }
          main {
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
