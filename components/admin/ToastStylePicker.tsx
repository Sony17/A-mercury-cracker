"use client";

import { useEffect, useState } from "react";
import { Bell, Sparkles, PartyPopper, AlignLeft } from "lucide-react";
import { useStore } from "@/lib/store";
import { setToastStyle } from "@/components/ui/ToastDisplay";

type ToastStyle = "premium" | "funny" | "simple";

const STORAGE_KEY = "amc-toast-style";

const OPTIONS: {
  value: ToastStyle;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  {
    value: "premium",
    label: "Rich / Premium",
    description: "Dark blue card with gold rail and sparkle icon.",
    icon: Sparkles,
  },
  {
    value: "funny",
    label: "Funny",
    description: "Playful pastel sticky-note with cheeky prefixes.",
    icon: PartyPopper,
  },
  {
    value: "simple",
    label: "Simple",
    description: "Flat solid colour, no flourish — fast and clear.",
    icon: AlignLeft,
  },
];

export default function ToastStylePicker() {
  const { showToast } = useStore();
  const [style, setStyle] = useState<ToastStyle>("premium");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v === "funny" || v === "simple" || v === "premium") setStyle(v);
  }, []);

  const select = (next: ToastStyle) => {
    setStyle(next);
    setToastStyle(next);
    showToast(`Notifications now ${next === "premium" ? "rich / premium" : next}.`);
  };

  return (
    <div className="border border-border rounded-2xl p-5 bg-card">
      <div className="flex items-center gap-2 mb-1">
        <Bell size={18} className="text-gold" />
        <h3 className="font-display text-base font-bold text-white">
          Notification Style
        </h3>
      </div>
      <p className="text-xs text-white/70 mb-4">
        Choose how customer-facing toasts (add to cart, errors, info) look.
        Saved to the customer&apos;s browser — preview by clicking a card.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const active = style === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => select(opt.value)}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                active
                  ? "border-gold bg-[#001D3D] shadow-[0_8px_24px_rgba(212,175,55,0.25)]"
                  : "border-border bg-[#000814] hover:border-gold/60"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon
                  size={16}
                  className={active ? "text-gold-spark" : "text-gold"}
                />
                <span className="font-bold text-white text-sm">{opt.label}</span>
              </div>
              <p className="text-[11px] text-white/65 leading-snug">
                {opt.description}
              </p>
              {active && (
                <span className="inline-block mt-2 text-[10px] text-gold font-bold uppercase tracking-widest">
                  Active
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
