"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// Minimal mobile rockets: each rises from off-screen and bursts at the apex.
// Pure DOM/Framer Motion, pointer-events: none — safe for touch-scroll.
const MOBILE_ROCKETS = [
  { left: "22%", apexTop: "26%", color: "#ffd27a", glow: "rgba(255,170,60,0.85)", delay: 2, period: 16 },
  { left: "76%", apexTop: "20%", color: "#9CD5FF", glow: "rgba(156,213,255,0.85)", delay: 10, period: 18 },
];
const BURST_RAYS = Array.from({ length: 14 }, (_, i) => (i * 360) / 14);
const RISE_DUR = 1.1;
const BURST_DUR = 1.3;
const RISE_DISTANCE = 520;

function MobileRockets() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60] overflow-hidden motion-reduce:hidden"
    >
      {MOBILE_ROCKETS.map((shot, i) => (
        <div
          key={i}
          className="absolute"
          style={{ left: shot.left, top: shot.apexTop, width: 0, height: 0 }}
        >
          {/* Rising streak — climbs from below up to the apex */}
          <motion.span
            className="absolute rounded-full"
            style={{
              left: 0,
              top: 0,
              width: 3,
              height: 18,
              background: `linear-gradient(to top, transparent, ${shot.color})`,
              boxShadow: `0 0 10px ${shot.glow}, 0 0 22px ${shot.glow}`,
              translateX: "-50%",
            }}
            initial={{ y: RISE_DISTANCE, opacity: 0 }}
            animate={{
              y: [RISE_DISTANCE, 0],
              opacity: [0, 1, 1, 0],
              scaleY: [0.6, 1, 1, 0.4],
            }}
            transition={{
              duration: RISE_DUR,
              times: [0, 0.1, 0.9, 1],
              repeat: Infinity,
              repeatDelay: shot.period - RISE_DUR,
              delay: shot.delay,
              ease: "easeOut",
            }}
          />
          {/* Burst flash at apex */}
          <motion.span
            className="absolute rounded-full"
            style={{
              left: 0,
              top: 0,
              width: 12,
              height: 12,
              background: shot.color,
              boxShadow: `0 0 24px ${shot.glow}, 0 0 48px ${shot.glow}`,
              translateX: "-50%",
              translateY: "-50%",
            }}
            initial={{ opacity: 0, scale: 0.2 }}
            animate={{ opacity: [0, 1, 0], scale: [0.2, 1.8, 0.4] }}
            transition={{
              duration: BURST_DUR,
              repeat: Infinity,
              repeatDelay: shot.period - BURST_DUR,
              delay: shot.delay + RISE_DUR,
              ease: "easeOut",
            }}
          />
          {/* Burst rays */}
          {BURST_RAYS.map((angle, j) => {
            const rad = (angle * Math.PI) / 180;
            const r = 90;
            return (
              <motion.span
                key={j}
                className="absolute rounded-full"
                style={{
                  left: 0,
                  top: 0,
                  width: 4,
                  height: 4,
                  background: shot.color,
                  boxShadow: `0 0 8px ${shot.glow}, 0 0 16px ${shot.glow}`,
                  translateX: "-50%",
                  translateY: "-50%",
                }}
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={{
                  x: [0, Math.cos(rad) * r],
                  y: [0, Math.sin(rad) * r + 28],
                  opacity: [0, 1, 0],
                  scale: [0.3, 1.1, 0.2],
                }}
                transition={{
                  duration: BURST_DUR,
                  repeat: Infinity,
                  repeatDelay: shot.period - BURST_DUR,
                  delay: shot.delay + RISE_DUR + 0.05,
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
  if (variant === "mobile") return <MobileRockets />;

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
