"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { HERO_SLIDES, HERO_STATS, DEFAULT_CONTENT } from "@/lib/data";
import { Button } from "@/components/ui/button";

// Pre-computed stable positions — avoids hydration mismatch from Math.random()
const SPARKLES = [
  { top: "8%", left: "12%", dur: 5.2, delay: 0 },
  { top: "22%", left: "78%", dur: 6.1, delay: 0.8 },
  { top: "15%", left: "45%", dur: 4.8, delay: 1.5 },
  { top: "65%", left: "5%", dur: 7.0, delay: 0.3 },
  { top: "72%", left: "88%", dur: 5.5, delay: 2.1 },
  { top: "40%", left: "92%", dur: 6.3, delay: 0.6 },
  { top: "88%", left: "33%", dur: 4.5, delay: 1.9 },
  { top: "55%", left: "60%", dur: 5.8, delay: 3.0 },
  { top: "30%", left: "25%", dur: 6.7, delay: 2.4 },
  { top: "78%", left: "55%", dur: 5.0, delay: 0.9 },
  { top: "10%", left: "67%", dur: 7.2, delay: 1.2 },
  { top: "48%", left: "18%", dur: 4.9, delay: 3.5 },
  { top: "93%", left: "72%", dur: 6.0, delay: 0.4 },
  { top: "35%", left: "50%", dur: 5.3, delay: 2.7 },
  { top: "60%", left: "38%", dur: 4.6, delay: 1.7 },
  { top: "20%", left: "95%", dur: 6.8, delay: 0.1 },
];

export default function HeroSlider() {
  const c = DEFAULT_CONTENT;
  const [idx, setIdx] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    timer.current = setInterval(() => setIdx((i) => (i + 1) % HERO_SLIDES.length), 5500);
  };
  const clearTimer = () => {
    if (timer.current) clearInterval(timer.current);
  };
  const go = (dir: number) => {
    clearTimer();
    setIdx((i) => (i + dir + HERO_SLIDES.length) % HERO_SLIDES.length);
    startTimer();
  };

  useEffect(() => {
    startTimer();
    return clearTimer;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="relative min-h-[560px] lg:min-h-[680px] flex items-center overflow-hidden">
      {/* Slides */}
      <AnimatePresence mode="sync">
        <motion.div
          key={idx}
          className="absolute inset-0 z-0"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1.08 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
          <Image
            src={HERO_SLIDES[idx]}
            alt="Fireworks"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          {/* Light gradient overlay — NOT heavy blue */}
          <div className="absolute inset-0 bg-gradient-to-r from-navy/65 via-navy/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/50 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Floating sparkles — stable positions, no hydration mismatch */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {SPARKLES.map((s, i) => (
          <motion.span
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-sky/70"
            style={{
              top: s.top,
              left: s.left,
              boxShadow: "0 0 10px #9CD5FF, 0 0 20px rgba(156,213,255,0.4)",
            }}
            animate={{
              y: [0, -12, 6, -8, 0],
              x: [0, 8, -6, 10, 0],
              opacity: [0.6, 1, 0.7, 1, 0.6],
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
          className="max-w-2xl"
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

          <div className="flex flex-wrap gap-3 mb-12">
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
              variant="outline"
              className="border-white/60 text-white hover:bg-white hover:text-navy backdrop-blur-sm font-semibold"
            >
              <a href={`https://wa.me/91${c.whatsapp}`} target="_blank" rel="noopener">
                Order on WhatsApp
              </a>
            </Button>
          </div>

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
