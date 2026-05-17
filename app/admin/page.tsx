"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import AdminSidebar from "@/components/admin/AdminSidebar";
import StatsGrid from "@/components/admin/StatsGrid";
import ProductTable from "@/components/admin/ProductTable";
import PolicyEditor from "@/components/admin/PolicyEditor";
import QuickQuestionsEditor from "@/components/admin/QuickQuestionsEditor";
import SettingsEditor from "@/components/admin/SettingsEditor";
import B2BInquiriesEditor from "@/components/admin/B2BInquiriesEditor";
import DashboardCharts from "@/components/admin/DashboardCharts";
import HeroSlidesEditor from "@/components/admin/HeroSlidesEditor";
import BundlesEditor from "@/components/admin/BundlesEditor";
import MediaEditor from "@/components/admin/MediaEditor";
import OrdersEditor from "@/components/admin/OrdersEditor";
import CustomerEnquiriesEditor from "@/components/admin/CustomerEnquiriesEditor";
import SubscribersEditor from "@/components/admin/SubscribersEditor";
import { Button } from "@/components/ui/button";
import { Menu, X, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminPage() {
  const { user, setAuthOpen } = useStore();
  const [tab, setTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-16 h-16 rounded-2xl bg-navy/10 flex items-center justify-center">
          <Lock size={28} className="text-navy" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-black text-navy mb-2">Admin Access Required</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Please login with admin credentials to access the dashboard.
          </p>
        </div>
        <Button
          className="bg-navy hover:bg-blue text-white font-bold px-8"
          onClick={() => setAuthOpen(true)}
        >
          Login as Admin
        </Button>
        <p className="text-xs text-muted-foreground">
          Credentials: admin@amercurycrackers.com / admin123
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-9rem)] md:h-[calc(100dvh-5rem)] bg-cream overflow-hidden">
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed lg:relative inset-y-0 left-0 z-40 transition-transform duration-300 lg:translate-x-0 flex-shrink-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <AdminSidebar active={tab} onChange={(t) => { setTab(t); setSidebarOpen(false); }} />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <div className="bg-white border-b border-border px-5 py-3 flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg bg-cream text-navy"
          >
            <Menu size={16} />
          </button>
          <div>
            <h1 className="font-black text-navy capitalize">{tab}</h1>
            <p className="text-xs text-muted-foreground">Welcome back, {user.name}</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5">
          {tab === "dashboard" && (
            <div className="space-y-6">
              <StatsGrid />
              <DashboardCharts />
            </div>
          )}

          {tab === "hero" && <HeroSlidesEditor />}

          {tab === "products" && (
            <div>
              <div className="mb-5">
                <h2 className="text-lg font-black text-navy">Product Management</h2>
                <p className="text-sm text-muted-foreground">Add, edit, and manage your cracker inventory</p>
              </div>
              <ProductTable />
            </div>
          )}

          {tab === "bundles" && <BundlesEditor />}

          {tab === "media" && <MediaEditor />}

          {tab === "policies" && <PolicyEditor />}

          {tab === "chatbot" && <QuickQuestionsEditor />}

          {tab === "settings" && <SettingsEditor />}

          {tab === "b2b" && <B2BInquiriesEditor />}

          {tab === "orders" && <OrdersEditor />}

          {tab === "customers" && <CustomerEnquiriesEditor />}

          {tab === "subscribers" && <SubscribersEditor />}
        </div>
      </div>
    </div>
  );
}
