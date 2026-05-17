"use client";

import Link from "next/link";
import Image from "next/image";
import { useStore } from "@/lib/store";
import { Phone, Mail, Clock } from "lucide-react";
import CustomerCareLinks from "./CustomerCareLinks";
import type { SocialLink } from "@/lib/types";

function SocialButton({ link }: { link: SocialLink }) {
  const initial = (link.label?.[0] || link.platform?.[0] || "?").toUpperCase();
  const bg = link.color || "#475569";
  return (
    <a
      href={link.url || "#"}
      target="_blank"
      rel="noopener"
      aria-label={link.label}
      title={link.label}
      className="w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-110 overflow-hidden"
      style={{ backgroundColor: bg }}
    >
      {link.iconUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={link.iconUrl} alt={link.label} className="w-4 h-4 object-contain" />
      ) : (
        <span className="text-white font-black text-xs">{initial}</span>
      )}
    </a>
  );
}

export default function Footer() {
  const { company: c } = useStore();
  const socials = c.socials || [];

  return (
    <footer className="bg-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-20 sm:pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Image
              src="/logo.png"
              alt={c.brand}
              width={740}
              height={326}
              className="h-14 w-auto object-contain mb-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
            />
            <div className="text-xs text-white/60 mb-3">{c.tagline}</div>
            <p className="text-white/70 text-sm leading-relaxed mb-5">
              Bareilly&apos;s premium destination for fancy crackers since {c.est}. Child-safe quality, unmatched variety, best rates in the market.
            </p>
            {socials.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {socials.map((s) => (
                  <SocialButton key={s.id} link={s} />
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm tracking-wide uppercase">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { label: "Home", href: "/" },
                { label: "Products", href: "/products" },
                { label: "₹2000 Bundles", href: "/#bundles" },
                { label: "About Us", href: "/#about" },
                { label: "Contact", href: "/#contact" },
                { label: "Google Listing", href: c.google, external: true },
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    target={l.external ? "_blank" : undefined}
                    rel={l.external ? "noopener" : undefined}
                    className="text-white/65 hover:text-white text-sm transition-colors hover:translate-x-1 inline-block transition-transform duration-200"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm tracking-wide uppercase">Customer Care</h4>
            <CustomerCareLinks />
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm tracking-wide uppercase">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Phone size={15} className="text-sky flex-shrink-0" />
                <a href={`tel:+91${c.phone}`} className="text-white/70 hover:text-white text-sm transition-colors">
                  +91 {c.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={15} className="text-sky flex-shrink-0" />
                <a href={`mailto:${c.email}`} className="text-white/70 hover:text-white text-sm transition-colors truncate">
                  {c.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock size={15} className="text-sky flex-shrink-0" />
                <span className="text-white/70 text-sm">{c.hours}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Compliance */}
        <div className="mt-10 p-4 bg-white/5 border border-white/10 rounded-xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-sky font-bold uppercase tracking-wider block mb-1">GSTIN</span>
              <span className="text-white/75">{c.gstin || <em className="text-yellow-400">Not provided — add via Admin</em>}</span>
            </div>
            <div>
              <span className="text-sky font-bold uppercase tracking-wider block mb-1">PESO License</span>
              <span className="text-white/75">{c.peso || <em className="text-yellow-400">Not provided — add via Admin</em>}</span>
            </div>
            <div>
              <span className="text-sky font-bold uppercase tracking-wider block mb-1">Compliance</span>
              <span className="text-white/75">Sale regulated under Explosives Act 1884. HSN: 3604. Strictly 18+.</span>
              <span className="text-yellow-300/80 italic block mt-1">Use only as per safety instructions on packaging.</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <span>© 2026 {c.brand}. All Rights Reserved.</span>
          <span>Owner: {c.ownerName} · Designed by Open Idea Studio</span>
        </div>
      </div>
    </footer>
  );
}
