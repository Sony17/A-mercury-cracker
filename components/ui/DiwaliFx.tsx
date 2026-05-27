"use client";

import { useEffect, useState } from "react";

export default function DiwaliFx() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Skip the heavy canvas iframe on mobile — pointer-events: none on a full-
    // viewport iframe still breaks touch-scroll in mobile Safari/Chrome.
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    if (!reduce && !mobile) setShow(true);
  }, []);

  if (!show) return null;

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
