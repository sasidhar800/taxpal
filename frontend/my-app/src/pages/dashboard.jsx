import Layout from "../components/Layout";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import {
  clearAuthSession,
  getGoogleUser,
  getToken,
} from "../utils/auth";
import api from "../utils/api";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import { motion } from "framer-motion";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import {
  Activity,
  ArrowUpRight,
  CreditCard,
  Download,
  IndianRupee,
  ReceiptText,
  Target,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

const MotionMain = motion.main;
const MotionDiv = motion.div;

const fallbackAnalyticsData = [
  { month: "Jan", income: 40000, expense: 15000 },
  { month: "Feb", income: 45000, expense: 18000 },
  { month: "Mar", income: 50000, expense: 20000 },
  { month: "Apr", income: 55000, expense: 22000 },
  { month: "May", income: 60000, expense: 25000 },
  { month: "Jun", income: 75000, expense: 30000 },
];

const fallbackRevenueData = [
  { month: "Jan", revenue: 12000 },
  { month: "Feb", revenue: 18000 },
  { month: "Mar", revenue: 15000 },
  { month: "Apr", revenue: 25000 },
  { month: "May", revenue: 22000 },
  { month: "Jun", revenue: 32000 },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

function Dashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [monthlyBudget] = useState(50000);
  const [stats, setStats] = useState({
    users: 0,
    revenue: 0,
    orders: 0,
    income: 0,
    expense: 0,
    balance: 0,
    monthlyData: [],
    expenseBreakdown: [],
    recentTransactions: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getToken();
        const googleUser = getGoogleUser();

        if (!token && !googleUser) {
          clearAuthSession();
          navigate("/", {
            replace: true,
          });
          return;
        }

        if (token && !googleUser) {
          await api.get("/protected");
        }

        const res = await api.get("/stats");
        setStats(res.data);
        setLoading(false);
      } catch (error) {
        console.log(error);
        toast.error(error.response?.data?.message || "Failed to load dashboard");
        clearAuthSession();
        navigate("/", {
          replace: true,
        });
      }
    };

    fetchData();
  }, [navigate]);

  const transactions = stats.recentTransactions || [];
  const analyticsData =
    stats.monthlyData?.length > 0 ? stats.monthlyData : fallbackAnalyticsData;
  const revenueData =
    stats.monthlyData?.length > 0
      ? stats.monthlyData.map((item) => ({
          month: item.month,
          revenue: item.revenue,
        }))
      : fallbackRevenueData;
  const totalIncome = Number(stats.income || 0);
  const totalExpense = Number(stats.expense || 0);

  const budgetUsed = (totalExpense / monthlyBudget) * 100;
  const savings = totalIncome - totalExpense;
  const savingsGoal = 100000;
  const savingsProgress = (savings / savingsGoal) * 100;

  const pieData = [
    { name: "Income", value: totalIncome },
    { name: "Expense", value: totalExpense },
  ];

  const COLORS = ["#22c55e", "#f43f5e"];

  const statCards = [
    {
      title: "Total Users",
      value: stats.users,
      trend: "+12.4%",
      caption: "Active accounts",
      icon: Users,
      accent: "from-cyan-400 to-blue-500",
      color: "text-cyan-300",
    },
    {
      title: "Revenue",
      value: formatCurrency(stats.revenue),
      trend: "+18.2%",
      caption: "Monthly collected",
      icon: IndianRupee,
      accent: "from-emerald-400 to-teal-500",
      color: "text-emerald-300",
    },
    {
      title: "Orders",
      value: stats.orders,
      trend: "+7.8%",
      caption: "Completed filings",
      icon: ReceiptText,
      accent: "from-fuchsia-400 to-rose-500",
      color: "text-fuchsia-300",
    },
  ];

  const exportPDF = async () => {
    const input = document.getElementById("dashboard");

    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#020617",
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
    pdf.save("taxpal-dashboard-analytics.pdf");
    toast.success("Dashboard analytics exported");
  };

  const cardMotion = {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45 },
  };

  const chartTooltipStyle = {
    backgroundColor: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "14px",
    color: "#f8fafc",
    boxShadow: "0 20px 50px rgba(2, 6, 23, 0.35)",
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-center">
        <div className="space-y-5">
          <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-slate-800 border-t-cyan-400" />
          <p className="text-lg font-semibold tracking-wide text-cyan-200 sm:text-2xl">
            Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <MotionMain
        id="dashboard"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen overflow-hidden bg-slate-950 text-slate-100"
      >
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-5 shadow-2xl shadow-slate-950/40 sm:p-8">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
                  <Activity className="h-4 w-4" />
                  {t("financeOverview")}
                </div>

                <h1 className="max-w-4xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-6xl">
                  {t("financeDashboard")}
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                  Welcome back, Sasidhar. Track revenue, spending, savings, and
                  recent transactions from one polished workspace.
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row lg:items-center">
                <button
                  onClick={exportPDF}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-300 hover:shadow-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-slate-950"
                >
                  <Download className="h-4 w-4" />
                  Export PDF
                </button>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-6">
            {statCards.map((card, index) => {
              const Icon = card.icon;

              return (
                <MotionDiv
                  key={card.title}
                  {...cardMotion}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  whileHover={{ y: -6 }}
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-slate-950/30 backdrop-blur transition-all duration-300 hover:border-cyan-300/30 hover:bg-slate-900 sm:p-6"
                >
                  <div
                    className={`absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br ${card.accent} opacity-10 blur-2xl transition-opacity duration-300 group-hover:opacity-20`}
                  />

                  <div className="relative flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-400">
                        {card.title}
                      </p>
                      <h2
                        className={`mt-3 break-words text-3xl font-bold tracking-tight sm:text-4xl ${card.color}`}
                      >
                        {card.value}
                      </h2>
                    </div>

                    <div
                      className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${card.accent} text-white shadow-lg shadow-slate-950/20`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="relative mt-6 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                    <span className="text-sm text-slate-400">
                      {card.caption}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-bold text-emerald-300">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                      {card.trend}
                    </span>
                  </div>
                </MotionDiv>
              );
            })}
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">
            <MotionDiv
              {...cardMotion}
              className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-xl shadow-slate-950/30 backdrop-blur sm:p-6 xl:col-span-3"
            >
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
                    Revenue analytics
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                    Monthly performance
                  </h2>
                </div>
                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-200">
                  {formatCurrency(32000)} peak
                </div>
              </div>

              <div className="h-[320px] w-full sm:h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={revenueData}
                    margin={{ top: 10, right: 8, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="month"
                      stroke="#94a3b8"
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value / 1000}k`}
                    />
                    <Tooltip
                      contentStyle={chartTooltipStyle}
                      labelStyle={{ color: "#e2e8f0", fontWeight: 700 }}
                      formatter={(value) => [formatCurrency(value), "Revenue"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#22d3ee"
                      strokeWidth={4}
                      dot={{ r: 4, fill: "#22d3ee", strokeWidth: 0 }}
                      activeDot={{ r: 7, fill: "#67e8f9", strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </MotionDiv>

            <MotionDiv
              {...cardMotion}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-xl shadow-slate-950/30 backdrop-blur sm:p-6 xl:col-span-2"
            >
              <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
                  Cash flow
                </p>
                <h2 className="mt-2 text-2xl font-bold text-white">
                  Income vs expense
                </h2>
              </div>

              <div className="h-[320px] w-full sm:h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analyticsData}
                    margin={{ top: 10, right: 8, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="month"
                      stroke="#94a3b8"
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value / 1000}k`}
                    />
                    <Tooltip
                      contentStyle={chartTooltipStyle}
                      labelStyle={{ color: "#e2e8f0", fontWeight: 700 }}
                      formatter={(value, name) => [
                        formatCurrency(value),
                        name === "income" ? "Income" : "Expense",
                      ]}
                    />
                    <Bar
                      dataKey="income"
                      fill="#22c55e"
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar
                      dataKey="expense"
                      fill="#f43f5e"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </MotionDiv>
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <MotionDiv
              {...cardMotion}
              className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-xl shadow-slate-950/30 backdrop-blur sm:p-6 xl:col-span-2"
            >
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
                    Activity
                  </p>
                  <h2 className="mt-2 flex items-center gap-2 text-2xl font-bold text-white">
                    <CreditCard className="h-6 w-6 text-cyan-300" />
                    Recent Transactions
                  </h2>
                </div>
                <span className="w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300">
                  {transactions.length} records
                </span>
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/10">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] border-collapse text-left">
                    <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.16em] text-slate-400">
                      <tr>
                        <th className="px-5 py-4 font-semibold">Name</th>
                        <th className="px-5 py-4 font-semibold">Type</th>
                        <th className="px-5 py-4 font-semibold">Status</th>
                        <th className="px-5 py-4 font-semibold">Amount</th>
                        <th className="px-5 py-4 font-semibold">Date</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-white/10">
                      {transactions.map((item, index) => (
                        <tr
                          key={`${item.name}-${index}`}
                          className="group transition-colors duration-200 hover:bg-white/[0.04]"
                        >
                          <td className="px-5 py-4">
                            <div className="font-semibold text-white">
                              {item.name}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ${
                                item.type === "income"
                                  ? "bg-emerald-400/10 text-emerald-300"
                                  : "bg-rose-400/10 text-rose-300"
                              }`}
                            >
                              {item.type}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                                item.status === "Completed"
                                  ? "bg-cyan-400/10 text-cyan-300"
                                  : "bg-amber-400/10 text-amber-300"
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>

                          <td className="px-5 py-4 font-bold text-slate-100">
                            {formatCurrency(item.amount)}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-400">
                            {item.date}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </MotionDiv>

            <MotionDiv
              {...cardMotion}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-xl shadow-slate-950/30 backdrop-blur sm:p-6"
            >
              <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-fuchsia-300">
                  Split
                </p>
                <h2 className="mt-2 text-2xl font-bold text-white">
                  Income vs Expense
                </h2>
              </div>

              <div className="h-[290px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={96}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={entry.name} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={chartTooltipStyle}
                      formatter={(value, name) => [
                        formatCurrency(value),
                        name,
                      ]}
                    />
                    <Legend
                      iconType="circle"
                      wrapperStyle={{ color: "#cbd5e1", fontSize: 13 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Income
                  </p>
                  <p className="mt-2 text-lg font-bold text-emerald-300">
                    {formatCurrency(totalIncome)}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Expense
                  </p>
                  <p className="mt-2 text-lg font-bold text-rose-300">
                    {formatCurrency(totalExpense)}
                  </p>
                </div>
              </div>
            </MotionDiv>
          </section>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <MotionDiv
              {...cardMotion}
              className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-slate-950/30 backdrop-blur sm:p-6"
            >
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
                    Budget
                  </p>
                  <h2 className="mt-2 flex items-center gap-2 text-2xl font-bold text-white">
                    <Wallet className="h-6 w-6 text-cyan-300" />
                    Budget Tracker
                  </h2>
                </div>
                <span className="rounded-2xl bg-cyan-400/10 px-3 py-2 text-sm font-bold text-cyan-200">
                  {budgetUsed.toFixed(1)}%
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-slate-400">Monthly Budget</span>
                  <span className="font-bold text-cyan-200">
                    {formatCurrency(monthlyBudget)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-slate-400">Total Expense</span>
                  <span className="font-bold text-rose-300">
                    {formatCurrency(totalExpense)}
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                  <MotionDiv
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(budgetUsed, 100)}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                  />
                </div>

                <p className="text-sm leading-6 text-slate-400">
                  You have used {budgetUsed.toFixed(1)}% of this month's budget.
                </p>
              </div>
            </MotionDiv>

            <MotionDiv
              {...cardMotion}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-slate-950/30 backdrop-blur sm:p-6"
            >
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
                    Savings
                  </p>
                  <h2 className="mt-2 flex items-center gap-2 text-2xl font-bold text-white">
                    <Target className="h-6 w-6 text-emerald-300" />
                    Savings Goal
                  </h2>
                </div>
                <span className="rounded-2xl bg-emerald-400/10 px-3 py-2 text-sm font-bold text-emerald-200">
                  {savingsProgress.toFixed(1)}%
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-slate-400">Goal</span>
                  <span className="font-bold text-cyan-200">
                    {formatCurrency(savingsGoal)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-slate-400">Current Savings</span>
                  <span className="font-bold text-emerald-300">
                    {formatCurrency(savings)}
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                  <MotionDiv
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(savingsProgress, 100)}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                  />
                </div>

                <p className="text-sm leading-6 text-slate-400">
                  You are {savingsProgress.toFixed(1)}% closer to your savings
                  goal.
                </p>
              </div>
            </MotionDiv>
          </section>
        </div>
      </MotionMain>
    </Layout>
  );
}

export default Dashboard;
