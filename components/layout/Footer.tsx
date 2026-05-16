import Link from "next/link";
import { DEFAULT_CONTENT } from "@/lib/data";
import { Phone, Mail, MapPin, Clock, Sparkles } from "lucide-react";

const whatsappIcon = (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
    <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24z" />
  </svg>
);

export default function Footer() {
  const c = DEFAULT_CONTENT;

  return (
    <footer className="bg-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Sparkles size={18} className="text-sky" />
              </div>
              <div>
                <div className="font-black text-white text-sm">{c.brand}</div>
                <div className="text-xs text-white/60">{c.tagline}</div>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed mb-5">
              Bareilly&apos;s premium destination for fancy crackers since {c.est}. Child-safe quality, unmatched variety, best rates in the market.
            </p>
            <div className="flex gap-2">
      <a
                href="#"
                aria-label="Facebook"
                className="w-9 h-9 bg-white/10 hover:bg-white hover:text-navy rounded-full flex items-center justify-center transition-all"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/></svg>
              </a>
              <a
                href={c.instagram}
                target="_blank"
                rel="noopener"
                aria-label="Instagram"
                className="w-9 h-9 bg-white/10 hover:bg-white hover:text-navy rounded-full flex items-center justify-center transition-all"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a
                href={`https://wa.me/91${c.whatsapp}`}
                target="_blank"
                rel="noopener"
                aria-label="WhatsApp"
                className="w-9 h-9 bg-white/10 hover:bg-[#25D366] rounded-full flex items-center justify-center transition-all"
              >
                {whatsappIcon}
              </a>
              <a
                href="#"
                aria-label="YouTube"
                className="w-9 h-9 bg-white/10 hover:bg-red-600 rounded-full flex items-center justify-center transition-all"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
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
            <ul className="space-y-2">
              {["Shipping Policy", "Return Policy", "Privacy Policy", "Terms & Conditions", "Safety Guidelines"].map(
                (l) => (
                  <li key={l}>
                    <Link
                      href="#"
                      className="text-white/65 hover:text-white text-sm transition-colors hover:translate-x-1 inline-block transition-transform duration-200"
                    >
                      {l}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm tracking-wide uppercase">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin size={15} className="text-sky mt-0.5 flex-shrink-0" />
                <span className="text-white/70 text-sm leading-relaxed">{c.address}</span>
              </li>
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
          <span>Owner: {c.ownerName} · Designed in Bareilly</span>
        </div>
      </div>
    </footer>
  );
}
