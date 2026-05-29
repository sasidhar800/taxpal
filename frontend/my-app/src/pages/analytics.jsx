import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import Layout from "../components/Layout";
import { useLanguage } from "../context/LanguageContext";
import api from "../utils/api";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";

import { motion } from "framer-motion";

const fallbackBarData = [
  { name: "Jan", income: 4000, expense: 2400 },
  { name: "Feb", income: 3000, expense: 1398 },
  { name: "Mar", income: 5000, expense: 2000 },
  { name: "Apr", income: 4780, expense: 2500 },
  { name: "May", income: 5890, expense: 3000 },
];

const fallbackPieData = [
  { name: "Food", value: 400 },
  { name: "Transport", value: 300 },
  { name: "Shopping", value: 300 },
  { name: "Other", value: 200 },
];

const fallbackGrowthData = [
  { month: "Jan", users: 30 },
  { month: "Feb", users: 45 },
  { month: "Mar", users: 60 },
  { month: "Apr", users: 90 },
  { month: "May", users: 120 },
];

function Analytics() {
  const { t } = useLanguage();
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    api
      .get("/stats")
      .then((res) => {
        if (isMounted) {
          setStatsData(res.data);
        }
      })
      .catch((error) => {
        console.log(error);
        toast.error(error.response?.data?.message || "Failed to load analytics");
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);
  // =========================
  // Data
  // =========================
  const COLORS = ["#22c55e", "#3b82f6", "#eab308", "#ef4444"];

  const barData = useMemo(
    () =>
      statsData?.monthlyData?.length
        ? statsData.monthlyData.map((item) => ({
            name: item.month,
            income: item.income,
            expense: item.expense,
          }))
        : fallbackBarData,
    [statsData]
  );

  const pieData = useMemo(
    () =>
      statsData?.expenseBreakdown?.length
        ? statsData.expenseBreakdown
        : fallbackPieData,
    [statsData]
  );

  const growthData = useMemo(
    () =>
      statsData?.monthlyData?.length
        ? statsData.monthlyData.map((item, index) => ({
            month: item.month,
            users: index + 1,
          }))
        : fallbackGrowthData,
    [statsData]
  );

  const totalIncome = Number(statsData?.income || 100000);
  const totalExpense = Number(statsData?.expense || 50000);
  const balance = Number(statsData?.balance ?? totalIncome - totalExpense);
  const savingsRate = totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0;

  const stats = [
    {
      title: "Total Income",
      value: `INR ${totalIncome.toLocaleString("en-IN")}`,
      change: "+12% growth",
      tone: "text-emerald-300",
      bg: "from-emerald-500/20 to-emerald-500/5",
      border: "border-emerald-400/20",
    },
    {
      title: "Total Expense",
      value: `INR ${totalExpense.toLocaleString("en-IN")}`,
      change: "+5% increase",
      tone: "text-rose-300",
      bg: "from-rose-500/20 to-rose-500/5",
      border: "border-rose-400/20",
    },
    {
      title: "Balance",
      value: `INR ${balance.toLocaleString("en-IN")}`,
      change: "Stable balance",
      tone: "text-cyan-300",
      bg: "from-cyan-500/20 to-cyan-500/5",
      border: "border-cyan-400/20",
    },
    {
      title: "Savings Rate",
      value: `${savingsRate}%`,
      change: "Excellent",
      tone: "text-fuchsia-300",
      bg: "from-fuchsia-500/20 to-fuchsia-500/5",
      border: "border-fuchsia-400/20",
    },
  ];

  const insights = [
    { label: "Monthly Revenue", value: `INR ${Math.round(totalIncome / Math.max(barData.length, 1)).toLocaleString("en-IN")}`, caption: "Average income" },
    { label: "Cash Flow", value: `INR ${balance.toLocaleString("en-IN")}`, caption: "Net flow" },
    { label: "Active Users", value: String(statsData?.users || 0), caption: loading ? "Loading" : "Latest count" },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: (index) => ({
      opacity: 1,
      y: 0,
      transition: { delay: index * 0.08, duration: 0.45 },
    }),
  };

  const tooltipStyle = {
    background: "#020617",
    border: "1px solid rgba(148, 163, 184, 0.25)",
    borderRadius: "12px",
    color: "#e2e8f0",
    boxShadow: "0 20px 45px rgba(2, 6, 23, 0.45)",
  };

  return (
    <Layout>
      <div className="min-h-screen overflow-hidden bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-5 lg:mb-10 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-3 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1 text-sm font-medium text-cyan-200">
                {t("financeAnalytics")}
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                {t("analyticsOverview")}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                Monitor income, expenses, savings, and business growth from one
                clean financial dashboard.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 shadow-2xl shadow-slate-950/30 backdrop-blur">
              {insights.map((item) => (
                <div
                  key={item.label}
                  className="min-w-0 rounded-xl bg-slate-900/70 px-3 py-3 text-center"
                >
                  <p className="truncate text-xs text-slate-500">
                    {item.label}
                  </p>
                  <p className="mt-1 truncate text-base font-bold text-white sm:text-lg">
                    {item.value}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {item.caption}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ y: -6, scale: 1.01 }}
                className={`group relative overflow-hidden rounded-2xl border ${stat.border} bg-gradient-to-br ${stat.bg} p-5 shadow-xl shadow-slate-950/25 transition-all duration-300 hover:shadow-2xl`}
              >
                <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-white/10 blur-3xl transition-opacity duration-300 group-hover:opacity-80" />

                <div className="relative">
                  <div className="mb-5 flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-400">
                      {stat.title}
                    </p>
                    <span className="h-2.5 w-2.5 rounded-full bg-current opacity-70" />
                  </div>

                  <h2 className={`text-3xl font-bold tracking-tight ${stat.tone}`}>
                    {stat.value}
                  </h2>

                  <p className="mt-4 text-sm font-medium text-slate-300">
                    {stat.change}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Charts */}
          <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
            {/* Bar Chart */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-2xl shadow-slate-950/30 backdrop-blur sm:p-6"
            >
              <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white sm:text-2xl">
                    Income vs Expense
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Monthly financial performance
                  </p>
                </div>

                <span className="w-fit rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                  +INR 50,000 net
                </span>
              </div>

              <div className="h-72 w-full sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                    <CartesianGrid stroke="#1e293b" vertical={false} />

                    <XAxis
                      dataKey="name"
                      stroke="#94a3b8"
                      tickLine={false}
                      axisLine={false}
                    />

                    <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />

                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(148, 163, 184, 0.08)" }} />

                    <Legend iconType="circle" wrapperStyle={{ color: "#cbd5e1" }} />

                    <Bar
                      dataKey="income"
                      fill="#22c55e"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={42}
                    />

                    <Bar
                      dataKey="expense"
                      fill="#ef4444"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={42}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Pie Chart */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-2xl shadow-slate-950/30 backdrop-blur sm:p-6"
            >
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white sm:text-2xl">
                  Expense Breakdown
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Category-wise spending distribution
                </p>
              </div>

              <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[minmax(0,1fr)_180px]">
                <div className="h-72 min-w-0 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        outerRadius="78%"
                        innerRadius="48%"
                        paddingAngle={4}
                        labelLine={false}
                        label={({ name }) => name}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={entry.name} fill={COLORS[index]} />
                        ))}
                      </Pie>

                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
                  {pieData.map((item, index) => (
                    <div
                      key={item.name}
                      className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/60 p-3"
                    >
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: COLORS[index] }}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-200">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          INR {item.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Growth Chart */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            whileHover={{ y: -4 }}
            className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-2xl shadow-slate-950/30 backdrop-blur sm:p-6"
          >
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-white sm:text-2xl">
                  User Growth
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Customer growth trend over time
                </p>
              </div>

              <span className="w-fit rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                4x since January
              </span>
            </div>

            <div className="h-72 w-full sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke="#1e293b" vertical={false} />

                  <XAxis
                    dataKey="month"
                    stroke="#94a3b8"
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />

                  <Tooltip contentStyle={tooltipStyle} />

                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#06b6d4"
                    strokeWidth={4}
                    animationDuration={1500}
                    dot={{
                      r: 5,
                      fill: "#06b6d4",
                      stroke: "#0f172a",
                      strokeWidth: 2,
                    }}
                    activeDot={{
                      r: 7,
                      fill: "#67e8f9",
                      stroke: "#0f172a",
                      strokeWidth: 3,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}

export default Analytics;
