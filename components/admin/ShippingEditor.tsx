"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { DEFAULT_CONTENT } from "@/lib/data";
import { computeShipping, freeShippingThreshold } from "@/lib/shipping";
import type { ShippingTier } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Plus, Trash2, RotateCcw, Save, Truck } from "lucide-react";

const MAX_TIERS = 6;

function sortForDisplay(tiers: ShippingTier[]): ShippingTier[] {
  return [...tiers].sort((a, b) => {
    if (a.upTo === null) return 1;
    if (b.upTo === null) return -1;
    return a.upTo - b.upTo;
  });
}

function tierLabel(tier: ShippingTier, lowerBound: number): string {
  const lower = lowerBound > 0 ? formatPrice(lowerBound) : formatPrice(0);
  if (tier.upTo === null) return `${lower} and above`;
  return `${lower} – under ${formatPrice(tier.upTo)}`;
}

export default function ShippingEditor() {
  const { company, updateCompany, showToast } = useStore();
  const [items, setItems] = useState<ShippingTier[]>(company.shippingTiers || []);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setItems(company.shippingTiers || []);
  }, [company.shippingTiers]);

  const update = (id: string, patch: Partial<ShippingTier>) => {
    setItems((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    setDirty(true);
  };

  const remove = (id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
    setDirty(true);
  };

  const add = () => {
    if (items.length >= MAX_TIERS) {
      showToast(`Max ${MAX_TIERS} shipping tiers`, "error");
      return;
    }
    setItems((prev) => [
      ...prev,
      { id: `ship-${Date.now().toString(36)}`, upTo: 1000, fee: 100 },
    ]);
    setDirty(true);
  };

  const handleSave = () => {
    updateCompany({ shippingTiers: sortForDisplay(items) });
    setDirty(false);
    showToast("Shipping tiers saved", "success");
  };

  const handleReset = () => {
    if (!confirm("Reset shipping tiers to defaults? Your changes will be lost.")) return;
    setItems(DEFAULT_CONTENT.shippingTiers);
    setDirty(true);
  };

  const sorted = sortForDisplay(items);
  const freeAt = freeShippingThreshold(items);

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-navy/10 flex items-center justify-center flex-shrink-0">
          <Truck size={16} className="text-navy" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-navy">Shipping Charges</h3>
          <p className="text-xs text-muted-foreground">
            Charge shipping by order value. Each tier applies to orders below its &ldquo;up to&rdquo;
            amount. Set a fee of 0 for free shipping. Leave &ldquo;up to&rdquo; blank for the highest
            band (covers all larger orders).
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5">
            <RotateCcw size={13} />
            Reset
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!dirty}
            className="bg-gold hover:bg-gold-spark text-navy gap-1.5"
          >
            <Save size={13} />
            Save
          </Button>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <Button
          onClick={add}
          disabled={items.length >= MAX_TIERS}
          className="bg-gold hover:bg-gold-spark text-navy gap-1.5"
        >
          <Plus size={14} />
          Add tier ({items.length}/{MAX_TIERS})
        </Button>
      </div>

      <div className="space-y-3">
        {sorted.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">
            No shipping tiers — all orders ship free. Add a tier to start charging shipping.
          </p>
        )}
        {sorted.map((tier, idx) => {
          const lowerBound = idx === 0 ? 0 : sorted[idx - 1].upTo ?? 0;
          return (
            <div key={tier.id} className="border border-border rounded-xl p-3 bg-white">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-navy">{tierLabel(tier, lowerBound)}</span>
                <button
                  onClick={() => remove(tier.id)}
                  className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center"
                  aria-label="Remove tier"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-navy uppercase tracking-wide">
                    Orders up to (₹)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={tier.upTo ?? ""}
                    onChange={(e) =>
                      update(tier.id, {
                        upTo: e.target.value === "" ? null : Math.max(0, Number(e.target.value)),
                      })
                    }
                    placeholder="Blank = highest band (no limit)"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-navy uppercase tracking-wide">
                    Shipping fee (₹)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={tier.fee}
                    onChange={(e) =>
                      update(tier.id, { fee: Math.max(0, Number(e.target.value) || 0) })
                    }
                    placeholder="0 = free"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {items.length > 0 && (
        <div className="mt-4 rounded-xl bg-slate-50 border border-border p-3 text-xs text-navy space-y-1">
          <p className="font-bold uppercase tracking-wide text-[11px]">Preview</p>
          {[500, 1500, 3500].map((amt) => {
            const fee = computeShipping(amt, items);
            return (
              <div key={amt} className="flex justify-between">
                <span>Order {formatPrice(amt)}</span>
                <span className="font-semibold">
                  {fee === 0 ? "Free shipping" : `+ ${formatPrice(fee)} shipping`}
                </span>
              </div>
            );
          })}
          <p className="pt-1 text-muted-foreground">
            {freeAt === null
              ? "No free-shipping band — the cart won't show a free-shipping nudge."
              : freeAt === 0
              ? "All orders ship free."
              : `Cart shows a “free shipping” nudge until ${formatPrice(freeAt)}.`}
          </p>
        </div>
      )}
    </div>
  );
}
