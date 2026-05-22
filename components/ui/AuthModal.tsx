"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, MessageCircle, MapPin, KeyRound, ArrowLeft, ShieldAlert } from "lucide-react";
import { useStore } from "@/lib/store";
import { ADMIN_EMAIL, ADMIN_PASS } from "@/lib/data";
import type { User, UserAddress } from "@/lib/types";

const storage = {
  get: <T,>(k: string, d: T): T => {
    if (typeof window === "undefined") return d;
    try {
      const v = localStorage.getItem("mc_" + k);
      return v ? (JSON.parse(v) as T) : d;
    } catch {
      return d;
    }
  },
  set: <T,>(k: string, v: T) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("mc_" + k, JSON.stringify(v));
    } catch {}
  },
};

const blankAddress: UserAddress = { line1: "", line2: "", city: "", state: "", pincode: "" };

type View = "auth" | "forgot" | "force-change";

export default function AuthModal() {
  const { authOpen, setAuthOpen, login, showToast } = useStore();
  const [view, setView] = useState<View>("auth");
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [address, setAddress] = useState<UserAddress>(blankAddress);
  const [err, setErr] = useState("");

  // Forgot-password view state
  const [forgot, setForgot] = useState({ email: "", phone: "" });
  const [forgotMsg, setForgotMsg] = useState("");
  const [forgotErr, setForgotErr] = useState("");
  const [forgotBusy, setForgotBusy] = useState(false);

  // Force-change-password view state (after a temp-password login)
  const [pending, setPending] = useState<User | null>(null);
  const [tempPw, setTempPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newPw2, setNewPw2] = useState("");
  const [changeBusy, setChangeBusy] = useState(false);
  const [changeErr, setChangeErr] = useState("");

  const reset = () => {
    setForm({ name: "", email: "", phone: "", password: "" });
    setAddress(blankAddress);
    setErr("");
    setForgot({ email: "", phone: "" });
    setForgotMsg("");
    setForgotErr("");
    setPending(null);
    setTempPw("");
    setNewPw("");
    setNewPw2("");
    setChangeErr("");
    setView("auth");
  };

  const tryServerLogin = async (
    email: string,
    password: string,
  ): Promise<{ user: User } | { error: string } | null> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.status === 401) return { error: "INVALID" };
      if (!res.ok) return null;
      const data = (await res.json()) as { user: User };
      return { user: data.user };
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");

    if (tab === "login") {
      // Admin shortcut: hardcoded credentials, fully local.
      if (form.email === ADMIN_EMAIL && form.password === ADMIN_PASS) {
        const u: User = { name: "Admin", email: form.email, role: "admin" };
        login(u);
        showToast("Welcome Admin!");
        return;
      }

      // Try server first — this is the only path that knows about temp
      // passwords and the mustChangePassword flag.
      const serverResult = await tryServerLogin(form.email, form.password);
      if (serverResult && "user" in serverResult) {
        const u = serverResult.user;
        if (u.mustChangePassword) {
          // Hold the login: force a password change first.
          setPending(u);
          setTempPw(form.password);
          setView("force-change");
          return;
        }
        login({ ...u, role: u.role ?? "customer" });
        showToast(`Welcome back, ${u.name}!`);
        return;
      }

      // Fall back to legacy localStorage signups.
      const users = storage.get<User[]>("users", []);
      const found = users.find((u) => u.email === form.email && u.password === form.password);
      if (!found) {
        setErr("Invalid email or password");
        return;
      }
      const u: User = { ...found, role: "customer" };
      login(u);
      showToast(`Welcome back, ${u.name}!`);
      return;
    }

    // signup
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setErr("Fill name, email and password");
      return;
    }
    if (!/^\d{10}$/.test(form.phone.trim())) {
      setErr("Enter a valid 10-digit phone number (used for WhatsApp & calls)");
      return;
    }
    if (!address.line1.trim() || !address.city.trim() || !address.state.trim()) {
      setErr("Address line, city and state are required for delivery");
      return;
    }
    if (!/^\d{6}$/.test(address.pincode.trim())) {
      setErr("Enter a valid 6-digit pincode");
      return;
    }

    const users = storage.get<User[]>("users", []);
    if (users.find((u) => u.email === form.email)) {
      setErr("Email already registered");
      return;
    }
    const cleanAddress: UserAddress = {
      line1: address.line1.trim(),
      line2: address.line2?.trim() || "",
      city: address.city.trim(),
      state: address.state.trim(),
      pincode: address.pincode.trim(),
    };
    const u: User = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password,
      role: "customer",
      createdAt: Date.now(),
      address: cleanAddress,
    };
    users.push(u);
    storage.set("users", users);
    storage.set(`address_${u.email}`, cleanAddress);
    login(u);
    reset();
    showToast(`Account created! Welcome ${u.name}`);
  };

  const submitForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotErr("");
    setForgotMsg("");
    const email = forgot.email.trim();
    const phone = forgot.phone.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setForgotErr("Enter a valid email");
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      setForgotErr("Enter a valid 10-digit phone number");
      return;
    }
    setForgotBusy(true);
    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setForgotErr(data.error ?? "Could not submit request");
        return;
      }
      setForgotMsg(
        "Request submitted. The store will call you on this number with a temporary password — usually within store hours.",
      );
    } catch {
      setForgotErr("Network error. Please try again.");
    } finally {
      setForgotBusy(false);
    }
  };

  const submitChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeErr("");
    if (!pending) return;
    if (newPw.length < 6) {
      setChangeErr("New password must be at least 6 characters");
      return;
    }
    if (newPw !== newPw2) {
      setChangeErr("Passwords do not match");
      return;
    }
    setChangeBusy(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: pending.email,
          currentPassword: tempPw,
          newPassword: newPw,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        user?: User;
        error?: string;
      };
      if (!res.ok || !data.user) {
        setChangeErr(data.error ?? "Could not change password");
        return;
      }
      const u = { ...data.user, role: data.user.role ?? "customer" };
      login(u);
      showToast("Password updated. You're signed in.");
      reset();
    } catch {
      setChangeErr("Network error. Please try again.");
    } finally {
      setChangeBusy(false);
    }
  };

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const a = (k: keyof UserAddress) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setAddress((prev) => ({ ...prev, [k]: e.target.value }));

  const title =
    view === "forgot"
      ? "Reset your password"
      : view === "force-change"
      ? "Set a new password"
      : tab === "login"
      ? "Welcome back"
      : "Create account";

  return (
    <Dialog open={authOpen} onOpenChange={(o) => { setAuthOpen(o); if (!o) reset(); }}>
      <DialogContent className="max-w-md max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-navy text-xl font-black">{title}</DialogTitle>
        </DialogHeader>

        {view === "auth" && (
          <>
            <Tabs value={tab} onValueChange={(v) => { setTab(v); setErr(""); }}>
              <TabsList className="w-full">
                <TabsTrigger value="login" className="flex-1">Login</TabsTrigger>
                <TabsTrigger value="signup" className="flex-1">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value={tab} className="mt-4">
                <form onSubmit={handleSubmit} className="space-y-3">
                  {tab === "signup" && (
                    <div>
                      <label className="text-xs font-semibold mb-1 block">Full Name *</label>
                      <Input required value={form.name} onChange={f("name")} placeholder="Your name" />
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold mb-1 block">Email *</label>
                    <Input required type="email" value={form.email} onChange={f("email")} placeholder="you@example.com" />
                  </div>

                  {tab === "signup" && (
                    <div>
                      <label className="text-xs font-semibold mb-1 block">
                        Phone Number <span className="text-destructive">*</span>
                      </label>
                      <Input
                        required
                        type="tel"
                        inputMode="numeric"
                        pattern="\d{10}"
                        maxLength={10}
                        value={form.phone}
                        onChange={f("phone")}
                        placeholder="10-digit mobile number"
                      />
                      <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5">
                        <MessageCircle size={11} className="text-[#25D366]" />
                        <Phone size={11} className="text-navy" />
                        We&apos;ll use this for WhatsApp updates &amp; order calls.
                      </p>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold">Password *</label>
                      {tab === "login" && (
                        <button
                          type="button"
                          onClick={() => {
                            setForgot({ email: form.email, phone: "" });
                            setForgotErr("");
                            setForgotMsg("");
                            setView("forgot");
                          }}
                          className="text-[11px] font-semibold text-navy hover:underline inline-flex items-center gap-1"
                        >
                          <KeyRound size={11} />
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <Input
                      required
                      type="password"
                      value={form.password}
                      onChange={f("password")}
                      placeholder={tab === "login" ? "Your password" : "Min 4 characters"}
                      minLength={4}
                    />
                  </div>

                  {tab === "signup" && (
                    <div className="pt-2 border-t border-border space-y-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-navy">
                        <MapPin size={13} />
                        Delivery Address <span className="text-destructive">*</span>
                      </div>
                      <Input
                        required
                        value={address.line1}
                        onChange={a("line1")}
                        placeholder="House no, street"
                      />
                      <Input
                        value={address.line2 ?? ""}
                        onChange={a("line2")}
                        placeholder="Area, landmark (optional)"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input required value={address.city} onChange={a("city")} placeholder="City" />
                        <Input required value={address.state} onChange={a("state")} placeholder="State" />
                      </div>
                      <Input
                        required
                        value={address.pincode}
                        onChange={a("pincode")}
                        placeholder="Pincode"
                        inputMode="numeric"
                        maxLength={6}
                        pattern="\d{6}"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Used to ship your order. You can update it later from your profile.
                      </p>
                    </div>
                  )}

                  {err && <p className="text-destructive text-xs">{err}</p>}

                  <Button type="submit" className="w-full bg-navy hover:bg-blue text-white font-bold">
                    {tab === "login" ? "Login" : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <p className="text-[10px] text-center text-muted-foreground">
              Admin: {ADMIN_EMAIL} / {ADMIN_PASS}
            </p>
          </>
        )}

        {view === "forgot" && (
          <form onSubmit={submitForgot} className="space-y-3 mt-2">
            <p className="text-xs text-muted-foreground">
              Submit your email and the phone number on file. The store will call you with a
              temporary password — you&apos;ll be asked to set a new one on your next login.
            </p>
            <div>
              <label className="text-xs font-semibold mb-1 block">Email *</label>
              <Input
                required
                type="email"
                value={forgot.email}
                onChange={(e) => setForgot((p) => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block">Phone (10 digits) *</label>
              <Input
                required
                type="tel"
                inputMode="numeric"
                pattern="\d{10}"
                maxLength={10}
                value={forgot.phone}
                onChange={(e) => setForgot((p) => ({ ...p, phone: e.target.value }))}
                placeholder="10-digit mobile number"
              />
            </div>

            {forgotErr && <p className="text-destructive text-xs">{forgotErr}</p>}
            {forgotMsg && (
              <p className="text-xs bg-green-50 text-green-800 border border-green-200 rounded-md p-2">
                {forgotMsg}
              </p>
            )}

            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                className="gap-1 bg-white text-navy border-slate-300 hover:bg-slate-100 hover:text-navy"
                onClick={() => setView("auth")}
              >
                <ArrowLeft size={14} />
                Back
              </Button>
              <Button
                type="submit"
                disabled={forgotBusy || !!forgotMsg}
                className="flex-1 bg-navy hover:bg-blue text-white font-bold"
              >
                {forgotBusy ? "Submitting…" : forgotMsg ? "Submitted" : "Submit request"}
              </Button>
            </div>
          </form>
        )}

        {view === "force-change" && pending && (
          <form onSubmit={submitChangePassword} className="space-y-3 mt-2">
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-900 rounded-md p-3 text-xs">
              <ShieldAlert size={16} className="flex-shrink-0 mt-0.5" />
              <div>
                You signed in with a temporary password. Set a new password to finish signing in
                as <span className="font-semibold">{pending.email}</span>.
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold mb-1 block">New password *</label>
              <Input
                required
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="Min 6 characters"
                minLength={6}
              />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block">Confirm new password *</label>
              <Input
                required
                type="password"
                value={newPw2}
                onChange={(e) => setNewPw2(e.target.value)}
                placeholder="Re-enter new password"
                minLength={6}
              />
            </div>

            {changeErr && <p className="text-destructive text-xs">{changeErr}</p>}

            <Button
              type="submit"
              disabled={changeBusy}
              className="w-full bg-navy hover:bg-blue text-white font-bold"
            >
              {changeBusy ? "Saving…" : "Set password & sign in"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
