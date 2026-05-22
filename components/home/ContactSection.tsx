"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { DEFAULT_CONTENT } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactSection() {
  const c = DEFAULT_CONTENT;
  const [form, setForm] = useState({ name: "", phone: "", email: "", msg: "" });
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: "", phone: "", email: "", msg: "" });
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <section id="contact" className="section-pad bg-cream">
      <div className="container-xl">
        <div className="text-center mb-6 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-navy mb-3">Get in Touch</h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Place bulk orders, ask questions or visit our Bareilly showroom
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-stretch">
          {/* Contact form */}
          <motion.form
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            onSubmit={submit}
            className="bg-white border border-border rounded-2xl p-4 sm:p-6 shadow-sm space-y-4"
          >
            <h3 className="font-bold text-navy">Quick Enquiry</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Your Name *</label>
                <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Mobile *</label>
                <Input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="10-digit" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Email</label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Message *</label>
              <Textarea required value={form.msg} onChange={(e) => setForm({ ...form, msg: e.target.value })} placeholder="Tell us what you need…" rows={3} />
            </div>
            {sent ? (
              <div className="text-green-600 font-semibold text-sm text-center py-2">✓ Message sent! We&apos;ll get back to you soon.</div>
            ) : (
              <Button type="submit" className="w-full bg-navy hover:bg-blue text-white font-bold">Send Message</Button>
            )}
          </motion.form>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl overflow-hidden border border-border shadow-sm flex flex-col"
          >
            <div className="bg-navy text-white px-4 sm:px-6 py-4 flex items-center justify-between gap-3 sm:gap-4 flex-wrap">
              <div>
                <div className="font-bold">Visit Our Showroom</div>
                <div className="text-white/70 text-sm">{c.address}</div>
              </div>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(c.address)}`}
                target="_blank"
                rel="noopener"
                className="flex items-center gap-2 bg-white text-[#001D3D] font-bold text-sm px-4 py-2 rounded-xl hover:bg-[#FFD166] hover:text-[#000814] transition-colors"
              >
                <ExternalLink size={14} /> Get Directions
              </a>
            </div>
            <iframe
              src={`https://maps.google.com/maps?q=${encodeURIComponent(c.address)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Showroom Location"
              className="w-full flex-1 min-h-56 sm:min-h-72 border-0 block"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
