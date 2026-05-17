"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Truck,
  Package,
  BadgePercent,
  ShieldCheck,
  FileText,
  CheckCircle2,
  Building2,
  Phone,
  Send,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const BENEFITS = [
  {
    icon: BadgePercent,
    title: "Wholesale Pricing",
    desc: "Tiered slabs by quantity — better rates the more you order.",
  },
  {
    icon: Truck,
    title: "Pan-India Delivery",
    desc: "Direct dispatch from Bareilly warehouse, GST invoice included.",
  },
  {
    icon: ShieldCheck,
    title: "PESO-Certified Stock",
    desc: "Every SKU complies with PESO & state safety norms.",
  },
  {
    icon: Package,
    title: "Custom Mix Bundles",
    desc: "Build hampers for retailers, corporate gifting or society orders.",
  },
];

const BUSINESS_TYPES = [
  "Retailer / Shop",
  "Wholesaler / Distributor",
  "Corporate Gifting",
  "Society / RWA",
  "Event Manager",
  "Other",
];

const QTY_RANGES = [
  "Under ₹25,000",
  "₹25,000 – ₹1,00,000",
  "₹1,00,000 – ₹5,00,000",
  "₹5,00,000+",
];

const EMPTY = {
  name: "",
  phone: "",
  email: "",
  businessName: "",
  businessType: BUSINESS_TYPES[0],
  gstin: "",
  city: "",
  qty: QTY_RANGES[0],
  interest: "",
  message: "",
};

export default function B2BPage() {
  const { addB2BInquiry, showToast, company } = useStore();
  const [form, setForm] = useState(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const update = <K extends keyof typeof EMPTY>(k: K, v: (typeof EMPTY)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    const phone = form.phone.replace(/\D/g, "");
    if (phone.length < 10) {
      setErr("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!form.businessName.trim()) {
      setErr("Business name is required.");
      return;
    }

    addB2BInquiry({ ...form, phone });
    setSubmitted(true);
    setForm(EMPTY);
    showToast("Inquiry submitted — we'll review and reach out shortly.", "success");
  };

  return (
    <div className="bg-cream">
      {/* Hero */}
      <section className="relative bg-navy text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-sky/30 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-blue/40 blur-3xl" />
        </div>
        <div className="container-xl relative z-10 py-16 md:py-24">
          <div className="max-w-3xl">
            <span className="inline-block bg-white/10 border border-white/15 text-sky text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
              For Business · Bulk Orders
            </span>
            <h1 className="text-4xl md:text-5xl font-black leading-tight mb-4">
              Buy Crackers in Bulk —
              <br />
              <span className="text-sky">Wholesale Rates, Direct from Bareilly.</span>
            </h1>
            <p className="text-white/75 text-base md:text-lg max-w-2xl mb-8">
              Retailers, distributors, corporate gifting teams and event managers — get our
              latest price list with MOQ, slab pricing and full SKU range. Submit your
              business details, and once approved our team shares the catalog PDF directly
              on WhatsApp.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#inquiry">
                <Button className="bg-white text-navy hover:bg-sky hover:text-white font-bold px-6 h-11">
                  <Send size={16} /> Request Price List
                </Button>
              </a>
              <a href={`tel:${company.phone}`}>
                <Button
                  variant="outline"
                  className="border-white/30 bg-white/5 text-white hover:bg-white/15 font-bold px-6 h-11"
                >
                  <Phone size={16} /> Call {company.phone}
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section-pad bg-cream">
        <div className="container-xl">
          <div className="text-center mb-10">
            <span className="section-tag">★ Why partner with us</span>
            <h2 className="text-3xl md:text-4xl font-black text-navy mb-2">
              Built for serious buyers
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Transparent pricing, GST invoice, and a single point of contact for orders.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {BENEFITS.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="bg-white rounded-2xl p-5 border border-border shadow-sm hover:shadow-md hover:border-blue/30 transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-navy text-white flex items-center justify-center mb-3">
                  <b.icon size={20} />
                </div>
                <h3 className="font-black text-navy mb-1">{b.title}</h3>
                <p className="text-sm text-muted-foreground">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section-pad bg-white border-y border-border">
        <div className="container-xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-navy mb-2">
              How bulk ordering works
            </h2>
            <p className="text-muted-foreground">Three simple steps from inquiry to delivery.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              {
                n: "01",
                t: "Submit your details",
                d: "Fill the form below with your business info & quantity range.",
              },
              {
                n: "02",
                t: "Get approved",
                d: "Our team verifies your inquiry within 1 working day.",
              },
              {
                n: "03",
                t: "Receive price list on WhatsApp",
                d: "Approved buyers get the latest catalog PDF directly to their phone.",
              },
            ].map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="relative bg-cream rounded-2xl p-6 border border-border"
              >
                <div className="text-4xl font-black text-sky/60 mb-2">{s.n}</div>
                <h3 className="font-black text-navy mb-1">{s.t}</h3>
                <p className="text-sm text-muted-foreground">{s.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Inquiry form */}
      <section id="inquiry" className="section-pad bg-cream">
        <div className="container-xl">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
            {/* Left: info card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2 bg-navy text-white rounded-2xl p-7 shadow-lg"
            >
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                <FileText size={22} className="text-sky" />
              </div>
              <h3 className="text-2xl font-black mb-2">Request Bulk Price List</h3>
              <p className="text-white/70 text-sm mb-6">
                Tell us about your business and what you&apos;re looking for. Once approved by
                our admin, you&apos;ll receive the latest PDF catalog with wholesale slabs on
                WhatsApp at the number you share.
              </p>
              <ul className="space-y-3 text-sm">
                {[
                  "GST-compliant invoice on every order",
                  "Custom mix bundles available",
                  "Dedicated business account manager",
                  "Pan-India shipping with tracking",
                ].map((p) => (
                  <li key={p} className="flex items-start gap-2 text-white/85">
                    <CheckCircle2 size={16} className="text-sky flex-shrink-0 mt-0.5" />
                    {p}
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-6 border-t border-white/10 text-xs text-white/60">
                Prefer to talk? Call{" "}
                <a href={`tel:${company.phone}`} className="text-sky font-bold">
                  {company.phone}
                </a>{" "}
                · WhatsApp{" "}
                <a
                  href={`https://wa.me/91${company.whatsapp}`}
                  target="_blank"
                  rel="noopener"
                  className="text-sky font-bold"
                >
                  {company.whatsapp}
                </a>
              </div>
            </motion.div>

            {/* Right: form */}
            <motion.form
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              onSubmit={submit}
              className="lg:col-span-3 bg-white rounded-2xl border border-border shadow-sm p-6 md:p-7 space-y-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Building2 size={18} className="text-blue" />
                <h3 className="font-black text-navy text-lg">B2B Inquiry Form</h3>
              </div>

              {submitted && (
                <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 flex items-start gap-2">
                  <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Inquiry received!</div>
                    Our team will review your details and send the price list PDF via
                    WhatsApp once approved. You can submit another inquiry below if needed.
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Your Name *">
                  <Input
                    required
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="Full name"
                  />
                </Field>
                <Field label="WhatsApp Mobile *">
                  <Input
                    required
                    type="tel"
                    inputMode="numeric"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="10-digit number"
                  />
                </Field>
              </div>

              <Field label="Email">
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="you@business.com"
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Business Name *">
                  <Input
                    required
                    value={form.businessName}
                    onChange={(e) => update("businessName", e.target.value)}
                    placeholder="Eg. Sharma Traders"
                  />
                </Field>
                <Field label="Business Type *">
                  <select
                    required
                    value={form.businessType}
                    onChange={(e) => update("businessType", e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                  >
                    {BUSINESS_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="GSTIN (optional)">
                  <Input
                    value={form.gstin}
                    onChange={(e) => update("gstin", e.target.value.toUpperCase())}
                    placeholder="22AAAAA0000A1Z5"
                  />
                </Field>
                <Field label="City / State *">
                  <Input
                    required
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                    placeholder="Eg. Bareilly, UP"
                  />
                </Field>
              </div>

              <Field label="Estimated Order Quantity *">
                <select
                  required
                  value={form.qty}
                  onChange={(e) => update("qty", e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                >
                  {QTY_RANGES.map((q) => (
                    <option key={q} value={q}>
                      {q}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Product Categories of Interest">
                <Input
                  value={form.interest}
                  onChange={(e) => update("interest", e.target.value)}
                  placeholder="Eg. Sparklers, Flower Pots, Sky Shots"
                />
              </Field>

              <Field label="Message">
                <Textarea
                  rows={3}
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                  placeholder="Tell us about your requirement, delivery timeline, etc."
                />
              </Field>

              {err && (
                <div className="text-red-600 text-sm font-medium bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  {err}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-navy hover:bg-blue text-white font-bold h-11"
              >
                <Send size={16} /> Submit Inquiry
              </Button>

              <p className="text-[11px] text-muted-foreground text-center">
                By submitting, you agree to be contacted on WhatsApp / phone regarding your
                inquiry. See our{" "}
                <Link href="/#contact" className="underline">
                  contact details
                </Link>
                .
              </p>
            </motion.form>
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-foreground mb-1 block">{label}</label>
      {children}
    </div>
  );
}
