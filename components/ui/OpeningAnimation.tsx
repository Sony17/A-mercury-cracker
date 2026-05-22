"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const SESSION_KEY = "amc-opening-shown";

const RAYS = Array.from({ length: 14 }, (_, i) => (i * 360) / 14);

export default function OpeningAnimation() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY)) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) {
      sessionStorage.setItem(SESSION_KEY, "1");
      return;
    }
    setShow(true);
    const t = setTimeout(() => {
      sessionStorage.setItem(SESSION_KEY, "1");
      setShow(false);
    }, 2600);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="opening"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{
            background:
              "radial-gradient(circle at center, #001D3D 0%, #000814 70%)",
          }}
          aria-hidden
        >
          {/* Central burst */}
          <div className="relative">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.3, 1], opacity: [0, 1, 1] }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="w-24 h-24 rounded-full"
              style={{
                background:
                  "radial-gradient(closest-side, #FFD166, #D4AF37 60%, transparent 80%)",
                boxShadow:
                  "0 0 60px rgba(255,209,102,0.85), 0 0 140px rgba(212,175,55,0.7)",
              }}
            />
            {/* Radial rays */}
            {RAYS.map((angle, i) => {
              const rad = (angle * Math.PI) / 180;
              const r = 220;
              return (
                <motion.span
                  key={i}
                  initial={{ x: 0, y: 0, opacity: 0, scale: 0.2 }}
                  animate={{
                    x: Math.cos(rad) * r,
                    y: Math.sin(rad) * r,
                    opacity: [0, 1, 0],
                    scale: [0.4, 1, 0.4],
                  }}
                  transition={{
                    duration: 1.6,
                    ease: "easeOut",
                    delay: 0.25,
                  }}
                  className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full"
                  style={{
                    background: "#FFD166",
                    boxShadow: "0 0 10px #FFD166, 0 0 20px #D4AF37",
                  }}
                />
              );
            })}
            {/* Brand text */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.1 }}
              className="absolute left-1/2 top-full mt-12 -translate-x-1/2 text-center whitespace-nowrap"
            >
              <div
                className="font-display text-3xl sm:text-5xl font-black"
                style={{
                  background:
                    "linear-gradient(90deg,#FFD166 0%,#D4AF37 50%,#FFD166 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  textShadow: "0 0 26px rgba(212,175,55,0.5)",
                }}
              >
                A Mercury Crackers
              </div>
              <div className="mt-2 text-xs sm:text-sm tracking-[0.4em] uppercase text-white/70">
                Different from others
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
