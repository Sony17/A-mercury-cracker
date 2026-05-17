"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import { loadPolicies, savePolicies } from "@/components/ui/PolicyDialog";
import PolicyDialog from "@/components/ui/PolicyDialog";
import {
  DEFAULT_POLICIES,
  POLICY_LABELS,
  POLICY_ORDER,
  type Policy,
  type PolicyKey,
} from "@/lib/policies";
import { cn } from "@/lib/utils";
import { Eye, RotateCcw, Save } from "lucide-react";

export default function PolicyEditor() {
  const { showToast } = useStore();
  const [policies, setPolicies] = useState<Record<PolicyKey, Policy>>(DEFAULT_POLICIES);
  const [active, setActive] = useState<PolicyKey>("safety");
  const [preview, setPreview] = useState<PolicyKey | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setPolicies(loadPolicies());
  }, []);

  const current = policies[active];

  const update = (patch: Partial<Policy>) => {
    setPolicies((prev) => ({ ...prev, [active]: { ...prev[active], ...patch } }));
    setDirty(true);
  };

  const handleSave = () => {
    savePolicies(policies);
    setDirty(false);
    showToast(`${POLICY_LABELS[active]} saved`, "success");
  };

  const handleReset = () => {
    if (!confirm(`Reset "${POLICY_LABELS[active]}" to the default text? Unsaved edits to this policy will be lost.`)) return;
    setPolicies((prev) => ({ ...prev, [active]: DEFAULT_POLICIES[active] }));
    setDirty(true);
  };

  return (
    <div>
      <div className="mb-5 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-black text-navy">Policies & Guidelines</h2>
          <p className="text-sm text-muted-foreground">
            Edit the text shown in the footer popups (Shipping, Return, Privacy, Terms, Safety).
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPreview(active)}
            className="gap-2"
          >
            <Eye size={14} /> Preview
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            className="gap-2 text-amber-700 border-amber-300 hover:bg-amber-50"
          >
            <RotateCcw size={14} /> Reset to default
          </Button>
          <Button
            onClick={handleSave}
            disabled={!dirty}
            className="gap-2 bg-navy hover:bg-blue text-white font-bold disabled:opacity-50"
          >
            <Save size={14} /> Save changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-5">
        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-2 h-fit">
          {POLICY_ORDER.map((key) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={cn(
                "w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active === key
                  ? "bg-navy text-white"
                  : "text-foreground hover:bg-cream"
              )}
            >
              {POLICY_LABELS[key]}
            </button>
          ))}
        </div>

        {/* Editor */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold mb-1 block text-navy">Title (shown at top of popup)</label>
            <Input
              value={current.title}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="e.g. Shipping Policy"
            />
          </div>

          <div>
            <label className="text-xs font-semibold mb-1 block text-navy">
              Content
              <span className="text-muted-foreground font-normal ml-2">
                Use a blank line to start a new paragraph. Bullet points (• or -) display as-is.
              </span>
            </label>
            <Textarea
              value={current.content}
              onChange={(e) => update({ content: e.target.value })}
              className="min-h-[480px] font-mono text-[13px] leading-relaxed"
            />
          </div>

          {dirty && (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
              You have unsaved changes. Click <strong>Save changes</strong> to publish.
            </div>
          )}
        </div>
      </div>

      <PolicyDialog
        policyKey={preview}
        override={preview ? policies[preview] : null}
        onClose={() => setPreview(null)}
      />
    </div>
  );
}
