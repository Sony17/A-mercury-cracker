"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ChevronRight } from "lucide-react";

export interface FestivalLandingProps {
  slug: string;
  title: string;
  tagline: string;
  intro: string;
  heroImage: string;
  highlights: { label: string; sub: string }[];
  picks: { name: string; cat?: string }[];
  ctaWhatsappMsg: string;
  whatsappNumber: string;
}

export default function FestivalLanding({
  slug,
  title,
  tagline,
  intro,
  heroImage,
  highlights,
  picks,
  ctaWhatsappMsg,
  whatsappNumber,
}: FestivalLandingProps) {
  return (
    <main className="text-foreground">
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
        <Image
          src={heroImage}
          alt={`${title} crackers`}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-[#000814]/85 via-[#000814]/55 to-[#000814]/95"
        />
        <div className="relative container-xl py-20 sm:py-28 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#FFD166] text-xs font-semibold uppercase tracking-widest mb-5"
          >
            <Sparkles size={14} /> {tagline}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="font-display text-4xl sm:text-6xl font-black text-white mb-4"
            style={{
              textShadow:
                "0 0 24px rgba(212,175,55,0.5), 0 6px 36px rgba(0,8,20,0.7)",
            }}
          >
            {title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="max-w-2xl mx-auto text-white/85 text-base sm:text-lg leading-relaxed mb-8"
          >
            {intro}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="flex flex-wrap justify-center gap-3"
          >
            <a
              href={`https://wa.me/91${whatsappNumber}?text=${encodeURIComponent(
                ctaWhatsappMsg
              )}`}
              target="_blank"
              rel="noopener"
              className="btn-gold inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold"
            >
              Order on WhatsApp
              <ChevronRight size={18} />
            </a>
            <Link
              href={`/products?occasion=${encodeURIComponent(slug)}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-white/10 border border-white/30 text-white hover:bg-white/20 transition-colors"
            >
              Shop the Edit
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Highlights */}
      <section className="bg-[#001D3D] py-12 sm:py-16">
        <div className="container-xl grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {highlights.map((h) => (
            <div
              key={h.label}
              className="card-luxury rounded-2xl p-5 text-center"
            >
              <div className="font-display text-2xl sm:text-3xl font-black text-gold-spark">
                {h.label}
              </div>
              <div className="text-xs sm:text-sm text-white/75 mt-1">
                {h.sub}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Curated picks */}
      <section className="section-pad bg-[#000814]">
        <div className="container-xl">
          <div className="text-center mb-10">
            <span className="section-tag">Curated for {title}</span>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-white">
              Top picks of the season
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {picks.map((p) => (
              <Link
                key={p.name}
                href={`/products?q=${encodeURIComponent(p.name)}`}
                className="card-luxury rounded-2xl p-5 hover:scale-[1.02] transition-transform"
              >
                <div className="font-display text-lg font-bold text-gold-spark mb-1">
                  {p.name}
                </div>
                {p.cat && (
                  <div className="text-xs uppercase tracking-widest text-white/60">
                    {p.cat}
                  </div>
                )}
                <div className="mt-3 text-gold text-xs font-semibold inline-flex items-center gap-1">
                  Order now <ChevronRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-[#001D3D] py-16">
        <div className="container-xl text-center">
          <h3 className="font-display text-2xl sm:text-3xl font-black text-white mb-3">
            Light up your <span className="text-gold-spark">{title}</span>
          </h3>
          <p className="text-white/70 max-w-xl mx-auto mb-6">
            Bulk discount available for {title} orders above ₹5,000. WhatsApp us
            and we&apos;ll send the price list within minutes.
          </p>
          <a
            href={`https://wa.me/91${whatsappNumber}?text=${encodeURIComponent(
              ctaWhatsappMsg
            )}`}
            target="_blank"
            rel="noopener"
            className="btn-gold inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold"
          >
            Get {title} price list
            <ChevronRight size={18} />
          </a>
        </div>
      </section>
    </main>
  );
}
