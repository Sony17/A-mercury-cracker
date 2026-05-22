"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  "Delivering All Over India  ·  Free Delivery on orders above ₹3000  ·  Call 9557149655",
  "Different from Others · Bareilly's Premium Fancy Crackers Store · Est. 1994",
  "Child-Safe Quality · 500+ Varieties · 70% off MRP · Open 10AM–4PM Daily",
];

export default function TopStrip() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % MESSAGES.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="bg-gradient-to-r from-navy via-blue to-navy text-white text-xs py-2 overflow-hidden relative border-b border-gold/20">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-center">
        <p
          key={idx}
          className="text-center font-medium tracking-wide animate-in fade-in slide-in-from-bottom-1 duration-500"
        >
          {MESSAGES[idx]}
        </p>
      </div>
    </div>
  );
}
