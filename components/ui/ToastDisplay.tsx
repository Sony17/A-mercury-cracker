"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, Sparkles, PartyPopper } from "lucide-react";

type ToastStyle = "premium" | "funny" | "simple";

const STORAGE_KEY = "amc-toast-style";

function readStyle(): ToastStyle {
  if (typeof window === "undefined") return "premium";
  const v = window.localStorage.getItem(STORAGE_KEY);
  if (v === "funny" || v === "simple" || v === "premium") return v;
  return "premium";
}

export function setToastStyle(style: ToastStyle) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, style);
  window.dispatchEvent(new CustomEvent("amc:toast-style", { detail: style }));
}

export default function ToastDisplay() {
  const { toast } = useStore();
  const [style, setStyle] = useState<ToastStyle>("premium");

  useEffect(() => {
    setStyle(readStyle());
    const onChange = (e: Event) => {
      const ce = e as CustomEvent<ToastStyle>;
      setStyle(ce.detail);
    };
    window.addEventListener("amc:toast-style", onChange as EventListener);
    return () =>
      window.removeEventListener("amc:toast-style", onChange as EventListener);
  }, []);

  if (!toast) return <AnimatePresence />;

  const isError = toast.type === "error";
  const isWarn = toast.type === "warn";
  const isInfo = toast.type === "info";

  const baseIcon = isError || isWarn ? AlertCircle : isInfo ? Info : CheckCircle2;

  // Funny copy embellishments for success toasts
  const funnyPrefix = isError
    ? "Whoops! 💥"
    : isWarn
    ? "Hold on! 🤔"
    : isInfo
    ? "Heads up! 📣"
    : "Boom! 🎆";

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.msg}
          initial={{ opacity: 0, y: -20, x: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 320, damping: 22 }}
          className="fixed top-20 right-4 z-[9999] max-w-xs"
        >
          {style === "premium" && (
            <div
              className={cn(
                "relative overflow-hidden flex items-center gap-3 pl-4 pr-5 py-3 rounded-2xl text-sm font-semibold shadow-2xl",
                "border"
              )}
              style={{
                background:
                  "linear-gradient(135deg, #001D3D 0%, #000814 100%)",
                borderColor: "rgba(212,175,55,0.55)",
                color: "#fff",
                boxShadow:
                  "0 16px 40px rgba(0,8,20,0.55), 0 0 0 1px rgba(255,209,102,0.1) inset",
              }}
            >
              <div
                aria-hidden
                className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-2/3 rounded-full"
                style={{
                  background: "linear-gradient(180deg, #FFD166, #D4AF37)",
                  boxShadow: "0 0 18px rgba(255,209,102,0.7)",
                }}
              />
              <Sparkles
                size={18}
                className="flex-shrink-0"
                style={{ color: "#FFD166" }}
              />
              <span className="font-display tracking-wide">{toast.msg}</span>
            </div>
          )}

          {style === "funny" && (() => {
            const Icon = isError || isWarn ? AlertCircle : PartyPopper;
            return (
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold shadow-xl border-2",
                  isError
                    ? "bg-red-100 text-red-800 border-red-400"
                    : isWarn
                    ? "bg-amber-100 text-amber-900 border-amber-400"
                    : isInfo
                    ? "bg-sky-100 text-sky-900 border-sky-400"
                    : "bg-yellow-100 text-yellow-900 border-yellow-400"
                )}
                style={{ transform: "rotate(-1deg)" }}
              >
                <motion.span
                  animate={{ rotate: [0, -15, 12, -8, 0] }}
                  transition={{ duration: 0.8 }}
                  className="text-xl"
                >
                  <Icon size={20} className="inline-block" />
                </motion.span>
                <span>
                  <span className="font-black mr-1">{funnyPrefix}</span>
                  {toast.msg}
                </span>
              </div>
            );
          })()}

          {style === "simple" && (() => {
            const Icon = baseIcon;
            return (
              <div
                className={cn(
                  "flex items-center gap-2 px-4 py-3 rounded-lg shadow-md text-sm font-medium",
                  isError
                    ? "bg-red-600 text-white"
                    : isWarn
                    ? "bg-amber-600 text-white"
                    : isInfo
                    ? "bg-slate-700 text-white"
                    : "bg-emerald-700 text-white"
                )}
              >
                <Icon size={16} className="flex-shrink-0" />
                <span>{toast.msg}</span>
              </div>
            );
          })()}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
