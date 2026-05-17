"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { FEATURED_LIMIT } from "@/lib/types";
import { CATEGORIES } from "@/lib/data";
import { formatPrice, getDiscount, cn } from "@/lib/utils";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, Search, Star } from "lucide-react";
import { getAvailable, useStore } from "@/lib/store";
import ProductEditor, { UPLOAD_PREFIX } from "./ProductEditor";
import Image from "next/image";

export default function ProductTable() {
  const { products, setProductsList, showToast } = useStore();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);

  const save = (list: Product[]) => {
    setProductsList(list);
  };

  const featuredCount = products.filter((p) => p.featured).length;

  const toggleFeatured = (id: number) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;
    if (!target.featured && featuredCount >= FEATURED_LIMIT) {
      showToast(`Only ${FEATURED_LIMIT} products can be featured. Unfeature one first.`);
      return;
    }
    save(products.map((p) => (p.id === id ? { ...p, featured: !p.featured } : p)));
  };

  const deleteProduct = (id: number) => {
    if (!confirm("Delete this product?")) return;
    save(products.filter((p) => p.id !== id));
  };

  const bulkDelete = () => {
    if (!confirm(`Delete ${selected.length} products?`)) return;
    save(products.filter((p) => !selected.includes(p.id)));
    setSelected([]);
  };

  const upsert = (p: Product) => {
    if (editing) {
      save(products.map((x) => (x.id === p.id ? p : x)));
    } else {
      save([...products, { ...p, id: Date.now() }]);
    }
    setEditing(null);
    setCreating(false);
  };

  const toggleSelect = (id: number) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const filtered = products
    .filter((p) => catFilter === "All" || p.cat === catFilter)
    .filter((p) =>
      !search.trim() ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku ?? "").toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 px-3 sm:px-5 py-3 sm:py-4 border-b border-border">
        <div className="relative flex-1 min-w-[10rem]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {["All", ...CATEGORIES.slice(1)].map((c) => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className={cn(
                "px-2 py-1 rounded-lg text-xs font-medium transition-all",
                catFilter === c ? "bg-navy text-white" : "bg-cream text-muted-foreground hover:text-navy"
              )}
            >
              {c}
            </button>
          ))}
        </div>
        {selected.length > 0 && (
          <Button size="sm" variant="destructive" onClick={bulkDelete} className="h-8 text-xs">
            <Trash2 size={13} /> Delete {selected.length}
          </Button>
        )}
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground inline-flex items-center gap-1">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            Featured {featuredCount}/{FEATURED_LIMIT}
          </span>
          <Button size="sm" className="bg-navy hover:bg-blue text-white h-8 text-xs" onClick={() => setCreating(true)}>
            <Plus size={13} /> Add Product
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-px">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-cream/60">
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  onChange={(e) => setSelected(e.target.checked ? filtered.map((p) => p.id) : [])}
                  checked={selected.length === filtered.length && filtered.length > 0}
                />
              </TableHead>
              <TableHead>Product</TableHead>
              <TableHead className="hidden sm:table-cell">Category</TableHead>
              <TableHead className="hidden md:table-cell">Brand / SKU</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="hidden md:table-cell">Discount</TableHead>
              <TableHead className="hidden sm:table-cell">Stock</TableHead>
              <TableHead className="hidden sm:table-cell">Featured</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => {
              const off = getDiscount(p.price, p.mrp);
              const available = getAvailable(p);
              const isOut = available === 0;
              const stockLabel =
                available === null ? "∞" : isOut ? "Out" : `${available} left`;
              const stockClass =
                available === null
                  ? "bg-sky/20 text-navy"
                  : isOut
                    ? "bg-red-100 text-red-700"
                    : available <= 10
                      ? "bg-amber-100 text-amber-800"
                      : "bg-green-100 text-green-700";
              return (
                <TableRow key={p.id} className="hover:bg-cream/40">
                  <TableCell>
                    <input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleSelect(p.id)} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Image src={p.img} alt={p.name} width={40} height={40} className="w-10 h-10 rounded-lg object-cover border border-border flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-sm">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.pack}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="outline" className="text-xs">{p.cat}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="text-xs">
                      <div className="font-medium">{p.brand ?? "—"}</div>
                      <div className="text-muted-foreground font-mono">#{p.sku ?? "—"}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-bold text-navy text-sm">{formatPrice(p.price)}</div>
                      <div className="text-xs text-muted-foreground line-through">{formatPrice(p.mrp)}</div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded">{off}% OFF</span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className={cn("text-xs font-bold px-2 py-0.5 rounded", stockClass)}>
                      {stockLabel}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <button
                      type="button"
                      onClick={() => toggleFeatured(p.id)}
                      title={p.featured ? "Remove from featured" : "Mark as featured"}
                      className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
                        p.featured
                          ? "bg-amber-50 text-amber-500 hover:bg-amber-100"
                          : "text-muted-foreground hover:bg-cream hover:text-amber-500"
                      )}
                    >
                      <Star size={14} className={p.featured ? "fill-amber-400" : ""} />
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setEditing(p)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-cream hover:text-navy transition-colors"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-red-50 hover:text-destructive transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                  No products match your search
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="px-5 py-3 border-t border-border text-xs text-muted-foreground">
        Showing {filtered.length} of {products.length} products
      </div>

      {/* Product Editor Modal */}
      {(editing || creating) && (
        <ProductEditor
          product={creating ? undefined : editing!}
          uploadedCount={products.filter((p) => p.img?.startsWith(UPLOAD_PREFIX) || p.img?.startsWith("data:")).length}
          onSave={upsert}
          onClose={() => { setEditing(null); setCreating(false); }}
        />
      )}
    </div>
  );
}
