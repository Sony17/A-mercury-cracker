"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { POLICY_LABELS, type Policy, type PolicyKey } from "@/lib/policies";
import { cachedPolicies, loadPolicies, type PolicyMap } from "@/lib/policiesClient";

interface PolicyDialogProps {
  policyKey: PolicyKey | null;
  onClose: () => void;
  /** Optional override — when provided, shown instead of the saved/default version (used for unsaved admin previews). */
  override?: Policy | null;
}

export default function PolicyDialog({ policyKey, onClose, override }: PolicyDialogProps) {
  const [policies, setPolicies] = useState<PolicyMap>(cachedPolicies);

  useEffect(() => {
    let cancelled = false;
    const refresh = (force: boolean) => {
      loadPolicies(force).then((p) => {
        if (!cancelled) setPolicies(p);
      });
    };
    refresh(false);
    const onUpdate = () => refresh(true);
    window.addEventListener("mc:policies-updated", onUpdate);
    return () => {
      cancelled = true;
      window.removeEventListener("mc:policies-updated", onUpdate);
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
