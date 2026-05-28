"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Mail,
  MessageCircle,
  RotateCcw,
  ShoppingCart,
  Trash2,
  XCircle,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { cn, formatPrice } from "@/lib/utils";
import type { AbandonedCart, AbandonedCartStatus } from "@/lib/types";

const TABS: { id: AbandonedCartStatus | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "recovered", label: "Recovered" },
  { id: "dismissed", label: "Dismissed" },
];

const STATUS_STYLES: Record<AbandonedCartStatus, string> = {
  active: "bg-amber-50 text-amber-700 border-amber-200",
  recovered: "bg-green-50 text-green-700 border-green-200",
  dismissed: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function AbandonedCartsEditor() {
  const { abandonedCarts, company, setAbandonedCartStatus, deleteAbandonedCart, showToast } =
    useStore();
  const [tab, setTab] = useState<AbandonedCartStatus | "all">("active");

  const counts = useMemo(
    () => ({
      all: abandonedCarts.length,
      active: abandonedCarts.filter((a) => a.status === "active").length,
      recovered: abandonedCarts.filter((a) => a.status === "recovered").length,
      dismissed: abandonedCarts.filter((a) => a.status === "dismissed").length,
    }),
    [abandonedCarts]
  );

  const recoverableValue = useMemo(
    () =>
      abandonedCarts
        .filter((a) => a.status === "active")
        .reduce((s, a) => s + (typeof a.total === "number" ? a.total : 0), 0),
    [abandonedCarts]
  );

  const filtered = useMemo(() => {
    const list = tab === "all" ? abandonedCarts : abandonedCarts.filter((a) => a.status === tab);
    return [...list].sort((a, b) => b.updatedAt - a.updatedAt);
  }, [abandonedCarts, tab]);

  const waLink = (cart: AbandonedCart) => {
    const phone = cart.customer.phone?.replace(/\D/g, "");
    if (!phone) return null;
    const dest = phone.length === 10 ? "91" + phone : phone;
    const lines = cart.items
      .map((i) => `• ${i.name} × ${i.qty}`)
      .join("\n");
    const brand = company.brand || "A Mercury Crackers";
    const msg = encodeURIComponent(
      `Hi ${cart.customer.name || "there"}! 🎆\n\nYou left some items in your ${brand} cart:\n\n${lines}\n\nTotal: ${formatPrice(cart.total)}\n\nComplete your order before stock runs out — reply here and we'll help you check out.`
    );
    return `https://wa.me/${dest}?text=${msg}`;
  };

  const exportCsv = () => {
    if (filtered.length === 0) return;
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const header = "name,email,phone,items,total,status,updatedAt\n";
    const rows = filtered
      .map((a) =>
        [
          esc(a.customer.name || ""),
          esc(a.customer.email || ""),
          esc(a.customer.phone || ""),
          esc(a.items.map((i) => `${i.name} x${i.qty}`).join("; ")),
          a.total,
          a.status,
          esc(new Date(a.updatedAt).toISOString()),
        ].join(",")
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `abandoned-carts-${tab}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-navy">Abandoned Carts</h2>
          <p className="text-sm text-muted-foreground">
            Signed-in customers who added items but never completed checkout.
          </p>
        </div>
        <Button
          size="sm"
          className="bg-gold hover:bg-gold-spark text-navy font-bold"
          onClick={exportCsv}
          disabled={filtered.length === 0}
        >
          <Download size={14} /> Export CSV
        </Button>
      </div>

      <div className="mb-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-border rounded-2xl p-4 shadow-sm">
          <div className="text-2xl font-black text-navy">{counts.active}</div>
          <div className="text-xs text-muted-foreground">Active carts</div>
        </div>
        <div className="bg-white border border-border rounded-2xl p-4 shadow-sm">
          <div className="text-2xl font-black text-navy">{formatPrice(recoverableValue)}</div>
          <div className="text-xs text-muted-foreground">Recoverable value</div>
        </div>
        <div className="bg-white border border-border rounded-2xl p-4 shadow-sm">
          <div className="text-2xl font-black text-green-700">{counts.recovered}</div>
          <div className="text-xs text-muted-foreground">Recovered</div>
        </div>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {TABS.map((t) => {
          const count = counts[t.id as keyof typeof counts];
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-bold border transition-all",
                active
                  ? "bg-navy text-white border-navy"
                  : "bg-white text-navy border-border hover:border-navy/40"
              )}
            >
              {t.label}
              <span
                className={cn(
                  "ml-2 text-xs px-1.5 py-0.5 rounded-md",
                  active ? "bg-white/15 text-white" : "bg-cream text-muted-foreground"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-12 text-center">
          <ShoppingCart size={32} className="text-muted-foreground mx-auto mb-3" />
          <h3 className="font-bold text-foreground mb-1">No abandoned carts here</h3>
          <p className="text-sm text-muted-foreground">
            When a logged-in shopper leaves items without checking out, they show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => {
            const wa = waLink(a);
            return (
              <div
                key={a.id}
                className="bg-white border border-border rounded-2xl shadow-sm p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-navy truncate">
                        {a.customer.name || "Unknown customer"}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border",
                          STATUS_STYLES[a.status]
                        )}
                      >
                        {a.status}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground break-all mt-0.5">
                      {a.customer.email || "no email"}
                      {a.customer.phone ? ` · +91 ${a.customer.phone}` : ""}
                    </div>
                    {a.recoveredOrderId && (
                      <div className="text-xs text-green-700 mt-0.5">
                        Recovered as order {a.recoveredOrderId}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-navy">{formatPrice(a.total)}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                      <Clock size={12} /> {new Date(a.updatedAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                <ul className="text-sm text-foreground border-t border-border pt-3 space-y-1">
                  {a.items.map((i) => (
                    <li key={i.id} className="flex justify-between gap-3">
                      <span className="truncate">
                        {i.name} <span className="text-muted-foreground">× {i.qty}</span>
                      </span>
                      <span className="font-semibold text-navy whitespace-nowrap">
                        {formatPrice(i.price * i.qty)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-border">
                  {wa && (
                    <a
                      href={wa}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg bg-[#25D366] text-white hover:bg-[#1aa550]"
                    >
                      <MessageCircle size={14} /> Recover via WhatsApp
                    </a>
                  )}
                  {a.customer.email && (
                    <a
                      href={`mailto:${a.customer.email}?subject=${encodeURIComponent(
                        `Your ${company.brand || "A Mercury Crackers"} cart is waiting`
                      )}`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg bg-navy text-white hover:bg-blue"
                    >
                      <Mail size={14} /> Email
                    </a>
                  )}
                  <button
                    onClick={() =>
                      window.open(
                        `/admin/abandoned-cart/${encodeURIComponent(a.id)}?download=1`,
                        "_blank",
                        "noopener"
                      )
                    }
                    className="inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg border border-navy/20 text-navy hover:bg-navy/5"
                  >
                    <FileText size={14} /> PDF
                  </button>
                  {a.status !== "recovered" && (
                    <button
                      onClick={() => setAbandonedCartStatus(a.id, "recovered")}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg border border-green-200 text-green-700 hover:bg-green-50"
                    >
                      <CheckCircle2 size={14} /> Mark recovered
                    </button>
                  )}
                  {a.status === "active" ? (
                    <button
                      onClick={() => setAbandonedCartStatus(a.id, "dismissed")}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-cream"
                    >
                      <XCircle size={14} /> Dismiss
                    </button>
                  ) : (
                    <button
                      onClick={() => setAbandonedCartStatus(a.id, "active")}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-cream"
                    >
                      <RotateCcw size={14} /> Reopen
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm("Delete this abandoned cart record?")) {
                        deleteAbandonedCart(a.id);
                        showToast("Abandoned cart deleted", "success");
                      }
                    }}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-cream ml-auto"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
