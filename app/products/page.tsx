"use client";

import { Suspense, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { SlidersHorizontal, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FilterSidebar, { type FilterState } from "@/components/products/FilterSidebar";
import FilterDrawer from "@/components/products/FilterDrawer";
import ProductGrid from "@/components/products/ProductGrid";
import type { Product } from "@/lib/types";

const DEFAULT_FILTERS: FilterState = {
  category: "All",
  brands: [],
  priceRange: [0, 2500],
  sort: "default",
};

function ProductsView() {
  const params = useSearchParams();

  const initialSearch = params.get("q") ?? "";
  const catParam = params.get("cat") ?? params.get("category");
  const brandParam = params.get("brand");
  const { products, company } = useStore();
  const validCats = useMemo(
    () => new Set(["All", ...(company.categories ?? []).map((c) => c.n)]),
    [company.categories],
  );
  const initialFilters: FilterState = {
    category: catParam && validCats.has(catParam) ? catParam : "All",
    brands: brandParam ? [brandParam] : [],
    priceRange: [0, 2500],
    sort: "default",
  };
  const [search, setSearch] = useState(initialSearch);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    let list: Product[] = [...products];

    if (filters.category !== "All") {
      list = list.filter((p) => p.cat === filters.category);
    }
    if (filters.brands.length > 0) {
      list = list.filter((p) => p.brand && filters.brands.includes(p.brand));
    }
    list = list.filter((p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.cat.toLowerCase().includes(q) ||
          (p.brand ?? "").toLowerCase().includes(q)
      );
    }

    switch (filters.sort) {
      case "price_asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "discount":
        list.sort((a, b) => (b.mrp - b.price) / b.mrp - (a.mrp - a.price) / a.mrp);
        break;
    }

    return list;
  }, [filters, search, products]);

  const hasActiveFilters =
    filters.category !== "All" ||
    filters.brands.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 2500 ||
    filters.sort !== "default";

  return (
    <div className="min-h-screen bg-cream">
      {/* Page Header */}
      <div className="bg-navy text-white py-8 sm:py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2">All Products</h1>
          <p className="text-sm sm:text-base text-white/70">
            {filteredProducts.length} products available · Delivering All Over India
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Search + mobile filter button */}
        <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search crackers, sparklers, bombs…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <Button
            variant="outline"
            className="lg:hidden flex items-center gap-2 bg-white"
            onClick={() => setDrawerOpen(true)}
          >
            <SlidersHorizontal size={15} />
            Filters
            {hasActiveFilters && (
              <span className="w-4 h-4 bg-navy text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                !
              </span>
            )}
          </Button>
        </div>

        <div className="flex gap-4 sm:gap-6">
          {/* Sidebar (desktop) */}
          <FilterSidebar filters={filters} onChange={setFilters} />

          {/* Products */}
          <div className="flex-1 min-w-0">
            {/* Active filters chips */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-4">
                {filters.category !== "All" && (
                  <span className="bg-navy text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                    {filters.category}
                    <button onClick={() => setFilters({ ...filters, category: "All" })}><X size={10} /></button>
                  </span>
                )}
                {filters.brands.map((b) => (
                  <span key={b} className="bg-blue text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                    {b}
                    <button onClick={() => setFilters({ ...filters, brands: filters.brands.filter((x) => x !== b) })}><X size={10} /></button>
                  </span>
                ))}
                <button
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                  className="text-xs text-muted-foreground underline underline-offset-2 hover:text-navy"
                >
                  Clear all
                </button>
              </div>
            )}

            <ProductGrid products={filteredProducts} />
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        onChange={setFilters}
      />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <ProductsView />
    </Suspense>
  );
}
