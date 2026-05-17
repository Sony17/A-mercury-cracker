"use client";

import Image from "next/image";
import Link from "next/link";

type Item = { label: string; href: string; img?: string; icon?: string };

export default function SlidingRibbon({
  title,
  items,
  direction = "left",
}: {
  title: string;
  items: Item[];
  direction?: "left" | "right";
}) {
  const loop = [...items, ...items];
  const animClass = direction === "right" ? "brand-track-rev" : "brand-track";

  const parts = title.split(" ");
  const lead = parts.slice(0, -1).join(" ");
  const tail = parts[parts.length - 1];

  return (
    <section className="relative bg-cream py-4 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue/40 to-transparent" />

      <div className="flex items-center gap-3 sm:gap-6">
        <span className="shrink-0 ml-3 sm:ml-6 pl-2 sm:pl-3 border-l-2 border-blue/40 text-blue text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] font-semibold uppercase leading-tight flex flex-col">
          <span className="opacity-70">{lead}</span>
          <span className="text-navy">{tail}</span>
        </span>

        <div className="brand-mask flex-1">
          <div className={`${animClass} flex w-max items-center gap-6 sm:gap-10`}>
            {loop.map((it, i) => (
              <div key={`${it.label}-${i}`} className="shrink-0 flex items-center gap-6 sm:gap-10">
                <Link
                  href={it.href}
                  className="group flex items-center gap-2.5 font-sans text-sm text-navy/70 hover:text-navy transition-colors duration-300 whitespace-nowrap tracking-wide"
                >
                  {it.img ? (
                    <span className="relative w-7 h-7 rounded-full overflow-hidden ring-1 ring-blue/20 group-hover:ring-blue/60 transition-all bg-white shrink-0">
                      <Image
                        src={it.img}
                        alt=""
                        fill
                        sizes="28px"
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </span>
                  ) : it.icon ? (
                    <span className="w-7 h-7 rounded-full bg-white ring-1 ring-blue/20 group-hover:ring-blue/60 flex items-center justify-center text-base shrink-0 transition-all">
                      {it.icon}
                    </span>
                  ) : null}
                  <span>{it.label}</span>
                </Link>
                <span className="w-1 h-1 rounded-full bg-blue/60 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue/40 to-transparent" />
    </section>
  );
}
