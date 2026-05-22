"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useStore } from "@/lib/store";

const COLORS = {
  navy: "#7c2d12",
  saffron: "#ea580c",
  gold: "#facc15",
  ivory: "#fff7ed",
  green: "#16a34a",
  red: "#dc2626",
  sky: "#0284c7",
  plum: "#7e22ce",
};

const CATEGORY_COLORS = [COLORS.saffron, COLORS.gold, COLORS.navy, COLORS.sky, COLORS.plum];

const tooltipStyle = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  fontSize: "12px",
  fontWeight: 600,
  color: "#1f2937",
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function ChartCard({
  title,
  subtitle,
  children,
  delay = 0,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`bg-white rounded-2xl border border-border shadow-sm p-5 min-w-0 ${className}`}
    >
      <div className="mb-4">
        <h3 className="font-bold text-navy text-sm">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </motion.div>
  );
}

function EmptyState({ msg }: { msg: string }) {
  return (
    <div className="h-64 flex items-center justify-center text-xs text-muted-foreground">
      {msg}
    </div>
  );
}

export default function DashboardCharts() {
  const { orders, products } = useStore();

  const safeOrders = useMemo(
    () => orders.filter((o): o is NonNullable<typeof o> => Boolean(o)),
    [orders],
  );

  const salesTrend = useMemo(() => {
    const now = new Date();
    const buckets: { day: string; revenue: number; orders: number; key: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      buckets.push({ day: DAY_LABELS[d.getDay()], revenue: 0, orders: 0, key });
    }
    safeOrders
      .filter((o) => o.status !== "cancelled")
      .forEach((o) => {
        if (!o.createdAt) return;
        const key = new Date(o.createdAt).toISOString().slice(0, 10);
        const bucket = buckets.find((b) => b.key === key);
        if (bucket) {
          bucket.revenue += typeof o.total === "number" ? o.total : 0;
          bucket.orders += 1;
        }
      });
    return buckets;
  }, [safeOrders]);

  const categorySplit = useMemo(() => {
    const productById = new Map(products.map((p) => [p.id, p]));
    const totals = new Map<string, number>();
    safeOrders
      .filter((o) => o.status !== "cancelled")
      .forEach((o) => {
        (o.items ?? []).forEach((line) => {
          if (!line) return;
          const cat =
            typeof line.id === "number" ? productById.get(line.id)?.cat ?? "Other" : "Bundle";
          totals.set(cat, (totals.get(cat) ?? 0) + (line.qty ?? 0));
        });
      });
    const totalQty = Array.from(totals.values()).reduce((s, v) => s + v, 0);
    if (totalQty === 0) return [];
    return Array.from(totals.entries())
      .map(([name, qty]) => ({ name, value: Math.round((qty / totalQty) * 100) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [safeOrders, products]);

  const topProducts = useMemo(() => {
    const totals = new Map<string, number>();
    safeOrders
      .filter((o) => o.status !== "cancelled")
      .forEach((o) => {
        (o.items ?? []).forEach((line) => {
          if (!line?.name) return;
          totals.set(line.name, (totals.get(line.name) ?? 0) + (line.qty ?? 0));
        });
      });
    return Array.from(totals.entries())
      .map(([name, sold]) => ({ name, sold }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);
  }, [safeOrders]);

  const orderStatus = useMemo(() => {
    const counts = { delivered: 0, dispatched: 0, pending: 0, cancelled: 0 };
    safeOrders.forEach((o) => {
      if (o.status && o.status in counts) counts[o.status] += 1;
    });
    return [
      { name: "Delivered", value: counts.delivered, color: COLORS.green },
      { name: "Dispatched", value: counts.dispatched, color: COLORS.saffron },
      { name: "Pending", value: counts.pending, color: COLORS.gold },
      { name: "Cancelled", value: counts.cancelled, color: COLORS.red },
    ].filter((s) => s.value > 0);
  }, [orders]);

  const hasOrders = safeOrders.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <ChartCard
        title="Weekly Revenue"
        subtitle="Revenue from live orders over the last 7 days"
        delay={0.05}
        className="lg:col-span-2"
      >
        {hasOrders ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={salesTrend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.saffron} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={COLORS.saffron} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => `₹${Number(v).toLocaleString("en-IN")}`} />
                <Area type="monotone" dataKey="revenue" stroke={COLORS.saffron} strokeWidth={2.5} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState msg="No orders yet — chart will populate as orders come in." />
        )}
      </ChartCard>

      <ChartCard title="Sales by Category" subtitle="Share of units sold from live orders" delay={0.1}>
        {categorySplit.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={categorySplit}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categorySplit.map((_, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v}%`} />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11, fontWeight: 600 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState msg="No order line items yet." />
        )}
      </ChartCard>

      <ChartCard title="Top Products" subtitle="Units sold across all live orders" delay={0.15} className="lg:col-span-2">
        {topProducts.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={topProducts} layout="vertical" margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#1f2937", fontWeight: 600 }}
                  tickLine={false}
                  axisLine={false}
                  width={140}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="sold" radius={[0, 8, 8, 0]}>
                  {topProducts.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? COLORS.saffron : i === 1 ? COLORS.navy : COLORS.gold} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState msg="No products sold yet." />
        )}
      </ChartCard>

      <ChartCard title="Order Status" subtitle="Live order pipeline" delay={0.2}>
        {orderStatus.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={orderStatus}
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                  style={{ fontSize: 10, fontWeight: 600 }}
                >
                  {orderStatus.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState msg="No orders yet." />
        )}
      </ChartCard>
    </div>
  );
}
