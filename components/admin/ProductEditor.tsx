"use client";

import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Product } from "@/lib/types";
import { PIC } from "@/lib/data";
import { Upload, X } from "lucide-react";
import Image from "@/components/ui/SmartImage";
import { useStore } from "@/lib/store";
import { MAX_UPLOAD_BYTES, UPLOAD_LIMIT, isUploadedImage } from "@/lib/productImages";

// Uploads are downscaled before they leave the browser: the storefront never
// needs more than this, and it keeps stored images small.
const MAX_DIMENSION = 1400;
const WEBP_QUALITY = 0.85;
// Ceiling on what we'll even try to resize — a phone photo is a few MB.
const MAX_SOURCE_BYTES = 25 * 1024 * 1024;

// Shrink to MAX_DIMENSION and re-encode as WebP. Falls back to the original
// file whenever that isn't possible or isn't actually smaller.
async function downscale(file: File): Promise<Blob> {
  // Re-encoding a GIF would drop its animation.
  if (file.type === "image/gif") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", WEBP_QUALITY),
    );
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

interface ProductEditorProps {
  product?: Product;
  uploadedCount: number;
  onSave: (p: Product) => void;
  onClose: () => void;
}

const BLANK: Omit<Product, "id"> = {
  name: "",
  cat: "Sparklers",
  pack: "",
  mrp: 0,
  price: 0,
  img: PIC.p1,
  tag: "",
  brand: "",
  sku: "",
  stock: 100,
  featured: false,
};

type StockMode = "tracked" | "unlimited" | "out";

function modeOf(stock: Product["stock"]): StockMode {
  if (stock === false) return "out";
  if (typeof stock === "number") return "tracked";
  return "unlimited";
}

export default function ProductEditor({ product, uploadedCount, onSave, onClose }: ProductEditorProps) {
  const [form, setForm] = useState<Omit<Product, "id">>(product ?? BLANK);
  const fileRef = useRef<HTMLInputElement>(null);
  const { showToast, company } = useStore();
  const categoryNames = (company.categories ?? []).map((c) => c.n);
  const brandNames = (company.brands ?? []).map((b) => b.label);

  const [uploading, setUploading] = useState(false);
  const currentIsUpload = isUploadedImage(form.img);
  const originalWasUpload = !!product && isUploadedImage(product.img);
  // The current product's existing upload is already counted in uploadedCount,
  // so subtract it when checking remaining quota.
  const effectiveCount = uploadedCount - (originalWasUpload ? 1 : 0);
  const canUpload = effectiveCount < UPLOAD_LIMIT;
  const remaining = Math.max(0, UPLOAD_LIMIT - effectiveCount);

  const f = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const val = e.target.type === "number" ? parseFloat(e.target.value) || 0 : e.target.value;
      setForm((prev) => ({ ...prev, [k]: val }));
    };

  const onFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      showToast("Please choose an image file", "error");
      return;
    }
    if (file.size > MAX_SOURCE_BYTES) {
      showToast("That image is too large — please pick one under 25 MB", "error");
      return;
    }
    if (!canUpload && !currentIsUpload) {
      showToast(`Only ${UPLOAD_LIMIT} products can have uploaded images. Use an image URL for the rest.`, "error");
      return;
    }
    setUploading(true);
    try {
      // Photos straight off a phone are far bigger than the upload limit, so
      // check the size after downscaling rather than rejecting the original.
      const shrunk = await downscale(file);
      if (shrunk.size > MAX_UPLOAD_BYTES) {
        showToast("Image is too large to store even after resizing — try a smaller one", "error");
        return;
      }
      const body = new FormData();
      body.append("file", shrunk, file.name);
      // Replacing this product's own upload frees the old image and doesn't
      // consume another slot.
      if (currentIsUpload) body.append("replaces", form.img);
      const res = await fetch("/api/upload-product-image", { method: "POST", body });
      const data = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;
      if (!res.ok || !data?.url) {
        showToast(data?.error ?? `Upload failed (${res.status})`, "error");
        return;
      }
      setForm((prev) => ({ ...prev, img: data.url! }));
    } catch {
      showToast("Upload failed — could not reach the server", "error");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const clearUpload = () => {
    setForm((prev) => ({ ...prev, img: "" }));
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, id: product?.id ?? 0 } as Product);
  };

  const discount = form.mrp > 0 ? Math.round((1 - form.price / form.mrp) * 100) : 0;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="admin-shell max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-navy">{product ? "Edit Product" : "Add Product"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          {/* Image preview */}
          {form.img && (
            <div className="rounded-xl overflow-hidden h-36 border border-border">
              <Image src={form.img} alt="preview" width={400} height={144} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-semibold mb-1 block">Product Name *</label>
              <Input required value={form.name} onChange={f("name")} placeholder="e.g. Premium Fuljhadi 10cm" />
            </div>

            <div>
              <label className="text-xs font-semibold mb-1 block">Category</label>
              <select
                value={form.cat}
                onChange={f("cat")}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:border-blue"
              >
                {categoryNames.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold mb-1 block">Brand</label>
              <select
                value={form.brand ?? ""}
                onChange={f("brand")}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:border-blue"
              >
                <option value="">Select brand</option>
                {brandNames.map((b) => <option key={b}>{b}</option>)}
                {form.brand && !brandNames.includes(form.brand) && (
                  <option value={form.brand}>{form.brand} (removed from Brands)</option>
                )}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold mb-1 block">Pack / Quantity</label>
              <Input value={form.pack} onChange={f("pack")} placeholder="e.g. 10 pcs" />
            </div>

            <div>
              <label className="text-xs font-semibold mb-1 block">SKU</label>
              <Input value={form.sku ?? ""} onChange={f("sku")} placeholder="e.g. SP-001" />
            </div>

            <div>
              <label className="text-xs font-semibold mb-1 block">MRP (₹)</label>
              <Input required type="number" min={0} value={form.mrp || ""} onChange={f("mrp")} placeholder="Original price" />
            </div>

            <div>
              <label className="text-xs font-semibold mb-1 block">Our Price (₹)</label>
              <Input required type="number" min={0} value={form.price || ""} onChange={f("price")} placeholder="Selling price" />
            </div>

            {discount > 0 && (
              <div className="col-span-2">
                <div className="text-xs text-green-700 font-bold bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
                  ✓ Discount: {discount}% off MRP
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold mb-1 block">Tag / Badge</label>
              <select
                value={form.tag}
                onChange={f("tag")}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:border-blue"
              >
                <option value="">None</option>
                <option>Best Seller</option>
                <option>Sale</option>
                <option>New</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold mb-1 block">Stock</label>
              <select
                value={modeOf(form.stock)}
                onChange={(e) => {
                  const mode = e.target.value as StockMode;
                  setForm((prev) => ({
                    ...prev,
                    stock:
                      mode === "out"
                        ? false
                        : mode === "unlimited"
                          ? true
                          : typeof prev.stock === "number"
                            ? prev.stock
                            : 100,
                  }));
                }}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:border-blue"
              >
                <option value="tracked">Tracked quantity</option>
                <option value="unlimited">Unlimited</option>
                <option value="out">Out of stock</option>
              </select>
            </div>

            {modeOf(form.stock) === "tracked" && (
              <div>
                <label className="text-xs font-semibold mb-1 block">Units available</label>
                <Input
                  type="number"
                  min={0}
                  value={typeof form.stock === "number" ? form.stock : 0}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      stock: Math.max(0, parseInt(e.target.value, 10) || 0),
                    }))
                  }
                  placeholder="e.g. 100"
                />
              </div>
            )}

            <div className="col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold block">Product Image</label>
                <span className="text-[11px] text-muted-foreground">
                  Uploads used {Math.min(uploadedCount, UPLOAD_LIMIT)}/{UPLOAD_LIMIT}
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading || (!canUpload && !currentIsUpload)}
                  className="gap-1.5"
                >
                  <Upload size={14} />
                  {uploading ? "Uploading…" : currentIsUpload ? "Replace upload" : "Upload image"}
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
                  }}
                />
              </div>

              {!canUpload && !currentIsUpload ? (
                <p className="text-[11px] text-amber-900 bg-amber-50 border border-amber-300 px-2 py-1.5 rounded">
                  Upload limit reached ({UPLOAD_LIMIT} products). Use an image URL below for this product.
                </p>
              ) : (
                <p className="text-[11px] text-slate-600">
                  PNG/JPG/WebP — large photos are resized automatically. {remaining} upload
                  {remaining === 1 ? "" : "s"} remaining.
                </p>
              )}

              {!currentIsUpload && (
                <Input
                  value={form.img}
                  onChange={f("img")}
                  placeholder="https://images.unsplash.com/… (image URL)"
                />
              )}
            </div>

            <div className="col-span-2">
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={!!form.featured}
                  onChange={(e) => setForm((prev) => ({ ...prev, featured: e.target.checked }))}
                  className="w-4 h-4 accent-amber-500"
                />
                Show on homepage as a Featured Cracker (max 4)
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1 bg-gold hover:bg-gold-spark text-navy font-bold">
              {product ? "Save Changes" : "Add Product"}
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
