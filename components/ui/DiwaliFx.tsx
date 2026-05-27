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
    <iframe
      aria-hidden
      tabIndex={-1}
      title="Diwali fireworks"
      src="/fireworks/index.html"
      className="pointer-events-none fixed inset-0 z-[60] h-full w-full border-0 motion-reduce:hidden"
      style={{ background: "transparent", mixBlendMode: "lighten" }}
    />
  );
}
