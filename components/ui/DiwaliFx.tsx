"use client";

import { motion } from "framer-motion";

// Edge firework bursts — subtle, only fire occasionally.
const EDGE_FIREWORKS = [
  { top: "12%", left: "4%", color: "#ffd27a", glow: "rgba(255,170,60,0.6)", delay: 1.5 },
  { top: "18%", right: "5%", color: "#9CD5FF", glow: "rgba(156,213,255,0.65)", delay: 5 },
  { bottom: "18%", left: "6%", color: "#ff7a4a", glow: "rgba(255,90,30,0.55)", delay: 8 },
  { bottom: "22%", right: "7%", color: "#ffe27a", glow: "rgba(255,210,80,0.6)", delay: 11.5 },
];
const EDGE_RAYS = Array.from({ length: 10 }, (_, i) => (i * 360) / 10);
const EDGE_PERIOD = 14;

// Drifting embers — slow upward float for ambience.
const EMBERS = [
  { left: "15%", delay: 0, dur: 11, hue: "#ffcf6b" },
  { left: "38%", delay: 3, dur: 13, hue: "#ff9966" },
  { left: "62%", delay: 6, dur: 12, hue: "#9CD5FF" },
  { left: "85%", delay: 9, dur: 14, hue: "#ffe27a" },
];

export default function DiwaliFx() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60] overflow-hidden motion-reduce:hidden"
    >
      {/* Edge firework bursts */}
      {EDGE_FIREWORKS.map((fw, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: (fw as { top?: string }).top,
            bottom: (fw as { bottom?: string }).bottom,
            left: (fw as { left?: string }).left,
            right: (fw as { right?: string }).right,
          }}
        >
          {/* Central flash */}
          <motion.span
            className="absolute -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full"
            style={{
              background: fw.color,
              boxShadow: `0 0 16px ${fw.glow}, 0 0 32px ${fw.glow}`,
            }}
            animate={{ opacity: [0, 1, 0], scale: [0.3, 1.4, 0.3] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              repeatDelay: EDGE_PERIOD - 1.2,
              delay: fw.delay,
              ease: "easeOut",
            }}
          />
          {/* Rays */}
          {EDGE_RAYS.map((angle, j) => {
            const rad = (angle * Math.PI) / 180;
            const r = 70;
            return (
              <motion.span
                key={j}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  background: fw.color,
                  boxShadow: `0 0 6px ${fw.glow}, 0 0 12px ${fw.glow}`,
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
                  repeatDelay: EDGE_PERIOD - 1.4,
                  delay: fw.delay + 0.05,
                  ease: "easeOut",
                }}
              />
            );
          })}
        </div>
      ))}

      {/* Drifting embers floating upward */}
      {EMBERS.map((e, i) => (
        <motion.span
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            left: e.left,
            bottom: 0,
            background: e.hue,
            boxShadow: `0 0 8px ${e.hue}, 0 0 18px ${e.hue}aa`,
          }}
          animate={{
            y: [0, -window_safe_h()],
            x: [0, 18, -14, 0],
            opacity: [0, 0.9, 0.9, 0],
          }}
          transition={{
            duration: e.dur,
            times: [0, 0.15, 0.85, 1],
            repeat: Infinity,
            repeatDelay: 2,
            delay: e.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

// During SSR `window` is undefined; we just want a tall-enough travel distance.
// Using a constant avoids needing useEffect/useState for this purely-cosmetic value.
function window_safe_h() {
  return 1200;
}
