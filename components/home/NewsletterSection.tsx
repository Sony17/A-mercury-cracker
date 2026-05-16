"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setDone(true);
    setEmail("");
  };

  return (
    <section className="section-pad bg-gradient-to-br from-navy to-[#2a4a5e]">
      <div className="container-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-xl mx-auto"
        >
          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-5">
            <Mail size={24} className="text-sky" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
            Get Festival Offers First
          </h2>
          <p className="text-white/70 mb-8">
            Subscribe for early access to Diwali bundles, exclusive discounts, and new arrivals.
          </p>

          {done ? (
            <div className="flex items-center justify-center gap-3 text-green-300 font-semibold">
              <CheckCircle2 size={20} />
              You&apos;re subscribed! We&apos;ll be in touch before the next festival.
            </div>
          ) : (
            <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/15 border-white/25 text-white placeholder:text-white/50 focus:bg-white/20"
              />
              <Button
                type="submit"
                className="bg-white text-navy hover:bg-cream font-bold flex-shrink-0"
              >
                Subscribe
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
