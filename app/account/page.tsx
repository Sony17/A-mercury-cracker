"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Package,
  LogOut,
  LayoutDashboard,
  Pencil,
  Save,
  X,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatPrice, getInitials } from "@/lib/utils";
import type { UserAddress } from "@/lib/types";

function storageGet<T>(k: string, d: T): T {
  if (typeof window === "undefined") return d;
  try {
    const v = localStorage.getItem("mc_" + k);
    return v ? (JSON.parse(v) as T) : d;
  } catch {
    return d;
  }
}

function storageSet<T>(k: string, v: T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("mc_" + k, JSON.stringify(v));
  } catch {}
}

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  dispatched: "Dispatched",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  dispatched: "bg-blue-100 text-blue-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-700",
};

const TABS = [
  { id: "profile", label: "Profile", icon: UserIcon },
  { id: "orders", label: "Orders", icon: Package },
  { id: "address", label: "Address", icon: MapPin },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AccountPage() {
  const router = useRouter();
  const { user, logout, updateUser, setAuthOpen, showToast, orders: allOrders } = useStore();
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<TabId>("profile");

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "" });

  const [address, setAddress] = useState<UserAddress>({
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [savingAddr, setSavingAddr] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!user) return;
    setForm({ name: user.name ?? "", phone: user.phone ?? "" });
    setAddress(
      user.address ??
        storageGet<UserAddress>(`address_${user.email}`, {
          line1: "",
          line2: "",
          city: "",
          state: "",
          pincode: "",
        })
    );
  }, [user]);

  const orders = user
    ? allOrders.filter((o) => o.customer.email === user.email)
    : [];

  if (!mounted) return null;

  if (!user) {
    return (
      <div className="min-h-[70vh] bg-slate-50 flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-16 h-16 rounded-2xl bg-navy/10 flex items-center justify-center">
          <UserIcon size={28} className="text-navy" />
        </div>
        <div className="text-center max-w-sm">
          <h1 className="text-2xl font-black text-navy mb-2">Sign in to your account</h1>
          <p className="text-slate-600 text-sm mb-6">
            Login or create an account to view your profile, track orders, and manage your saved address.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            className="bg-navy hover:bg-blue text-white font-bold px-6"
            onClick={() => setAuthOpen(true)}
          >
            Login / Sign Up
          </Button>
          <Button variant="outline" className="bg-white text-navy border-slate-300 hover:bg-slate-100 hover:text-navy" onClick={() => router.push("/")}>
            Continue browsing
          </Button>
        </div>
      </div>
    );
  }

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      })
    : "—";

  const saveProfile = () => {
    if (!form.name.trim()) {
      showToast("Name is required", "error");
      return;
    }
    if (!/^\d{10}$/.test(form.phone.trim())) {
      showToast("Enter a valid 10-digit phone number", "error");
      return;
    }
    updateUser({ name: form.name.trim(), phone: form.phone.trim() });
    setEditing(false);
    showToast("Profile updated");
  };

  const saveAddress = () => {
    if (!address.line1.trim() || !address.city.trim() || !address.state.trim()) {
      showToast("Address line, city and state are required", "error");
      return;
    }
    if (!/^\d{6}$/.test(address.pincode.trim())) {
      showToast("Enter a valid 6-digit pincode", "error");
      return;
    }
    const cleaned: UserAddress = {
      line1: address.line1.trim(),
      line2: address.line2?.trim() || "",
      city: address.city.trim(),
      state: address.state.trim(),
      pincode: address.pincode.trim(),
    };
    setSavingAddr(true);
    storageSet(`address_${user.email}`, cleaned);
    updateUser({ address: cleaned });
    showToast("Address saved");
    setTimeout(() => setSavingAddr(false), 400);
  };

  return (
    <div className="min-h-[70vh] bg-slate-50 py-6 sm:py-12 px-3 sm:px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-8 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-navy text-white flex items-center justify-center text-lg sm:text-2xl font-black flex-shrink-0">
              {getInitials(user.name)}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-3xl font-black text-navy truncate">
                {user.name}
              </h1>
              <p className="text-sm text-slate-600 truncate">{user.email}</p>
              <p className="text-xs text-slate-500 mt-1">
                Member since {memberSince}
                {user.role === "admin" && (
                  <span className="ml-2 inline-flex items-center gap-1 text-[#B8860B] font-semibold">
                    · Admin
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {user.role === "admin" && (
                <Link href="/admin">
                  <Button variant="outline" size="sm" className="gap-2 bg-white text-navy border-slate-300 hover:bg-slate-100 hover:text-navy">
                    <LayoutDashboard size={14} />
                    Admin
                  </Button>
                </Link>
              )}
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-white border-slate-300 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => {
                  logout();
                  showToast("Logged out");
                  router.push("/");
                }}
              >
                <LogOut size={14} />
                Logout
              </Button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-[220px_1fr] gap-4 sm:gap-6">
          {/* Tabs */}
          <aside className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2 h-fit flex md:block overflow-x-auto md:overflow-visible">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "flex-shrink-0 md:w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap",
                    active
                      ? "bg-navy text-white"
                      : "text-navy hover:bg-slate-100"
                  )}
                >
                  <Icon size={16} />
                  {t.label}
                </button>
              );
            })}
          </aside>

          {/* Panel */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 text-navy">
            {tab === "profile" && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-black text-navy">Profile details</h2>
                  {!editing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-white text-navy border-slate-300 hover:bg-slate-100 hover:text-navy"
                      onClick={() => setEditing(true)}
                    >
                      <Pencil size={14} />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 bg-white text-navy border-slate-300 hover:bg-slate-100 hover:text-navy"
                        onClick={() => {
                          setForm({ name: user.name, phone: user.phone ?? "" });
                          setEditing(false);
                        }}
                      >
                        <X size={14} />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="gap-2 bg-navy hover:bg-blue text-white"
                        onClick={saveProfile}
                      >
                        <Save size={14} />
                        Save
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <Field icon={UserIcon} label="Full name">
                    {editing ? (
                      <Input
                        value={form.name}
                        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                        className="text-navy border-slate-300 placeholder:text-slate-400"
                      />
                    ) : (
                      <p className="text-sm font-medium text-navy">{user.name}</p>
                    )}
                  </Field>

                  <Field icon={Mail} label="Email">
                    <p className="text-sm font-medium text-navy">{user.email}</p>
                    <p className="text-[11px] text-slate-500">Email cannot be changed</p>
                  </Field>

                  <Field icon={Phone} label="Phone">
                    {editing ? (
                      <Input
                        type="tel"
                        placeholder="10-digit phone"
                        value={form.phone}
                        onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                        className="text-navy border-slate-300 placeholder:text-slate-400"
                      />
                    ) : (
                      <p className="text-sm font-medium text-navy">
                        {user.phone || (
                          <span className="text-slate-500 italic">Not set</span>
                        )}
                      </p>
                    )}
                  </Field>
                </div>
              </div>
            )}

            {tab === "orders" && (
              <div>
                <h2 className="text-lg font-black text-navy mb-1">Order history</h2>
                <p className="text-xs text-slate-600 mb-5">
                  Use the tracking ID below to follow up with the store on WhatsApp or by phone.
                </p>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                      <Package size={24} className="text-slate-500" />
                    </div>
                    <p className="text-sm font-semibold text-navy mb-1">No orders yet</p>
                    <p className="text-xs text-slate-600 mb-5">
                      Once you place an order it will appear here.
                    </p>
                    <Link href="/products">
                      <Button className="bg-navy hover:bg-blue text-white">
                        Start shopping
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {orders
                      .slice()
                      .sort((a, b) => b.createdAt - a.createdAt)
                      .map((o) => {
                        const statusKey = o.status ?? "pending";
                        return (
                          <li
                            key={o.id}
                            className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">
                                  Tracking ID
                                </p>
                                <p className="font-mono font-bold text-sm text-navy break-all">
                                  {o.id}
                                </p>
                                <p className="text-xs text-slate-600 mt-1">
                                  {new Date(o.createdAt).toLocaleString("en-IN")} ·{" "}
                                  {o.items.length} item{o.items.length === 1 ? "" : "s"}
                                  {o.txnId && (
                                    <>
                                      {" · "}
                                      Txn{" "}
                                      <span className="font-mono">{o.txnId}</span>
                                    </>
                                  )}
                                </p>
                              </div>
                              <div className="flex items-center gap-3 flex-shrink-0">
                                <span
                                  className={cn(
                                    "text-[11px] font-bold px-2 py-1 rounded-full uppercase tracking-wide",
                                    STATUS_STYLE[statusKey] ?? "bg-slate-100 text-navy"
                                  )}
                                >
                                  {STATUS_LABEL[statusKey] ?? statusKey}
                                </span>
                                <span className="font-black text-navy">
                                  {formatPrice(o.total)}
                                </span>
                              </div>
                            </div>
                            <ul className="text-xs text-slate-600 space-y-0.5 pl-3 border-l-2 border-slate-200">
                              {o.items.map((it) => (
                                <li key={`${o.id}-${it.id}`}>
                                  {it.name} × {it.qty} —{" "}
                                  <span className="font-semibold text-navy">
                                    {formatPrice(it.price * it.qty)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </li>
                        );
                      })}
                  </ul>
                )}
              </div>
            )}

            {tab === "address" && (
              <div>
                <h2 className="text-lg font-black text-navy mb-5">Saved delivery address</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-navy mb-1 block">Address line 1</label>
                    <Input
                      value={address.line1}
                      onChange={(e) =>
                        setAddress((p) => ({ ...p, line1: e.target.value }))
                      }
                      placeholder="House no, street"
                      className="text-navy border-slate-300 placeholder:text-slate-400"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-navy mb-1 block">Address line 2</label>
                    <Input
                      value={address.line2}
                      onChange={(e) =>
                        setAddress((p) => ({ ...p, line2: e.target.value }))
                      }
                      placeholder="Area, landmark"
                      className="text-navy border-slate-300 placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-navy mb-1 block">City</label>
                    <Input
                      value={address.city}
                      onChange={(e) =>
                        setAddress((p) => ({ ...p, city: e.target.value }))
                      }
                      className="text-navy border-slate-300 placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-navy mb-1 block">State</label>
                    <Input
                      value={address.state}
                      onChange={(e) =>
                        setAddress((p) => ({ ...p, state: e.target.value }))
                      }
                      className="text-navy border-slate-300 placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-navy mb-1 block">Pincode</label>
                    <Input
                      value={address.pincode}
                      onChange={(e) =>
                        setAddress((p) => ({ ...p, pincode: e.target.value }))
                      }
                      inputMode="numeric"
                      maxLength={6}
                      className="text-navy border-slate-300 placeholder:text-slate-400"
                    />
                  </div>
                </div>
                <div className="mt-5 flex justify-end">
                  <Button
                    onClick={saveAddress}
                    disabled={savingAddr}
                    className="bg-navy hover:bg-blue text-white gap-2"
                  >
                    <Save size={14} />
                    Save address
                  </Button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
        <Icon size={16} className="text-navy" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1">
          {label}
        </p>
        {children}
      </div>
    </div>
  );
}
