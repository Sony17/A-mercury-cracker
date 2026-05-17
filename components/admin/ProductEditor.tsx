"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Product } from "@/lib/types";
import { CATEGORIES, BRANDS, PIC } from "@/lib/data";
import Image from "next/image";

interface ProductEditorProps {
  product?: Product;
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
  stock: true,
  featured: false,
};

export default function ProductEditor({ product, onSave, onClose }: ProductEditorProps) {
  const [form, setForm] = useState<Omit<Product, "id">>(product ?? BLANK);

  const f = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const val = e.target.type === "number" ? parseFloat(e.target.value) || 0 : e.target.value;
      setForm((prev) => ({ ...prev, [k]: val }));
    };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, id: product?.id ?? 0 } as Product);
  };

  const discount = form.mrp > 0 ? Math.round((1 - form.price / form.mrp) * 100) : 0;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
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
                {CATEGORIES.slice(1).map((c) => <option key={c}>{c}</option>)}
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
                {BRANDS.map((b) => <option key={b}>{b}</option>)}
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
              <label className="text-xs font-semibold mb-1 block">Stock Status</label>
              <select
                value={form.stock === false ? "out" : "in"}
                onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value !== "out" }))}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:border-blue"
              >
                <option value="in">In Stock</option>
                <option value="out">Out of Stock</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="text-xs font-semibold mb-1 block">Image URL</label>
              <Input value={form.img} onChange={f("img")} placeholder="https://images.unsplash.com/…" />
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
            <Button type="submit" className="flex-1 bg-navy hover:bg-blue text-white font-bold">
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
