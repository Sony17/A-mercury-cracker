"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/lib/store";
import { ADMIN_EMAIL, ADMIN_PASS } from "@/lib/data";
import type { User } from "@/lib/types";

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

export default function AuthModal() {
  const { authOpen, setAuthOpen, login, showToast } = useStore();
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [err, setErr] = useState("");

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
    } else {
      if (!form.name || !form.email || !form.password) { setErr("Fill all required fields"); return; }
      const users = storage.get<User[]>("users", []);
      if (users.find((u) => u.email === form.email)) { setErr("Email already registered"); return; }
      const u: User = { ...form, role: "customer", createdAt: Date.now() };
      users.push(u);
      storage.set("users", users);
      login(u);
      showToast(`Account created! Welcome ${u.name}`);
    }
  };

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  return (
    <Dialog open={authOpen} onOpenChange={setAuthOpen}>
      <DialogContent className="max-w-sm">
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
                  <label className="text-xs font-semibold mb-1 block">Phone</label>
                  <Input type="tel" value={form.phone} onChange={f("phone")} placeholder="10-digit phone" />
                </div>
              )}
              <div>
                <label className="text-xs font-semibold mb-1 block">Password *</label>
                <Input required type="password" value={form.password} onChange={f("password")} placeholder="Min 4 characters" minLength={4} />
              </div>
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
