"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";

const SESSION_KEY = "amc-legal-notice-shown";
const OPENING_KEY = "amc-opening-shown";

/** Firework bursts painted with CSS — top/left is the burst centre. */
const BURSTS = [
  { top: "7%", left: "6%", size: 300, color: "#FF7A4A", delay: 0 },
  { top: "2%", left: "84%", size: 420, color: "#FFB861", delay: 0.6 },
  { top: "44%", left: "0%", size: 250, color: "#FF8A5B", delay: 1.2 },
  { top: "38%", left: "98%", size: 460, color: "#FFD166", delay: 0.3 },
  { top: "82%", left: "88%", size: 360, color: "#FFC15E", delay: 0.9 },
] as const;

function Burst({
  top,
  left,
  size,
  color,
  delay,
  still,
}: {
  top: string;
  left: string;
  size: number;
  color: string;
  delay: number;
  still: boolean;
}) {
  const mask =
    "radial-gradient(closest-side, transparent 3%, #000 14%, #000 48%, transparent 84%)";
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute rounded-full"
      // marginTop/Left centres the burst on top/left — framer-motion owns `transform`.
      style={{ top, left, width: size, height: size, marginTop: -size / 2, marginLeft: -size / 2 }}
      initial={{ opacity: still ? 0.9 : 0.7, scale: still ? 1 : 0.92 }}
      animate={
        still ? { opacity: 0.9, scale: 1 } : { opacity: [0.7, 1, 0.78], scale: [0.92, 1.05, 0.97] }
      }
      transition={
        still ? { duration: 0 } : { duration: 5, delay, repeat: Infinity, ease: "easeInOut" }
      }
    >
      {/* Radiating spokes */}
      <span
        className="absolute inset-0 rounded-full"
        style={{
          background: `repeating-conic-gradient(from 0deg, ${color} 0deg 0.55deg, transparent 0.55deg 5deg)`,
          WebkitMaskImage: mask,
          maskImage: mask,
          filter: "blur(0.9px)",
        }}
      />
      {/* Hot core */}
      <span
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(closest-side, #FFF3C4 0%, ${color} 12%, transparent 34%)`,
          opacity: 0.75,
        }}
      />
    </motion.span>
  );
}

export default function LegalNoticeModal() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;

  // Show once per session, after the opening animation has cleared.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isAdmin) return; // storefront notice — not for the admin panel
    if (sessionStorage.getItem(SESSION_KEY)) return;
    const afterOpening = sessionStorage.getItem(OPENING_KEY) ? 350 : 3400;
    const t = setTimeout(() => setOpen(true), afterOpening);
    return () => clearTimeout(t);
  }, [isAdmin]);

  const dismiss = () => {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {}
    setOpen(false);
  };

  // Lock scroll, close on Escape, and focus the close button while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    // Focus the panel itself (not the close button) so mouse users get no ring.
    const t = setTimeout(() => panelRef.current?.focus(), 120);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="legal-notice"
          className="fixed inset-0 z-[210] flex items-center justify-center p-3 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close notice"
            onClick={dismiss}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="legal-notice-title"
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-2xl shadow-2xl outline-none ring-1 ring-[#FFD166]/30"
            style={{
              background:
                "radial-gradient(120% 100% at 50% 0%, #8E1210 0%, #6B0D0C 45%, #4A0706 100%)",
            }}
          >
            {/* Fireworks backdrop */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
              <div className="absolute inset-0 opacity-45">
                {BURSTS.map((b, i) => (
                  <Burst key={i} {...b} still={!!reduced} />
                ))}
              </div>
              {/* Ember glow along the bottom edge */}
              <div
                className="absolute inset-x-0 bottom-0 h-40"
                style={{
                  background:
                    "radial-gradient(80% 100% at 50% 120%, rgba(255,140,60,0.28) 0%, transparent 70%)",
                }}
              />
              {/* Scrim keeps the copy readable over the bursts */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(75% 70% at 42% 50%, rgba(58,5,4,0.88) 0%, rgba(58,5,4,0.5) 60%, transparent 100%)",
                }}
              />
            </div>

            <button
              type="button"
              onClick={dismiss}
              aria-label="Close notice"
              className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full text-white/90 transition hover:bg-white/15 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD166] sm:right-5 sm:top-5"
            >
              <X className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2.5} />
            </button>

            <div className="relative px-5 py-10 sm:px-12 sm:py-14">
              <h2
                id="legal-notice-title"
                className="text-[1.05rem] font-bold leading-[1.75] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] sm:text-2xl sm:leading-[1.7]"
              >
                As per supreme court order, online sale of fire crackers are not
                permitted! We value our customers and at the same time, respect
                jurisdiction. We request you to add your products in the order
                form and submit the required crackers through the submit button.
                We will contact you within 24 hours and confirm the order
                through WhatsApp or phone call. Enjoy your celebrations with
                Bareilly Mercury Crackers. We send the parcels through
                registered and legal transport service providers as like every
                other major companies in Bareilly is doing so.
              </h2>

              <button
                type="button"
                onClick={dismiss}
                className="mt-8 rounded-full bg-[#FFD166] px-8 py-3 text-sm font-bold uppercase tracking-wider text-[#4A0706] shadow-lg transition hover:bg-[#FFDF8E] focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:text-base"
              >
                I Understand
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
