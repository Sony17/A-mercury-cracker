"use client";

import { CATEGORIES, BRANDS } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface FilterState {
  category: string;
  brands: string[];
  priceRange: [number, number];
  sort: string;
}

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (f: FilterState) => void;
}

const SORT_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "discount", label: "Biggest Discount" },
];

function SectionHead({ label, open, onToggle }: { label: string; open: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between py-2 text-sm font-bold text-navy hover:text-blue transition-colors"
    >
      {label}
      <ChevronDown size={14} className={cn("transition-transform duration-200", open ? "rotate-180" : "")} />
    </button>
  );
}

export default function FilterSidebar({ filters, onChange }: FilterSidebarProps) {
  const [sectOpen, setSectOpen] = useState({ cat: true, brand: true, price: true, sort: true });
  const toggle = (k: keyof typeof sectOpen) => setSectOpen((s) => ({ ...s, [k]: !s[k] }));

  const toggleBrand = (b: string) => {
    const next = filters.brands.includes(b)
      ? filters.brands.filter((x) => x !== b)
      : [...filters.brands, b];
    onChange({ ...filters, brands: next });
  };

  const reset = () =>
    onChange({ category: "All", brands: [], priceRange: [0, 2500], sort: "default" });

  return (
    <aside className="w-64 flex-shrink-0 sticky top-20 self-start bg-white border border-border rounded-2xl p-4 space-y-1 shadow-sm hidden lg:block">
      <div className="flex items-center justify-between mb-3">
        <span className="font-black text-sm text-navy">Filters</span>
        <Button variant="ghost" size="sm" onClick={reset} className="text-xs text-muted-foreground hover:text-navy h-7">
          Reset all
        </Button>
      </div>
      <Separator />

      {/* Category */}
      <SectionHead label="Category" open={sectOpen.cat} onToggle={() => toggle("cat")} />
      {sectOpen.cat && (
        <div className="space-y-1 pb-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => onChange({ ...filters, category: c })}
              className={cn(
                "w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all",
                filters.category === c
                  ? "bg-navy text-white font-semibold"
                  : "text-muted-foreground hover:bg-cream hover:text-navy"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      )}
      <Separator />

      {/* Brand */}
      <SectionHead label="Brand" open={sectOpen.brand} onToggle={() => toggle("brand")} />
      {sectOpen.brand && (
        <div className="space-y-2 pb-2">
          {BRANDS.map((b) => (
            <div key={b} className="flex items-center gap-2">
              <Checkbox
                id={`brand-${b}`}
                checked={filters.brands.includes(b)}
                onCheckedChange={() => toggleBrand(b)}
              />
              <Label htmlFor={`brand-${b}`} className="text-sm text-muted-foreground cursor-pointer">
                {b}
              </Label>
            </div>
          ))}
        </div>
      )}
      <Separator />

      {/* Price Range */}
      <SectionHead label="Price Range" open={sectOpen.price} onToggle={() => toggle("price")} />
      {sectOpen.price && (
        <div className="pb-3 px-1">
          <Slider
            min={0}
            max={2500}
            step={50}
            value={filters.priceRange}
            onValueChange={(v) => onChange({ ...filters, priceRange: v as [number, number] })}
            className="mb-3"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>₹{filters.priceRange[0]}</span>
            <span>₹{filters.priceRange[1]}</span>
          </div>
        </div>
      )}
      <Separator />

      {/* Sort */}
      <SectionHead label="Sort By" open={sectOpen.sort} onToggle={() => toggle("sort")} />
      {sectOpen.sort && (
        <div className="space-y-1 pb-2">
          {SORT_OPTIONS.map((s) => (
            <button
              key={s.value}
              onClick={() => onChange({ ...filters, sort: s.value })}
              className={cn(
                "w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all",
                filters.sort === s.value
                  ? "bg-navy text-white font-semibold"
                  : "text-muted-foreground hover:bg-cream hover:text-navy"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}

export type { FilterState };
