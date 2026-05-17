"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { DEFAULT_CONTENT } from "@/lib/data";
import { Plus, Trash2, RotateCcw, Save, Image as ImageIcon, Upload } from "lucide-react";

const MAX_SLIDES = 8;
const MAX_UPLOAD_BYTES = 2 * 1024 * 1024; // 2 MB

function isLikelyImageUrl(value: string) {
  if (!value) return false;
  const trimmed = value.trim();
  if (trimmed.startsWith("data:image/")) return true;
  try {
    const u = new URL(trimmed);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export default function HeroSlidesEditor() {
  const { company, updateCompany, showToast } = useStore();
  const [items, setItems] = useState<string[]>(company.heroSlides || []);
  const [dirty, setDirty] = useState(false);
  const [draft, setDraft] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setItems(company.heroSlides || []);
  }, [company.heroSlides]);

  const setAt = (idx: number, url: string) => {
    setItems((prev) => prev.map((u, i) => (i === idx ? url : u)));
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

  const addUrl = () => {
    const url = draft.trim();
    if (!url) return;
    if (!isLikelyImageUrl(url)) {
      showToast("Enter a valid http(s) image URL", "error");
      return;
    }
    if (items.length >= MAX_SLIDES) {
      showToast(`Max ${MAX_SLIDES} slides`, "error");
      return;
    }
    setItems((prev) => [...prev, url]);
    setDraft("");
    setDirty(true);
  };

  const onFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      showToast("Please choose an image file", "error");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      showToast("Image must be under 2 MB", "error");
      return;
    }
    if (items.length >= MAX_SLIDES) {
      showToast(`Max ${MAX_SLIDES} slides`, "error");
      return;
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
    setItems((prev) => [...prev, dataUrl]);
    setDirty(true);
  };

  const handleSave = () => {
    const cleaned = items.map((u) => u.trim()).filter(Boolean);
    if (cleaned.length === 0) {
      showToast("Add at least one hero image", "error");
      return;
    }
    updateCompany({ heroSlides: cleaned });
    setItems(cleaned);
    setDirty(false);
    showToast("Hero slides saved", "success");
  };

  const handleReset = () => {
    if (!confirm("Reset hero slides to defaults? Your edits will be lost.")) return;
    setItems(DEFAULT_CONTENT.heroSlides);
    setDirty(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-navy">Hero Slider</h2>
          <p className="text-sm text-muted-foreground">
            Manage the rotating background images on the homepage hero. Up to {MAX_SLIDES} images.
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
            <ImageIcon size={16} className="text-navy" />
          </div>
          <div>
            <h3 className="font-black text-navy">Add a slide</h3>
            <p className="text-xs text-muted-foreground">
              Paste a public image URL, or upload from your device (max 2 MB). Landscape 16:9 looks best.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mb-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addUrl();
              }
            }}
            placeholder="https://example.com/banner.jpg"
            className="flex-1"
          />
          <Button
            onClick={addUrl}
            disabled={items.length >= MAX_SLIDES}
            className="bg-navy hover:bg-blue text-white gap-1.5"
          >
            <Plus size={14} />
            Add URL
          </Button>
          <Button
            variant="outline"
            onClick={() => fileRef.current?.click()}
            disabled={items.length >= MAX_SLIDES}
            className="gap-1.5"
          >
            <Upload size={14} />
            Upload
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
              e.target.value = "";
            }}
          />
        </div>
        <p className="text-[11px] text-muted-foreground">
          {items.length}/{MAX_SLIDES} slides
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.length === 0 && (
          <div className="md:col-span-2 bg-white rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No hero slides yet. The homepage will look empty — add at least one image.
          </div>
        )}
        {items.map((url, idx) => (
          <div
            key={`${idx}-${url}`}
            className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden"
          >
            <div className="relative w-full aspect-[16/9] bg-cream">
              {isLikelyImageUrl(url) ? (
                <Image
                  src={url}
                  alt={`Slide ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                  Invalid URL
                </div>
              )}
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-navy/80 text-white text-[11px] font-bold">
                #{idx + 1}
              </div>
            </div>
            <div className="p-3 space-y-2">
              <Input
                value={url}
                onChange={(e) => setAt(idx, e.target.value)}
                placeholder="Image URL"
                className="text-xs"
              />
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => move(idx, -1)}
                    disabled={idx === 0}
                  >
                    ▲ Up
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => move(idx, 1)}
                    disabled={idx === items.length - 1}
                  >
                    ▼ Down
                  </Button>
                </div>
                <button
                  onClick={() => remove(idx)}
                  className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center"
                  aria-label="Remove slide"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
