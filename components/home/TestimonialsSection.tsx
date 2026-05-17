"use client";

import { TESTIMONIALS, GOOGLE_RATING } from "@/lib/data";
import { Star, BadgeCheck, ExternalLink } from "lucide-react";

function GoogleG({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8a12 12 0 1 1 0-24c3 0 5.8 1.1 7.9 3l5.7-5.7C34 5.1 29.3 3 24 3a21 21 0 1 0 0 42c10.5 0 20-7.6 20-21 0-1.2-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 5.1 29.3 3 24 3 16.3 3 9.7 7.4 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 45c5.2 0 10-2 13.6-5.2l-6.3-5.2c-2 1.5-4.5 2.4-7.3 2.4-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.6 40.6 16.3 45 24 45z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.6l6.3 5.2C41.4 35.5 44 30.2 44 24c0-1.2-.1-2.4-.4-3.5z"/>
    </svg>
  );
}

const AVATAR_GRADIENTS = [
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-emerald-500 to-teal-600",
  "from-sky-500 to-blue-600",
  "from-violet-500 to-purple-600",
  "from-fuchsia-500 to-pink-600",
];

function InitialAvatar({ name, index }: { name: string; index: number }) {
  const initial = name.trim().charAt(0).toUpperCase();
  const gradient = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];
  return (
    <div
      className={`flex items-center justify-center w-11 h-11 rounded-full flex-shrink-0 ring-2 ring-slate-100 bg-gradient-to-br ${gradient} text-white font-bold text-lg select-none`}
      aria-label={name}
    >
      {initial}
    </div>
  );
}

type Testimonial = (typeof TESTIMONIALS)[number];

function TestimonialCard({ t, index }: { t: Testimonial; index: number }) {
  return (
    <a
      href={GOOGLE_RATING.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-all group"
    >
      <div className="flex items-start gap-3 mb-3">
        <InitialAvatar name={t.name} index={index} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="font-bold text-slate-900 text-sm truncate">{t.name}</span>
            {t.verified && (
              <BadgeCheck size={14} className="text-blue-500 flex-shrink-0" />
            )}
          </div>
          <div className="text-slate-500 text-xs truncate">{t.reviewerMeta}</div>
        </div>
        <GoogleG className="w-4 h-4 flex-shrink-0 mt-1" />
      </div>

      <div className="flex items-center gap-2 mb-2">
        <div className="flex gap-0.5">
          {Array.from({ length: t.rating }).map((_, j) => (
            <Star key={j} size={13} className="fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        <span className="text-xs text-slate-500">{t.date}</span>
      </div>

      <p className="text-slate-700 text-sm leading-relaxed mb-3">{t.text}</p>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <span className="text-xs text-slate-500">{t.city}</span>
        <span className="text-xs font-semibold text-blue-600 group-hover:underline">
          View on Google →
        </span>
      </div>
    </a>
  );
}

function ScrollColumn({
  items,
  reverse = false,
  startIndex = 0,
}: {
  items: Testimonial[];
  reverse?: boolean;
  startIndex?: number;
}) {
  // Duplicate the list so translateY(-50%) loops seamlessly.
  const loop = [...items, ...items];
  return (
    <div className={reverse ? "vscroll-track-rev" : "vscroll-track"}>
      <div className="flex flex-col gap-5">
        {loop.map((t, i) => (
          <TestimonialCard key={`${t.name}-${i}`} t={t} index={startIndex + i} />
        ))}
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  const half = Math.ceil(TESTIMONIALS.length / 2);
  const colB = TESTIMONIALS.slice(half).concat(TESTIMONIALS.slice(0, half));

  return (
    <section className="section-pad bg-navy overflow-hidden relative">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 text-9xl">★</div>
        <div className="absolute bottom-10 right-10 text-9xl">★</div>
      </div>

      <div className="container-xl relative z-10">
        <div className="text-center mb-6 sm:mb-10">
          <span className="inline-block bg-white/10 text-sky px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-3">
            Testimonials
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-3">
            What Families Say
          </h2>
          <p className="text-sm sm:text-base text-white/65 max-w-xl mx-auto mb-6">
            Trusted by 500+ happy families across India every festive season
          </p>

          <a
            href={GOOGLE_RATING.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-white text-slate-900 rounded-full pl-2 pr-5 py-2 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
          >
            <span className="flex items-center justify-center w-9 h-9 bg-white rounded-full ring-1 ring-slate-200">
              <GoogleG className="w-5 h-5" />
            </span>
            <span className="flex items-center gap-2">
              <span className="font-black text-lg">{GOOGLE_RATING.score}</span>
              <span className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                ))}
              </span>
              <span className="text-sm text-slate-600 font-medium">
                · {GOOGLE_RATING.count}+ Google Reviews
              </span>
            </span>
            <ExternalLink size={14} className="text-slate-500" />
          </a>
        </div>

        <div className="vscroll-mask grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 h-[420px] sm:h-[520px]">
          <ScrollColumn items={TESTIMONIALS} startIndex={0} />
          <div className="hidden md:block h-full">
            <ScrollColumn items={colB} reverse startIndex={half} />
          </div>
        </div>
      </div>
    </section>
  );
}
