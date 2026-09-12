"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import {
  CODE_MAX_LENGTH,
  describeDiscount,
  normalizeCode,
  referralState,
  remainingUses,
  type ReferralState,
} from "@/lib/referrals";
import type { Referral, ReferralType } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import {
  Check,
  Copy,
  Pencil,
  Plus,
  Power,
  TicketPercent,
  Trash2,
  X,
} from "lucide-react";

// Referrals are admin-only on the server (/api/db/referrals): GET lists them,
// PATCH upserts one record, DELETE removes one by id. Single-record writes keep
// two admins editing at once from clobbering each other's codes.
async function fetchReferrals(): Promise<Referral[]> {
  const res = await fetch("/api/db/referrals", { cache: "no-store" });
  if (!res.ok) throw new Error("Couldn't load referral codes");
  const data = (await res.json()) as Referral[];
  return Array.isArray(data) ? data.filter((r) => r != null) : [];
}

async function saveReferral(r: Referral): Promise<boolean> {
  try {
    const res = await fetch("/api/db/referrals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(r),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function destroyReferral(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/db/referrals?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    return res.ok;
  } catch {
    return false;
  }
}

const STATE_STYLE: Record<ReferralState, string> = {
  active: "bg-green-100 text-green-800 border-green-200",
  inactive: "bg-slate-100 text-slate-700 border-slate-300",
  expired: "bg-amber-100 text-amber-800 border-amber-200",
  exhausted: "bg-red-50 text-red-700 border-red-200",
};

const STATE_LABEL: Record<ReferralState, string> = {
  active: "Active",
  inactive: "Inactive",
  expired: "Expired",
  exhausted: "Fully used",
};

interface FormState {
  id: string;
  code: string;
  label: string;
  type: ReferralType;
  value: string;
  minSubtotal: string;
  maxDiscount: string;
  maxUses: string;
  expiry: string;
  active: boolean;
}

const BLANK_FORM: FormState = {
  id: "",
  code: "",
  label: "",
  type: "percent",
  value: "10",
  minSubtotal: "",
  maxDiscount: "",
  maxUses: "",
  expiry: "",
  active: true,
};

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

// `expiresAt` is a timestamp; the form edits it as a local calendar date and
// stores end-of-day, so a code set to expire "16 Nov" works all of 16 Nov.
function toDateInput(ms?: number): string {
  if (!ms) return "";
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function fromDateInput(value: string): number | undefined {
  if (!value) return undefined;
  const d = new Date(`${value}T23:59:59`);
  return Number.isNaN(d.getTime()) ? undefined : d.getTime();
}

function toForm(r: Referral): FormState {
  return {
    id: r.id,
    code: r.display || r.code,
    label: r.label ?? "",
    type: r.type,
    value: String(r.value ?? ""),
    minSubtotal: r.minSubtotal ? String(r.minSubtotal) : "",
    maxDiscount: r.maxDiscount ? String(r.maxDiscount) : "",
    maxUses: r.maxUses ? String(r.maxUses) : "",
    expiry: toDateInput(r.expiresAt),
    active: r.active !== false,
  };
}

function numberOrUndefined(value: string): number | undefined {
  const n = Number(value);
  if (!value.trim() || !Number.isFinite(n) || n <= 0) return undefined;
  return Math.round(n);
}

export default function ReferralsEditor() {
  const { showToast, orders } = useStore();
  const [list, setList] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Loads the collection once on mount. State is only touched after the fetch
  // resolves (and never after unmount), so the initial render isn't a cascade.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchReferrals();
        if (!cancelled) {
          setList(data);
          setLoadError(null);
        }
      } catch {
        if (!cancelled) setLoadError("Couldn't load referral codes. Reload to try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Redemptions are counted from the orders themselves (cancelled orders
  // excluded), so the numbers here survive the `uses` counter drifting.
  const usageByCode = useMemo(() => {
    const map = new Map<string, { orders: number; discount: number }>();
    for (const o of orders) {
      if (!o?.referralCode || o.status === "cancelled") continue;
      const key = normalizeCode(o.referralCode);
      const prev = map.get(key) ?? { orders: 0, discount: 0 };
      map.set(key, {
        orders: prev.orders + 1,
        discount: prev.discount + (typeof o.discount === "number" ? o.discount : 0),
      });
    }
    return map;
  }, [orders]);

  const activeCount = useMemo(
    () => list.filter((r) => referralState(r) === "active").length,
    [list],
  );
  const totalGiven = useMemo(
    () => [...usageByCode.values()].reduce((s, u) => s + u.discount, 0),
    [usageByCode],
  );

  const startCreate = () => {
    setForm({ ...BLANK_FORM });
    setFormError(null);
  };

  const startEdit = (r: Referral) => {
    setForm(toForm(r));
    setFormError(null);
  };

  const closeForm = () => {
    setForm(null);
    setFormError(null);
  };

  const patch = (p: Partial<FormState>) => {
    setForm((prev) => (prev ? { ...prev, ...p } : prev));
    setFormError(null);
  };

  const submit = async () => {
    if (!form) return;
    const code = normalizeCode(form.code);
    if (!code) {
      setFormError("Enter a code.");
      return;
    }
    const value = Number(form.value);
    if (!Number.isFinite(value) || value <= 0) {
      setFormError("Enter a discount greater than 0.");
      return;
    }
    if (form.type === "percent" && value > 100) {
      setFormError("A percentage discount can't be over 100%.");
      return;
    }
    const clash = list.find((r) => normalizeCode(r.code) === code && r.id !== form.id);
    if (clash) {
      setFormError(`“${clash.display || clash.code}” already uses that code.`);
      return;
    }

    const existing = form.id ? list.find((r) => r.id === form.id) : undefined;
    const record: Referral = {
      id: form.id || `ref_${Date.now().toString(36)}`,
      code,
      display: form.code.trim() || code,
      label: form.label.trim() || undefined,
      type: form.type,
      value: Math.round(value * 100) / 100,
      minSubtotal: numberOrUndefined(form.minSubtotal),
      maxDiscount: form.type === "percent" ? numberOrUndefined(form.maxDiscount) : undefined,
      maxUses: numberOrUndefined(form.maxUses),
      uses: existing?.uses ?? 0,
      expiresAt: fromDateInput(form.expiry),
      active: form.active,
      createdAt: existing?.createdAt ?? Date.now(),
    };

    setSaving(true);
    const ok = await saveReferral(record);
    setSaving(false);
    if (!ok) {
      setFormError("Couldn't save — try again.");
      return;
    }
    setList((prev) => {
      const idx = prev.findIndex((r) => r.id === record.id);
      if (idx < 0) return [record, ...prev];
      const next = prev.slice();
      next[idx] = record;
      return next;
    });
    showToast(existing ? "Referral code updated" : "Referral code created", "success");
    closeForm();
  };

  const toggleActive = async (r: Referral) => {
    const next = { ...r, active: !r.active };
    setList((prev) => prev.map((x) => (x.id === r.id ? next : x)));
    if (!(await saveReferral(next))) {
      setList((prev) => prev.map((x) => (x.id === r.id ? r : x)));
      showToast("Couldn't update the code — try again", "error");
      return;
    }
    showToast(next.active ? `${next.display || next.code} activated` : `${next.display || next.code} deactivated`, "success");
  };

  const remove = async (r: Referral) => {
    const name = r.display || r.code;
    const used = usageByCode.get(normalizeCode(r.code))?.orders ?? 0;
    const warning = used
      ? `${name} has been used on ${used} order${used === 1 ? "" : "s"}. Deleting it removes the code — past orders keep their discount. Continue?`
      : `Delete ${name}?`;
    if (!confirm(warning)) return;
    const prev = list;
    setList((cur) => cur.filter((x) => x.id !== r.id));
    if (!(await destroyReferral(r.id))) {
      setList(prev);
      showToast("Couldn't delete the code — try again", "error");
      return;
    }
    showToast(`${name} deleted`, "success");
  };

  const copy = async (r: Referral) => {
    try {
      await navigator.clipboard.writeText(r.display || r.code);
      setCopied(r.id);
      setTimeout(() => setCopied((c) => (c === r.id ? null : c)), 1600);
    } catch {
      showToast("Copy failed", "error");
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-navy/10 flex items-center justify-center flex-shrink-0">
            <TicketPercent size={16} className="text-navy" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-navy">Referral Codes</h3>
            <p className="text-xs text-muted-foreground">
              Codes customers type in the cart for a discount. The order value a code needs
              and any cap on the rupees off are set per code here — leave them blank and the
              code applies to every order, uncapped. Deactivate a code to stop it working
              without losing its history.
            </p>
          </div>
          <Button
            onClick={startCreate}
            className="bg-gold hover:bg-gold-spark text-navy gap-1.5 flex-shrink-0"
          >
            <Plus size={14} />
            New code
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4">
          <Stat label="Codes" value={String(list.length)} />
          <Stat label="Active" value={String(activeCount)} />
          <Stat label="Discount given" value={formatPrice(totalGiven)} />
        </div>
      </div>

      {/* Create / edit form */}
      {form && (
        <div className="bg-white rounded-2xl border border-border shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-navy text-sm">
              {form.id ? "Edit referral code" : "New referral code"}
            </h4>
            <button
              onClick={closeForm}
              className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-600 flex items-center justify-center"
              aria-label="Close form"
            >
              <X size={15} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Code *" hint={`Case-insensitive for customers. Stored as ${normalizeCode(form.code) || "—"}`}>
              <Input
                value={form.code}
                maxLength={CODE_MAX_LENGTH}
                autoCapitalize="off"
                spellCheck={false}
                onChange={(e) => patch({ code: e.target.value })}
                placeholder="InfinityRohit10"
              />
            </Field>
            <Field label="Label" hint="Internal note — who the code belongs to.">
              <Input
                value={form.label}
                onChange={(e) => patch({ label: e.target.value })}
                placeholder="Rohit — Diwali 10%"
              />
            </Field>
            <Field label="Discount type">
              <select
                value={form.type}
                onChange={(e) => patch({ type: e.target.value as ReferralType })}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:border-blue"
              >
                <option value="percent">Percent off (%)</option>
                <option value="flat">Flat amount off (₹)</option>
              </select>
            </Field>
            <Field label={form.type === "percent" ? "Percent off *" : "Amount off (₹) *"}>
              <Input
                type="number"
                min={0}
                max={form.type === "percent" ? 100 : undefined}
                inputMode="numeric"
                value={form.value}
                onChange={(e) => patch({ value: e.target.value })}
              />
            </Field>
            <Field
              label="Minimum order (₹)"
              hint="Cart subtotal needed before the code works. Blank = any order."
            >
              <Input
                type="number"
                min={0}
                inputMode="numeric"
                value={form.minSubtotal}
                onChange={(e) => patch({ minSubtotal: e.target.value })}
                placeholder="e.g. 1500"
              />
            </Field>
            {form.type === "percent" && (
              <Field label="Max discount (₹)" hint="Caps the rupees off. Blank = uncapped.">
                <Input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={form.maxDiscount}
                  onChange={(e) => patch({ maxDiscount: e.target.value })}
                  placeholder="e.g. 1000"
                />
              </Field>
            )}
            <Field label="Usage limit" hint="Total redemptions allowed. Blank = unlimited.">
              <Input
                type="number"
                min={0}
                inputMode="numeric"
                value={form.maxUses}
                onChange={(e) => patch({ maxUses: e.target.value })}
                placeholder="Unlimited"
              />
            </Field>
            <Field label="Expires on" hint="Works through the whole day. Blank = never expires.">
              <Input
                type="date"
                value={form.expiry}
                onChange={(e) => patch({ expiry: e.target.value })}
              />
            </Field>
          </div>

          <label className="flex items-center gap-2 text-sm text-navy font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => patch({ active: e.target.checked })}
              className="w-4 h-4 accent-[#001D3D]"
            />
            Active — customers can use this code now
          </label>

          {formError && <p className="text-xs text-red-600">{formError}</p>}

          <div className="flex gap-2">
            <Button
              onClick={() => void submit()}
              disabled={saving}
              className="bg-gold hover:bg-gold-spark text-navy font-bold gap-1.5"
            >
              <Check size={14} />
              {saving ? "Saving…" : form.id ? "Save changes" : "Create code"}
            </Button>
            <Button variant="outline" onClick={closeForm}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <p className="text-sm text-white/75">Loading referral codes…</p>
      ) : loadError ? (
        <p className="text-sm text-red-200">{loadError}</p>
      ) : list.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border shadow-sm p-8 text-center">
          <TicketPercent size={28} className="text-slate-400 mx-auto mb-2" />
          <p className="font-bold text-navy">No referral codes yet</p>
          <p className="text-sm text-muted-foreground">
            Create one and share it — customers enter it in the cart.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((r) => {
            const state = referralState(r);
            const left = remainingUses(r);
            const usage = usageByCode.get(normalizeCode(r.code));
            return (
              <div
                key={r.id}
                className="bg-white rounded-2xl border border-border shadow-sm p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-navy font-mono text-sm">
                        {r.display || r.code}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${STATE_STYLE[state]}`}
                      >
                        {STATE_LABEL[state]}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-navy/15 bg-navy/5 text-navy">
                        {describeDiscount(r)}
                      </span>
                    </div>
                    {r.label && (
                      <p className="text-sm text-muted-foreground mt-1">{r.label}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <IconButton label="Copy code" onClick={() => void copy(r)}>
                      {copied === r.id ? (
                        <Check size={14} className="text-green-700" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </IconButton>
                    <IconButton
                      label={r.active ? "Deactivate" : "Activate"}
                      onClick={() => void toggleActive(r)}
                      className={
                        r.active
                          ? "bg-green-50 hover:bg-green-100 text-green-700"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                      }
                    >
                      <Power size={14} />
                    </IconButton>
                    <IconButton label="Edit" onClick={() => startEdit(r)}>
                      <Pencil size={14} />
                    </IconButton>
                    <IconButton
                      label="Delete"
                      onClick={() => void remove(r)}
                      className="bg-red-50 hover:bg-red-100 text-red-600"
                    >
                      <Trash2 size={14} />
                    </IconButton>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  <Stat
                    label="Min order"
                    value={r.minSubtotal ? formatPrice(r.minSubtotal) : "None"}
                  />
                  <Stat
                    label="Uses left"
                    value={left === null ? "Unlimited" : String(left)}
                  />
                  <Stat label="Orders" value={String(usage?.orders ?? 0)} />
                  <Stat label="Given away" value={formatPrice(usage?.discount ?? 0)} />
                </div>

                <p className="text-[11px] text-muted-foreground mt-3">
                  {r.expiresAt
                    ? `Expires ${new Date(r.expiresAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}`
                    : "No expiry"}
                  {" · "}
                  {r.uses || 0} redemption{(r.uses || 0) === 1 ? "" : "s"} counted
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 border border-border px-3 py-2">
      <div className="text-[10px] font-bold uppercase tracking-wide text-slate-600">
        {label}
      </div>
      <div className="text-sm font-black text-navy">{value}</div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-bold text-navy uppercase tracking-wide block">
        {label}
      </label>
      {children}
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function IconButton({
  label,
  onClick,
  className = "bg-slate-100 hover:bg-slate-200 text-slate-700",
  children,
}: {
  label: string;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${className}`}
    >
      {children}
    </button>
  );
}
