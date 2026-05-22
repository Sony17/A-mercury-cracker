"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DEFAULT_POLICIES,
  POLICIES_STORAGE_KEY,
  POLICY_LABELS,
  type Policy,
  type PolicyKey,
} from "@/lib/policies";

export function loadPolicies(): Record<PolicyKey, Policy> {
  if (typeof window === "undefined") return DEFAULT_POLICIES;
  try {
    const raw = localStorage.getItem("mc_" + POLICIES_STORAGE_KEY);
    if (!raw) return DEFAULT_POLICIES;
    const saved = JSON.parse(raw) as Partial<Record<PolicyKey, Policy>>;
    return { ...DEFAULT_POLICIES, ...saved };
  } catch {
    return DEFAULT_POLICIES;
  }
}

export function savePolicies(p: Record<PolicyKey, Policy>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("mc_" + POLICIES_STORAGE_KEY, JSON.stringify(p));
    window.dispatchEvent(new CustomEvent("mc:policies-updated"));
  } catch {}
}

interface PolicyDialogProps {
  policyKey: PolicyKey | null;
  onClose: () => void;
  /** Optional override — when provided, shown instead of the saved/default version (used for unsaved admin previews). */
  override?: Policy | null;
}

export default function PolicyDialog({ policyKey, onClose, override }: PolicyDialogProps) {
  const [policies, setPolicies] = useState<Record<PolicyKey, Policy>>(DEFAULT_POLICIES);

  useEffect(() => {
    setPolicies(loadPolicies());
    const onUpdate = () => setPolicies(loadPolicies());
    window.addEventListener("mc:policies-updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("mc:policies-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  const open = policyKey !== null;
  const policy = policyKey ? (override ?? policies[policyKey]) : null;
  const title = policyKey ? POLICY_LABELS[policyKey] : "";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl sm:max-w-2xl p-0 gap-0 max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border bg-[#001D3D]">
          <DialogTitle className="text-[#FFD166] text-lg font-black tracking-tight">
            {policy?.title ?? title}
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto px-6 py-5 text-sm leading-relaxed text-[#001D3D] space-y-3">
          {policy?.content
            .split(/\n\s*\n/)
            .map((para, i) => (
              <p key={i} className="whitespace-pre-line">
                {para}
              </p>
            ))}
        </div>

        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-600">
          Last reviewed for the {new Date().getFullYear()} season. For questions, WhatsApp +91 9557149655.
        </div>
      </DialogContent>
    </Dialog>
  );
}
