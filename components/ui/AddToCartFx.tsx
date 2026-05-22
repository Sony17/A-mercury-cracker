"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface Burst {
  id: number;
  x: number;
  y: number;
  label: string;
}

const RAYS = Array.from({ length: 10 }, (_, i) => (i * 360) / 10);

export default function AddToCartFx() {
  const [bursts, setBursts] = useState<Burst[]>([]);

  useEffect(() => {
    const onFx = (e: Event) => {
      const ce = e as CustomEvent<{ x: number; y: number; label?: string }>;
      const { x, y, label = "+1" } = ce.detail || { x: 0, y: 0 };
      const id = Date.now() + Math.random();
      setBursts((b) => [...b, { id, x, y, label }]);
      setTimeout(() => {
        setBursts((b) => b.filter((it) => it.id !== id));
      }, 1100);
    };
    window.addEventListener("amc:add-to-cart", onFx as EventListener);
    return () =>
      window.removeEventListener("amc:add-to-cart", onFx as EventListener);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[150]" aria-hidden>
      <AnimatePresence>
        {bursts.map((b) => (
          <div
            key={b.id}
            className="absolute"
            style={{ left: b.x, top: b.y, width: 0, height: 0 }}
          >
            {/* Central flash */}
            <motion.span
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: [0.2, 1.6, 0.2], opacity: [0, 1, 0] }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full"
              style={{
                background:
                  "radial-gradient(closest-side, #FFD166 0%, #D4AF37 60%, transparent 80%)",
                boxShadow: "0 0 22px rgba(255,209,102,0.85)",
              }}
            />
            {/* Gold rays */}
            {RAYS.map((angle, j) => {
              const rad = (angle * Math.PI) / 180;
              const r = 48;
              return (
                <motion.span
                  key={j}
                  initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
                  animate={{
                    x: Math.cos(rad) * r,
                    y: Math.sin(rad) * r,
                    opacity: [0, 1, 0],
                    scale: [0.4, 1, 0.4],
                  }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                  className="absolute w-1.5 h-1.5 rounded-full"
                  style={{
                    background: "#FFD166",
                    boxShadow: "0 0 8px #FFD166, 0 0 14px #D4AF37",
                  }}
                />
              );
            })}
            {/* Floating +1 label */}
            <motion.span
              initial={{ opacity: 0, y: 0, scale: 0.9 }}
              animate={{ opacity: [0, 1, 0], y: -56, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute -translate-x-1/2 font-display font-black text-sm px-2 py-0.5 rounded-full"
              style={{
                background: "linear-gradient(180deg, #FFD166, #D4AF37)",
                color: "#000814",
                boxShadow: "0 4px 12px rgba(212,175,55,0.4)",
              }}
            >
              {b.label}
            </motion.span>
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function triggerAddToCartFx(
  event: React.MouseEvent | MouseEvent,
  label = "+1"
) {
  if (typeof window === "undefined") return;
  const x = (event as MouseEvent).clientX || 0;
  const y = (event as MouseEvent).clientY || 0;
  window.dispatchEvent(
    new CustomEvent("amc:add-to-cart", { detail: { x, y, label } })
  );
}
