"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { DEFAULT_CONTENT } from "@/lib/data";
import type { ReelMedia } from "@/lib/types";
import { Plus, Trash2, RotateCcw, Save, Camera, Film } from "lucide-react";

// Parses any IG URL like
//   https://www.instagram.com/reel/SHORT/
//   https://www.instagram.com/p/SHORT/
//   https://www.instagram.com/<user>/reel/SHORT/
// or a bare shortcode. Returns null if it can't extract one.
function parseInstagramInput(raw: string): ReelMedia | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const m = trimmed.match(/instagram\.com\/(?:[^/]+\/)?(reel|reels|p|tv)\/([A-Za-z0-9_-]+)/i);
  if (m) {
    const kind = m[1].toLowerCase().startsWith("reel") || m[1].toLowerCase() === "tv" ? "reel" : "p";
    return { shortcode: m[2], kind };
  }
  if (/^[A-Za-z0-9_-]{5,}$/.test(trimmed)) {
    return { shortcode: trimmed, kind: "reel" };
  }
  return null;
}

// Accepts youtu.be/ID, youtube.com/watch?v=ID, youtube.com/shorts/ID, youtube.com/embed/ID, or a bare 11-char ID
function parseYoutubeInput(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const m =
    trimmed.match(/youtu\.be\/([A-Za-z0-9_-]{11})/) ||
    trimmed.match(/[?&]v=([A-Za-z0-9_-]{11})/) ||
    trimmed.match(/youtube\.com\/(?:shorts|embed|live)\/([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

const MAX_REELS = 9;
const MAX_YOUTUBE = 6;

export default function MediaEditor() {
  const { company, updateCompany, showToast } = useStore();
  const [reels, setReels] = useState<ReelMedia[]>(company.reels || []);
  const [youtubeIds, setYoutubeIds] = useState<string[]>(company.youtubeIds || []);
  const [reelDraft, setReelDraft] = useState("");
  const [ytDraft, setYtDraft] = useState("");
  const [dirty, setDirty] = useState(false);

  useEffect(() => setReels(company.reels || []), [company.reels]);
  useEffect(() => setYoutubeIds(company.youtubeIds || []), [company.youtubeIds]);

  const addReel = () => {
    const parsed = parseInstagramInput(reelDraft);
    if (!parsed) {
      showToast("Paste a valid Instagram reel/post URL", "error");
      return;
    }
    if (reels.some((r) => r.shortcode === parsed.shortcode)) {
      showToast("That reel is already added", "error");
      return;
    }
    if (reels.length >= MAX_REELS) {
      showToast(`Max ${MAX_REELS} reels`, "error");
      return;
    }
    setReels((prev) => [...prev, parsed]);
    setReelDraft("");
    setDirty(true);
  };

  const updateReel = (idx: number, patch: Partial<ReelMedia>) => {
    setReels((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
    setDirty(true);
  };

  const removeReel = (idx: number) => {
    setReels((prev) => prev.filter((_, i) => i !== idx));
    setDirty(true);
  };

  const moveReel = (idx: number, dir: -1 | 1) => {
    setReels((prev) => {
      const next = [...prev];
      const t = idx + dir;
      if (t < 0 || t >= next.length) return prev;
      [next[idx], next[t]] = [next[t], next[idx]];
      return next;
    });
    setDirty(true);
  };

  const addYoutube = () => {
    const id = parseYoutubeInput(ytDraft);
    if (!id) {
      showToast("Paste a valid YouTube URL or 11-char video ID", "error");
      return;
    }
    if (youtubeIds.includes(id)) {
      showToast("That video is already added", "error");
      return;
    }
    if (youtubeIds.length >= MAX_YOUTUBE) {
      showToast(`Max ${MAX_YOUTUBE} videos`, "error");
      return;
    }
    setYoutubeIds((prev) => [...prev, id]);
    setYtDraft("");
    setDirty(true);
  };

  const removeYoutube = (idx: number) => {
    setYoutubeIds((prev) => prev.filter((_, i) => i !== idx));
    setDirty(true);
  };

  const moveYoutube = (idx: number, dir: -1 | 1) => {
    setYoutubeIds((prev) => {
      const next = [...prev];
      const t = idx + dir;
      if (t < 0 || t >= next.length) return prev;
      [next[idx], next[t]] = [next[t], next[idx]];
      return next;
    });
    setDirty(true);
  };

  const handleSave = () => {
    updateCompany({ reels, youtubeIds });
    setDirty(false);
    showToast("Media saved", "success");
  };

  const handleReset = () => {
    if (!confirm("Reset reels and YouTube videos to defaults? Your edits will be lost.")) return;
    setReels(DEFAULT_CONTENT.reels);
    setYoutubeIds(DEFAULT_CONTENT.youtubeIds);
    setDirty(true);
  };

  const reelUrlFor = (r: ReelMedia) => `https://www.instagram.com/${r.kind}/${r.shortcode}/`;
  const ytUrlFor = (id: string) => `https://www.youtube.com/watch?v=${id}`;
  const ytThumb = (id: string) => `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-navy">Media — Instagram & YouTube</h2>
          <p className="text-sm text-muted-foreground">
            Manage the reels and YouTube videos shown in the homepage Instagram section.
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
            className="bg-gold hover:bg-gold-spark text-navy gap-2"
          >
            <Save size={14} />
            Save Changes
          </Button>
        </div>
      </div>

      {/* ── Reels ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-pink-100 flex items-center justify-center flex-shrink-0">
            <Camera size={16} className="text-pink-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-navy">Instagram Reels</h3>
            <p className="text-xs text-muted-foreground">
              Paste a reel URL (e.g. <code>instagram.com/reel/XXXX/</code> or
              <code> instagram.com/p/XXXX/</code>). Up to {MAX_REELS}.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <Input
            value={reelDraft}
            onChange={(e) => setReelDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addReel();
              }
            }}
            placeholder="https://www.instagram.com/reel/XXXXXXXX/"
            className="flex-1"
          />
          <Button
            onClick={addReel}
            disabled={reels.length >= MAX_REELS}
            className="bg-gold hover:bg-gold-spark text-navy gap-1.5"
          >
            <Plus size={14} />
            Add Reel ({reels.length}/{MAX_REELS})
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {reels.length === 0 && (
            <div className="sm:col-span-2 lg:col-span-3 text-center text-sm text-muted-foreground py-6">
              No reels yet. Paste a URL above and click Add.
            </div>
          )}
          {reels.map((r, idx) => (
            <div key={`${r.shortcode}-${idx}`} className="border border-border rounded-xl p-3 bg-cream">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-navy text-white">
                  #{idx + 1}
                </span>
                <a
                  href={reelUrlFor(r)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-[#FFD166] hover:text-white hover:underline truncate flex-1"
                  title={reelUrlFor(r)}
                >
                  /{r.kind}/{r.shortcode}
                </a>
                <button
                  onClick={() => removeReel(idx)}
                  className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center"
                  aria-label="Remove reel"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-2">
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-white/80 uppercase tracking-wide">
                    Shortcode
                  </label>
                  <Input
                    value={r.shortcode}
                    onChange={(e) => updateReel(idx, { shortcode: e.target.value })}
                    className="text-xs h-8"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/80 uppercase tracking-wide">
                    Type
                  </label>
                  <select
                    value={r.kind}
                    onChange={(e) => updateReel(idx, { kind: e.target.value as "reel" | "p" })}
                    className="w-full h-8 px-2 rounded-md border border-border bg-white text-xs"
                  >
                    <option value="reel">reel</option>
                    <option value="p">p</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => moveReel(idx, -1)}
                  disabled={idx === 0}
                  className="flex-1 h-7 text-xs"
                >
                  ▲ Up
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => moveReel(idx, 1)}
                  disabled={idx === reels.length - 1}
                  className="flex-1 h-7 text-xs"
                >
                  ▼ Down
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── YouTube ───────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <Film size={16} className="text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-navy">YouTube Videos</h3>
            <p className="text-xs text-muted-foreground">
              Paste a YouTube URL (watch, youtu.be, or shorts). Up to {MAX_YOUTUBE}.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <Input
            value={ytDraft}
            onChange={(e) => setYtDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addYoutube();
              }
            }}
            placeholder="https://www.youtube.com/watch?v=XXXXXXXXXXX"
            className="flex-1"
          />
          <Button
            onClick={addYoutube}
            disabled={youtubeIds.length >= MAX_YOUTUBE}
            className="bg-gold hover:bg-gold-spark text-navy gap-1.5"
          >
            <Plus size={14} />
            Add Video ({youtubeIds.length}/{MAX_YOUTUBE})
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {youtubeIds.length === 0 && (
            <div className="sm:col-span-2 lg:col-span-3 text-center text-sm text-muted-foreground py-6">
              No YouTube videos yet.
            </div>
          )}
          {youtubeIds.map((id, idx) => (
            <div key={`${id}-${idx}`} className="border border-border rounded-xl overflow-hidden bg-cream">
              <div className="relative aspect-video bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ytThumb(id)}
                  alt={`YouTube ${id}`}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 text-[11px] font-bold px-2 py-0.5 rounded-full bg-navy text-white">
                  #{idx + 1}
                </span>
              </div>
              <div className="p-3 space-y-2">
                <a
                  href={ytUrlFor(id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-[#FFD166] hover:text-white hover:underline truncate block"
                >
                  {id}
                </a>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => moveYoutube(idx, -1)}
                    disabled={idx === 0}
                    className="flex-1 h-7 text-xs"
                  >
                    ▲ Up
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => moveYoutube(idx, 1)}
                    disabled={idx === youtubeIds.length - 1}
                    className="flex-1 h-7 text-xs"
                  >
                    ▼ Down
                  </Button>
                  <button
                    onClick={() => removeYoutube(idx)}
                    className="w-8 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center"
                    aria-label="Remove video"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
