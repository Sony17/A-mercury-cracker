export const QUICK_QUESTIONS_STORAGE_KEY = "quickQuestions";
export const MAX_QUICK_QUESTIONS = 10;

export interface QuickQA {
  question: string;
  answer: string;
}

export const DEFAULT_QUICK_QUESTIONS: QuickQA[] = [
  {
    question: "Do you deliver outside Bareilly?",
    answer:
      "Yes! We deliver all over India. 🚚 For local Bareilly orders, we offer same-day delivery. WhatsApp us for shipping rates and timelines.",
  },
  {
    question: "What are your store hours?",
    answer:
      "We're open 10 AM – 9 PM, all days during the Diwali season. 🏪 Visit us in Bareilly — address details are in the footer.",
  },
  {
    question: "How to place a bulk order?",
    answer:
      "We offer great wholesale rates! 📦 For orders above ₹25,000, you get 5–10% extra discount. WhatsApp us with your list and we'll send a quote.",
  },
  {
    question: "Are crackers child-safe?",
    answer:
      "All our crackers are carefully curated for child safety. ✅ Our 'Kids Safe Edition' bundle is specifically loud-free and perfect for young children.",
  },
];

function isQuickQA(v: unknown): v is QuickQA {
  return (
    typeof v === "object" &&
    v !== null &&
    typeof (v as QuickQA).question === "string" &&
    typeof (v as QuickQA).answer === "string"
  );
}

export function loadQuickQuestions(): QuickQA[] {
  if (typeof window === "undefined") return DEFAULT_QUICK_QUESTIONS;
  try {
    const raw = localStorage.getItem("mc_" + QUICK_QUESTIONS_STORAGE_KEY);
    if (!raw) return DEFAULT_QUICK_QUESTIONS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_QUICK_QUESTIONS;

    // Migrate legacy string[] shape: pair each question with a generic answer.
    const migrated: QuickQA[] = parsed
      .map((v) => {
        if (isQuickQA(v)) return { question: v.question.trim(), answer: v.answer.trim() };
        if (typeof v === "string" && v.trim()) {
          return { question: v.trim(), answer: "" };
        }
        return null;
      })
      .filter((v): v is QuickQA => v !== null && v.question.length > 0)
      .slice(0, MAX_QUICK_QUESTIONS);

    return migrated.length > 0 ? migrated : DEFAULT_QUICK_QUESTIONS;
  } catch {
    return DEFAULT_QUICK_QUESTIONS;
  }
}

export function saveQuickQuestions(items: QuickQA[]) {
  if (typeof window === "undefined") return;
  try {
    const cleaned = items
      .map((qa) => ({ question: qa.question.trim(), answer: qa.answer.trim() }))
      .filter((qa) => qa.question.length > 0)
      .slice(0, MAX_QUICK_QUESTIONS);
    localStorage.setItem(
      "mc_" + QUICK_QUESTIONS_STORAGE_KEY,
      JSON.stringify(cleaned),
    );
    window.dispatchEvent(new CustomEvent("mc:quick-questions-updated"));
  } catch {}
}
