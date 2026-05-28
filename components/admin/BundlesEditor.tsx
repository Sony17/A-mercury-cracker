"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BUNDLES, PIC } from "@/lib/data";
import type { Bundle } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { Pencil, Trash2, Plus, Save, RotateCcw, Upload, X, GripVertical, ChevronUp, ChevronDown } from "lucide-react";

const STORAGE_KEY = "mc_bundles";
const DEFAULT_PRICE = 2000;
const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

const storage = {
  get: <T,>(k: string, d: T): T => {
    if (typeof window === "undefined") return d;
    try {
      const v = localStorage.getItem(k);
      return v ? (JSON.parse(v) as T) : d;
    } catch {
      return d;
    }
  },
  set: <T,>(k: string, v: T) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {}
  },
};

const BLANK: Bundle = {
  id: "",
  name: "",
  cat: "Bundles",
  img: PIC.p1,
  price: DEFAULT_PRICE,
  mrp: 0,
  save: 0,
  tag: "",
  short: "",
  items: [],
};

const isDataUrl = (s: string) => s.startsWith("data:");

export default function BundlesEditor() {
  const { showToast } = useStore();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [editing, setEditing] = useState<Bundle | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const stored = storage.get<Bundle[]>(STORAGE_KEY, []);
    setBundles(stored.length > 0 ? stored : BUNDLES);
  }, []);

  const persist = (list: Bundle[]) => {
    setBundles(list);
    storage.set(STORAGE_KEY, list);
  };

  const upsert = (b: Bundle) => {
    if (editing) {
      persist(bundles.map((x) => (x.id === editing.id ? b : x)));
      showToast("Bundle updated", "success");
    } else {
      const id = b.id || `B${Date.now()}`;
      persist([...bundles, { ...b, id }]);
      showToast("Bundle added", "success");
    }
    setEditing(null);
    setCreating(false);
  };

  const remove = (id: string) => {
    if (!confirm("Delete this bundle?")) return;
    persist(bundles.filter((b) => b.id !== id));
  };

  const move = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= bundles.length) return;
    const next = [...bundles];
    [next[idx], next[target]] = [next[target], next[idx]];
    persist(next);
  };

  const resetDefaults = () => {
    if (!confirm("Reset bundles to defaults? Your edits will be lost.")) return;
    persist(BUNDLES);
    showToast("Bundles reset to defaults", "success");
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-navy">₹{DEFAULT_PRICE} Bundles</h2>
          <p className="text-sm text-muted-foreground">
            Manage the ready-to-order combos shown on the homepage. Customise items, price, and savings.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetDefaults} className="gap-2">
            <RotateCcw size={14} />
            Reset
          </Button>
          <Button
            onClick={() => setCreating(true)}
            className="bg-gold hover:bg-gold-spark text-navy gap-2"
          >
            <Plus size={14} />
            Add Bundle
          </Button>
        </div>
      </div>

      {bundles.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No bundles yet. Click <b>Add Bundle</b> to create your first one.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {bundles.map((b, idx) => {
          const pct = b.mrp > 0 ? Math.round((b.save / b.mrp) * 100) : 0;
          return (
            <div
              key={b.id}
              className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col"
            >
              <div className="relative h-36 bg-cream">
                {b.img && (
                  <Image
                    src={b.img}
                    alt={b.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    unoptimized
                  />
                )}
                {b.tag && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    {b.tag}
                  </div>
                )}
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  <button
                    onClick={() => move(idx, -1)}
                    disabled={idx === 0}
                    className="w-7 h-7 rounded-lg bg-white/90 hover:bg-white text-navy flex items-center justify-center disabled:opacity-40"
                    aria-label="Move up"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    onClick={() => move(idx, 1)}
                    disabled={idx === bundles.length - 1}
                    className="w-7 h-7 rounded-lg bg-white/90 hover:bg-white text-navy flex items-center justify-center disabled:opacity-40"
                    aria-label="Move down"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-black text-sm text-navy line-clamp-2">{b.name}</h4>
                  <span className="text-[10px] text-muted-foreground font-mono flex-shrink-0">
                    #{b.id}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{b.short}</p>

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-lg font-black text-navy">{formatPrice(b.price)}</span>
                  <span className="text-xs text-muted-foreground line-through">
                    {formatPrice(b.mrp)}
                  </span>
                  {pct > 0 && (
                    <span className="ml-auto text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded">
                      {pct}% OFF
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-muted-foreground mb-3">
                  {b.items.length} item{b.items.length === 1 ? "" : "s"} · Save ₹
                  {b.save.toLocaleString()}
                </div>

                <div className="flex gap-2 mt-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-1.5"
                    onClick={() => setEditing(b)}
                  >
                    <Pencil size={13} />
                    Edit
                  </Button>
                  <button
                    onClick={() => remove(b.id)}
                    className="w-9 h-9 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center"
                    aria-label="Delete bundle"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {(editing || creating) && (
        <BundleForm
          bundle={editing ?? undefined}
          onSave={upsert}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
        />
      )}
    </div>
  );
}

interface BundleFormProps {
  bundle?: Bundle;
  onSave: (b: Bundle) => void;
  onClose: () => void;
}

function BundleForm({ bundle, onSave, onClose }: BundleFormProps) {
  const { showToast } = useStore();
  const [form, setForm] = useState<Bundle>(bundle ?? BLANK);
  const [draftItem, setDraftItem] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const currentIsUpload = isDataUrl(form.img);
  const pct = form.mrp > 0 ? Math.round((form.save / form.mrp) * 100) : 0;

  const setField = <K extends keyof Bundle>(key: K, value: Bundle[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateNumber = (key: "price" | "mrp" | "save") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = parseFloat(e.target.value) || 0;
      setForm((prev) => {
        const next = { ...prev, [key]: v };
        if (key === "mrp" || key === "price") {
          next.save = Math.max(0, next.mrp - next.price);
        }
        return next;
      });
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
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
    setField("img", dataUrl);
  };

  const clearUpload = () => {
    setField("img", "");
    if (fileRef.current) fileRef.current.value = "";
  };

  const addItem = () => {
    const t = draftItem.trim();
    if (!t) return;
    setForm((prev) => ({ ...prev, items: [...prev.items, t] }));
    setDraftItem("");
  };

  const updateItem = (idx: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((it, i) => (i === idx ? value : it)),
    }));
  };

  const removeItem = (idx: number) => {
    setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  };

  const moveItem = (idx: number, dir: -1 | 1) => {
    setForm((prev) => {
      const next = [...prev.items];
      const t = idx + dir;
      if (t < 0 || t >= next.length) return prev;
      [next[idx], next[t]] = [next[t], next[idx]];
      return { ...prev, items: next };
    });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast("Bundle name is required", "error");
      return;
    }
    if (form.items.length === 0) {
      showToast("Add at least one item", "error");
      return;
    }
    onSave({
      ...form,
      items: form.items.map((s) => s.trim()).filter(Boolean),
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="admin-shell max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-navy">
            {bundle ? "Edit Bundle" : "Add Bundle"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          {form.img && (
            <div className="rounded-xl overflow-hidden h-40 border border-border bg-cream">
              <Image
                src={form.img}
                alt="preview"
                width={800}
                height={160}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-semibold mb-1 block">Bundle Name *</label>
              <Input
                required
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="e.g. Family Diwali Special"
              />
            </div>

            <div className="col-span-2">
              <label className="text-xs font-semibold mb-1 block">Short description</label>
              <Input
                value={form.short}
                onChange={(e) => setField("short", e.target.value)}
                placeholder="e.g. 35-40 items · Mix across all categories · Kid-safe options"
              />
            </div>

            <div>
              <label className="text-xs font-semibold mb-1 block">Price (₹) *</label>
              <Input
                required
                type="number"
                min={0}
                value={form.price || ""}
                onChange={updateNumber("price")}
                placeholder={String(DEFAULT_PRICE)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold mb-1 block">MRP (₹) *</label>
              <Input
                required
                type="number"
                min={0}
                value={form.mrp || ""}
                onChange={updateNumber("mrp")}
                placeholder="Original total"
              />
            </div>

            <div>
              <label className="text-xs font-semibold mb-1 block">Save (₹)</label>
              <Input
                type="number"
                min={0}
                value={form.save || ""}
                onChange={updateNumber("save")}
                placeholder="Auto-calculated"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Defaults to MRP − Price. Override if you want.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold mb-1 block">Tag / Badge</label>
              <Input
                value={form.tag}
                onChange={(e) => setField("tag", e.target.value)}
                placeholder="e.g. Best Value, Premium, B2B Only"
              />
            </div>

            {pct > 0 && (
              <div className="col-span-2">
                <div className="text-xs text-green-700 font-bold bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
                  ✓ Discount: {pct}% off MRP · Customer saves ₹{form.save.toLocaleString()}
                </div>
              </div>
            )}

            <div className="col-span-2 space-y-2">
              <label className="text-xs font-semibold block">Cover image</label>
              <div className="flex gap-2 flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileRef.current?.click()}
                  className="gap-1.5"
                >
                  <Upload size={14} />
                  {currentIsUpload ? "Replace upload" : "Upload image"}
                </Button>
                {currentIsUpload && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={clearUpload}
                    className="gap-1.5 text-muted-foreground"
                  >
                    <X size={14} />
                    Remove
                  </Button>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onFile(file);
                    e.target.value = "";
                  }}
                />
              </div>
              {!currentIsUpload && (
                <Input
                  value={form.img}
                  onChange={(e) => setField("img", e.target.value)}
                  placeholder="https://example.com/bundle.jpg (image URL)"
                />
              )}
              <p className="text-[11px] text-muted-foreground">
                PNG/JPG up to 2 MB, or paste a public image URL.
              </p>
            </div>

            <div className="col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold block">
                  Items included * <span className="text-muted-foreground font-normal">({form.items.length})</span>
                </label>
              </div>

              <div className="flex gap-2 mb-3">
                <Input
                  value={draftItem}
                  onChange={(e) => setDraftItem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addItem();
                    }
                  }}
                  placeholder="e.g. 5× Premium Anar Flower Pots (big)"
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={addItem}
                  className="bg-gold hover:bg-gold-spark text-navy gap-1.5"
                >
                  <Plus size={14} />
                  Add
                </Button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {form.items.length === 0 && (
                  <div className="text-xs text-muted-foreground bg-cream border border-dashed border-border rounded-lg px-3 py-4 text-center">
                    No items yet. Add what&apos;s included in this ₹{form.price || DEFAULT_PRICE} bundle.
                  </div>
                )}
                {form.items.map((it, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <GripVertical size={14} className="text-muted-foreground flex-shrink-0" />
                    <Input
                      value={it}
                      onChange={(e) => updateItem(idx, e.target.value)}
                      className="flex-1 text-sm"
                    />
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        onClick={() => moveItem(idx, -1)}
                        disabled={idx === 0}
                        className="w-6 h-5 rounded bg-slate-100 hover:bg-slate-200 text-navy border border-slate-200 flex items-center justify-center disabled:opacity-40"
                        aria-label="Move item up"
                      >
                        <ChevronUp size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(idx, 1)}
                        disabled={idx === form.items.length - 1}
                        className="w-6 h-5 rounded bg-slate-100 hover:bg-slate-200 text-navy border border-slate-200 flex items-center justify-center disabled:opacity-40"
                        aria-label="Move item down"
                      >
                        <ChevronDown size={12} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center"
                      aria-label="Remove item"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              className="flex-1 bg-gold hover:bg-gold-spark text-navy font-bold gap-1.5"
            >
              <Save size={14} />
              {bundle ? "Save Changes" : "Add Bundle"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
