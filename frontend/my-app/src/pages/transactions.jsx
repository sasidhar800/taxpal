import React, { useState, useMemo, useEffect } from "react";
import Layout from "../components/Layout";
import { useLanguage } from "../context/LanguageContext";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import api from "../utils/api";
import { motion } from "framer-motion";
import {
  Pencil,
  Trash2,
  Plus,
  Search,
  Wallet,
  TrendingUp,
  TrendingDown,
  Filter,
  CalendarDays,
  Tag,
  IndianRupee,
  Download,
} from "lucide-react";

function Transactions() {
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState([]);

  const [form, setForm] = useState({
    name: "",
    type: "income",
    amount: "",
    category: "",
    date: "",
  });

  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.get("/transactions");
      setTransactions(res.data);
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const transactionData = {
        ...form,
        amount: Number(form.amount),
        date: String(form.date),
      };

      if (editId) {
        await api.put(
          `/transactions/${editId}`,
          transactionData
        );

        toast.success("Transaction updated");
        setEditId(null);
      } else {
        await api.post(
          "/transactions",
          transactionData
        );

        toast.success("Transaction added");
      }

      fetchTransactions();

      setForm({
        name: "",
        type: "income",
        amount: "",
        category: "",
        date: "",
      });
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this transaction?");

    if (!confirmDelete) return;

    try {
      await api.delete(`/transactions/${id}`);

      fetchTransactions();
      toast.success("Transaction deleted");
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  const formatDateForInput = (date) => {
    if (!date) return "";
    return String(date).slice(0, 10);
  };

  const handleEdit = (t) => {
    setForm({
      name: t.name,
      type: t.type,
      amount: t.amount,
      category: t.category,
      date: formatDateForInput(t.date),
    });

    setEditId(t._id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        t.name?.toLowerCase().includes(searchText) ||
        t.category?.toLowerCase().includes(searchText);

      const matchesType = typeFilter === "all" || t.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [transactions, search, typeFilter]);

  const totalIncome = useMemo(() => {
    return transactions
      .filter((t) => t.type === "income")
      .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  }, [transactions]);

  const totalExpense = useMemo(() => {
    return transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  }, [transactions]);

  const balance = totalIncome - totalExpense;

  const formatCurrency = (value) => {
    return `INR ${Number(value || 0).toLocaleString("en-IN")}`;
  };

  const exportPDF = async () => {
    const input = document.getElementById("transactions-report");

    if (!input) {
      return;
    }

    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#020617",
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 10;

    pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 10;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save("taxpal-transactions-report.pdf");
    toast.success("Transactions report exported");
  };

  const formatDisplayDate = (date) => {
    if (!date) return "";

    const formattedDate = new Date(date);

    if (Number.isNaN(formattedDate.getTime())) {
      return date;
    }

    return formattedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Layout>
      <div id="transactions-report" className="min-h-screen bg-slate-950 px-4 py-5 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-cyan-400">
                {t("financeOverview")}
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                {t("transactionsTitle")}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                Track income, expenses, categories, and cash flow in one clean
                workspace.
              </p>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-5 py-4 shadow-2xl shadow-slate-950/40">
              <p className="text-sm text-slate-400">{t("currentBalance")}</p>

              <p
                className={`mt-1 text-3xl font-bold ${
                  balance >= 0 ? "text-cyan-300" : "text-red-300"
                }`}
              >
                {formatCurrency(balance)}
              </p>
              <button
                type="button"
                onClick={exportPDF}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
              >
                <Download size={16} />
                {t("downloadPdf")}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <motion.div
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-slate-900 to-slate-900/70 p-5 shadow-xl shadow-slate-950/40 transition-all duration-300 hover:border-cyan-400/50"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400">{t("balance")}</p>

                  <h2 className="mt-2 text-2xl font-bold text-cyan-300 sm:text-3xl">
                    {formatCurrency(balance)}
                  </h2>
                </div>

                <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
                  <Wallet size={28} />
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-slate-900 to-slate-900/70 p-5 shadow-xl shadow-slate-950/40 transition-all duration-300 hover:border-emerald-400/50"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400">{t("income")}</p>

                  <h2 className="mt-2 text-2xl font-bold text-emerald-300 sm:text-3xl">
                    {formatCurrency(totalIncome)}
                  </h2>
                </div>

                <div className="rounded-2xl bg-emerald-400/10 p-3 text-emerald-300">
                  <TrendingUp size={28} />
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-red-400/20 bg-gradient-to-br from-slate-900 to-slate-900/70 p-5 shadow-xl shadow-slate-950/40 transition-all duration-300 hover:border-red-400/50"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400">{t("expenses")}</p>

                  <h2 className="mt-2 text-2xl font-bold text-red-300 sm:text-3xl">
                    {formatCurrency(totalExpense)}
                  </h2>
                </div>

                <div className="rounded-2xl bg-red-400/10 p-3 text-red-300">
                  <TrendingDown size={28} />
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-slate-950/40 sm:p-6"
          >
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-cyan-400/10 p-2 text-cyan-300">
                  <Plus size={22} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-white sm:text-2xl">
                    {editId ? "Edit Transaction" : t("addTransaction")}
                  </h2>

                  <p className="text-sm text-slate-400">
                    Enter transaction details below
                  </p>
                </div>
              </div>

              {editId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditId(null);
                    setForm({
                      name: "",
                      type: "income",
                      amount: "",
                      category: "",
                      date: "",
                    });
                  }}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition-all duration-300 hover:border-slate-500 hover:bg-slate-800"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5"
            >
              <input
                type="text"
                name="name"
                placeholder="Transaction name"
                value={form.name}
                onChange={handleChange}
                required
                className="h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-300 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />

              <div className="relative">
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="h-12 w-full appearance-none rounded-xl border border-slate-700 bg-slate-950 px-4 pr-10 text-sm text-white outline-none transition-all duration-300 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>

                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs text-slate-400">
                  ▼
                </div>
              </div>

              <input
                type="number"
                name="amount"
                placeholder="Amount"
                value={form.amount}
                onChange={handleChange}
                required
                className="h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-300 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />

              <input
                type="text"
                name="category"
                placeholder="Category"
                value={form.category}
                onChange={handleChange}
                required
                className="h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-300 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />

              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
                className="h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-sm text-white [color-scheme:dark] outline-none transition-all duration-300 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />

              <button
                type="submit"
                className="h-12 rounded-xl bg-cyan-400 px-5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-300 hover:shadow-cyan-500/30 md:col-span-2 xl:col-span-5"
              >
                {editId ? "Update Transaction" : t("addTransaction")}
              </button>
            </form>
          </motion.div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-2xl shadow-slate-950/40 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Transaction History
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  {filteredTransactions.length} transaction
                  {filteredTransactions.length === 1 ? "" : "s"} found
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
                <div className="relative w-full sm:min-w-80">
                  <Search
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    size={18}
                  />

                  <input
                    type="text"
                    placeholder="Search by name or category..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-12 w-full rounded-xl border border-slate-700 bg-slate-950 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-300 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  />
                </div>

                <div className="relative">
                  <Filter
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    size={18}
                  />

                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="h-12 w-full appearance-none rounded-xl border border-slate-700 bg-slate-950 pl-11 pr-10 text-sm text-white outline-none transition-all duration-300 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 sm:w-44"
                  >
                    <option value="all">All Types</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>

                  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs text-slate-400">
                    ▼
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 hidden overflow-x-auto rounded-xl border border-slate-800 lg:block">
              <table className="w-full min-w-[820px] border-collapse">
                <thead className="bg-slate-950/80">
                  <tr className="text-left text-xs uppercase tracking-wider text-slate-400">
                    <th className="px-5 py-4 font-semibold">Name</th>
                    <th className="px-5 py-4 font-semibold">Type</th>
                    <th className="px-5 py-4 font-semibold">Category</th>
                    <th className="px-5 py-4 font-semibold">Amount</th>
                    <th className="px-5 py-4 font-semibold">Date</th>
                    <th className="px-5 py-4 text-center font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800">
                  {filteredTransactions.map((t) => (
                    <tr
                      key={t._id}
                      className="group transition-all duration-300 hover:bg-slate-800/60"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-white">{t.name}</p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ${
                            t.type === "income"
                              ? "bg-emerald-400/10 text-emerald-300"
                              : "bg-red-400/10 text-red-300"
                          }`}
                        >
                          {t.type}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-300">
                        {t.category}
                      </td>

                      <td
                        className={`px-5 py-4 font-bold ${
                          t.type === "income"
                            ? "text-emerald-300"
                            : "text-red-300"
                        }`}
                      >
                        {formatCurrency(t.amount)}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-400">
                        {formatDisplayDate(t.date)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(t)}
                            className="rounded-lg bg-amber-400/10 p-2 text-amber-300 transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-400 hover:text-slate-950"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(t._id)}
                            className="rounded-lg bg-red-400/10 p-2 text-red-300 transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-400 hover:text-white"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {loading && (
                <div className="px-5 py-12 text-center text-slate-400">
                  Loading transactions...
                </div>
              )}

              {!loading && filteredTransactions.length === 0 && (
                <div className="px-5 py-12 text-center text-slate-400">
                  No transactions found.
                </div>
              )}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 lg:hidden">
              {filteredTransactions.map((t) => (
                <motion.div
                  key={t._id}
                  whileHover={{ y: -2 }}
                  className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 transition-all duration-300 hover:border-slate-700"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="truncate font-bold text-white">
                        {t.name}
                      </h3>

                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <Tag size={13} />
                          {t.category}
                        </span>

                        <span className="inline-flex items-center gap-1">
                          <CalendarDays size={13} />
                          {formatDisplayDate(t.date)}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold capitalize ${
                        t.type === "income"
                          ? "bg-emerald-400/10 text-emerald-300"
                          : "bg-red-400/10 text-red-300"
                      }`}
                    >
                      {t.type}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p
                      className={`inline-flex items-center gap-1 text-xl font-bold ${
                        t.type === "income"
                          ? "text-emerald-300"
                          : "text-red-300"
                      }`}
                    >
                      <IndianRupee size={18} />
                      {Number(t.amount || 0).toLocaleString("en-IN")}
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(t)}
                        className="rounded-lg bg-amber-400/10 p-2 text-amber-300 transition-all duration-300 hover:bg-amber-400 hover:text-slate-950"
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(t._id)}
                        className="rounded-lg bg-red-400/10 p-2 text-red-300 transition-all duration-300 hover:bg-red-400 hover:text-white"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {filteredTransactions.length === 0 && (
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-5 py-10 text-center text-slate-400">
                  No transactions found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Transactions;
