"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Sparkles, MapPin, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { HERO_SLIDES, HERO_STATS, DEFAULT_CONTENT, CATEGORIES, BRANDS } from "@/lib/data";
import { Button } from "@/components/ui/button";

// Pre-computed stable positions — avoids hydration mismatch from Math.random().
// Kept lean (6) and hidden on mobile to reduce paint cost.
const SPARKLES = [
  { top: "18%", left: "12%", dur: 6.1, delay: 0 },
  { top: "28%", left: "82%", dur: 7.0, delay: 1.2 },
  { top: "62%", left: "8%", dur: 5.8, delay: 0.5 },
  { top: "72%", left: "88%", dur: 6.5, delay: 2.1 },
  { top: "44%", left: "92%", dur: 6.8, delay: 1.6 },
  { top: "82%", left: "38%", dur: 5.5, delay: 0.8 },
];

const ROTATE_MS = 12000;

export default function HeroSlider() {
  const c = DEFAULT_CONTENT;
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [brand, setBrand] = useState("All");
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (cat !== "All") params.set("cat", cat);
    if (brand !== "All") params.set("brand", brand);
    const qs = params.toString();
    router.push(qs ? `/products?${qs}` : "/products");
  };

  const paused = useRef(false);
  const reducedMotion = useRef(false);

  const startTimer = () => {
    clearTimer();
    if (reducedMotion.current) return; // honor user motion preference
    timer.current = setInterval(() => {
      if (!paused.current) setIdx((i) => (i + 1) % HERO_SLIDES.length);
    }, ROTATE_MS);
  };
  const clearTimer = () => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  };
  const go = (dir: number) => {
    setIdx((i) => (i + dir + HERO_SLIDES.length) % HERO_SLIDES.length);
    startTimer();
  };

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotion.current = mq.matches;
    const onChange = (e: MediaQueryListEvent) => {
      reducedMotion.current = e.matches;
      if (e.matches) clearTimer();
      else startTimer();
    };
    mq.addEventListener("change", onChange);
    startTimer();
    return () => {
      mq.removeEventListener("change", onChange);
      clearTimer();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      className="relative min-h-screen h-screen flex items-center overflow-hidden"
      onMouseEnter={() => { paused.current = true; }}
      onMouseLeave={() => { paused.current = false; }}
      onFocusCapture={() => { paused.current = true; }}
      onBlurCapture={() => { paused.current = false; }}
    >
      {/* Slides */}
      <AnimatePresence mode="sync">
        <motion.div
          key={idx}
          className="absolute inset-0 z-0"
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1.03 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: "easeInOut" }}
        >
          <Image
            src={HERO_SLIDES[idx]}
            alt="Fireworks"
            fill
            className="object-cover"
            priority={idx === 0}
            loading={idx === 0 ? "eager" : "lazy"}
            sizes="100vw"
          />
        </motion.div>
      </AnimatePresence>

      {/* Floating sparkles — desktop only, reduced to 6, respects reduced-motion */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden hidden md:block motion-reduce:hidden">
        {SPARKLES.map((s, i) => (
          <motion.span
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-sky/70"
            style={{
              top: s.top,
              left: s.left,
              boxShadow: "0 0 10px #9CD5FF, 0 0 20px rgba(156,213,255,0.4)",
              willChange: "transform, opacity",
            }}
            animate={{
              y: [0, -10, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: s.dur,
              repeat: Infinity,
              delay: s.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-2xl relative rounded-3xl bg-navy/40 backdrop-blur-md ring-1 ring-white/15 shadow-2xl px-6 py-8 sm:px-8 sm:py-10"
        >
          {/* Delivery badge */}
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            <MapPin size={12} />
            Delivering All Over India · Est. {c.est}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-4">
            {c.heroTitle}
          </h1>
          <p className="text-base sm:text-lg text-white/90 leading-relaxed mb-8 max-w-xl">
            {c.heroSub}
          </p>

          <div className="flex flex-wrap gap-3 mb-6">
            <Button
              asChild
              size="lg"
              className="bg-white text-navy hover:bg-cream font-bold shadow-lg hover:shadow-xl transition-all"
            >
              <Link href="/#bundles">
                <Sparkles size={16} />
                ₹2000 Bundles
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-[#25D366] text-white hover:bg-[#1ebe5b] font-bold shadow-lg hover:shadow-xl transition-all border-0"
            >
              <a href={`https://wa.me/91${c.whatsapp}`} target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                  <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.595 5.392l-.999 3.648 3.893-.739zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
                </svg>
                Order on WhatsApp
              </a>
            </Button>
          </div>

          {/* Search bar with product + brand filters */}
          <form
            onSubmit={onSearch}
            className="mb-8 grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] gap-2 bg-white/95 backdrop-blur-sm rounded-2xl p-2 ring-1 ring-white/30 shadow-xl"
          >
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search crackers, sparklers, bombs…"
                className="w-full h-10 pl-9 pr-3 rounded-lg bg-white text-navy placeholder:text-muted-foreground text-sm border border-transparent focus:border-navy/30 focus:outline-none focus:ring-2 focus:ring-navy/20"
                aria-label="Search products"
              />
            </div>
            <select
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              className="h-10 px-3 pr-7 rounded-lg bg-white text-navy text-sm font-medium border border-transparent hover:border-navy/30 focus:border-navy/40 focus:outline-none focus:ring-2 focus:ring-navy/20 cursor-pointer"
              aria-label="Filter by category"
            >
              <option value="All">All Products</option>
              {CATEGORIES.filter((x) => x !== "All").map((x) => (
                <option key={x} value={x}>{x}</option>
              ))}
            </select>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="h-10 px-3 pr-7 rounded-lg bg-white text-navy text-sm font-medium border border-transparent hover:border-navy/30 focus:border-navy/40 focus:outline-none focus:ring-2 focus:ring-navy/20 cursor-pointer"
              aria-label="Filter by brand"
            >
              <option value="All">All Brands</option>
              {BRANDS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <Button
              type="submit"
              className="h-10 bg-navy text-white hover:bg-navy/90 font-semibold px-5"
            >
              <Search size={16} />
              Search
            </Button>
          </form>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-lg">
            {HERO_STATS.map((s) => (
              <div key={s.label} className="text-left">
                <div className="text-2xl font-black text-white">{s.value}</div>
                <div className="text-xs text-white/75">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={() => go(-1)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 border border-white/30 text-white flex items-center justify-center backdrop-blur-sm transition-all hover:scale-110"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={() => go(1)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 border border-white/30 text-white flex items-center justify-center backdrop-blur-sm transition-all hover:scale-110"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => { clearTimer(); setIdx(i); startTimer(); }}
            className={`rounded-full transition-all duration-300 ${i === idx ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/40"}`}
          />
        ))}
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 right-8 z-30 text-white/60 hidden lg:block"
        animate={{ y: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
          <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
        </svg>
      </motion.div>
    </section>
  );
}
