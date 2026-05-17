"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { motion } from "framer-motion";
import { DEFAULT_CONTENT } from "@/lib/data";
import { ExternalLink, Play } from "lucide-react";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

const IG_EMBED_SRC = "https://www.instagram.com/embed.js";

const IG_GRADIENT =
  "linear-gradient(135deg, #feda77 0%, #f58529 25%, #dd2a7b 50%, #8134af 75%, #515bd4 100%)";

function IgIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className="fill-current flex-shrink-0"
      aria-hidden
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

type Reel = { shortcode: string };

const REELS: Reel[] = [
  { shortcode: "DPVSETAirqD" },
];

const YOUTUBE_ID = "htLHBQ7-QN8";
const YOUTUBE_URL = `https://www.youtube.com/watch?v=${YOUTUBE_ID}`;

const reelUrl = (s: string) => `https://www.instagram.com/reel/${s}/`;

const IG_PROFILE = DEFAULT_CONTENT.instagram;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, ease: "easeOut" as const, delay },
});

function ReelCard({ shortcode, delay }: { shortcode: string; delay: number }) {
  const embedRef = useRef<HTMLDivElement | null>(null);
  const [showEmbed, setShowEmbed] = useState(false);

  useEffect(() => {
    if (showEmbed || !embedRef.current) return;
    const el = embedRef.current;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShowEmbed(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [showEmbed]);

  useEffect(() => {
    if (!showEmbed) return;
    if (window.instgrm) {
      window.instgrm.Embeds.process();
      return;
    }
    const iv = window.setInterval(() => {
      if (window.instgrm) {
        window.instgrm.Embeds.process();
        window.clearInterval(iv);
      }
    }, 200);
    return () => window.clearInterval(iv);
  }, [showEmbed]);

  const url = reelUrl(shortcode);

  return (
    <motion.div {...fadeUp(delay)} className="w-full max-w-[340px] mx-auto">
      <div
        className="p-[2px] rounded-[22px] shadow-2xl"
        style={{ background: IG_GRADIENT }}
      >
        <div className="rounded-[20px] overflow-hidden bg-white">
          <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-border">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white flex-shrink-0 shadow"
              style={{ background: IG_GRADIENT }}
            >
              <IgIcon size={17} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="font-bold text-sm text-foreground leading-tight truncate">
                mercuryignite23
              </div>
              <div className="text-[11px] text-muted-foreground truncate">
                A Mercury Crackers · Official
              </div>
            </div>

            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open reel on Instagram"
              className="flex items-center gap-1 text-[11px] font-semibold text-blue hover:text-navy transition-colors ml-2 flex-shrink-0"
            >
              Open <ExternalLink size={10} />
            </a>
          </div>

          <div ref={embedRef} className="relative min-h-[460px] sm:min-h-[580px]">
            {showEmbed ? (
              <blockquote
                className="instagram-media"
                data-instgrm-permalink={`${url}?utm_source=ig_embed&utm_campaign=loading`}
                data-instgrm-version="14"
                style={{
                  background: "#FFF",
                  border: 0,
                  margin: 0,
                  maxWidth: "100%",
                  minWidth: "326px",
                  padding: 0,
                  width: "100%",
                }}
              >
                <a href={url} target="_blank" rel="noopener noreferrer">
                  View this reel on Instagram
                </a>
              </blockquote>
            ) : (
              <button
                type="button"
                onClick={() => setShowEmbed(true)}
                aria-label="Load Instagram reel"
                className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-3 text-white"
                style={{ background: IG_GRADIENT }}
              >
                <span className="w-14 h-14 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/70">
                  <Play size={22} className="fill-white ml-0.5" />
                </span>
                <span className="text-sm font-bold tracking-wide">Tap to load reel</span>
                <span className="text-[11px] opacity-80">Saves data · loads on demand</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-4">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold text-white shadow-md hover:scale-[1.03] hover:shadow-lg active:scale-100 transition-all duration-200"
          style={{ background: IG_GRADIENT }}
        >
          <Play size={14} className="fill-white" />
          Watch Reel
        </a>
      </div>
    </motion.div>
  );
}

export default function InstagramSection() {
  return (
    <section
      id="insta"
      className="section-pad border-t border-border relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #F7F8F0 0%, #eef4fb 100%)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: IG_GRADIENT }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full opacity-10 blur-3xl"
        style={{ background: IG_GRADIENT }}
      />

      <div className="container-xl relative z-10">
        <motion.div {...fadeUp(0)} className="text-center mb-12">
          <span className="section-tag">Watch · Like · Follow</span>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-navy mb-4">
            See Us in Action
          </h2>

          <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto mb-5">
            Catch the latest sparks, deals, and festive moments straight from our Instagram.
          </p>

          <a
            href={IG_PROFILE}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-border bg-white/70 backdrop-blur-sm shadow-sm text-sm font-semibold text-foreground hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-white"
              style={{ background: IG_GRADIENT }}
            >
              <IgIcon size={13} />
            </span>
            @mercuryignite23
          </a>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 max-w-5xl mx-auto">
          {REELS.map((r, i) => (
            <ReelCard key={r.shortcode} shortcode={r.shortcode} delay={0.12 + i * 0.08} />
          ))}
        </div>

        <Script
          id="instagram-embed"
          src={IG_EMBED_SRC}
          strategy="lazyOnload"
          onLoad={() => window.instgrm?.Embeds.process()}
        />

        {/* ── YouTube feature ────────────────────────────── */}
        <motion.div {...fadeUp(0.2)} className="mt-16 max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <span className="section-tag">Watch on YouTube</span>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-navy mt-3">
              Featured Video
            </h3>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-border bg-black">
            <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
              <iframe
                src={`https://www.youtube.com/embed/${YOUTUBE_ID}?rel=0`}
                title="A Mercury Crackers — YouTube"
                className="absolute inset-0 w-full h-full border-0"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </div>

          <div className="flex justify-center mt-5">
            <a
              href={YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold text-white shadow-md hover:scale-[1.03] hover:shadow-lg active:scale-100 transition-all duration-200"
              style={{ background: "linear-gradient(135deg, #ff0000 0%, #cc0000 100%)" }}
            >
              <Play size={14} className="fill-white" />
              Watch on YouTube
            </a>
          </div>
        </motion.div>

        <motion.div
          {...fadeUp(0.3)}
          className="flex justify-center mt-10"
        >
          <a
            href={IG_PROFILE}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border-2 border-navy text-navy text-sm font-bold hover:bg-navy hover:text-white active:scale-95 transition-all duration-200"
          >
            <IgIcon size={14} />
            Follow Us
          </a>
        </motion.div>
      </div>
    </section>
  );
}
