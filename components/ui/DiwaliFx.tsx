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

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60] motion-reduce:hidden"
      style={{ touchAction: "pan-y" }}
    >
      <iframe
        tabIndex={-1}
        title="Diwali fireworks"
        src="/fireworks/index.html"
        scrolling="no"
        className="h-full w-full border-0"
        style={{
          background: "transparent",
          pointerEvents: "none",
          touchAction: "pan-y",
        }}
      />
    </div>
  );
}
