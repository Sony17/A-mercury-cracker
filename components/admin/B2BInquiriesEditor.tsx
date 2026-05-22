"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Phone,
  Send,
  Trash2,
  XCircle,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { B2BInquiry, B2BStatus } from "@/lib/types";
import ExportCsvButton from "./ExportCsvButton";

const STATUS_TABS: { id: B2BStatus | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
];

const STATUS_STYLE: Record<B2BStatus, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  approved: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
};

export default function B2BInquiriesEditor() {
  const {
    b2bInquiries,
    setB2BInquiryStatus,
    updateB2BInquiry,
    deleteB2BInquiry,
    company,
    showToast,
  } = useStore();

  const [tab, setTab] = useState<B2BStatus | "all">("all");
  const [editing, setEditing] = useState<Record<string, { url: string; label: string }>>({});

  const filtered = useMemo(() => {
    if (tab === "all") return b2bInquiries;
    return b2bInquiries.filter((i) => i.status === tab);
  }, [b2bInquiries, tab]);

  const counts = useMemo(
    () => ({
      all: b2bInquiries.length,
      pending: b2bInquiries.filter((i) => i.status === "pending").length,
      approved: b2bInquiries.filter((i) => i.status === "approved").length,
      rejected: b2bInquiries.filter((i) => i.status === "rejected").length,
    }),
    [b2bInquiries]
  );

  const getDraft = (inq: B2BInquiry) =>
    editing[inq.id] ?? { url: inq.pdfUrl ?? "", label: inq.pdfLabel ?? "Wholesale Price List" };

  const setDraft = (id: string, patch: Partial<{ url: string; label: string }>) =>
    setEditing((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? { url: "", label: "Wholesale Price List" }), ...patch },
    }));

  const sendWhatsApp = (inq: B2BInquiry) => {
    const draft = getDraft(inq);
    const url = draft.url.trim();
    if (!url) {
      showToast("Add a PDF / Doc URL before sending.", "error");
      return;
    }
    if (!/^https?:\/\//i.test(url)) {
      showToast("URL must start with http:// or https://", "error");
      return;
    }

    const label = draft.label.trim() || "Wholesale Price List";
    const phone = inq.phone.replace(/\D/g, "");
    const intl = phone.length === 10 ? "91" + phone : phone;

    const text = encodeURIComponent(
      `Hi ${inq.name.split(" ")[0] || "there"},\n\nThank you for your bulk inquiry with ${company.brand}.\n\nYour B2B request has been approved. Please find our ${label} below:\n${url}\n\nFor orders or queries, reply to this message or call ${company.phone}.\n\n— ${company.brand}`
    );

    window.open(`https://wa.me/${intl}?text=${text}`, "_blank");
    updateB2BInquiry(inq.id, {
      pdfUrl: url,
      pdfLabel: label,
      status: "approved",
      sentAt: Date.now(),
    });
    showToast("WhatsApp opened — review and send.", "success");
  };

  const approve = (inq: B2BInquiry) => {
    const draft = getDraft(inq);
    updateB2BInquiry(inq.id, {
      status: "approved",
      pdfUrl: draft.url || inq.pdfUrl,
      pdfLabel: draft.label || inq.pdfLabel,
    });
    showToast("Inquiry approved.", "success");
  };

  return (
    <div>
      <div className="mb-5 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-black text-navy">B2B Bulk Inquiries</h2>
          <p className="text-sm text-muted-foreground">
            Review business inquiries, approve buyers, and send the price list PDF on WhatsApp.
          </p>
        </div>
        <ExportCsvButton entity="b2bInquiries" />
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {STATUS_TABS.map((t) => {
          const count = counts[t.id as keyof typeof counts];
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-bold border transition-all",
                active
                  ? "bg-navy text-white border-navy"
                  : "bg-white text-navy border-border hover:border-navy/40"
              )}
            >
              {t.label}
              <span
                className={cn(
                  "ml-2 text-xs px-1.5 py-0.5 rounded-md",
                  active ? "bg-white/15 text-white" : "bg-cream text-muted-foreground"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-12 text-center">
          <Building2 size={32} className="text-muted-foreground mx-auto mb-3" />
          <h3 className="font-bold text-foreground mb-1">No inquiries yet</h3>
          <p className="text-sm text-muted-foreground">
            New B2B inquiries from the public form will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((inq) => {
            const draft = getDraft(inq);
            const intl = (inq.phone.length === 10 ? "91" : "") + inq.phone;
            return (
              <div
                key={inq.id}
                className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden"
              >
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4 border-b border-border bg-cream/40">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-black text-navy">{inq.businessName}</h3>
                      <span
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border",
                          STATUS_STYLE[inq.status]
                        )}
                      >
                        {inq.status}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FFD166]/15 text-[#FFD166] border border-[#FFD166]/40">
                        {inq.businessType}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {inq.name} · {inq.city}
                      {inq.gstin && <> · GSTIN {inq.gstin}</>}
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1">
                      <Clock size={12} /> {new Date(inq.createdAt).toLocaleString()}
                    </div>
                    {inq.sentAt && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 size={12} /> Sent {new Date(inq.sentAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Body */}
                <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Detail label="Phone (WhatsApp)">
                    <a
                      href={`https://wa.me/${intl}`}
                      target="_blank"
                      rel="noopener"
                      className="text-navy font-bold inline-flex items-center gap-1 hover:text-blue"
                    >
                      <Phone size={12} /> {inq.phone}
                    </a>
                  </Detail>
                  <Detail label="Email">{inq.email || "—"}</Detail>
                  <Detail label="Order Qty">{inq.qty}</Detail>
                  <Detail label="Interest">{inq.interest || "—"}</Detail>
                  <Detail label="Message" wide>
                    {inq.message ? (
                      <span className="whitespace-pre-wrap">{inq.message}</span>
                    ) : (
                      "—"
                    )}
                  </Detail>
                </div>

                {/* Approve / Send WhatsApp panel */}
                <div className="px-5 py-4 bg-cream/40 border-t border-border space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-navy uppercase tracking-wider">
                    <FileText size={14} /> Price List / Catalog Link
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Input
                      placeholder="Label (e.g. Diwali Wholesale Price List)"
                      value={draft.label}
                      onChange={(e) => setDraft(inq.id, { label: e.target.value })}
                    />
                    <Input
                      className="md:col-span-2"
                      placeholder="https://drive.google.com/.../pricelist.pdf"
                      value={draft.url}
                      onChange={(e) => setDraft(inq.id, { url: e.target.value })}
                    />
                  </div>
                  {inq.pdfUrl && (
                    <a
                      href={inq.pdfUrl}
                      target="_blank"
                      rel="noopener"
                      className="text-xs text-[#FFD166] inline-flex items-center gap-1 hover:text-white hover:underline"
                    >
                      <ExternalLink size={12} /> Open saved link ({inq.pdfLabel || "PDF"})
                    </a>
                  )}

                  <div className="flex flex-wrap gap-2 pt-2">
                    {inq.status !== "approved" && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white font-bold"
                        onClick={() => approve(inq)}
                      >
                        <CheckCircle2 size={14} /> Approve
                      </Button>
                    )}
                    <Button
                      size="sm"
                      className="bg-[#25D366] hover:bg-[#1aa550] text-white font-bold"
                      onClick={() => sendWhatsApp(inq)}
                    >
                      <Send size={14} /> Send via WhatsApp
                    </Button>
                    {inq.status !== "rejected" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => {
                          setB2BInquiryStatus(inq.id, "rejected");
                          showToast("Inquiry rejected.", "info");
                        }}
                      >
                        <XCircle size={14} /> Reject
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-border text-muted-foreground hover:bg-cream ml-auto"
                      onClick={() => {
                        if (confirm("Delete this inquiry permanently?")) {
                          deleteB2BInquiry(inq.id);
                        }
                      }}
                    >
                      <Trash2 size={14} /> Delete
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Detail({
  label,
  children,
  wide,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={cn(wide && "md:col-span-3")}>
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
        {label}
      </div>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}
