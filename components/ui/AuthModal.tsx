"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, MessageCircle, MapPin } from "lucide-react";
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

export default function AuthModal() {
  const { authOpen, setAuthOpen, login, showToast } = useStore();
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [address, setAddress] = useState<UserAddress>(blankAddress);
  const [err, setErr] = useState("");

  const reset = () => {
    setForm({ name: "", email: "", phone: "", password: "" });
    setAddress(blankAddress);
    setErr("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");

    if (tab === "login") {
      if (form.email === ADMIN_EMAIL && form.password === ADMIN_PASS) {
        const u: User = { name: "Admin", email: form.email, role: "admin" };
        login(u);
        showToast("Welcome Admin!");
        return;
      }
      const users = storage.get<User[]>("users", []);
      const found = users.find((u) => u.email === form.email && u.password === form.password);
      if (!found) { setErr("Invalid email or password"); return; }
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
    // Keep separate address store in sync for the Account page's address tab.
    storage.set(`address_${u.email}`, cleanAddress);
    login(u);
    reset();
    showToast(`Account created! Welcome ${u.name}`);
  };

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const a = (k: keyof UserAddress) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setAddress((prev) => ({ ...prev, [k]: e.target.value }));

  return (
    <Dialog open={authOpen} onOpenChange={(o) => { setAuthOpen(o); if (!o) reset(); }}>
      <DialogContent className="max-w-md max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-navy text-xl font-black">
            {tab === "login" ? "Welcome back" : "Create account"}
          </DialogTitle>
        </DialogHeader>

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
                <label className="text-xs font-semibold mb-1 block">Password *</label>
                <Input
                  required
                  type="password"
                  value={form.password}
                  onChange={f("password")}
                  placeholder="Min 4 characters"
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
      </DialogContent>
    </Dialog>
  );
}
