"use client";

import { Download } from "lucide-react";

interface Props {
  entity:
    | "products"
    | "orders"
    | "users"
    | "subscribers"
    | "customerEnquiries"
    | "b2bInquiries"
    | "company";
  label?: string;
  className?: string;
}

export default function ExportCsvButton({ entity, label = "Export CSV", className }: Props) {
  return (
    <a
      href={`/api/db/${entity}/export`}
      className={
        className ??
        "inline-flex items-center gap-1.5 rounded-md border border-navy/20 px-3 py-1.5 text-xs font-semibold text-navy hover:bg-navy hover:text-white transition-colors"
      }
    >
      <Download size={14} />
      {label}
    </a>
  );
}
