"use client";

import { useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileSpreadsheet, Download, AlertTriangle, CheckCircle2, X } from "lucide-react";
import type { Product } from "@/lib/types";
import { BRANDS, PIC } from "@/lib/data";
import { useStore } from "@/lib/store";

export const BULK_LIMIT = 500;

interface BulkUploadProductsProps {
  existing: Product[];
  onClose: () => void;
  onImport: (products: Product[]) => void;
}

const VALID_BRANDS = new Set(BRANDS);
const VALID_TAGS = new Set(["", "Best Seller", "Sale", "New"]);

const HEADER_ALIASES: Record<string, keyof RawRow> = {
  name: "name",
  "product name": "name",
  title: "name",
  cat: "cat",
  category: "cat",
  pack: "pack",
  "pack size": "pack",
  quantity: "pack",
  qty: "pack",
  mrp: "mrp",
  "mrp price": "mrp",
  "original price": "mrp",
  price: "price",
  "sale price": "price",
  "selling price": "price",
  "our price": "price",
  img: "img",
  image: "img",
  "image url": "img",
  tag: "tag",
  badge: "tag",
  brand: "brand",
  sku: "sku",
  "sku code": "sku",
  stock: "stock",
  inventory: "stock",
  description: "description",
  desc: "description",
  featured: "featured",
};

type RawRow = {
  name?: string;
  cat?: string;
  pack?: string;
  mrp?: string | number;
  price?: string | number;
  img?: string;
  tag?: string;
  brand?: string;
  sku?: string;
  stock?: string | number | boolean;
  description?: string;
  featured?: string | boolean;
};

interface ParsedRow {
  row: number;
  product: Product;
  errors: string[];
  warnings: string[];
}

function normaliseHeader(h: string): string {
  return String(h ?? "").trim().toLowerCase().replace(/_/g, " ").replace(/\s+/g, " ");
}

function toNumber(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(/[₹,\s]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function toStock(v: unknown): Product["stock"] {
  if (v === undefined || v === null || v === "") return true;
  const s = String(v).trim().toLowerCase();
  if (["true", "yes", "y", "unlimited", "infinity", "∞"].includes(s)) return true;
  if (["false", "no", "n", "out", "out of stock"].includes(s)) return false;
  const n = parseInt(s, 10);
  if (Number.isFinite(n)) return n;
  return true;
}

function toBool(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  const s = String(v ?? "").trim().toLowerCase();
  return ["true", "yes", "y", "1"].includes(s);
}

function detectDelimiter(sample: string): "," | ";" | "\t" {
  const commas = (sample.match(/,/g) ?? []).length;
  const semis = (sample.match(/;/g) ?? []).length;
  const tabs = (sample.match(/\t/g) ?? []).length;
  if (tabs > commas && tabs > semis) return "\t";
  if (semis > commas) return ";";
  return ",";
}

function parseCSV(text: string): string[][] {
  const delim = detectDelimiter(text.slice(0, 2048));
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else { inQuotes = false; }
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === delim) { cur.push(field); field = ""; }
      else if (ch === "\r") { /* skip */ }
      else if (ch === "\n") { cur.push(field); rows.push(cur); cur = []; field = ""; }
      else field += ch;
    }
  }
  if (field.length > 0 || cur.length > 0) { cur.push(field); rows.push(cur); }
  return rows.filter((r) => r.some((c) => String(c).trim() !== ""));
}

function rowsToRecords(rows: string[][]): RawRow[] {
  if (rows.length < 2) return [];
  const headers = rows[0].map(normaliseHeader);
  const keys = headers.map((h) => HEADER_ALIASES[h] ?? null);
  return rows.slice(1).map((r) => {
    const rec: Record<string, unknown> = {};
    keys.forEach((k, i) => {
      if (!k) return;
      const v = r[i];
      if (v === undefined) return;
      rec[k] = typeof v === "string" ? v.trim() : v;
    });
    return rec as RawRow;
  });
}

async function readFile(file: File): Promise<RawRow[]> {
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".csv") || lower.endsWith(".tsv") || lower.endsWith(".txt")) {
    const text = await file.text();
    return rowsToRecords(parseCSV(text));
  }
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const aoa = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, blankrows: false, defval: "" });
  return rowsToRecords(aoa.map((r) => (Array.isArray(r) ? r.map((v) => String(v ?? "")) : [])));
}

function validateRow(raw: RawRow, idx: number, existingSkus: Set<string>, seenSkus: Set<string>, validCategories: Set<string>): ParsedRow {
  const errors: string[] = [];
  const warnings: string[] = [];
  const name = String(raw.name ?? "").trim();
  if (!name) errors.push("name is required");

  const mrp = toNumber(raw.mrp);
  if (mrp === null) errors.push("mrp is required and must be a number");
  else if (mrp < 0) errors.push("mrp must be ≥ 0");

  const price = toNumber(raw.price);
  if (price === null) errors.push("price is required and must be a number");
  else if (price < 0) errors.push("price must be ≥ 0");

  let cat = String(raw.cat ?? "").trim();
  const fallbackCat = validCategories.values().next().value ?? "Sparklers";
  if (!cat) {
    cat = fallbackCat;
    warnings.push(`category missing → defaulted to ${fallbackCat}`);
  } else if (validCategories.size > 0 && !validCategories.has(cat)) {
    warnings.push(`unknown category "${cat}" — kept as-is`);
  }

  const brand = String(raw.brand ?? "").trim();
  if (brand && !VALID_BRANDS.has(brand)) warnings.push(`unknown brand "${brand}" — kept as-is`);

  const tag = String(raw.tag ?? "").trim();
  if (tag && !VALID_TAGS.has(tag)) warnings.push(`unusual tag "${tag}" — kept as-is`);

  const sku = String(raw.sku ?? "").trim();
  if (sku) {
    if (existingSkus.has(sku)) warnings.push(`SKU "${sku}" already exists — will be added as new row`);
    if (seenSkus.has(sku)) warnings.push(`SKU "${sku}" repeated in upload`);
    seenSkus.add(sku);
  }

  const img = String(raw.img ?? "").trim() || PIC.p1;

  const product: Product = {
    id: 0,
    name,
    cat,
    pack: String(raw.pack ?? "").trim(),
    mrp: mrp ?? 0,
    price: price ?? 0,
    img,
    tag,
    brand: brand || undefined,
    sku: sku || undefined,
    stock: toStock(raw.stock),
    description: raw.description ? String(raw.description) : undefined,
    featured: raw.featured !== undefined && raw.featured !== "" ? toBool(raw.featured) : false,
  };

  return { row: idx + 2, product, errors, warnings };
}

function buildTemplateCSV(): string {
  const headers = ["name", "cat", "pack", "mrp", "price", "img", "tag", "brand", "sku", "stock", "description", "featured"];
  const sample = [
    ["Premium Fuljhadi 10cm", "Sparklers", "10 pcs", "80", "25", "", "Best Seller", "Mercury", "SP-001", "100", "Long lasting sparklers", "false"],
    ["Mega Ground Chakkar", "Chakkars", "5 pcs", "250", "75", "", "", "Cock Brand", "CK-001", "unlimited", "", "false"],
  ];
  const rows = [headers, ...sample];
  return rows
    .map((r) => r.map((c) => (/[",\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join(","))
    .join("\n");
}

function downloadTemplate() {
  const csv = buildTemplateCSV();
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "products-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function BulkUploadProducts({ existing, onClose, onImport }: BulkUploadProductsProps) {
  const { showToast, company } = useStore();
  const validCategories = useMemo(
    () => new Set((company.categories ?? []).map((c) => c.n)),
    [company.categories],
  );
  const fileRef = useRef<HTMLInputElement>(null);
  const [parsing, setParsing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedRow[] | null>(null);
  const [dragging, setDragging] = useState(false);

  const existingSkus = useMemo(
    () => new Set(existing.map((p) => p.sku ?? "").filter(Boolean)),
    [existing],
  );

  const summary = useMemo(() => {
    if (!parsed) return null;
    const valid = parsed.filter((p) => p.errors.length === 0);
    const invalid = parsed.length - valid.length;
    const withWarnings = parsed.filter((p) => p.warnings.length > 0).length;
    return { total: parsed.length, valid: valid.length, invalid, withWarnings };
  }, [parsed]);

  const handleFile = async (file: File) => {
    setFileName(file.name);
    setParsing(true);
    setParsed(null);
    try {
      const raws = await readFile(file);
      if (raws.length === 0) {
        showToast("No rows found in file. Check headers and content.", "error");
        setParsing(false);
        return;
      }
      if (raws.length > BULK_LIMIT) {
        showToast(`File has ${raws.length} rows — limit is ${BULK_LIMIT}. Split the file and try again.`, "error");
        setParsing(false);
        return;
      }
      const seenSkus = new Set<string>();
      const out = raws.map((r, i) => validateRow(r, i, existingSkus, seenSkus, validCategories));
      setParsed(out);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not parse file";
      showToast(`Parse failed: ${msg}`, "error");
    } finally {
      setParsing(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const reset = () => {
    setParsed(null);
    setFileName(null);
  };

  const importValid = () => {
    if (!parsed) return;
    const valid = parsed.filter((p) => p.errors.length === 0);
    if (valid.length === 0) {
      showToast("No valid rows to import.", "error");
      return;
    }
    const baseId = Date.now();
    const newProducts: Product[] = valid.map((v, i) => ({ ...v.product, id: baseId + i }));
    onImport(newProducts);
    showToast(`Imported ${newProducts.length} product${newProducts.length === 1 ? "" : "s"}`, "success");
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-navy flex items-center gap-2">
            <FileSpreadsheet size={18} /> Bulk Upload Products
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Help / template */}
          <div className="rounded-xl border border-border bg-cream/50 p-3 sm:p-4 text-xs sm:text-sm space-y-2">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="space-y-1 flex-1 min-w-[14rem]">
                <div className="font-semibold text-navy">CSV or Excel (.xlsx) — up to {BULK_LIMIT} products per file</div>
                <div className="text-muted-foreground">
                  Required columns: <code className="px-1 bg-white rounded">name</code>,{" "}
                  <code className="px-1 bg-white rounded">mrp</code>,{" "}
                  <code className="px-1 bg-white rounded">price</code>. Optional:{" "}
                  <code className="px-1 bg-white rounded">cat</code>, pack, img, tag, brand, sku, stock, description, featured.
                </div>
                <div className="text-muted-foreground">
                  <strong>stock</strong>: leave blank or <code>unlimited</code> for ∞, a number for tracked qty, or <code>out</code> for out of stock.
                </div>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={downloadTemplate} className="gap-1.5 h-8 text-xs">
                <Download size={13} /> Template CSV
              </Button>
            </div>
          </div>

          {/* Dropzone */}
          {!parsed && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                dragging ? "border-navy bg-navy/5" : "border-border hover:border-navy/50 hover:bg-cream/40"
              }`}
            >
              <Upload className="mx-auto mb-2 text-muted-foreground" size={28} />
              <div className="text-sm font-semibold text-navy">
                {parsing ? "Parsing…" : fileName ? fileName : "Click or drag a CSV / Excel file here"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Supported: .csv, .tsv, .xlsx, .xls
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.tsv,.txt,.xlsx,.xls"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </div>
          )}

          {/* Preview */}
          {parsed && summary && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <Badge className="bg-green-100 text-green-700 border-green-200 gap-1">
                  <CheckCircle2 size={11} /> {summary.valid} valid
                </Badge>
                {summary.invalid > 0 && (
                  <Badge className="bg-red-100 text-red-700 border-red-200 gap-1">
                    <AlertTriangle size={11} /> {summary.invalid} with errors
                  </Badge>
                )}
                {summary.withWarnings > 0 && (
                  <Badge variant="outline" className="border-amber-300 text-amber-700">
                    {summary.withWarnings} with warnings
                  </Badge>
                )}
                <span className="text-muted-foreground ml-auto">
                  {fileName} • {summary.total} row{summary.total === 1 ? "" : "s"}
                </span>
                <Button type="button" variant="ghost" size="sm" onClick={reset} className="gap-1 h-7 text-xs">
                  <X size={12} /> Clear
                </Button>
              </div>

              <div className="border border-border rounded-xl overflow-hidden max-h-[45vh] overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-cream/70 sticky top-0">
                    <tr className="text-left">
                      <th className="px-2 py-1.5 w-10">#</th>
                      <th className="px-2 py-1.5">Name</th>
                      <th className="px-2 py-1.5">Cat</th>
                      <th className="px-2 py-1.5">MRP</th>
                      <th className="px-2 py-1.5">Price</th>
                      <th className="px-2 py-1.5">SKU</th>
                      <th className="px-2 py-1.5">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.slice(0, 100).map((p) => {
                      const bad = p.errors.length > 0;
                      const warn = !bad && p.warnings.length > 0;
                      return (
                        <tr
                          key={p.row}
                          className={`border-t border-border ${bad ? "bg-red-50/60" : warn ? "bg-amber-50/40" : ""}`}
                        >
                          <td className="px-2 py-1.5 text-muted-foreground">{p.row}</td>
                          <td className="px-2 py-1.5 font-medium">{p.product.name || <span className="text-red-600">—</span>}</td>
                          <td className="px-2 py-1.5">{p.product.cat}</td>
                          <td className="px-2 py-1.5">₹{p.product.mrp}</td>
                          <td className="px-2 py-1.5">₹{p.product.price}</td>
                          <td className="px-2 py-1.5 font-mono">{p.product.sku ?? "—"}</td>
                          <td className="px-2 py-1.5">
                            {bad ? (
                              <span className="text-red-700">{p.errors.join("; ")}</span>
                            ) : warn ? (
                              <span className="text-amber-700">{p.warnings.join("; ")}</span>
                            ) : (
                              <span className="text-green-700">OK</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {parsed.length > 100 && (
                  <div className="px-3 py-2 text-xs text-muted-foreground bg-cream/40 border-t border-border">
                    Showing first 100 of {parsed.length} rows. All valid rows will still be imported.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              onClick={importValid}
              disabled={!summary || summary.valid === 0}
              className="flex-1 bg-navy hover:bg-blue text-white font-bold"
            >
              {summary ? `Import ${summary.valid} product${summary.valid === 1 ? "" : "s"}` : "Import"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
