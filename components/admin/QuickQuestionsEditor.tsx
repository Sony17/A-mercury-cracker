"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import {
  DEFAULT_QUICK_QUESTIONS,
  MAX_QUICK_QUESTIONS,
  loadQuickQuestions,
  saveQuickQuestions,
  type QuickQA,
} from "@/lib/quickQuestions";
import { MessageSquare, RotateCcw, Save, Trash2 } from "lucide-react";

function padToMax(arr: QuickQA[]): QuickQA[] {
  const next: QuickQA[] = [...arr];
  while (next.length < MAX_QUICK_QUESTIONS) next.push({ question: "", answer: "" });
  return next.slice(0, MAX_QUICK_QUESTIONS);
}

export default function QuickQuestionsEditor() {
  const { showToast } = useStore();
  const [slots, setSlots] = useState<QuickQA[]>(padToMax([]));
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setSlots(padToMax(loadQuickQuestions()));
  }, []);

  const updateSlot = (i: number, patch: Partial<QuickQA>) => {
    setSlots((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], ...patch };
      return next;
    });
    setDirty(true);
  };

  const clearSlot = (i: number) => {
    updateSlot(i, { question: "", answer: "" });
  };

  const handleSave = () => {
    saveQuickQuestions(slots);
    setSlots(padToMax(loadQuickQuestions()));
    setDirty(false);
    showToast("Quick questions saved", "success");
  };

  const handleReset = () => {
    if (!confirm("Reset quick questions to defaults? Your custom questions and answers will be lost.")) return;
    setSlots(padToMax(DEFAULT_QUICK_QUESTIONS));
    setDirty(true);
  };

  const filledCount = slots.filter((s) => s.question.trim().length > 0).length;

  return (
    <div>
      <div className="mb-5 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-black text-navy flex items-center gap-2">
            <MessageSquare size={18} /> Chatbot Quick Questions
          </h2>
          <p className="text-sm text-muted-foreground">
            Customize the suggested questions and the bot's answers in the WhatsApp chat widget. Up to{" "}
            {MAX_QUICK_QUESTIONS} — leave any slot's question blank to skip it.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            className="gap-2 text-amber-700 border-amber-300 hover:bg-amber-50"
          >
            <RotateCcw size={14} /> Reset to defaults
          </Button>
          <Button
            onClick={handleSave}
            disabled={!dirty}
            className="gap-2 bg-gold hover:bg-gold-spark text-navy font-bold disabled:opacity-50"
          >
            <Save size={14} /> Save changes
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-navy text-sm">Question slots</h3>
          <span className="text-xs text-muted-foreground">
            {filledCount}/{MAX_QUICK_QUESTIONS} active
          </span>
        </div>

        <div className="space-y-4">
          {slots.map((slot, i) => (
            <div
              key={i}
              className="border border-border rounded-xl p-3 bg-cream/30 space-y-2"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-navy text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <Input
                  value={slot.question}
                  onChange={(e) => updateSlot(i, { question: e.target.value })}
                  placeholder={`Question ${i + 1} (leave blank to skip)`}
                  maxLength={120}
                  className="flex-1 bg-white"
                />
                {(slot.question || slot.answer) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => clearSlot(i)}
                    className="flex-shrink-0 text-xs gap-1 text-red-600 hover:bg-red-50"
                    aria-label={`Clear slot ${i + 1}`}
                  >
                    <Trash2 size={12} /> Clear
                  </Button>
                )}
              </div>
              <div className="pl-9">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">
                  Bot's reply
                </label>
                <Textarea
                  value={slot.answer}
                  onChange={(e) => updateSlot(i, { answer: e.target.value })}
                  placeholder="Type the answer the chatbot will reply with when this question is clicked…"
                  className="min-h-[64px] text-sm bg-white"
                  maxLength={500}
                  disabled={!slot.question.trim()}
                />
              </div>
            </div>
          ))}
        </div>

        {dirty && (
          <div className="mt-4 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
            You have unsaved changes. Click <strong>Save changes</strong> to publish them to the chat widget.
          </div>
        )}

        <div className="mt-5 pt-5 border-t border-border">
          <div className="text-xs font-semibold text-navy mb-2">Preview (chips shown in chat)</div>
          <div className="flex flex-wrap gap-1.5 bg-cream/50 rounded-lg p-3 min-h-[60px]">
            {slots.filter((s) => s.question.trim()).length === 0 ? (
              <span className="text-xs text-muted-foreground italic">
                No active questions — the chat widget will hide this section.
              </span>
            ) : (
              slots
                .filter((s) => s.question.trim())
                .map((qa, i) => (
                  <span
                    key={i}
                    className="text-[11px] text-[#075E54] bg-[#DCF8C6] px-2.5 py-1 rounded-full"
                  >
                    {qa.question}
                  </span>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
