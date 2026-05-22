"use client";

import { use, useEffect, useMemo, useState } from "react";
import { Printer, ArrowLeft, Lock } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const decodedId = decodeURIComponent(id);
  const { orders, company, user } = useStore();
  const [mounted, setMounted] = useState(false);
  const [didAutoPrint, setDidAutoPrint] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const order = useMemo(
    () => orders.find((o) => o.id === decodedId),
    [orders, decodedId]
  );

  useEffect(() => {
    if (!mounted || !order || didAutoPrint) return;
    const auto = new URLSearchParams(window.location.search).get("print") === "1";
    if (!auto) return;
    const t = setTimeout(() => {
      window.print();
      setDidAutoPrint(true);
    }, 350);
    return () => clearTimeout(t);
  }, [mounted, order, didAutoPrint]);

  if (!mounted) return null;

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-14 h-14 rounded-2xl bg-navy/10 flex items-center justify-center">
          <Lock size={24} className="text-navy" />
        </div>
        <h1 className="text-xl font-black text-navy">Admin Access Required</h1>
        <p className="text-sm text-muted-foreground">
          Login as admin to view invoices.
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-3 px-4">
        <h1 className="text-xl font-black text-navy">Order not found</h1>
        <p className="text-sm text-muted-foreground font-mono">{decodedId}</p>
        <Button
          variant="outline"
          onClick={() => window.close()}
          className="mt-2"
        >
          Close
        </Button>
      </div>
    );
  }

  const subtotal = order.items.reduce((s, i) => s + i.price * i.qty, 0);
  const total = order.total;
  // If totals diverge (e.g. legacy data), surface the persisted total without
  // inventing a tax breakdown — owner can adjust the printable doc by hand.
  const totalQty = order.items.reduce((s, i) => s + i.qty, 0);
  const addr = order.customer.address;
  const addrText = addr?.line1
    ? `${addr.line1}${addr.line2 ? ", " + addr.line2 : ""}, ${addr.city}, ${addr.state} - ${addr.pincode}`
    : "—";

  const created = new Date(order.createdAt);
  const dateStr = created.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeStr = created.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

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
          className="bg-gold hover:bg-gold-spark text-navy font-bold"
          onClick={() => window.print()}
        >
          <Printer size={14} /> Print / Save as PDF
        </Button>
      </div>

      <div className="max-w-3xl mx-auto bg-white border border-border shadow-sm rounded-xl print:shadow-none print:border-0 print:rounded-none">
        {/* Header */}
        <div className="px-8 py-6 border-b border-border flex items-start justify-between gap-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
              Tax Invoice
            </div>
            <h1 className="text-2xl font-black text-navy">{company.brand}</h1>
            {company.tagline && (
              <p className="text-xs text-muted-foreground mt-1">
                {company.tagline}
              </p>
            )}
            <div className="text-[11px] text-muted-foreground mt-2 leading-relaxed whitespace-pre-line">
              {company.address || "—"}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              {company.phone && <>Phone: {company.phone} · </>}
              {company.email}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1 font-mono">
              {company.gstin && <>GSTIN: {company.gstin}</>}
              {company.fssai && <> · FSSAI: {company.fssai}</>}
              {company.peso && <> · PESO: {company.peso}</>}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Invoice #
            </div>
            <div className="font-mono font-black text-navy text-sm">
              {order.id}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-3">
              Date
            </div>
            <div className="text-sm text-foreground">
              {dateStr}
              <span className="text-muted-foreground"> · {timeStr}</span>
            </div>
            <div className="mt-3 inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border border-border bg-cream/60 text-navy">
              {order.status}
            </div>
          </div>
        </div>

        {/* Bill to + Payment */}
        <div className="px-8 py-5 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-border">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
              Billed to
            </div>
            <div className="text-sm font-bold text-foreground">
              {order.customer.name}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {order.customer.email}
              {order.customer.phone && <> · {order.customer.phone}</>}
            </div>
            <div className="text-xs text-foreground mt-2 whitespace-pre-wrap">
              {addrText}
            </div>
          </div>
          <div className="md:text-right">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
              Payment
            </div>
            <div className="text-sm text-foreground">{order.paidVia}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5 font-mono">
              Txn / UTR: {order.txnId}
            </div>
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
              {order.items.map((it, idx) => (
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
              {subtotal !== total && (
                <tr>
                  <td colSpan={4} className="text-right text-xs text-muted-foreground pt-1">
                    Adjustments
                  </td>
                  <td className="text-right text-sm text-foreground pt-1">
                    {formatPrice(total - subtotal)}
                  </td>
                </tr>
              )}
              <tr>
                <td colSpan={4} className="pt-2 text-right text-xs font-bold uppercase tracking-widest text-navy">
                  Grand Total
                </td>
                <td className="pt-2 text-right text-lg font-black text-navy">
                  {formatPrice(total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Tracking / POD */}
        {(order.tracking?.courier || order.tracking?.number || order.tracking?.url) && (
          <div className="px-8 py-4 border-t border-border text-xs grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <div className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground mb-0.5">
                Courier
              </div>
              <div>{order.tracking.courier || "—"}</div>
            </div>
            <div>
              <div className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground mb-0.5">
                AWB / Tracking #
              </div>
              <div className="font-mono">{order.tracking.number || "—"}</div>
            </div>
            <div className="md:text-right">
              <div className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground mb-0.5">
                Tracking URL
              </div>
              <div className="break-all">{order.tracking.url || "—"}</div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-8 py-5 border-t border-border text-[11px] text-muted-foreground space-y-1">
          <div>
            Thank you for shopping with {company.brand}. For queries reply on
            WhatsApp{company.whatsapp ? ` (+91 ${company.whatsapp})` : ""} or call{" "}
            {company.phone || ""}.
          </div>
          <div>
            Crackers are sold under safety guidelines. Light only under adult
            supervision in an open area. Returns are not accepted on opened
            fireworks for safety reasons.
          </div>
          <div className="pt-2 text-[10px] uppercase tracking-widest">
            This is a system-generated invoice and does not require a signature.
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
          body > * > header,
          body > * > footer,
          body > * > nav,
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
