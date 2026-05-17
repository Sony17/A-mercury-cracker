"use client";

import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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

const SALES_TREND = [
  { day: "Mon", revenue: 6400, orders: 12 },
  { day: "Tue", revenue: 8100, orders: 15 },
  { day: "Wed", revenue: 7200, orders: 13 },
  { day: "Thu", revenue: 11200, orders: 21 },
  { day: "Fri", revenue: 14800, orders: 28 },
  { day: "Sat", revenue: 18600, orders: 34 },
  { day: "Sun", revenue: 17950, orders: 31 },
];

const CATEGORY_SPLIT = [
  { name: "Sparklers", value: 32 },
  { name: "Flower Pots", value: 24 },
  { name: "Chakkar", value: 18 },
  { name: "Sky Shots", value: 14 },
  { name: "Bombs", value: 12 },
];

const CATEGORY_COLORS = [COLORS.saffron, COLORS.gold, COLORS.navy, COLORS.sky, COLORS.plum];

const TOP_PRODUCTS = [
  { name: "Family Diwali Combo", sold: 84 },
  { name: "Sky Shot 25", sold: 67 },
  { name: "Kids Safe Edition", sold: 58 },
  { name: "Flower Pot Deluxe", sold: 49 },
  { name: "Anaar Special", sold: 41 },
];

const ORDER_STATUS = [
  { name: "Delivered", value: 96, color: COLORS.green },
  { name: "Dispatched", value: 28, color: COLORS.saffron },
  { name: "Pending", value: 14, color: COLORS.gold },
  { name: "Cancelled", value: 5, color: COLORS.red },
];

const tooltipStyle = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  fontSize: "12px",
  fontWeight: 600,
  color: "#1f2937",
};

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
      className={`bg-white rounded-2xl border border-border shadow-sm p-5 ${className}`}
    >
      <div className="mb-4">
        <h3 className="font-bold text-navy text-sm">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </motion.div>
  );
}

export default function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Revenue trend — big card */}
      <ChartCard
        title="Weekly Revenue"
        subtitle="Revenue & order count over the last 7 days"
        delay={0.05}
        className="lg:col-span-2"
      >
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={SALES_TREND} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
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
      </ChartCard>

      {/* Category pie */}
      <ChartCard title="Sales by Category" subtitle="Share of units sold this month" delay={0.1}>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={CATEGORY_SPLIT}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={85}
                paddingAngle={2}
                dataKey="value"
              >
                {CATEGORY_SPLIT.map((_, i) => (
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
      </ChartCard>

      {/* Top products bar */}
      <ChartCard title="Top Products" subtitle="Units sold this week" delay={0.15} className="lg:col-span-2">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={TOP_PRODUCTS} layout="vertical" margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
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
                {TOP_PRODUCTS.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? COLORS.saffron : i === 1 ? COLORS.navy : COLORS.gold} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Order status pie */}
      <ChartCard title="Order Status" subtitle="Live order pipeline" delay={0.2}>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={ORDER_STATUS}
                cx="50%"
                cy="50%"
                outerRadius={85}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={false}
                style={{ fontSize: 10, fontWeight: 600 }}
              >
                {ORDER_STATUS.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

    </div>
  );
}
