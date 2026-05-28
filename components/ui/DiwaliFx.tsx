"use client";

import { useEffect, useState } from "react";

export default function DiwaliFx() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) setShow(true);
  }, []);

  if (!show) return null;

  // Mobile: fixed banner at the top only (30vh) — leaves the rest of the
  // screen iframe-free so touch-scroll always works.
  // Desktop (>= md): full-viewport overlay.
  return (
    <iframe
      aria-hidden
      tabIndex={-1}
      title="Diwali fireworks"
      src="/fireworks/index.html"
      scrolling="no"
      className="pointer-events-none fixed left-0 right-0 top-0 z-30 h-[30vh] w-full border-0 md:inset-0 md:h-full motion-reduce:hidden"
      style={{ background: "transparent" }}
    />
  );
}
