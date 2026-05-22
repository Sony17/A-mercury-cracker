"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import {
  SOCIAL_PRESETS,
  MAX_SOCIALS,
  getPreset,
  makeSocialFromPreset,
  DEFAULT_SOCIALS,
} from "@/lib/socials";
import type { SocialLink } from "@/lib/types";
import { Plus, Trash2, GripVertical, RotateCcw, Save, Share2 } from "lucide-react";

function platformInitial(s: SocialLink) {
  return (s.label?.[0] || s.platform?.[0] || "?").toUpperCase();
}

function SocialIconPreview({ link }: { link: SocialLink }) {
  const bg = link.color || "#475569";
  if (link.iconUrl) {
    return (
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: bg }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={link.iconUrl} alt={link.label} className="w-4 h-4 object-contain" />
      </div>
    );
  }
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0"
      style={{ backgroundColor: bg }}
    >
      {platformInitial(link)}
    </div>
  );
}

export default function SocialsEditor() {
  const { company, updateCompany, showToast } = useStore();
  const [items, setItems] = useState<SocialLink[]>(company.socials || []);
  const [dirty, setDirty] = useState(false);
  const [newPreset, setNewPreset] = useState<string>("instagram");

  useEffect(() => {
    setItems(company.socials || []);
  }, [company.socials]);

  const update = (id: string, patch: Partial<SocialLink>) => {
    setItems((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    setDirty(true);
  };

  const remove = (id: string) => {
    setItems((prev) => prev.filter((s) => s.id !== id));
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
    if (items.length >= MAX_SOCIALS) {
      showToast(`Max ${MAX_SOCIALS} social links`, "error");
      return;
    }
    setItems((prev) => [...prev, makeSocialFromPreset(newPreset)]);
    setDirty(true);
  };

  const handleSave = () => {
    updateCompany({ socials: items });
    setDirty(false);
    showToast("Social links saved", "success");
  };

  const handleReset = () => {
    if (!confirm("Reset social links to defaults? Custom additions will be lost.")) return;
    setItems(DEFAULT_SOCIALS);
    setDirty(true);
  };

  const resetIconToPreset = (link: SocialLink) => {
    const p = getPreset(link.platform);
    update(link.id, { iconUrl: p?.iconUrl || "" });
  };

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-navy/10 flex items-center justify-center flex-shrink-0">
          <Share2 size={16} className="text-navy" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-navy">Social Links</h3>
          <p className="text-xs text-muted-foreground">
            Manage links shown in the footer. Add up to {MAX_SOCIALS} — Instagram, JustDial, MagicPin, and more. You can upload a custom logo URL per link.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5">
            <RotateCcw size={13} />
            Reset
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!dirty}
            className="bg-gold hover:bg-gold-spark text-navy gap-1.5"
          >
            <Save size={13} />
            Save
          </Button>
        </div>
      </div>

      {/* Add row */}
      <div className="flex flex-col sm:flex-row gap-2 p-3 bg-cream rounded-xl mb-4">
        <select
          value={newPreset}
          onChange={(e) => setNewPreset(e.target.value)}
          className="flex-1 h-9 px-3 rounded-lg border border-border bg-white text-sm"
        >
          {SOCIAL_PRESETS.map((p) => (
            <option key={p.key} value={p.key}>
              {p.label}
            </option>
          ))}
        </select>
        <Button
          onClick={add}
          disabled={items.length >= MAX_SOCIALS}
          className="bg-gold hover:bg-gold-spark text-navy gap-1.5"
        >
          <Plus size={14} />
          Add ({items.length}/{MAX_SOCIALS})
        </Button>
      </div>

      {/* Items */}
      <div className="space-y-3">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">
            No social links yet. Pick a platform above and click Add.
          </p>
        )}
        {items.map((link, idx) => {
          const preset = getPreset(link.platform);
          return (
            <div key={link.id} className="border border-border rounded-xl p-3 bg-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex flex-col">
                  <button
                    onClick={() => move(idx, -1)}
                    disabled={idx === 0}
                    className="text-muted-foreground hover:text-navy disabled:opacity-30 text-xs"
                    aria-label="Move up"
                  >
                    ▲
                  </button>
                  <GripVertical size={14} className="text-muted-foreground" />
                  <button
                    onClick={() => move(idx, 1)}
                    disabled={idx === items.length - 1}
                    className="text-muted-foreground hover:text-navy disabled:opacity-30 text-xs"
                    aria-label="Move down"
                  >
                    ▼
                  </button>
                </div>
                <SocialIconPreview link={link} />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-navy text-sm truncate">{link.label}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {link.url || <span className="italic text-yellow-600">No URL set</span>}
                  </div>
                </div>
                <button
                  onClick={() => remove(link.id)}
                  className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center"
                  aria-label="Remove"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-navy uppercase tracking-wide">Label</label>
                  <Input
                    value={link.label}
                    onChange={(e) => update(link.id, { label: e.target.value })}
                    placeholder="Display name"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-navy uppercase tracking-wide">URL</label>
                  <Input
                    value={link.url}
                    onChange={(e) => update(link.id, { url: e.target.value })}
                    placeholder={preset?.urlHint || "https://..."}
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-navy uppercase tracking-wide">
                      Logo URL (override)
                    </label>
                    {preset?.iconUrl && link.iconUrl !== preset.iconUrl && (
                      <button
                        onClick={() => resetIconToPreset(link)}
                        className="text-[11px] text-[#FFD166] hover:text-white hover:underline"
                      >
                        Use default
                      </button>
                    )}
                  </div>
                  <Input
                    value={link.iconUrl || ""}
                    onChange={(e) => update(link.id, { iconUrl: e.target.value })}
                    placeholder="https://example.com/logo.png — leave blank for letter fallback"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Paste a logo image URL (PNG/SVG). For JustDial / MagicPin / custom platforms, upload your own.
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-navy uppercase tracking-wide">
                    Brand Color
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={link.color || "#475569"}
                      onChange={(e) => update(link.id, { color: e.target.value })}
                      className="w-10 h-9 rounded-lg border border-border cursor-pointer bg-white"
                    />
                    <Input
                      value={link.color || ""}
                      onChange={(e) => update(link.id, { color: e.target.value })}
                      placeholder="#000000"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
