"use client";

import { useEffect, useState } from "react";
import { Sparkles, Snowflake } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "mercury-theme";

export default function ThemeToggle({ transparent = false }: { transparent?: boolean }) {
  const [festive, setFestive] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const on = saved === "festive";
    setFestive(on);
    document.documentElement.classList.toggle("festive", on);
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = !festive;
    setFestive(next);
    document.documentElement.classList.toggle("festive", next);
    localStorage.setItem(STORAGE_KEY, next ? "festive" : "blue");
  };

  if (!mounted) {
    return <div className="w-16 h-8" aria-hidden />;
  }

  return (
    <button
      onClick={toggle}
      role="switch"
      aria-checked={festive}
      aria-label={festive ? "Switch to vibrant blue theme" : "Switch to festive theme"}
      title={festive ? "Switch to Cool Blue" : "Switch to Festive"}
      className={cn(
        "relative inline-flex items-center h-8 w-16 rounded-full border transition-colors duration-300 shrink-0",
        festive
          ? "bg-gradient-to-r from-[#7c2d12] to-[#ea580c] border-[#facc15]"
          : transparent
          ? "bg-white/20 border-white/40 backdrop-blur-sm"
          : "bg-gradient-to-r from-navy to-blue border-sky"
      )}
    >
      <Snowflake
        size={12}
        className={cn(
          "absolute left-2 transition-opacity",
          festive ? "opacity-30 text-white" : "opacity-90 text-white"
        )}
      />
      <Sparkles
        size={12}
        className={cn(
          "absolute right-2 transition-opacity",
          festive ? "opacity-90 text-white" : "opacity-30 text-white"
        )}
      />
      <span
        className={cn(
          "absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow-md flex items-center justify-center transition-transform duration-300",
          festive ? "translate-x-8" : "translate-x-0"
        )}
      >
        {festive ? (
          <Sparkles size={12} className="text-[#ea580c]" />
        ) : (
          <Snowflake size={12} className="text-blue" />
        )}
      </span>
    </button>
  );
}
