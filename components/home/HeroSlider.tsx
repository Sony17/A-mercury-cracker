"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Sparkles, MapPin, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { HERO_STATS, DEFAULT_CONTENT, BRANDS } from "@/lib/data";
import { useStore } from "@/lib/store";
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

// Firework bursts — each fires periodically, rays radiate out then fade.
const FIREWORKS = [
  { top: "18%", left: "18%", color: "#ffd27a", glow: "rgba(255,170,60,0.8)", delay: 0, radius: 90 },
  { top: "22%", left: "78%", color: "#9CD5FF", glow: "rgba(156,213,255,0.85)", delay: 2.2, radius: 85 },
  { top: "65%", left: "12%", color: "#ff7a4a", glow: "rgba(255,90,30,0.85)", delay: 4.1, radius: 80 },
  { top: "70%", left: "85%", color: "#ffe27a", glow: "rgba(255,210,80,0.85)", delay: 6, radius: 95 },
];

const BURST_RAYS = Array.from({ length: 12 }, (_, i) => (i * 360) / 12);
const FIREWORK_PERIOD = 7.2;

// Rising spark trails — like fuses launching upward before the burst.
const RISING_SPARKS = [
  { left: "8%", delay: 0, dur: 3.2, hue: "#ffd27a" },
  { left: "42%", delay: 1.4, dur: 3.6, hue: "#9CD5FF" },
  { left: "70%", delay: 2.8, dur: 3.4, hue: "#ffb05a" },
  { left: "92%", delay: 4.2, dur: 3.5, hue: "#ffe27a" },
];

const ROTATE_MS = 5000;

export default function HeroSlider() {
  const { company } = useStore();
  const c = { ...DEFAULT_CONTENT, ...company };
  const slides = c.heroSlides?.length ? c.heroSlides : DEFAULT_CONTENT.heroSlides;
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
  const slidesRef = useRef(slides);

  useEffect(() => {
    slidesRef.current = slides;
  }, [slides]);

  // Clamp during render — if admin removes the current slide, fall back to the first.
  const safeIdx = slides.length > 0 ? idx % slides.length : 0;

  const startTimer = () => {
    clearTimer();
    if (reducedMotion.current) return; // honor user motion preference
    timer.current = setInterval(() => {
      const n = slidesRef.current.length;
      if (n > 1 && !paused.current) setIdx((i) => (i + 1) % n);
    }, ROTATE_MS);
  };
  const clearTimer = () => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  };
  const go = (dir: number) => {
    const n = slidesRef.current.length;
    if (n === 0) return;
    setIdx((i) => (i + dir + n) % n);
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
      className="relative min-h-[600px] sm:min-h-screen lg:h-screen flex items-center justify-center overflow-hidden"
      onMouseEnter={() => { paused.current = true; }}
      onMouseLeave={() => { paused.current = false; }}
      onFocusCapture={() => { paused.current = true; }}
      onBlurCapture={() => { paused.current = false; }}
    >
      {/* Slides */}
      <AnimatePresence mode="sync">
        <motion.div
          key={safeIdx}
          className="absolute inset-0 z-0"
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1.03 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: "easeInOut" }}
        >
          {slides[safeIdx] && (
            <Image
              src={slides[safeIdx]}
              alt="Fireworks"
              fill
              className="object-cover"
              priority={safeIdx === 0}
              loading={safeIdx === 0 ? "eager" : "lazy"}
              sizes="100vw"
              unoptimized
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Image overlay for contrast */}
      <div
        aria-hidden
        className="absolute inset-0 z-[5] bg-gradient-to-b from-black/80 via-black/60 to-black/85"
      />
      <div aria-hidden className="absolute inset-0 z-[5] bg-black/40" />

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

      {/* Firework bursts — periodic radial explosions */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden hidden md:block motion-reduce:hidden">
        {FIREWORKS.map((fw, i) => (
          <div
            key={i}
            className="absolute"
            style={{ top: fw.top, left: fw.left }}
            aria-hidden
          >
            {/* Central flash */}
            <motion.span
              className="absolute -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
              style={{
                background: fw.color,
                boxShadow: `0 0 20px ${fw.glow}, 0 0 40px ${fw.glow}`,
              }}
              animate={{ opacity: [0, 1, 0], scale: [0.3, 1.6, 0.3] }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                repeatDelay: FIREWORK_PERIOD - 1.4,
                delay: fw.delay,
                ease: "easeOut",
              }}
            />
            {/* Radial rays */}
            {BURST_RAYS.map((angle, j) => {
              const rad = (angle * Math.PI) / 180;
              const x = Math.cos(rad) * fw.radius;
              const y = Math.sin(rad) * fw.radius;
              return (
                <motion.span
                  key={j}
                  className="absolute w-1.5 h-1.5 rounded-full"
                  style={{
                    background: fw.color,
                    boxShadow: `0 0 8px ${fw.glow}, 0 0 16px ${fw.glow}`,
                    left: 0,
                    top: 0,
                  }}
                  animate={{
                    x: [0, x],
                    y: [0, y],
                    opacity: [0, 1, 0],
                    scale: [0.5, 1, 0.4],
                  }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    repeatDelay: FIREWORK_PERIOD - 1.6,
                    delay: fw.delay + 0.05,
                    ease: "easeOut",
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Rising spark trails — fuses shooting upward */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden hidden md:block motion-reduce:hidden">
        {RISING_SPARKS.map((s, i) => (
          <motion.span
            key={i}
            className="absolute w-1 h-3 rounded-full"
            aria-hidden
            style={{
              left: s.left,
              bottom: 0,
              background: `linear-gradient(to top, transparent, ${s.hue})`,
              boxShadow: `0 0 8px ${s.hue}, 0 0 16px ${s.hue}aa`,
            }}
            animate={{ y: [0, -700], opacity: [0, 1, 1, 0] }}
            transition={{
              duration: s.dur,
              times: [0, 0.1, 0.7, 1],
              repeat: Infinity,
              repeatDelay: 4,
              delay: s.delay,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-20 max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 pt-24 pb-24 sm:py-20 w-full">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0, y: 24 },
            show: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.6, staggerChildren: 0.12, delayChildren: 0.15 },
            },
          }}
          className="w-full relative rounded-2xl sm:rounded-3xl bg-navy/40 backdrop-blur-md ring-1 ring-white/15 shadow-2xl overflow-hidden grid lg:grid-cols-[5fr_7fr] items-stretch text-center"
        >
          {/* Embedded collage banner — top on mobile, left side on desktop, merged into the same card */}
          <div className="relative w-full aspect-square lg:aspect-auto lg:h-full min-h-[260px] overflow-hidden bg-navy/30">
            <Image
              src="/herocol.png"
              alt="Occasions where crackers celebrate the moment"
              fill
              className="object-contain object-center"
              sizes="(max-width: 1024px) 100vw, 42vw"
              priority
            />
          </div>

          <div className="w-full px-4 py-6 sm:px-8 sm:py-10 lg:px-10 lg:py-12 flex flex-col items-center">
          {/* Delivery badge */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
            className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-5"
          >
            <MapPin size={12} />
            Delivering All Over India · Est. {c.est} · 32+ Years of Trust
          </motion.div>

          <motion.h1
            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
            className="whitespace-nowrap text-xl xs:text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-3 sm:mb-4"
          >
            <motion.span
              className="inline-block motion-reduce:!animate-none"
              animate={{
                textShadow: [
                  "0 0 4px rgba(255,200,120,0.4), 0 0 12px rgba(255,140,40,0.2)",
                  "0 0 14px rgba(255,210,140,0.95), 0 0 32px rgba(255,140,40,0.65), 0 0 60px rgba(255,90,20,0.35)",
                  "0 0 4px rgba(255,200,120,0.4), 0 0 12px rgba(255,140,40,0.2)",
                ],
                color: ["#ffffff", "#fff4d6", "#ffffff"],
              }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            >
              {c.heroTitle}
            </motion.span>
          </motion.h1>
          <motion.div
            aria-hidden
            className="h-[3px] w-24 sm:w-32 rounded-full -mt-1 mb-4 sm:mb-5 motion-reduce:!animate-none"
            style={{
              background:
                "linear-gradient(90deg, transparent, #ffd27a 35%, #ff7a1a 65%, transparent)",
            }}
            animate={{ opacity: [0.4, 1, 0.4], scaleX: [0.6, 1, 0.6] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.p
            variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
            className="text-sm sm:text-lg text-white/90 leading-relaxed mb-6 sm:mb-8 max-w-xl"
          >
            {c.heroSub}
          </motion.p>

          <motion.div
            variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
            className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-5 sm:mb-6"
          >
            <Button
              asChild
              size="lg"
              className="bg-white text-[#001D3D] hover:bg-[#FFD166] hover:text-[#000814] font-bold shadow-lg hover:shadow-xl transition-all"
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
          </motion.div>

          {/* Search bar with product + brand filters */}
          <motion.form
            variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
            onSubmit={onSearch}
            className="w-full mb-6 sm:mb-8 grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] gap-1.5 sm:gap-2 bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl p-1.5 sm:p-2 ring-1 ring-white/30 shadow-xl text-left"
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
              {(c.categories ?? []).map((x) => (
                <option key={x.n} value={x.n}>{x.n}</option>
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
          </motion.form>

          {/* Stats */}
          <motion.div
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
            }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-lg mx-auto"
          >
            {HERO_STATS.map((s) => (
              <motion.div
                key={s.label}
                variants={{
                  hidden: { opacity: 0, scale: 0.7 },
                  show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 320, damping: 16 } },
                }}
                className="text-center"
              >
                <div className="text-xl sm:text-2xl font-black text-white">{s.value}</div>
                <div className="text-[10px] sm:text-xs text-white/75">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={() => go(-1)}
        className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 border border-white/30 text-white items-center justify-center backdrop-blur-sm transition-all hover:scale-110"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={() => go(1)}
        className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 border border-white/30 text-white items-center justify-center backdrop-blur-sm transition-all hover:scale-110"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => { clearTimer(); setIdx(i); startTimer(); }}
            className={`rounded-full transition-all duration-300 ${i === safeIdx ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/40"}`}
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
