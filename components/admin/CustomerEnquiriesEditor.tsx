"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Clock, MessageSquare, Phone, Trash2, Undo2, Users } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CustomerEnquiry, CustomerEnquiryStatus } from "@/lib/types";
import ExportCsvButton from "./ExportCsvButton";

const STATUS_TABS: { id: CustomerEnquiryStatus | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "resolved", label: "Resolved" },
];

const STATUS_STYLE: Record<CustomerEnquiryStatus, string> = {
  new: "bg-amber-100 text-amber-700 border-amber-200",
  resolved: "bg-green-100 text-green-700 border-green-200",
};

export default function CustomerEnquiriesEditor() {
  const {
    customerEnquiries,
    setCustomerEnquiryStatus,
    deleteCustomerEnquiry,
    company,
    showToast,
  } = useStore();

  const [tab, setTab] = useState<CustomerEnquiryStatus | "all">("all");

  const filtered = useMemo(() => {
    if (tab === "all") return customerEnquiries;
    return customerEnquiries.filter((i) => i.status === tab);
  }, [customerEnquiries, tab]);

  const counts = useMemo(
    () => ({
      all: customerEnquiries.length,
      new: customerEnquiries.filter((i) => i.status === "new").length,
      resolved: customerEnquiries.filter((i) => i.status === "resolved").length,
    }),
    [customerEnquiries]
  );

  const waLink = (enq: CustomerEnquiry) => {
    const raw = (enq.phone || company.whatsapp || "").replace(/\D/g, "");
    if (!raw) return null;
    const intl = raw.length === 10 ? "91" + raw : raw;
    const text = encodeURIComponent(
      `Hi${enq.name ? ` ${enq.name.split(" ")[0]}` : ""}, regarding your question: "${enq.question}"\n\n— ${company.brand}`
    );
    return `https://wa.me/${intl}?text=${text}`;
  };

  return (
    <div>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-navy">Customer Enquiries</h2>
          <p className="text-sm text-muted-foreground">
            Questions visitors typed into the chatbot. Mark as resolved once you have replied.
          </p>
        </div>
        <ExportCsvButton entity="customerEnquiries" />
      </div>

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

      {filtered.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-12 text-center">
          <Users size={32} className="text-muted-foreground mx-auto mb-3" />
          <h3 className="font-bold text-foreground mb-1">No enquiries yet</h3>
          <p className="text-sm text-muted-foreground">
            When a visitor sends a custom question via the chatbot, it appears here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((enq) => {
            const wa = waLink(enq);
            return (
              <div
                key={enq.id}
                className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4 border-b border-border bg-cream/40">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-black text-navy">
                        {enq.name || "Anonymous visitor"}
                      </h3>
                      <span
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border",
                          STATUS_STYLE[enq.status]
                        )}
                      >
                        {enq.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {enq.email || "no email"}
                      {enq.phone && <> · {enq.phone}</>}
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground flex items-center gap-1">
                    <Clock size={12} /> {new Date(enq.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="px-5 py-4 space-y-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                      <MessageSquare size={12} /> Question
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{enq.question}</p>
                  </div>
                  {enq.reply && (
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                        Auto reply sent
                      </div>
                      <p className="text-sm text-foreground/80 whitespace-pre-wrap bg-cream/60 border border-border rounded-lg px-3 py-2">
                        {enq.reply}
                      </p>
                    </div>
                  )}
                </div>

                <div className="px-5 py-3 bg-cream/40 border-t border-border flex flex-wrap gap-2">
                  {wa && (
                    <a
                      href={wa}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center gap-1 text-xs font-bold text-white bg-[#25D366] hover:bg-[#1aa550] px-3 py-1.5 rounded-md"
                    >
                      <Phone size={12} /> Reply on WhatsApp
                    </a>
                  )}
                  {enq.status === "new" ? (
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white font-bold"
                      onClick={() => {
                        setCustomerEnquiryStatus(enq.id, "resolved");
                        showToast("Marked as resolved.", "success");
                      }}
                    >
                      <CheckCircle2 size={14} /> Mark resolved
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-border text-navy"
                      onClick={() => {
                        setCustomerEnquiryStatus(enq.id, "new");
                        showToast("Reopened.", "info");
                      }}
                    >
                      <Undo2 size={14} /> Reopen
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-border text-muted-foreground hover:bg-cream ml-auto"
                    onClick={() => {
                      if (confirm("Delete this enquiry permanently?")) {
                        deleteCustomerEnquiry(enq.id);
                      }
                    }}
                  >
                    <Trash2 size={14} /> Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
