"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import { DEFAULT_CONTENT } from "@/lib/data";
import type { SiteContent } from "@/lib/types";
import { RotateCcw, Save, ShieldCheck, Building2, Phone, QrCode, Upload, X } from "lucide-react";
import SocialsEditor from "./SocialsEditor";

const QR_MAX_DIMENSION = 480;

async function fileToCompressedDataUrl(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new window.Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Could not read image"));
    el.src = dataUrl;
  });
  const scale = Math.min(1, QR_MAX_DIMENSION / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/png");
}

type StringKeys<T> = { [K in keyof T]-?: T[K] extends string ? K : never }[keyof T];
type FieldKey = StringKeys<SiteContent>;

interface FieldDef {
  key: FieldKey;
  label: string;
  placeholder?: string;
  hint?: string;
  multiline?: boolean;
  rows?: number;
  fullWidth?: boolean;
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

const PAYMENT_FIELDS: FieldDef[] = [
  {
    key: "upiVpa",
    label: "UPI ID (VPA)",
    placeholder: "yourname@okhdfcbank",
    hint: "Your registered UPI handle — customers pay to this address when scanning the QR.",
  },
  {
    key: "upiPayeeName",
    label: "Payee Name",
    placeholder: "A Mercury Crackers",
    hint: "Name shown in the customer's UPI app during payment.",
  },
  {
    key: "upiQrImageUrl",
    label: "Custom QR Image URL (optional)",
    placeholder: "https://… link to your bank/Paytm QR image",
    hint: "Leave blank to auto-generate from the UPI ID. Paste an image URL to override with your own QR.",
  },
  {
    key: "paymentSafetyNotes",
    label: "Safety Notes (shown in QR popup)",
    placeholder: "One note per line — leave blank to hide the safety section.",
    hint: "Each line becomes a bullet under the QR. Use this to warn customers about scams, payee name, OTP/PIN sharing, etc.",
    multiline: true,
    rows: 6,
    fullWidth: true,
  },
];

const CONTACT_FIELDS: FieldDef[] = [
  { key: "phone", label: "Phone" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "email", label: "Email" },
  { key: "address", label: "Address", multiline: true },
  {
    key: "mapEmbedUrl",
    label: "Map Location (Embed URL or Place Query)",
    placeholder: "https://www.google.com/maps/embed?pb=… or just a place name/Plus Code",
    hint: "Paste the iframe src from Google Maps → Share → Embed a map. Or paste a place name/address/Plus Code and we'll search it. Leave blank to use the address above.",
    multiline: true,
  },
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

  const qrFileInputRef = useRef<HTMLInputElement | null>(null);
  const [qrUploading, setQrUploading] = useState(false);

  const handleQrUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      showToast("Please choose an image file", "error");
      return;
    }
    setQrUploading(true);
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      setField("upiQrImageUrl", dataUrl);
    } catch {
      showToast("Could not process that image", "error");
    } finally {
      setQrUploading(false);
      if (qrFileInputRef.current) qrFileInputRef.current.value = "";
    }
  };

  const renderQrField = (f: FieldDef) => {
    const value = draft.upiQrImageUrl || "";
    return (
      <div key={f.key} className="space-y-1.5 md:col-span-2">
        <label className="text-xs font-bold text-navy uppercase tracking-wide">{f.label}</label>
        <div className="flex flex-col sm:flex-row gap-3">
          {value ? (
            <div className="relative w-28 h-28 rounded-lg border border-border bg-white overflow-hidden flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value} alt="QR preview" className="w-full h-full object-contain" />
              <button
                type="button"
                onClick={() => setField("upiQrImageUrl", "")}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                aria-label="Remove QR image"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <div className="w-28 h-28 rounded-lg border border-dashed border-border bg-cream flex items-center justify-center text-muted-foreground flex-shrink-0">
              <QrCode size={28} />
            </div>
          )}
          <div className="flex-1 space-y-2 min-w-0">
            <input
              ref={qrFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleQrUpload(file);
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => qrFileInputRef.current?.click()}
              disabled={qrUploading}
              className="gap-2"
            >
              <Upload size={14} />
              {qrUploading ? "Processing…" : value ? "Replace image" : "Upload QR image"}
            </Button>
            <Input
              value={value.startsWith("data:") ? "" : value}
              onChange={(e) => setField("upiQrImageUrl", e.target.value)}
              placeholder={value.startsWith("data:") ? "Uploaded image in use — clear it to paste a URL" : f.placeholder}
              disabled={value.startsWith("data:")}
            />
            {f.hint && <p className="text-[11px] text-muted-foreground">{f.hint}</p>}
          </div>
        </div>
      </div>
    );
  };

  const renderField = (f: FieldDef) => {
    if (f.key === "upiQrImageUrl") return renderQrField(f);
    return (
      <div key={f.key} className={`space-y-1.5${f.fullWidth ? " md:col-span-2" : ""}`}>
        <label className="text-xs font-bold text-navy uppercase tracking-wide">{f.label}</label>
        {f.multiline ? (
          <Textarea
            value={draft[f.key] || ""}
            onChange={(e) => setField(f.key, e.target.value)}
            placeholder={f.placeholder}
            rows={f.rows ?? 3}
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
  };

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
            className="bg-gold hover:bg-gold-spark text-navy gap-2"
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
        icon={QrCode}
        title="Payment / UPI"
        desc="Controls the QR shown at checkout. Update the UPI ID to your real handle so customers pay you."
        fields={PAYMENT_FIELDS}
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
