"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, Send, Check, ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import { DEFAULT_CONTENT } from "@/lib/data";
import { loadQuickQuestions, type QuickQA } from "@/lib/quickQuestions";
import { useStore } from "@/lib/store";

const WA_ICON = (
  <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current">
    <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
  </svg>
);

export default function Chatbot() {
  const c = DEFAULT_CONTENT;
  const { user, addCustomerEnquiry } = useStore();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ from: "user" | "bot"; text: string; time: string }[]>([
    {
      from: "bot",
      text: `Hi! 👋 Welcome to ${c.brand}. How can I help you today?`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [quickOpen, setQuickOpen] = useState(true);
  const [quickActions, setQuickActions] = useState<QuickQA[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuickActions(loadQuickQuestions());
    const onUpdate = () => setQuickActions(loadQuickQuestions());
    window.addEventListener("mc:quick-questions-updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("mc:quick-questions-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, open, quickOpen]);

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

  const send = (text: string, isCustom = false, overrideAnswer?: string) => {
    if (!text.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg = { from: "user" as const, text, time: now };
    const reply =
      overrideAnswer && overrideAnswer.trim()
        ? overrideAnswer
        : quickActions.find((qa) => qa.question === text)?.answer?.trim() || getReply(text);
    const botMsg = { from: "bot" as const, text: reply, time: now };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");

    if (isCustom) {
      addCustomerEnquiry({
        question: text,
        reply,
        name: user?.name,
        email: user?.email,
        phone: user?.phone,
      });
      const waUrl = `https://wa.me/91${c.whatsapp}?text=${encodeURIComponent(text)}`;
      window.open(waUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <>
      {/* Floating WhatsApp button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed right-4 bottom-20 md:bottom-6 z-50 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xl hover:scale-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/50 transition-transform"
        aria-label="WhatsApp Chat"
      >
        {open ? (
          <X size={24} />
        ) : (
          <span className="relative w-7 h-7 flex items-center justify-center">
            {WA_ICON}
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white p-[1px] flex items-center justify-center overflow-hidden shadow">
              <Image
                src="/logo.png"
                alt=""
                aria-hidden="true"
                width={16}
                height={16}
                className="object-contain"
              />
            </span>
          </span>
        )}
      </button>

      {/* WhatsApp-style chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed right-4 left-4 md:left-auto bottom-36 md:bottom-24 z-50 md:w-80 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            style={{ maxHeight: "min(70vh, calc(100dvh - 10rem))" }}
          >
            {/* Header (WhatsApp green) */}
            <div className="bg-[#075E54] px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
                  <Image
                    src="/logo.png"
                    alt={c.brand}
                    width={40}
                    height={40}
                    className="object-contain w-9 h-9"
                  />
                </div>
                <div>
                  <div className="text-white text-sm font-semibold">{c.brand}</div>
                  <div className="text-white/80 text-[11px]">online</div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-white hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 transition-colors"
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages (WhatsApp chat background) */}
            <div
              className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-2"
              style={{
                background: "#ECE5DD",
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill='%23d9d2c5' fill-opacity='0.4'%3E%3Cpath d='M30 30c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10-10-4.5-10-10zm-30 0c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10S0 35.5 0 30z'/%3E%3C/g%3E%3C/svg%3E\")",
              }}
            >
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 text-xs leading-relaxed shadow-sm relative ${
                      m.from === "user"
                        ? "bg-[#DCF8C6] text-gray-900 rounded-lg rounded-tr-none"
                        : "bg-white text-gray-900 rounded-lg rounded-tl-none"
                    }`}
                  >
                    <div className="pr-10">{m.text}</div>
                    <div className="flex items-center gap-0.5 justify-end mt-0.5">
                      <span className="text-[10px] text-slate-500">{m.time}</span>
                      {m.from === "user" && (
                        <Check size={10} className="text-[#34B7F1]" strokeWidth={3} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick actions (collapsible) */}
            {quickActions.length > 0 && (
            <div className="border-t border-gray-200 bg-white">
              <button
                onClick={() => setQuickOpen((o) => !o)}
                className="w-full flex items-center justify-between px-3 py-2 text-[11px] text-slate-600 font-semibold hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#075E54]/30 transition-colors"
                aria-expanded={quickOpen}
              >
                <span>Quick questions</span>
                {quickOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              </button>
              <AnimatePresence initial={false}>
                {quickOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-wrap gap-1.5 px-3 pb-2 max-h-28 overflow-y-auto">
                      {quickActions.map((qa, i) => (
                        <button
                          key={`${qa.question}-${i}`}
                          onClick={() => send(qa.question, false, qa.answer)}
                          className="text-[11px] font-semibold text-[#054D40] bg-[#DCF8C6] hover:bg-[#c8efb0] border border-[#a8d99a] px-2.5 py-1 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#075E54]/40 transition-colors"
                        >
                          {qa.question}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            )}

            {/* Input bar (WhatsApp style) */}
            <div className="px-2 py-2 bg-[#F0F0F0] flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send(input, true)}
                onFocus={() => {
                  if (typeof window !== "undefined" && window.innerWidth < 768) {
                    setQuickOpen(false);
                  }
                }}
                placeholder="Type a message"
                className="flex-1 min-w-0 text-base md:text-sm px-4 py-2 rounded-full bg-white border-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#075E54]/40 placeholder:text-slate-500 text-[#001D3D]"
              />
              {input.trim() ? (
                <button
                  onClick={() => send(input, true)}
                  className="w-10 h-10 bg-[#25D366] text-white rounded-full flex items-center justify-center hover:bg-[#1ebe5d] transition-colors flex-shrink-0"
                  aria-label="Send"
                >
                  <Send size={16} />
                </button>
              ) : (
                <a
                  href={`https://wa.me/91${c.whatsapp}`}
                  target="_blank"
                  rel="noopener"
                  className="w-10 h-10 bg-[#25D366] text-white rounded-full flex items-center justify-center hover:bg-[#1ebe5d] transition-colors flex-shrink-0"
                  aria-label="Open on WhatsApp"
                >
                  <ChevronRight size={18} />
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
