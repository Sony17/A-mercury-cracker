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

// Air shots — rocket streak rises from the bottom and bursts at the apex.
const AIR_SHOTS = [
  { left: "20%", apexTop: "22%", color: "#ffd27a", glow: "rgba(255,170,60,0.8)", delay: 2, period: 14 },
  { left: "50%", apexTop: "16%", color: "#9CD5FF", glow: "rgba(156,213,255,0.8)", delay: 7, period: 16 },
  { left: "80%", apexTop: "26%", color: "#ff7a4a", glow: "rgba(255,90,30,0.8)", delay: 12, period: 18 },
];
const BURST_RAYS = Array.from({ length: 16 }, (_, i) => (i * 360) / 16);
const RISE_DUR = 1.1;
const BURST_DUR = 1.4;

// Willow / Brocade shells — long drooping rays that arc down under gravity.
const WILLOWS = [
  { left: "32%", apexTop: "20%", color: "#ffd27a", glow: "rgba(255,180,80,0.75)", delay: 3, period: 20 },
  { left: "70%", apexTop: "18%", color: "#ffe7b3", glow: "rgba(255,220,140,0.75)", delay: 13, period: 22 },
];
const WILLOW_RAYS = Array.from({ length: 14 }, (_, i) => (i * 360) / 14);
const WILLOW_DUR = 2.4;

// Chrysanthemum — rays that leave a fading trail behind them.
const CHRYSANTHEMUMS = [
  { left: "12%", apexTop: "30%", color: "#ff9a55", glow: "rgba(255,140,60,0.8)", delay: 6, period: 19 },
  { left: "62%", apexTop: "12%", color: "#c9a0ff", glow: "rgba(180,130,255,0.75)", delay: 16, period: 21 },
];
const CHRYS_RAYS = Array.from({ length: 18 }, (_, i) => (i * 360) / 18);
const CHRYS_DUR = 1.8;

// Ring shells — perfect ring of sparks expanding outward, no center flash.
const RINGS = [
  { left: "40%", apexTop: "28%", color: "#9CD5FF", glow: "rgba(156,213,255,0.8)", delay: 4, period: 18 },
  { left: "88%", apexTop: "14%", color: "#a8ffd0", glow: "rgba(140,255,200,0.75)", delay: 14, period: 20 },
];
const RING_DUR = 1.6;

// Crossette — initial burst, then each spark splits into a secondary mini-burst.
const CROSSETTES = [
  { left: "26%", apexTop: "14%", color: "#ffe27a", glow: "rgba(255,210,80,0.8)", delay: 9, period: 22 },
  { left: "72%", apexTop: "32%", color: "#ff7a4a", glow: "rgba(255,90,30,0.8)", delay: 19, period: 24 },
];
const CROSS_PRIMARY = Array.from({ length: 8 }, (_, i) => (i * 360) / 8);
const CROSS_SECONDARY = Array.from({ length: 6 }, (_, i) => (i * 360) / 6);
const CROSS_PRIMARY_DUR = 0.9;
const CROSS_SECONDARY_DUR = 0.7;

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

      {/* Air shots — rocket streak rising then bursting at apex */}
      {AIR_SHOTS.map((shot, i) => (
        <div
          key={`shot-${i}`}
          className="absolute"
          style={{ left: shot.left, top: shot.apexTop, width: 0, height: 0 }}
        >
          {/* Rising streak — climbs from far below the apex up to (0,0) */}
          <motion.span
            className="absolute rounded-full"
            style={{
              left: 0,
              top: 0,
              width: 4,
              height: 22,
              background: `linear-gradient(to top, transparent, ${shot.color})`,
              boxShadow: `0 0 12px ${shot.glow}, 0 0 28px ${shot.glow}`,
              translateX: "-50%",
            }}
            initial={{ y: 800, opacity: 0 }}
            animate={{
              y: [800, 0],
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
              width: 14,
              height: 14,
              background: shot.color,
              boxShadow: `0 0 28px ${shot.glow}, 0 0 56px ${shot.glow}`,
              translateX: "-50%",
              translateY: "-50%",
            }}
            initial={{ opacity: 0, scale: 0.2 }}
            animate={{ opacity: [0, 1, 0], scale: [0.2, 2, 0.4] }}
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
            const r = 130;
            return (
              <motion.span
                key={j}
                className="absolute rounded-full"
                style={{
                  left: 0,
                  top: 0,
                  width: 5,
                  height: 5,
                  background: shot.color,
                  boxShadow: `0 0 10px ${shot.glow}, 0 0 20px ${shot.glow}`,
                  translateX: "-50%",
                  translateY: "-50%",
                }}
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={{
                  x: [0, Math.cos(rad) * r],
                  y: [0, Math.sin(rad) * r + 40],
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

      {/* Willow / Brocade shells — drooping golden rays */}
      {WILLOWS.map((shot, i) => (
        <div
          key={`willow-${i}`}
          className="absolute"
          style={{ left: shot.left, top: shot.apexTop, width: 0, height: 0 }}
        >
          {WILLOW_RAYS.map((angle, j) => {
            const rad = (angle * Math.PI) / 180;
            const r = 90;
            const sag = 180;
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
                  boxShadow: `0 0 8px ${shot.glow}, 0 0 18px ${shot.glow}`,
                  translateX: "-50%",
                  translateY: "-50%",
                }}
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={{
                  x: [0, Math.cos(rad) * r],
                  y: [0, Math.sin(rad) * r * 0.6 + sag],
                  opacity: [0, 1, 0.8, 0],
                  scale: [0.4, 1, 0.7, 0.2],
                }}
                transition={{
                  duration: WILLOW_DUR,
                  times: [0, 0.15, 0.6, 1],
                  repeat: Infinity,
                  repeatDelay: shot.period - WILLOW_DUR,
                  delay: shot.delay,
                  ease: [0.2, 0.6, 0.4, 1],
                }}
              />
            );
          })}
        </div>
      ))}

      {/* Chrysanthemum shells — rays with fading trails */}
      {CHRYSANTHEMUMS.map((shot, i) => (
        <div
          key={`chrys-${i}`}
          className="absolute"
          style={{ left: shot.left, top: shot.apexTop, width: 0, height: 0 }}
        >
          {/* Center flash */}
          <motion.span
            className="absolute rounded-full"
            style={{
              left: 0,
              top: 0,
              width: 10,
              height: 10,
              background: shot.color,
              boxShadow: `0 0 20px ${shot.glow}, 0 0 40px ${shot.glow}`,
              translateX: "-50%",
              translateY: "-50%",
            }}
            initial={{ opacity: 0, scale: 0.2 }}
            animate={{ opacity: [0, 1, 0], scale: [0.2, 1.5, 0.3] }}
            transition={{
              duration: CHRYS_DUR,
              repeat: Infinity,
              repeatDelay: shot.period - CHRYS_DUR,
              delay: shot.delay,
              ease: "easeOut",
            }}
          />
          {/* Trail rays — long rectangles oriented outward, scaling from center */}
          {CHRYS_RAYS.map((angle, j) => {
            const r = 100;
            return (
              <motion.span
                key={j}
                className="absolute"
                style={{
                  left: 0,
                  top: 0,
                  width: 3,
                  height: r,
                  background: `linear-gradient(to top, transparent, ${shot.color})`,
                  boxShadow: `0 0 6px ${shot.glow}`,
                  transformOrigin: "50% 100%",
                  transform: `translate(-50%, -100%) rotate(${angle + 90}deg)`,
                }}
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{
                  scaleY: [0, 1, 1],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: CHRYS_DUR,
                  times: [0, 0.4, 1],
                  repeat: Infinity,
                  repeatDelay: shot.period - CHRYS_DUR,
                  delay: shot.delay + 0.05,
                  ease: "easeOut",
                }}
              />
            );
          })}
        </div>
      ))}

      {/* Ring shells — expanding hollow ring */}
      {RINGS.map((shot, i) => (
        <div
          key={`ring-${i}`}
          className="absolute"
          style={{ left: shot.left, top: shot.apexTop, width: 0, height: 0 }}
        >
          <motion.span
            className="absolute rounded-full"
            style={{
              left: 0,
              top: 0,
              width: 12,
              height: 12,
              border: `2px solid ${shot.color}`,
              boxShadow: `0 0 14px ${shot.glow}, inset 0 0 14px ${shot.glow}`,
              translateX: "-50%",
              translateY: "-50%",
            }}
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ scale: [0.2, 22], opacity: [0, 1, 0] }}
            transition={{
              duration: RING_DUR,
              times: [0, 0.15, 1],
              repeat: Infinity,
              repeatDelay: shot.period - RING_DUR,
              delay: shot.delay,
              ease: "easeOut",
            }}
          />
        </div>
      ))}

      {/* Crossette — primary burst then each tip splits into a secondary burst */}
      {CROSSETTES.map((shot, i) => (
        <div
          key={`cross-${i}`}
          className="absolute"
          style={{ left: shot.left, top: shot.apexTop, width: 0, height: 0 }}
        >
          {/* Primary flash */}
          <motion.span
            className="absolute rounded-full"
            style={{
              left: 0,
              top: 0,
              width: 10,
              height: 10,
              background: shot.color,
              boxShadow: `0 0 18px ${shot.glow}, 0 0 36px ${shot.glow}`,
              translateX: "-50%",
              translateY: "-50%",
            }}
            initial={{ opacity: 0, scale: 0.2 }}
            animate={{ opacity: [0, 1, 0], scale: [0.2, 1.6, 0.4] }}
            transition={{
              duration: CROSS_PRIMARY_DUR,
              repeat: Infinity,
              repeatDelay: shot.period - CROSS_PRIMARY_DUR,
              delay: shot.delay,
              ease: "easeOut",
            }}
          />
          {/* Primary rays + secondary mini-bursts at each tip */}
          {CROSS_PRIMARY.map((angle, j) => {
            const rad = (angle * Math.PI) / 180;
            const r = 90;
            const tipX = Math.cos(rad) * r;
            const tipY = Math.sin(rad) * r;
            return (
              <div key={j} className="absolute" style={{ left: 0, top: 0 }}>
                {/* Primary ray traveling to tip */}
                <motion.span
                  className="absolute rounded-full"
                  style={{
                    left: 0,
                    top: 0,
                    width: 5,
                    height: 5,
                    background: shot.color,
                    boxShadow: `0 0 8px ${shot.glow}, 0 0 16px ${shot.glow}`,
                    translateX: "-50%",
                    translateY: "-50%",
                  }}
                  initial={{ x: 0, y: 0, opacity: 0 }}
                  animate={{
                    x: [0, tipX],
                    y: [0, tipY],
                    opacity: [0, 1, 0],
                    scale: [0.3, 1, 0.2],
                  }}
                  transition={{
                    duration: CROSS_PRIMARY_DUR,
                    repeat: Infinity,
                    repeatDelay: shot.period - CROSS_PRIMARY_DUR,
                    delay: shot.delay + 0.04,
                    ease: "easeOut",
                  }}
                />
                {/* Secondary mini-burst at the tip */}
                {CROSS_SECONDARY.map((subAngle, k) => {
                  const subRad = (subAngle * Math.PI) / 180;
                  const subR = 26;
                  return (
                    <motion.span
                      key={k}
                      className="absolute rounded-full"
                      style={{
                        left: 0,
                        top: 0,
                        width: 3,
                        height: 3,
                        background: shot.color,
                        boxShadow: `0 0 6px ${shot.glow}`,
                        translateX: "-50%",
                        translateY: "-50%",
                      }}
                      initial={{ x: tipX, y: tipY, opacity: 0 }}
                      animate={{
                        x: [tipX, tipX + Math.cos(subRad) * subR],
                        y: [tipY, tipY + Math.sin(subRad) * subR + 8],
                        opacity: [0, 1, 0],
                        scale: [0.3, 1, 0.2],
                      }}
                      transition={{
                        duration: CROSS_SECONDARY_DUR,
                        repeat: Infinity,
                        repeatDelay: shot.period - CROSS_SECONDARY_DUR,
                        delay: shot.delay + CROSS_PRIMARY_DUR * 0.85,
                        ease: "easeOut",
                      }}
                    />
                  );
                })}
              </div>
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
