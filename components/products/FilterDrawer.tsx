"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CATEGORIES, BRANDS } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { FilterState } from "./FilterSidebar";

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: FilterState;
  onChange: (f: FilterState) => void;
}

const SORT_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "discount", label: "Biggest Discount" },
];

export default function FilterDrawer({ open, onClose, filters, onChange }: FilterDrawerProps) {
  const toggleBrand = (b: string) => {
    const next = filters.brands.includes(b)
      ? filters.brands.filter((x) => x !== b)
      : [...filters.brands, b];
    onChange({ ...filters, brands: next });
  };

  const reset = () => {
    onChange({ category: "All", brands: [], priceRange: [0, 2500], sort: "default" });
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="w-72 overflow-y-auto">
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle className="text-navy">Filters</SheetTitle>
          <Button variant="ghost" size="sm" onClick={reset} className="text-xs text-muted-foreground">
            Reset all
          </Button>
        </SheetHeader>

        <div className="space-y-4 mt-4">
          {/* Category */}
          <div>
            <div className="font-bold text-sm text-navy mb-2">Category</div>
            <div className="space-y-1">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => onChange({ ...filters, category: c })}
                  className={cn(
                    "w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all",
                    filters.category === c
                      ? "bg-navy text-white font-semibold"
                      : "text-muted-foreground hover:bg-cream"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Brand */}
          <div>
            <div className="font-bold text-sm text-navy mb-2">Brand</div>
            <div className="space-y-2">
              {BRANDS.map((b) => (
                <div key={b} className="flex items-center gap-2">
                  <Checkbox
                    id={`m-brand-${b}`}
                    checked={filters.brands.includes(b)}
                    onCheckedChange={() => toggleBrand(b)}
                  />
                  <Label htmlFor={`m-brand-${b}`} className="text-sm text-muted-foreground cursor-pointer">
                    {b}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Price */}
          <div>
            <div className="font-bold text-sm text-navy mb-3">Price Range</div>
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

          <Separator />

          {/* Sort */}
          <div>
            <div className="font-bold text-sm text-navy mb-2">Sort By</div>
            <div className="space-y-1">
              {SORT_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => onChange({ ...filters, sort: s.value })}
                  className={cn(
                    "w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all",
                    filters.sort === s.value
                      ? "bg-navy text-white font-semibold"
                      : "text-muted-foreground hover:bg-cream"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <Button className="w-full bg-navy hover:bg-blue text-white font-bold" onClick={onClose}>
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
