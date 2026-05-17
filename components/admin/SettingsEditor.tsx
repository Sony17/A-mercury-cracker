"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import { DEFAULT_CONTENT } from "@/lib/data";
import type { SiteContent } from "@/lib/types";
import { RotateCcw, Save, ShieldCheck, Building2, Phone } from "lucide-react";
import SocialsEditor from "./SocialsEditor";

type StringKeys<T> = { [K in keyof T]: T[K] extends string ? K : never }[keyof T];
type FieldKey = StringKeys<SiteContent>;

interface FieldDef {
  key: FieldKey;
  label: string;
  placeholder?: string;
  hint?: string;
  multiline?: boolean;
}

const COMPLIANCE_FIELDS: FieldDef[] = [
  { key: "gstin", label: "GSTIN", placeholder: "09ABCDE1234F1Z5", hint: "15-character GST Identification Number" },
  { key: "peso", label: "PESO License", placeholder: "PESO/EXPLOSIVE/LIC/2025/UP/00123", hint: "Petroleum & Explosives Safety Organisation license number" },
  { key: "fssai", label: "FSSAI (optional)", placeholder: "Leave blank if not applicable" },
];

const BUSINESS_FIELDS: FieldDef[] = [
  { key: "brand", label: "Brand Name" },
  { key: "tagline", label: "Tagline" },
  { key: "ownerName", label: "Owner Name" },
  { key: "est", label: "Established Year" },
  { key: "about", label: "About", multiline: true },
];

const CONTACT_FIELDS: FieldDef[] = [
  { key: "phone", label: "Phone" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "email", label: "Email" },
  { key: "address", label: "Address", multiline: true },
  { key: "hours", label: "Hours" },
  { key: "instagram", label: "Instagram URL" },
  { key: "google", label: "Google Listing URL" },
];

export default function SettingsEditor() {
  const { company, updateCompany, resetCompany, showToast } = useStore();
  const [draft, setDraft] = useState<SiteContent>(company);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setDraft(company);
  }, [company]);

  const setField = (key: FieldKey, value: string) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSave = () => {
    updateCompany(draft);
    setDirty(false);
    showToast("Company info saved", "success");
  };

  const handleReset = () => {
    if (!confirm("Reset all company info to defaults? Your edits will be lost.")) return;
    resetCompany();
    setDraft(DEFAULT_CONTENT);
    setDirty(false);
    showToast("Reset to defaults", "success");
  };

  const renderField = (f: FieldDef) => (
    <div key={f.key} className="space-y-1.5">
      <label className="text-xs font-bold text-navy uppercase tracking-wide">{f.label}</label>
      {f.multiline ? (
        <Textarea
          value={draft[f.key] || ""}
          onChange={(e) => setField(f.key, e.target.value)}
          placeholder={f.placeholder}
          rows={3}
        />
      ) : (
        <Input
          value={draft[f.key] || ""}
          onChange={(e) => setField(f.key, e.target.value)}
          placeholder={f.placeholder}
        />
      )}
      {f.hint && <p className="text-[11px] text-muted-foreground">{f.hint}</p>}
    </div>
  );

  const Section = ({
    icon: Icon,
    title,
    desc,
    fields,
  }: {
    icon: typeof ShieldCheck;
    title: string;
    desc: string;
    fields: FieldDef[];
  }) => (
    <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-navy/10 flex items-center justify-center flex-shrink-0">
          <Icon size={16} className="text-navy" />
        </div>
        <div>
          <h3 className="font-black text-navy">{title}</h3>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map(renderField)}
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-navy">Company Settings</h2>
          <p className="text-sm text-muted-foreground">
            Update company info shown in the footer, contact section, and compliance block.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw size={14} />
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={!dirty}
            className="bg-navy hover:bg-blue text-white gap-2"
          >
            <Save size={14} />
            Save Changes
          </Button>
        </div>
      </div>

      <Section
        icon={ShieldCheck}
        title="Compliance & Licensing"
        desc="Statutory identifiers displayed in the footer compliance block."
        fields={COMPLIANCE_FIELDS}
      />

      <Section
        icon={Building2}
        title="Business Info"
        desc="Brand identity and about copy used across the site."
        fields={BUSINESS_FIELDS}
      />

      <Section
        icon={Phone}
        title="Contact & Social"
        desc="Reach-out channels and primary social links."
        fields={CONTACT_FIELDS}
      />

      <SocialsEditor />
    </div>
  );
}
