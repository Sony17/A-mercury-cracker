"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  Clock,
  Copy,
  KeyRound,
  Phone,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ResetRequest, ResetRequestStatus } from "@/lib/types";

const TABS: { id: ResetRequestStatus | "all"; label: string }[] = [
  { id: "pending", label: "Pending" },
  { id: "completed", label: "Completed" },
  { id: "rejected", label: "Rejected" },
  { id: "all", label: "All" },
];

const STATUS_STYLE: Record<ResetRequestStatus, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  completed: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function PasswordResetsEditor() {
  const { showToast } = useStore();
  const [requests, setRequests] = useState<ResetRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<ResetRequestStatus | "all">("pending");
  const [busyId, setBusyId] = useState<string | null>(null);
  // Holds the temp password to display once after approving.
  const [issued, setIssued] = useState<{ email: string; temp: string } | null>(
    null,
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/db/resetRequests", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as ResetRequest[];
        setRequests(Array.isArray(data) ? data : []);
      }
    } catch {
      // ignored
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const counts = useMemo(
    () => ({
      all: requests.length,
      pending: requests.filter((r) => r.status === "pending").length,
      completed: requests.filter((r) => r.status === "completed").length,
      rejected: requests.filter((r) => r.status === "rejected").length,
    }),
    [requests],
  );

  const filtered = useMemo(() => {
    const list = tab === "all" ? requests : requests.filter((r) => r.status === tab);
    return list
      .slice()
      .sort((a, b) => {
        // Pending first by oldest-first (FIFO), others by most-recent resolved.
        if (a.status === "pending" && b.status !== "pending") return -1;
        if (b.status === "pending" && a.status !== "pending") return 1;
        if (a.status === "pending" && b.status === "pending") {
          return a.requestedAt - b.requestedAt;
        }
        return (b.resolvedAt ?? b.requestedAt) - (a.resolvedAt ?? a.requestedAt);
      });
  }, [requests, tab]);

  const callRecovery = async (
    requestId: string,
    action: "approve" | "reject",
  ): Promise<{ ok: boolean; tempPassword?: string; error?: string }> => {
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        tempPassword?: string;
        error?: string;
      };
      if (!res.ok) return { ok: false, error: data.error ?? "Failed" };
      return { ok: true, tempPassword: data.tempPassword };
    } catch {
      return { ok: false, error: "Network error" };
    }
  };

  const approve = async (r: ResetRequest) => {
    setBusyId(r.id);
    const result = await callRecovery(r.id, "approve");
    setBusyId(null);
    if (!result.ok || !result.tempPassword) {
      showToast(result.error ?? "Could not issue temp password", "error");
      return;
    }
    setIssued({ email: r.email, temp: result.tempPassword });
    await refresh();
  };

  const reject = async (r: ResetRequest) => {
    if (!confirm(`Reject reset request from ${r.email}?`)) return;
    setBusyId(r.id);
    const result = await callRecovery(r.id, "reject");
    setBusyId(null);
    if (!result.ok) {
      showToast(result.error ?? "Could not reject request", "error");
      return;
    }
    showToast("Request rejected.", "info");
    await refresh();
  };

  const remove = async (r: ResetRequest) => {
    if (!confirm(`Delete this ${r.status} request permanently?`)) return;
    setBusyId(r.id);
    try {
      const next = requests.filter((x) => x.id !== r.id);
      const res = await fetch("/api/db/resetRequests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!res.ok) throw new Error();
      setRequests(next);
    } catch {
      showToast("Could not delete request", "error");
    } finally {
      setBusyId(null);
    }
  };

  const copyTemp = async () => {
    if (!issued) return;
    try {
      await navigator.clipboard.writeText(issued.temp);
      showToast("Temp password copied.", "success");
    } catch {
      showToast("Couldn't copy — long-press to copy manually.", "error");
    }
  };

  return (
    <div>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-navy">Password Resets</h2>
          <p className="text-sm text-muted-foreground">
            Customers who can&apos;t log in. Confirm identity over the phone, then issue a
            temporary password — they&apos;ll be forced to set a new one on next login.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="bg-white text-navy border-slate-300 hover:bg-slate-100 hover:text-navy"
          onClick={() => void refresh()}
        >
          Refresh
        </Button>
      </div>

      {issued && (
        <div className="mb-5 bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-200 flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={18} className="text-amber-900" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-amber-900 text-sm">
                Temporary password issued for {issued.email}
              </p>
              <p className="text-xs text-amber-800 mt-0.5">
                Read it to the customer now — it will not be shown again. They&apos;ll be
                prompted to set a new password on next login.
              </p>
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <code className="font-mono text-lg font-black bg-white border border-amber-300 text-amber-900 rounded-md px-3 py-1.5 tracking-wider select-all">
                  {issued.temp}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white text-navy border-slate-300 hover:bg-slate-100 hover:text-navy gap-1"
                  onClick={copyTemp}
                >
                  <Copy size={14} /> Copy
                </Button>
                <Button
                  size="sm"
                  className="bg-amber-700 hover:bg-amber-800 text-white gap-1 ml-auto"
                  onClick={() => setIssued(null)}
                >
                  <Check size={14} /> Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-5 flex-wrap">
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
                  : "bg-white text-navy border-border hover:border-navy/40",
              )}
            >
              {t.label}
              <span
                className={cn(
                  "ml-2 text-xs px-1.5 py-0.5 rounded-md",
                  active ? "bg-white/15 text-white" : "bg-slate-100 text-muted-foreground",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="bg-white border border-border rounded-2xl p-12 text-center text-sm text-muted-foreground">
          Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-12 text-center">
          <KeyRound size={32} className="text-muted-foreground mx-auto mb-3" />
          <h3 className="font-bold text-navy mb-1">No requests in this view</h3>
          <p className="text-sm text-muted-foreground">
            When a customer submits the forgot-password form, it shows up here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => {
            const isPending = r.status === "pending";
            const waLink = (() => {
              const raw = (r.phone || "").replace(/\D/g, "");
              if (!raw) return null;
              const intl = raw.length === 10 ? "91" + raw : raw;
              const text = encodeURIComponent(
                `Hi, regarding your password reset request on A Mercury Crackers. Can you confirm your name and last order so we can issue a temporary password?`,
              );
              return `https://wa.me/${intl}?text=${text}`;
            })();
            return (
              <div
                key={r.id}
                className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4 border-b border-border bg-slate-50">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-black text-navy break-all">{r.email}</h3>
                      <span
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border",
                          STATUS_STYLE[r.status],
                        )}
                      >
                        {r.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <Phone size={12} /> {r.phone || "no phone"}
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground flex items-center gap-1">
                    <Clock size={12} /> {new Date(r.requestedAt).toLocaleString()}
                  </div>
                </div>

                <div className="px-5 py-3 bg-slate-50 border-t border-border flex flex-wrap gap-2">
                  {waLink && (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center gap-1 text-xs font-bold text-white bg-[#25D366] hover:bg-[#1aa550] px-3 py-1.5 rounded-md"
                    >
                      <Phone size={12} /> WhatsApp
                    </a>
                  )}
                  {isPending && (
                    <>
                      <Button
                        size="sm"
                        disabled={busyId === r.id}
                        className="bg-navy hover:bg-blue text-white font-bold gap-1"
                        onClick={() => void approve(r)}
                      >
                        <KeyRound size={14} />
                        {busyId === r.id ? "Issuing…" : "Issue temp password"}
                      </Button>
                      <Button
                        size="sm"
                        disabled={busyId === r.id}
                        variant="outline"
                        className="bg-white text-navy border-slate-300 hover:bg-slate-100 hover:text-navy gap-1"
                        onClick={() => void reject(r)}
                      >
                        <X size={14} /> Reject
                      </Button>
                    </>
                  )}
                  {!isPending && (
                    <span className="text-xs text-muted-foreground">
                      Resolved{" "}
                      {r.resolvedAt
                        ? new Date(r.resolvedAt).toLocaleString()
                        : "—"}
                    </span>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-border text-muted-foreground hover:bg-slate-100 ml-auto"
                    disabled={busyId === r.id}
                    onClick={() => void remove(r)}
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
