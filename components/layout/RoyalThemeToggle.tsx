"use client";

import { useEffect, useState } from "react";
import { Crown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "mercury-royal";

export default function RoyalThemeToggle({ transparent = false }: { transparent?: boolean }) {
  const [royal, setRoyal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const on = localStorage.getItem(STORAGE_KEY) === "on";
    setRoyal(on);
    document.documentElement.classList.toggle("royal", on);
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = !royal;
    setRoyal(next);
    document.documentElement.classList.toggle("royal", next);
    localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
  };

  if (!mounted) return <div className="w-16 h-8" aria-hidden />;

  return (
    <button
      onClick={toggle}
      role="switch"
      aria-checked={royal}
      aria-label={royal ? "Switch off Royal theme" : "Switch to Royal theme"}
      title={royal ? "Royal: ON" : "Royal: OFF"}
      className={cn(
        "relative inline-flex items-center h-8 w-16 rounded-full border transition-colors duration-300 shrink-0",
        royal
          ? "border-[#FFD166]"
          : transparent
          ? "bg-white/20 border-white/40 backdrop-blur-sm"
          : "bg-[#001D3D] border-[#D4AF37]/60",
      )}
      style={
        royal
          ? { background: "linear-gradient(90deg, #000814 0%, #001D3D 100%)" }
          : undefined
      }
    >
      <Sparkles
        size={12}
        className={cn(
          "absolute left-2 transition-opacity",
          royal ? "opacity-30 text-white" : "opacity-90 text-[#FFD166]",
        )}
      />
      <Crown
        size={12}
        className={cn(
          "absolute right-2 transition-opacity",
          royal ? "opacity-100 text-[#FFD166]" : "opacity-30 text-white",
        )}
      />
      <span
        className={cn(
          "absolute top-1 left-1 h-6 w-6 rounded-full shadow-md flex items-center justify-center transition-transform duration-300",
          royal ? "translate-x-8" : "translate-x-0",
        )}
        style={{
          background: royal
            ? "linear-gradient(180deg, #FFD166 0%, #D4AF37 100%)"
            : "#FFFFFF",
        }}
      >
        <Crown size={12} style={{ color: royal ? "#000814" : "#001D3D" }} />
      </span>
    </button>
  );
}
