"use client";

import { useMemo, useState } from "react";
import { Clock, Copy, Download, Mail, MessageCircle, Phone, Trash2, Users } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SubscriberChannel } from "@/lib/types";
import ExportCsvButton from "./ExportCsvButton";

const TABS: { id: SubscriberChannel | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "phone", label: "WhatsApp / SMS" },
  { id: "email", label: "Email" },
];

export default function SubscribersEditor() {
  const { subscribers, deleteSubscriber, showToast } = useStore();
  const [tab, setTab] = useState<SubscriberChannel | "all">("all");

  const filtered = useMemo(() => {
    if (tab === "all") return subscribers;
    return subscribers.filter((s) => s.channel === tab);
  }, [subscribers, tab]);

  const counts = useMemo(
    () => ({
      all: subscribers.length,
      phone: subscribers.filter((s) => s.channel === "phone").length,
      email: subscribers.filter((s) => s.channel === "email").length,
    }),
    [subscribers]
  );

  const formatValue = (channel: SubscriberChannel, value: string) =>
    channel === "phone" && value.length === 10 ? `+91 ${value}` : value;

  const copyAll = async () => {
    if (filtered.length === 0) return;
    const text = filtered.map((s) => formatValue(s.channel, s.value)).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      showToast(`Copied ${filtered.length} ${tab === "all" ? "subscriber" : tab} entries.`, "success");
    } catch {
      showToast("Copy failed.", "error");
    }
  };

  const exportCsv = () => {
    if (filtered.length === 0) return;
    const header = "channel,value,createdAt\n";
    const rows = filtered
      .map((s) => `${s.channel},${formatValue(s.channel, s.value)},${new Date(s.createdAt).toISOString()}`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${tab}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-navy">Subscribers</h2>
          <p className="text-sm text-muted-foreground">
            People who opted in via the &ldquo;Get Festival Offers First&rdquo; form.
          </p>
        </div>
        <ExportCsvButton entity="subscribers" />
      </div>

      <div className="flex gap-2 mb-5 flex-wrap items-center">
        {TABS.map((t) => {
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

        <div className="ml-auto flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-border text-navy"
            onClick={copyAll}
            disabled={filtered.length === 0}
          >
            <Copy size={14} /> Copy
          </Button>
          <Button
            size="sm"
            className="bg-gold hover:bg-gold-spark text-navy font-bold"
            onClick={exportCsv}
            disabled={filtered.length === 0}
          >
            <Download size={14} /> Export CSV
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-12 text-center">
          <Users size={32} className="text-muted-foreground mx-auto mb-3" />
          <h3 className="font-bold text-foreground mb-1">No subscribers yet</h3>
          <p className="text-sm text-muted-foreground">
            When a visitor submits the newsletter form, they appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="hidden sm:grid grid-cols-[120px_1fr_180px_100px] px-5 py-3 bg-cream/60 border-b border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <div>Channel</div>
            <div>Contact</div>
            <div>Subscribed</div>
            <div className="text-right">Actions</div>
          </div>
          {filtered.map((s) => {
            const isPhone = s.channel === "phone";
            const display = formatValue(s.channel, s.value);
            const waLink = isPhone
              ? `https://wa.me/${s.value.length === 10 ? "91" + s.value : s.value}`
              : null;
            const mailto = !isPhone ? `mailto:${s.value}` : null;
            return (
              <div
                key={s.id}
                className="grid grid-cols-1 sm:grid-cols-[120px_1fr_180px_100px] gap-2 sm:gap-0 px-5 py-3 border-b border-border last:border-b-0 items-center"
              >
                <div>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border",
                      isPhone
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    )}
                  >
                    {isPhone ? <Phone size={10} /> : <Mail size={10} />}
                    {isPhone ? "WhatsApp" : "Email"}
                  </span>
                </div>
                <div className="font-mono text-sm text-foreground break-all">{display}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock size={12} /> {new Date(s.createdAt).toLocaleString()}
                </div>
                <div className="flex sm:justify-end gap-1">
                  {waLink && (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-[#25D366] text-white hover:bg-[#1aa550]"
                      title="Message on WhatsApp"
                    >
                      <MessageCircle size={14} />
                    </a>
                  )}
                  {mailto && (
                    <a
                      href={mailto}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-navy text-white hover:bg-blue"
                      title="Send email"
                    >
                      <Mail size={14} />
                    </a>
                  )}
                  <button
                    onClick={() => {
                      if (confirm("Remove this subscriber?")) {
                        deleteSubscriber(s.id);
                      }
                    }}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-border text-muted-foreground hover:bg-cream"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
