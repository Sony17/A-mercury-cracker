"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { DEFAULT_CONTENT } from "@/lib/data";
import type { BrandLogo } from "@/lib/types";
import { Plus, Trash2, RotateCcw, Save, Image as ImageIcon, Upload, Tag } from "lucide-react";

const MAX_BRANDS = 30;
const MAX_UPLOAD_BYTES = 1.5 * 1024 * 1024; // 1.5 MB

function isLikelyImageUrl(value: string) {
  if (!value) return false;
  const trimmed = value.trim();
  if (trimmed.startsWith("data:image/")) return true;
  if (trimmed.startsWith("/")) return true;
  try {
    const u = new URL(trimmed);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `br-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `br-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export default function BrandsEditor() {
  const { company, updateCompany, showToast } = useStore();
  const [items, setItems] = useState<BrandLogo[]>(company.brands || []);
  const [dirty, setDirty] = useState(false);
  const [draftLabel, setDraftLabel] = useState("");
  const [draftImg, setDraftImg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setItems(company.brands || []);
  }, [company.brands]);

  const patchAt = (idx: number, patch: Partial<BrandLogo>) => {
    setItems((prev) => prev.map((b, i) => (i === idx ? { ...b, ...patch } : b)));
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

  const addBrand = () => {
    const label = draftLabel.trim();
    const img = draftImg.trim();
    if (!label) {
      showToast("Enter a brand name", "error");
      return;
    }
    if (!img || !isLikelyImageUrl(img)) {
      showToast("Add a brand image (URL or upload)", "error");
      return;
    }
    if (items.length >= MAX_BRANDS) {
      showToast(`Max ${MAX_BRANDS} brands`, "error");
      return;
    }
    setItems((prev) => [...prev, { id: newId(), label, img }]);
    setDraftLabel("");
    setDraftImg("");
    setDirty(true);
  };

  const onFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      showToast("Please choose an image file", "error");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      showToast("Image must be under 1.5 MB", "error");
      return;
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
    setDraftImg(dataUrl);
  };

  const handleSave = () => {
    const cleaned = items
      .map((b) => ({ ...b, label: b.label.trim(), img: b.img.trim() }))
      .filter((b) => b.label && b.img);
    if (cleaned.length === 0) {
      showToast("Add at least one brand", "error");
      return;
    }
    updateCompany({ brands: cleaned });
    setItems(cleaned);
    setDirty(false);
    showToast("Brands saved", "success");
  };

  const handleReset = () => {
    if (!confirm("Reset brands to defaults? Your edits will be lost.")) return;
    setItems(DEFAULT_CONTENT.brands);
    setDirty(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-navy">Brands</h2>
          <p className="text-sm text-muted-foreground">
            Manage brand logos shown in the &ldquo;Shop by Brand&rdquo; ribbon. Up to {MAX_BRANDS} brands.
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
            <Tag size={16} className="text-navy" />
          </div>
          <div>
            <h3 className="font-black text-navy">Add a brand</h3>
            <p className="text-xs text-muted-foreground">
              Brand name + a square logo. Use a public image URL, a path under /public (e.g. /Sony.png), or upload from your device (max 1.5 MB).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
          <Input
            value={draftLabel}
            onChange={(e) => setDraftLabel(e.target.value)}
            placeholder="Brand name (e.g. Sony)"
          />
          <div className="flex gap-2">
            <Input
              value={draftImg}
              onChange={(e) => setDraftImg(e.target.value)}
              placeholder="/Sony.png or https://…"
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={() => fileRef.current?.click()}
              className="gap-1.5"
              type="button"
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
        </div>

        <div className="flex items-center justify-between mt-2">
          <p className="text-[11px] text-muted-foreground">
            {items.length}/{MAX_BRANDS} brands
          </p>
          <Button
            onClick={addBrand}
            disabled={items.length >= MAX_BRANDS}
            className="bg-navy hover:bg-blue text-white gap-1.5"
          >
            <Plus size={14} />
            Add Brand
          </Button>
        </div>

        {draftImg && isLikelyImageUrl(draftImg) && (
          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="relative w-16 h-16 rounded-xl border border-border bg-cream overflow-hidden">
              <Image
                src={draftImg}
                alt="Preview"
                fill
                className="object-contain p-1"
                sizes="64px"
                unoptimized
              />
            </div>
            Preview
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-3 bg-white rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No brands yet. The &ldquo;Shop by Brand&rdquo; ribbon will be hidden — add at least one.
          </div>
        )}
        {items.map((b, idx) => (
          <div
            key={b.id || `${idx}-${b.label}`}
            className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden"
          >
            <div className="relative w-full aspect-[4/3] bg-cream flex items-center justify-center">
              {isLikelyImageUrl(b.img) ? (
                <Image
                  src={b.img}
                  alt={b.label || `Brand ${idx + 1}`}
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  unoptimized
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
                  <ImageIcon size={20} />
                  Invalid image
                </div>
              )}
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-navy/80 text-white text-[11px] font-bold">
                #{idx + 1}
              </div>
            </div>
            <div className="p-3 space-y-2">
              <Input
                value={b.label}
                onChange={(e) => patchAt(idx, { label: e.target.value })}
                placeholder="Brand name"
                className="text-xs"
              />
              <Input
                value={b.img}
                onChange={(e) => patchAt(idx, { img: e.target.value })}
                placeholder="Image URL or /path.png"
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
                  aria-label="Remove brand"
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
