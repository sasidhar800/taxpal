import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import toast from "react-hot-toast";
import {
  Edit2,
  Trash2,
  X,
} from "lucide-react";
import Layout from "../components/Layout";
import { useLanguage } from "../context/LanguageContext";
import { useSettings } from "../context/SettingsContext";
import api from "../utils/api";

const initialForm = {
  category: "",
  limit: "",
  spent: "",
};

const BUDGET_LOAD_ERROR_TOAST_ID = "budget-load-error";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

function Budget() {
  const { t } = useLanguage();
  const { playSound } = useSettings();
  const [budgets, setBudgets] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const totals = useMemo(() => {
    const totalLimit = budgets.reduce((sum, budget) => sum + Number(budget.limit || 0), 0);
    const totalSpent = budgets.reduce((sum, budget) => sum + Number(budget.spent || 0), 0);
    const totalRemaining = totalLimit - totalSpent;

    return {
      totalLimit,
      totalSpent,
      totalRemaining,
      monthlyProgress: totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0,
    };
  }, [budgets]);

  const savingsGoal = 10000;
  const savedAmount = Math.max(totals.totalRemaining, 0);
  const savingsProgress = Math.min((savedAmount / savingsGoal) * 100, 100);

  const loadBudgets = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/budgets");
      setBudgets(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to load budgets", {
        id: BUDGET_LOAD_ERROR_TOAST_ID,
      });
      playSound("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    setForm((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.category.trim() || Number(form.limit) < 0) {
      toast.error("Please enter a valid category and limit");
      playSound("error");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        category: form.category.trim(),
        limit: Number(form.limit),
        spent: Number(form.spent || 0),
      };

      if (editingId) {
        const res = await api.put(`/api/budgets/${editingId}`, payload);
        setBudgets((current) =>
          current.map((budget) =>
            budget._id === editingId ? res.data.budget : budget
          )
        );
        toast.success(res.data.message || "Budget updated");
      } else {
        const res = await api.post("/api/budgets", payload);
        setBudgets((current) => [res.data.budget, ...current]);
        toast.success(res.data.message || "Budget saved");
      }

      resetForm();
      playSound("success");
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Budget save failed");
      playSound("error");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (budget) => {
    setEditingId(budget._id);
    setForm({
      category: budget.category,
      limit: String(budget.limit),
      spent: String(budget.spent || 0),
    });
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/budgets/${id}`);
      setBudgets((current) => current.filter((budget) => budget._id !== id));
      toast.success("Budget deleted");
      playSound("success");

      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Delete failed");
      playSound("error");
    }
  };

  return (
    <Layout>
      <div className="min-h-screen text-[var(--tp-text)]">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
            {t("financeDashboard")}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--tp-heading)] sm:text-4xl">
            {t("budgetPlanner")}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--tp-muted)]">
            Track monthly limits, spending progress, and available savings from
            one clean dashboard.
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-[var(--tp-border)] bg-[var(--tp-card-bg)] p-5 shadow-xl shadow-black/10 backdrop-blur transition duration-300 hover:-translate-y-1">
            <p className="text-sm text-[var(--tp-muted)]">{t("monthlyBudget")}</p>
            <h2 className="mt-3 text-3xl font-bold text-[var(--tp-heading)]">
              {formatCurrency(totals.totalLimit)}
            </h2>
            <p className="mt-2 text-xs text-[var(--tp-muted)]">
              {budgets.length} {t("categories")}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--tp-border)] bg-[var(--tp-card-bg)] p-5 shadow-xl shadow-black/10 backdrop-blur transition duration-300 hover:-translate-y-1">
            <p className="text-sm text-[var(--tp-muted)]">{t("totalExpense")}</p>
            <h2 className="mt-3 text-3xl font-bold text-rose-300">
              {formatCurrency(totals.totalSpent)}
            </h2>
            <p className="mt-2 text-xs text-[var(--tp-muted)]">
              {totals.monthlyProgress.toFixed(0)}% of total budget used
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--tp-border)] bg-[var(--tp-card-bg)] p-5 shadow-xl shadow-black/10 backdrop-blur transition duration-300 hover:-translate-y-1">
            <p className="text-sm text-[var(--tp-muted)]">{t("remaining")}</p>
            <h2 className="mt-3 text-3xl font-bold text-emerald-300">
              {formatCurrency(totals.totalRemaining)}
            </h2>
            <p className="mt-2 text-xs text-[var(--tp-muted)]">
              Available for this month
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--tp-border)] bg-[var(--tp-card-bg)] p-5 shadow-xl shadow-black/10 backdrop-blur transition duration-300 hover:-translate-y-1">
            <p className="text-sm text-[var(--tp-muted)]">{t("budgetHealth")}</p>
            <h2 className="mt-3 text-3xl font-bold text-[var(--tp-heading)]">
              {totals.monthlyProgress > 80 ? t("high") : t("healthy")}
            </h2>
            <p className="mt-2 text-xs text-[var(--tp-muted)]">
              Based on current spending
            </p>
          </div>
        </div>

        <div className="mb-8 grid gap-6 xl:grid-cols-3">
          <div className="rounded-2xl border border-[var(--tp-border)] bg-[var(--tp-card-bg)] p-6 shadow-xl shadow-black/10 backdrop-blur xl:col-span-2">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-[var(--tp-heading)]">
                  {editingId ? t("edit") : t("setNewBudget")}
                </h2>
                <p className="mt-1 text-sm text-[var(--tp-muted)]">
                  Add or update a spending category and monthly limit.
                </p>
              </div>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-[var(--tp-border)] bg-[var(--tp-card-muted-bg)] p-2 text-[var(--tp-muted)] transition hover:text-[var(--tp-text)]"
                  aria-label="Cancel edit"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--tp-muted)]">
                  {t("category")}
                </label>
                <input
                  type="text"
                  name="category"
                  placeholder="Food, Travel, Rent..."
                  value={form.category}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[var(--tp-border)] bg-[var(--tp-card-muted-bg)] px-4 py-3 text-sm text-[var(--tp-text)] outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/10"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--tp-muted)]">
                  {t("budgetLimit")}
                </label>
                <input
                  type="number"
                  name="limit"
                  min="0"
                  placeholder="Enter amount"
                  value={form.limit}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[var(--tp-border)] bg-[var(--tp-card-muted-bg)] px-4 py-3 text-sm text-[var(--tp-text)] outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/10"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--tp-muted)]">
                  {t("spent")}
                </label>
                <input
                  type="number"
                  name="spent"
                  min="0"
                  placeholder="0"
                  value={form.spent}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[var(--tp-border)] bg-[var(--tp-card-muted-bg)] px-4 py-3 text-sm text-[var(--tp-text)] outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/10"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition duration-300 hover:-translate-y-0.5 hover:bg-cyan-300 disabled:opacity-60 md:col-span-3"
              >
                {saving ? `${t("loading")}...` : editingId ? t("edit") : t("addBudget")}
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-[var(--tp-border)] bg-gradient-to-br from-emerald-500/20 via-[var(--tp-card-bg)] to-cyan-500/20 p-6 shadow-xl shadow-black/10 backdrop-blur">
            <div className="mb-6">
              <p className="text-sm font-medium text-emerald-200">
                {t("savingsGoal")}
              </p>
              <h2 className="mt-2 text-2xl font-bold text-[var(--tp-heading)]">
                {formatCurrency(savingsGoal)}
              </h2>
              <p className="mt-1 text-sm text-[var(--tp-muted)]">
                {formatCurrency(savedAmount)} available toward savings
              </p>
            </div>

            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-[var(--tp-muted)]">{t("progress")}</span>
              <span className="font-semibold text-emerald-200">
                {savingsProgress.toFixed(0)}%
              </span>
            </div>

            <div className="h-4 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300 transition-all duration-500"
                style={{ width: `${savingsProgress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mb-8 rounded-2xl border border-[var(--tp-border)] bg-[var(--tp-card-bg)] p-6 shadow-xl shadow-black/10 backdrop-blur">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[var(--tp-heading)]">
                {t("monthlyBudgetOverview")}
              </h2>
              <p className="mt-1 text-sm text-[var(--tp-muted)]">
                Total spending progress across all categories.
              </p>
            </div>
            <p className="text-sm font-semibold text-cyan-200">
              {formatCurrency(totals.totalSpent)} / {formatCurrency(totals.totalLimit)}
            </p>
          </div>

          <div className="h-5 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                totals.monthlyProgress > 80
                  ? "bg-gradient-to-r from-rose-400 to-red-500"
                  : "bg-gradient-to-r from-cyan-300 to-emerald-300"
              }`}
              style={{ width: `${Math.min(totals.monthlyProgress, 100)}%` }}
            />
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-[var(--tp-border)] bg-[var(--tp-card-bg)] p-6 text-center text-[var(--tp-muted)]">
            {t("loading")}...
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {budgets.map((budget) => {
              const remaining = Number(budget.limit || 0) - Number(budget.spent || 0);
              const percent = Number(budget.limit || 0) > 0
                ? (Number(budget.spent || 0) / Number(budget.limit || 0)) * 100
                : 0;
              const isOverLimit = percent > 80;

              return (
                <div
                  key={budget._id}
                  className="group rounded-2xl border border-[var(--tp-border)] bg-[var(--tp-card-bg)] p-6 shadow-xl shadow-black/10 backdrop-blur transition duration-300 hover:-translate-y-1"
                >
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--tp-muted)]">
                        {t("category")}
                      </p>
                      <h2 className="mt-2 break-words text-2xl font-bold tracking-tight text-[var(--tp-heading)]">
                        {budget.category}
                      </h2>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                        isOverLimit
                          ? "bg-rose-400/15 text-rose-200"
                          : "bg-emerald-400/15 text-emerald-200"
                      }`}
                    >
                      {percent.toFixed(0)}%
                    </span>
                  </div>

                  <div className="mb-5 grid grid-cols-3 gap-3 text-sm">
                    <div className="rounded-xl bg-[var(--tp-card-muted-bg)] p-3">
                      <p className="text-[var(--tp-muted)]">{t("limit")}</p>
                      <p className="mt-1 font-bold text-[var(--tp-heading)]">
                        {formatCurrency(budget.limit)}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[var(--tp-card-muted-bg)] p-3">
                      <p className="text-[var(--tp-muted)]">{t("spent")}</p>
                      <p className="mt-1 font-bold text-rose-200">
                        {formatCurrency(budget.spent)}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[var(--tp-card-muted-bg)] p-3">
                      <p className="text-[var(--tp-muted)]">{t("left")}</p>
                      <p className="mt-1 font-bold text-emerald-200">
                        {formatCurrency(remaining)}
                      </p>
                    </div>
                  </div>

                  <div className="mb-2 flex items-center justify-between text-xs text-[var(--tp-muted)]">
                    <span>Spending Progress</span>
                    <span>{percent.toFixed(0)}%</span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full transition-all duration-500 group-hover:brightness-110 ${
                        isOverLimit
                          ? "bg-gradient-to-r from-rose-400 to-red-500"
                          : "bg-gradient-to-r from-cyan-300 to-emerald-300"
                      }`}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>

                  <div className="mt-5 flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleEdit(budget)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--tp-border)] bg-[var(--tp-card-muted-bg)] px-3 py-2 text-sm font-semibold text-[var(--tp-text)] transition hover:border-cyan-300"
                    >
                      <Edit2 size={16} />
                      {t("edit")}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(budget._id)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
                    >
                      <Trash2 size={16} />
                      {t("delete")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Budget;
