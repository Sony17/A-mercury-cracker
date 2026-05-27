"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Link as LinkIcon,
  Phone,
  Plus,
  Send,
  Trash2,
  XCircle,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { B2BInquiry, B2BLink, B2BStatus } from "@/lib/types";
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

const newLinkId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? `lnk_${crypto.randomUUID().slice(0, 8)}`
    : `lnk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

export default function B2BInquiriesEditor() {
  const {
    b2bInquiries,
    setB2BInquiryStatus,
    updateB2BInquiry,
    deleteB2BInquiry,
    company,
    updateCompany,
    showToast,
  } = useStore();

  const masterLinks: B2BLink[] = useMemo(
    () => company.b2bLinks ?? [],
    [company.b2bLinks]
  );

  const [tab, setTab] = useState<B2BStatus | "all">("all");
  // Per-inquiry: the master-link id picked in the dropdown.
  const [picked, setPicked] = useState<Record<string, string>>({});

  // Master-list draft.
  const [draftLabel, setDraftLabel] = useState("");
  const [draftUrl, setDraftUrl] = useState("");

  // Seed each inquiry's dropdown from its saved link if present.
  useEffect(() => {
    setPicked((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const inq of b2bInquiries) {
        if (next[inq.id]) continue;
        const saved = inq.links?.[0]?.url || inq.pdfUrl;
        if (!saved) continue;
        const match = masterLinks.find((m) => m.url === saved);
        if (match) {
          next[inq.id] = match.id;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [b2bInquiries, masterLinks]);

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

  // ---------- Master list actions ----------
  const addMasterLink = () => {
    const label = draftLabel.trim();
    const url = draftUrl.trim();
    if (!label) {
      showToast("Enter a label for the link.", "error");
      return;
    }
    if (!url || !/^https?:\/\//i.test(url)) {
      showToast("URL must start with http:// or https://", "error");
      return;
    }
    const next: B2BLink[] = [...masterLinks, { id: newLinkId(), label, url }];
    updateCompany({ b2bLinks: next });
    setDraftLabel("");
    setDraftUrl("");
    showToast("Link added.", "success");
  };

  const updateMasterLink = (id: string, patch: Partial<B2BLink>) => {
    const next = masterLinks.map((l) => (l.id === id ? { ...l, ...patch } : l));
    updateCompany({ b2bLinks: next });
  };

  const removeMasterLink = (id: string) => {
    if (!confirm("Remove this link from the master list?")) return;
    const next = masterLinks.filter((l) => l.id !== id);
    updateCompany({ b2bLinks: next });
    showToast("Link removed.", "info");
  };

  // ---------- Inquiry actions ----------
  const resolvePicked = (inq: B2BInquiry): B2BLink | null => {
    const id = picked[inq.id];
    if (!id) return null;
    return masterLinks.find((l) => l.id === id) ?? null;
  };

  const sendWhatsApp = (inq: B2BInquiry) => {
    const link = resolvePicked(inq);
    if (!link) {
      showToast("Pick a link from the dropdown first.", "error");
      return;
    }
    const phone = inq.phone.replace(/\D/g, "");
    const intl = phone.length === 10 ? "91" + phone : phone;

    const text = encodeURIComponent(
      `Hi ${inq.name.split(" ")[0] || "there"},\n\nThank you for your bulk inquiry with ${company.brand}.\n\nYour B2B request has been approved. Please find our ${link.label} below:\n${link.url}\n\nFor orders or queries, reply to this message or call ${company.phone}.\n\n— ${company.brand}`
    );

    window.open(`https://wa.me/${intl}?text=${text}`, "_blank");
    updateB2BInquiry(inq.id, {
      links: [link],
      pdfUrl: link.url,
      pdfLabel: link.label,
      status: "approved",
      sentAt: Date.now(),
    });
    showToast("WhatsApp opened — review and send.", "success");
  };

  const approve = (inq: B2BInquiry) => {
    const link = resolvePicked(inq);
    updateB2BInquiry(inq.id, {
      status: "approved",
      links: link ? [link] : inq.links,
      pdfUrl: link?.url ?? inq.pdfUrl,
      pdfLabel: link?.label ?? inq.pdfLabel,
    });
    showToast("Inquiry approved.", "success");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-black text-navy">B2B Bulk Inquiries</h2>
          <p className="text-sm text-muted-foreground">
            Configure your catalog links at the top, then pick one from the dropdown when
            replying to an inquiry.
          </p>
        </div>
        <ExportCsvButton entity="b2bInquiries" />
      </div>

      {/* Master link list */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-navy/10 flex items-center justify-center flex-shrink-0">
            <LinkIcon size={16} className="text-navy" />
          </div>
          <div>
            <h3 className="font-black text-navy">Add a catalog link</h3>
            <p className="text-xs text-muted-foreground">
              These links power the dropdown on every B2B inquiry below. Add as many as you
              need — wholesale price lists, retail catalogs, festival flyers, etc.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_auto] gap-2">
          <Input
            value={draftLabel}
            onChange={(e) => setDraftLabel(e.target.value)}
            placeholder="Label (e.g. Diwali Wholesale Price List)"
          />
          <Input
            value={draftUrl}
            onChange={(e) => setDraftUrl(e.target.value)}
            placeholder="https://drive.google.com/.../pricelist.pdf"
          />
          <Button
            type="button"
            onClick={addMasterLink}
            className="bg-gold hover:bg-gold-spark !text-navy font-bold gap-1.5"
          >
            <Plus size={14} /> Add link
          </Button>
        </div>

        {masterLinks.length === 0 ? (
          <p className="mt-3 text-xs text-muted-foreground">
            No links yet. Add at least one so the dropdown below has options.
          </p>
        ) : (
          <div className="mt-4 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {masterLinks.length} link{masterLinks.length === 1 ? "" : "s"} saved
            </p>
            {masterLinks.map((l) => (
              <div
                key={l.id}
                className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_auto] gap-2 items-center"
              >
                <Input
                  value={l.label}
                  onChange={(e) =>
                    updateMasterLink(l.id, { label: e.target.value })
                  }
                  placeholder="Label"
                  className="text-xs"
                />
                <Input
                  value={l.url}
                  onChange={(e) => updateMasterLink(l.id, { url: e.target.value })}
                  placeholder="https://..."
                  className="text-xs"
                />
                <div className="flex items-center gap-1.5 justify-end">
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noopener"
                    className="w-8 h-8 rounded-lg bg-cream hover:bg-gold/15 text-navy flex items-center justify-center"
                    aria-label="Open link"
                  >
                    <ExternalLink size={14} />
                  </a>
                  <button
                    type="button"
                    onClick={() => removeMasterLink(l.id)}
                    className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center"
                    aria-label="Remove link"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap">
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
            const intl = (inq.phone.length === 10 ? "91" : "") + inq.phone;
            const selectedId = picked[inq.id] ?? "";
            const sentLink = inq.links?.[0] ?? (inq.pdfUrl
              ? { id: "", url: inq.pdfUrl, label: inq.pdfLabel || "Saved link" }
              : null);
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

                {/* Pick + send */}
                <div className="px-5 py-4 bg-cream/40 border-t border-border space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-navy uppercase tracking-wider">
                    <FileText size={14} /> Price List / Catalog Link
                  </div>

                  {masterLinks.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Add a link at the top of this page first — the dropdown below will
                      then list it.
                    </p>
                  ) : (
                    <select
                      value={selectedId}
                      onChange={(e) =>
                        setPicked((prev) => ({ ...prev, [inq.id]: e.target.value }))
                      }
                      className="flex h-9 w-full max-w-xl rounded-md border border-input bg-white px-3 py-1 text-sm shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-ring text-navy"
                    >
                      <option value="">— Select a catalog link —</option>
                      {masterLinks.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {sentLink && sentLink.url && (
                    <a
                      href={sentLink.url}
                      target="_blank"
                      rel="noopener"
                      className="text-xs text-[#B8860B] inline-flex items-center gap-1 hover:text-navy hover:underline"
                    >
                      <ExternalLink size={12} /> Last sent: {sentLink.label || "Link"}
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
