"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";

type Mode = "phone" | "email";

export default function NewsletterSection() {
  const { addSubscriber } = useStore();
  const [mode, setMode] = useState<Mode>("phone");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "phone") {
      const digits = phone.replace(/\D/g, "");
      if (digits.length !== 10) return;
      addSubscriber("phone", digits);
    } else {
      if (!email) return;
      addSubscriber("email", email);
    }
    setDone(true);
    setEmail("");
    setPhone("");
  };

  const tabBase =
    "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition";
  const tabActive = "bg-white text-navy";
  const tabIdle = "bg-white/10 text-white/70 hover:bg-white/15";

  return (
    <section className="section-pad relative overflow-hidden isolate">
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-cover bg-center scale-110"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1677008400775-62071dfe3945?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGNyYWNrZXIlMjBmaXJld29ya3N8ZW58MHx8MHx8fDA%3D')",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-br from-navy/90 via-navy/80 to-black/85"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-black/40"
      />
      <div className="container-xl relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-xl mx-auto"
        >
          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-5">
            <Mail size={24} className="text-sky" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white mb-4 drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)]">
            Get Festival Offers First
          </h2>
          <p className="text-white/90 mb-6 sm:mb-8 text-sm sm:text-base md:text-lg drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)]">
            Subscribe for early access to Diwali bundles, exclusive discounts, and new arrivals.
            We&apos;ll send updates on WhatsApp or email — your choice.
          </p>

          {done ? (
            <div className="flex items-center justify-center gap-3 text-green-300 font-semibold">
              <CheckCircle2 size={20} />
              You&apos;re subscribed! We&apos;ll be in touch before the next festival.
            </div>
          ) : (
            <div className="max-w-md mx-auto">
              <div className="flex gap-2 p-1 bg-white/5 rounded-xl mb-3">
                <button
                  type="button"
                  onClick={() => setMode("phone")}
                  className={`${tabBase} ${mode === "phone" ? tabActive : tabIdle}`}
                >
                  <Phone size={16} />
                  WhatsApp / SMS
                </button>
                <button
                  type="button"
                  onClick={() => setMode("email")}
                  className={`${tabBase} ${mode === "email" ? tabActive : tabIdle}`}
                >
                  <Mail size={16} />
                  Email
                </button>
              </div>

              <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3">
                {mode === "phone" ? (
                  <div className="flex flex-1 items-stretch rounded-md overflow-hidden bg-white/15 border border-white/25 focus-within:bg-white/20">
                    <span className="flex items-center px-3 text-white/80 font-semibold border-r border-white/20 bg-white/5">
                      +91
                    </span>
                    <Input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]{10}"
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                      }
                      required
                      className="flex-1 bg-transparent border-0 text-white placeholder:text-white/50 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                ) : (
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/15 border-white/25 text-white placeholder:text-white/50 focus:bg-white/20"
                  />
                )}
                <Button
                  type="submit"
                  className="bg-white text-navy hover:bg-cream font-bold flex-shrink-0"
                >
                  Subscribe
                </Button>
              </form>

              <p className="text-white/50 text-xs mt-3">
                By subscribing, you agree to receive promotional messages. Standard rates may apply.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
