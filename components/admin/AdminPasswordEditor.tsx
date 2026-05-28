"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { Lock, Save } from "lucide-react";

export default function AdminPasswordEditor() {
  const { user, showToast } = useStore();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!user) return;
    if (!current || !next) {
      setErr("Enter your current and new password");
      return;
    }
    if (next.length < 6) {
      setErr("New password must be at least 6 characters");
      return;
    }
    if (next === current) {
      setErr("New password must differ from your current password");
      return;
    }
    if (next !== confirm) {
      setErr("New passwords do not match");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          currentPassword: current,
          newPassword: next,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setErr(data.error ?? "Could not change password");
        return;
      }
      setCurrent("");
      setNext("");
      setConfirm("");
      showToast("Password updated", "success");
    } catch {
      setErr("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm p-5 max-w-md">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-navy/10 flex items-center justify-center flex-shrink-0">
          <Lock size={16} className="text-navy" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-navy">Change Password</h3>
          <p className="text-xs text-muted-foreground">
            Update the password for your admin account ({user?.email}). You&apos;ll stay signed in.
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-navy mb-1 block">Current password</label>
          <Input
            type="password"
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-navy mb-1 block">New password</label>
          <Input
            type="password"
            autoComplete="new-password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-navy mb-1 block">Confirm new password</label>
          <Input
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>

        {err && <p className="text-destructive text-xs">{err}</p>}

        <Button
          type="submit"
          disabled={busy}
          className="bg-gold hover:bg-gold-spark text-navy font-bold gap-2"
        >
          <Save size={14} />
          {busy ? "Saving…" : "Update password"}
        </Button>
      </form>
    </div>
  );
}
