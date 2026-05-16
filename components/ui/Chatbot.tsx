"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, ChevronRight, Phone } from "lucide-react";
import { DEFAULT_CONTENT, FAQ_ITEMS } from "@/lib/data";

const WA_ICON = (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
    <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24z" />
  </svg>
);

const QUICK_ACTIONS = [
  "Do you deliver outside Bareilly?",
  "What are your store hours?",
  "How to place a bulk order?",
  "Are crackers child-safe?",
];

export default function Chatbot() {
  const c = DEFAULT_CONTENT;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ from: "user" | "bot"; text: string }[]>([
    { from: "bot", text: `Hi! 👋 Welcome to ${c.brand}. How can I help you today?` },
  ]);
  const [input, setInput] = useState("");

  const getReply = (q: string): string => {
    const lower = q.toLowerCase();
    if (lower.includes("deliver") || lower.includes("ship") || lower.includes("outside")) {
      return "Yes! We deliver all over India. 🚚 For local Bareilly orders, we offer same-day delivery. Contact us on WhatsApp for shipping rates.";
    }
    if (lower.includes("hour") || lower.includes("time") || lower.includes("open")) {
      return `We are open ${c.hours}. Come visit us at ${c.address}! 🏪`;
    }
    if (lower.includes("bulk") || lower.includes("wholesale")) {
      return "We offer great wholesale rates! 📦 For bulk orders above ₹25,000, you get 5-10% extra discount. WhatsApp us to discuss pricing.";
    }
    if (lower.includes("safe") || lower.includes("child") || lower.includes("kid")) {
      return "All our crackers are carefully curated for child safety. ✅ We have a special 'Kids Safe Edition' bundle with no loud crackers!";
    }
    if (lower.includes("price") || lower.includes("cost") || lower.includes("rate")) {
      return "Our prices are 70% below MRP! 💰 Starting from ₹25. Check out our ₹2000 bundles for the best value.";
    }
    return "Thanks for your question! For detailed assistance, please WhatsApp us at +91 " + c.whatsapp + " or call directly. We respond within minutes! 😊";
  };

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg = { from: "user" as const, text };
    const botMsg = { from: "bot" as const, text: getReply(text) };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  };

  return (
    <>
      {/* Floating button cluster */}
      <div className="fixed right-4 bottom-20 md:bottom-6 z-50 flex flex-col items-end gap-2">
        {/* WhatsApp button */}
        <a
          href={`https://wa.me/91${c.whatsapp}`}
          target="_blank"
          rel="noopener"
          className="w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          aria-label="WhatsApp"
        >
          {WA_ICON}
        </a>

        {/* Chat button */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-14 h-14 rounded-full bg-navy text-white flex items-center justify-center shadow-xl hover:bg-blue transition-all hover:scale-110"
          aria-label="Chat"
        >
          {open ? <X size={22} /> : <MessageCircle size={22} />}
        </button>
      </div>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed right-4 bottom-36 md:bottom-24 z-50 w-80 bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-navy px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">
                  🎆
                </div>
                <div>
                  <div className="text-white text-sm font-bold">Mercury Assistant</div>
                  <div className="text-white/60 text-[10px]">Usually replies in minutes</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white">
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="h-56 overflow-y-auto px-3 py-3 space-y-2 bg-cream/40">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                      m.from === "user"
                        ? "bg-navy text-white rounded-br-sm"
                        : "bg-white border border-border text-foreground rounded-bl-sm shadow-sm"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div className="px-3 py-2 border-t border-border bg-white/50">
              <div className="text-[10px] text-muted-foreground mb-2 font-medium">Quick questions:</div>
              <div className="space-y-1">
                {QUICK_ACTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="w-full flex items-center justify-between text-left text-xs text-navy bg-sky/10 hover:bg-sky/20 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {q}
                    <ChevronRight size={12} />
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="px-3 py-2 border-t border-border bg-white flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send(input)}
                placeholder="Type a message…"
                className="flex-1 text-xs px-3 py-2 rounded-lg border border-border bg-cream focus:outline-none focus:border-blue"
              />
              <button
                onClick={() => send(input)}
                className="w-8 h-8 bg-navy text-white rounded-lg flex items-center justify-center hover:bg-blue transition-colors flex-shrink-0"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            {/* WhatsApp escalation */}
            <div className="px-3 py-2 bg-[#25D366]/10 border-t border-[#25D366]/20 flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">Need direct help?</span>
              <a
                href={`https://wa.me/91${c.whatsapp}`}
                target="_blank"
                rel="noopener"
                className="flex items-center gap-1 text-[10px] font-bold text-[#25D366] hover:underline"
              >
                <Phone size={10} /> Chat on WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
