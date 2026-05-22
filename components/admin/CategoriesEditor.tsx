"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { DEFAULT_CONTENT } from "@/lib/data";
import type { CategoryItem } from "@/lib/types";
import { Plus, Trash2, RotateCcw, Save, Tag, Upload } from "lucide-react";

const MAX_CATEGORIES = 24;
const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

function isLikelyImageUrl(value: string) {
  if (!value) return false;
  const t = value.trim();
  if (t.startsWith("data:image/")) return true;
  if (t.startsWith("/")) return true;
  try {
    const u = new URL(t);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export default function CategoriesEditor() {
  const { company, updateCompany, showToast } = useStore();
  const [items, setItems] = useState<CategoryItem[]>(company.categories ?? []);
  const [dirty, setDirty] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftImg, setDraftImg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setItems(company.categories ?? []);
  }, [company.categories]);

  const setAt = (idx: number, patch: Partial<CategoryItem>) => {
    setItems((prev) => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
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

  const addCategory = () => {
    const name = draftName.trim();
    if (!name) {
      showToast("Enter a category name", "error");
      return;
    }
    if (items.some((c) => c.n.toLowerCase() === name.toLowerCase())) {
      showToast("That category already exists", "error");
      return;
    }
    if (items.length >= MAX_CATEGORIES) {
      showToast(`Max ${MAX_CATEGORIES} categories`, "error");
      return;
    }
    const img = draftImg.trim() || "/herocol.png";
    setItems((prev) => [...prev, { n: name, img }]);
    setDraftName("");
    setDraftImg("");
    setDirty(true);
  };

  const onFileForNew = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      showToast("Please choose an image file", "error");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      showToast("Image must be under 2 MB", "error");
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

  const onFileForRow = async (idx: number, file: File) => {
    if (!file.type.startsWith("image/")) {
      showToast("Please choose an image file", "error");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      showToast("Image must be under 2 MB", "error");
      return;
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
    setAt(idx, { img: dataUrl });
  };

  const handleSave = () => {
    const cleaned = items
      .map((c) => ({ n: c.n.trim(), img: c.img.trim() }))
      .filter((c) => c.n);
    const seen = new Set<string>();
    for (const c of cleaned) {
      const key = c.n.toLowerCase();
      if (seen.has(key)) {
        showToast(`Duplicate category: ${c.n}`, "error");
        return;
      }
      seen.add(key);
    }
    updateCompany({ categories: cleaned });
    setItems(cleaned);
    setDirty(false);
    showToast("Categories saved", "success");
  };

  const handleReset = () => {
    if (!confirm("Reset categories to defaults? Your custom categories will be lost.")) return;
    setItems(DEFAULT_CONTENT.categories);
    setDirty(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-navy">Categories</h2>
          <p className="text-sm text-muted-foreground">
            Add or remove product categories. Used across filters, the homepage grid, and product forms.
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

      <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-navy/10 flex items-center justify-center flex-shrink-0">
            <Tag size={16} className="text-navy" />
          </div>
          <div>
            <h3 className="font-black text-navy">Add a category</h3>
            <p className="text-xs text-muted-foreground">
              Name shows up on the storefront. Image is the circular icon in the category grid.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto_auto] gap-2 items-stretch">
          <Input
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCategory();
              }
            }}
            placeholder="Category name (e.g. Night Show)"
          />
          <Input
            value={draftImg}
            onChange={(e) => setDraftImg(e.target.value)}
            placeholder="Image URL (optional)"
          />
          <Button
            variant="outline"
            onClick={() => fileRef.current?.click()}
            className="gap-1.5"
          >
            <Upload size={14} />
            Upload
          </Button>
          <Button onClick={addCategory} className="bg-gold hover:bg-gold-spark text-navy gap-1.5">
            <Plus size={14} />
            Add
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFileForNew(f);
              e.target.value = "";
            }}
          />
        </div>
        {draftImg && (
          <div className="mt-3 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-border bg-cream">
              {isLikelyImageUrl(draftImg) ? (
                <Image
                  src={draftImg}
                  alt="preview"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : null}
            </div>
            <p className="text-[11px] text-muted-foreground">Preview</p>
          </div>
        )}
        <p className="mt-2 text-[11px] text-muted-foreground">
          {items.length}/{MAX_CATEGORIES} categories
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.length === 0 && (
          <div className="md:col-span-2 lg:col-span-3 bg-white rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No categories yet. Add one above to populate filters and the homepage grid.
          </div>
        )}
        {items.map((cat, idx) => (
          <div
            key={`${idx}-${cat.n}`}
            className="bg-white rounded-2xl border border-border shadow-sm p-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full overflow-hidden border border-border bg-cream flex-shrink-0">
                {isLikelyImageUrl(cat.img) ? (
                  <Image
                    src={cat.img}
                    alt={cat.n || "category"}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">
                    no image
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 space-y-1.5">
                <Input
                  value={cat.n}
                  onChange={(e) => setAt(idx, { n: e.target.value })}
                  className="text-sm font-semibold"
                />
                <Input
                  value={cat.img}
                  onChange={(e) => setAt(idx, { img: e.target.value })}
                  className="text-xs"
                  placeholder="Image URL or /local-path"
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
                <RowUploadButton onPick={(f) => onFileForRow(idx, f)} />
              </div>
              <button
                onClick={() => remove(idx)}
                className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center"
                aria-label={`Remove ${cat.n}`}
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

function RowUploadButton({ onPick }: { onPick: (file: File) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => ref.current?.click()} className="gap-1">
        <Upload size={12} />
      </Button>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
          e.target.value = "";
        }}
      />
    </>
  );
}
