"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// Lightweight DOM-based bursts shown on mobile.
// Pure transform/opacity animation, pointer-events: none, no iframe
// — safe for touch-scroll on mobile Safari/Chrome.
const MOBILE_BURSTS = [
  { top: "12%", left: "8%", color: "#ffd27a", glow: "rgba(255,170,60,0.6)", delay: 1.5 },
  { top: "16%", right: "10%", color: "#9CD5FF", glow: "rgba(156,213,255,0.6)", delay: 5.5 },
  { top: "44%", left: "70%", color: "#ff7a4a", glow: "rgba(255,90,30,0.55)", delay: 9 },
];
const RAY_ANGLES = Array.from({ length: 10 }, (_, i) => (i * 360) / 10);
const PERIOD = 13;

function MobileSparkles() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60] overflow-hidden motion-reduce:hidden"
    >
      {MOBILE_BURSTS.map((fw, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: (fw as { top?: string }).top,
            left: (fw as { left?: string }).left,
            right: (fw as { right?: string }).right,
          }}
        >
          <motion.span
            className="absolute -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
            style={{ background: fw.color, boxShadow: `0 0 14px ${fw.glow}, 0 0 28px ${fw.glow}` }}
            animate={{ opacity: [0, 1, 0], scale: [0.3, 1.4, 0.3] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              repeatDelay: PERIOD - 1.2,
              delay: fw.delay,
              ease: "easeOut",
            }}
          />
          {RAY_ANGLES.map((angle, j) => {
            const rad = (angle * Math.PI) / 180;
            const r = 56;
            return (
              <motion.span
                key={j}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  background: fw.color,
                  boxShadow: `0 0 5px ${fw.glow}, 0 0 10px ${fw.glow}`,
                  left: 0,
                  top: 0,
                }}
                animate={{
                  x: [0, Math.cos(rad) * r],
                  y: [0, Math.sin(rad) * r],
                  opacity: [0, 1, 0],
                  scale: [0.4, 1, 0.4],
                }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  repeatDelay: PERIOD - 1.4,
                  delay: fw.delay + 0.05,
                  ease: "easeOut",
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default function DiwaliFx() {
  const [variant, setVariant] = useState<"none" | "mobile" | "desktop">("none");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    setVariant(mobile ? "mobile" : "desktop");
  }, []);

  if (variant === "none") return null;
  if (variant === "mobile") return <MobileSparkles />;

  return (
    <iframe
      aria-hidden
      tabIndex={-1}
      title="Diwali fireworks"
      src="/fireworks/index.html"
      scrolling="no"
      className="pointer-events-none fixed inset-0 z-[60] hidden h-full w-full border-0 md:block motion-reduce:hidden"
      style={{ background: "transparent" }}
    />
  );
}
