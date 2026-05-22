"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { DEFAULT_CONTENT } from "@/lib/data";
import type { OccasionItem } from "@/lib/types";
import { Plus, Trash2, RotateCcw, Save, Sparkles } from "lucide-react";

const MAX_OCCASIONS = 24;

export default function OccasionsEditor() {
  const { company, updateCompany, showToast } = useStore();
  const [items, setItems] = useState<OccasionItem[]>(
    company.occasions ?? DEFAULT_CONTENT.occasions,
  );
  const [dirty, setDirty] = useState(false);
  const [draftIc, setDraftIc] = useState("");
  const [draftName, setDraftName] = useState("");
  const [draftTag, setDraftTag] = useState("");
  const [draftCopy, setDraftCopy] = useState("");
  const [draftHref, setDraftHref] = useState("");

  useEffect(() => {
    setItems(company.occasions ?? DEFAULT_CONTENT.occasions);
  }, [company.occasions]);

  const setAt = (idx: number, patch: Partial<OccasionItem>) => {
    setItems((prev) => prev.map((o, i) => (i === idx ? { ...o, ...patch } : o)));
    setDirty(true);
  };

  const remove = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
    setDirty(true);
  };

  const move = (idx: number, dir: -1 | 1) => {
    setItems((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
    setDirty(true);
  };

  const add = () => {
    const name = draftName.trim();
    const ic = draftIc.trim() || "🎉";
    if (!name) {
      showToast("Enter an occasion name", "error");
      return;
    }
    if (items.some((o) => o.n.toLowerCase() === name.toLowerCase())) {
      showToast("That occasion already exists", "error");
      return;
    }
    if (items.length >= MAX_OCCASIONS) {
      showToast(`Max ${MAX_OCCASIONS} occasions`, "error");
      return;
    }
    const next: OccasionItem = {
      ic,
      n: name,
      t: draftTag.trim() || "Festival",
      c: draftCopy.trim() || "",
    };
    const href = draftHref.trim();
    if (href) next.href = href;
    setItems((prev) => [...prev, next]);
    setDraftIc("");
    setDraftName("");
    setDraftTag("");
    setDraftCopy("");
    setDraftHref("");
    setDirty(true);
  };

  const handleSave = () => {
    const cleaned = items
      .map((o) => {
        const out: OccasionItem = {
          ic: (o.ic || "🎉").trim(),
          n: o.n.trim(),
          t: (o.t || "").trim(),
          c: (o.c || "").trim(),
        };
        const href = (o.href || "").trim();
        if (href) out.href = href;
        return out;
      })
      .filter((o) => o.n);
    const seen = new Set<string>();
    for (const o of cleaned) {
      const key = o.n.toLowerCase();
      if (seen.has(key)) {
        showToast(`Duplicate occasion: ${o.n}`, "error");
        return;
      }
      seen.add(key);
    }
    updateCompany({ occasions: cleaned });
    setItems(cleaned);
    setDirty(false);
    showToast("Occasions saved", "success");
  };

  const handleReset = () => {
    if (!confirm("Reset occasions to defaults? Your custom occasions will be lost.")) return;
    setItems(DEFAULT_CONTENT.occasions);
    setDirty(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-navy">Occasions</h2>
          <p className="text-sm text-muted-foreground">
            Powers the &ldquo;Shop by Occasion&rdquo; ribbon and grid on the homepage.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw size={14} />
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={!dirty}
            className="bg-navy hover:bg-blue text-white gap-2"
          >
            <Save size={14} />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-navy/10 flex items-center justify-center flex-shrink-0">
            <Sparkles size={16} className="text-navy" />
          </div>
          <div>
            <h3 className="font-black text-navy">Add an occasion</h3>
            <p className="text-xs text-muted-foreground">
              Icon is an emoji. Optional link goes to a festival landing page (e.g. /festivals/christmas).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-[64px_1fr_1fr_1fr_1fr_auto] gap-2 items-stretch">
          <Input
            value={draftIc}
            onChange={(e) => setDraftIc(e.target.value)}
            placeholder="🎉"
            maxLength={4}
            className="text-center text-lg"
          />
          <Input
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            placeholder="Name (e.g. Diwali)"
          />
          <Input
            value={draftTag}
            onChange={(e) => setDraftTag(e.target.value)}
            placeholder="Tag (e.g. Festival)"
          />
          <Input
            value={draftCopy}
            onChange={(e) => setDraftCopy(e.target.value)}
            placeholder="Description (optional)"
          />
          <Input
            value={draftHref}
            onChange={(e) => setDraftHref(e.target.value)}
            placeholder="Link URL (optional)"
          />
          <Button onClick={add} className="bg-navy hover:bg-blue text-white gap-1.5">
            <Plus size={14} />
            Add
          </Button>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          {items.length}/{MAX_OCCASIONS} occasions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.length === 0 && (
          <div className="md:col-span-2 lg:col-span-3 bg-white rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No occasions yet. Add one above to populate the homepage ribbon and grid.
          </div>
        )}
        {items.map((occ, idx) => (
          <div
            key={`${idx}-${occ.n}`}
            className="bg-white rounded-2xl border border-border shadow-sm p-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-cream flex items-center justify-center text-2xl flex-shrink-0">
                {occ.ic || "🎉"}
              </div>
              <div className="flex-1 min-w-0 space-y-1.5">
                <Input
                  value={occ.n}
                  onChange={(e) => setAt(idx, { n: e.target.value })}
                  className="text-sm font-semibold"
                  placeholder="Name"
                />
                <div className="grid grid-cols-2 gap-1.5">
                  <Input
                    value={occ.ic}
                    onChange={(e) => setAt(idx, { ic: e.target.value })}
                    className="text-xs text-center"
                    placeholder="Icon"
                    maxLength={4}
                  />
                  <Input
                    value={occ.t}
                    onChange={(e) => setAt(idx, { t: e.target.value })}
                    className="text-xs"
                    placeholder="Tag"
                  />
                </div>
                <Input
                  value={occ.c}
                  onChange={(e) => setAt(idx, { c: e.target.value })}
                  className="text-xs"
                  placeholder="Description"
                />
                <Input
                  value={occ.href ?? ""}
                  onChange={(e) => setAt(idx, { href: e.target.value })}
                  className="text-xs"
                  placeholder="Link URL (optional)"
                />
              </div>
            </div>
            <div className="mt-2.5 flex items-center justify-between">
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={() => move(idx, -1)} disabled={idx === 0}>
                  ▲
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => move(idx, 1)}
                  disabled={idx === items.length - 1}
                >
                  ▼
                </Button>
              </div>
              <button
                onClick={() => remove(idx)}
                className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center"
                aria-label={`Remove ${occ.n}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
