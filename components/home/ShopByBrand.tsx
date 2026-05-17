"use client";

import Link from "next/link";

const DUMMY_BRANDS = [
  "Mercury Ignite",
  "Sivakasi Royale",
  "Standard Fire",
  "Cock Brand",
  "Sony Crackers",
  "Wunderbar",
  "Ajanta Fireworks",
  "Vinayaga Sparks",
  "Lakshmi Crackers",
  "Coronation",
];

export default function ShopByBrand() {
  const loop = [...DUMMY_BRANDS, ...DUMMY_BRANDS];

  return (
    <section className="relative bg-cream py-14 overflow-hidden">
      {/* top hairline */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue/60 to-transparent" />

      <div className="text-center mb-10">
        <span className="text-blue text-xs tracking-[0.4em] font-semibold uppercase">
          Shop By Brand
        </span>
      </div>

      <div className="brand-mask">
        <div className="brand-track flex w-max items-center gap-16 px-8">
          {loop.map((b, i) => (
            <div key={`${b}-${i}`} className="shrink-0 flex items-center gap-16">
              <Link
                href={`/products?brand=${encodeURIComponent(b)}`}
                className="font-serif text-2xl md:text-3xl text-navy/70 hover:text-navy transition-colors duration-300 whitespace-nowrap tracking-wide"
              >
                {b}
              </Link>
              <span className="w-1.5 h-1.5 rounded-full bg-blue/70 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* bottom hairline */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue/60 to-transparent" />
    </section>
  );
}
