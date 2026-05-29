import React, { useState } from "react";
import Layout from "../components/Layout";
import { useLanguage } from "../context/LanguageContext";

import {
BarChart,
Bar,
XAxis,
YAxis,
Tooltip,
ResponsiveContainer,
CartesianGrid,
Legend,
} from "recharts";

import jsPDF from "jspdf";

function TaxEstimator() {
const { t } = useLanguage();
const [income, setIncome] = useState("");
const [deduction, setDeduction] = useState("");

const taxable = Math.max(income - deduction, 0);

const calculateTax = () => {
if (taxable <= 250000) return 0;
if (taxable <= 500000) return taxable * 0.05;
if (taxable <= 1000000) return taxable * 0.2;
return taxable * 0.3;
};

const tax = calculateTax();
const netIncome = taxable - tax;

const formatCurrency = (value) =>
`₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const data = [
{
name: "Finance",
Income: income || 0,
Deduction: deduction || 0,
Tax: tax || 0,
},
];

const suggestions = [
"Invest in tax-saving schemes",
"Track monthly expenses regularly",
"Maintain invoices and bills safely",
"Reduce unnecessary spending",
"Plan yearly savings early",
];

const summaryCards = [
{
label: "Total Income",
value: income,
accent: "from-violet-500 to-indigo-500",
border: "border-violet-400/30",
},
{
label: "Deductions",
value: deduction,
accent: "from-fuchsia-500 to-pink-500",
border: "border-fuchsia-400/30",
},
{
label: "Estimated Tax",
value: tax,
accent: "from-sky-500 to-blue-500",
border: "border-sky-400/30",
},
{
label: "Net Income",
value: netIncome,
accent: "from-emerald-500 to-teal-500",
border: "border-emerald-400/30",
},
];

const resultCards = [
{
label: "Taxable Income",
value: taxable,
text: "text-white",
},
{
label: "Estimated Tax",
value: tax,
text: "text-red-300",
},
{
label: "Net Income",
value: netIncome,
text: "text-emerald-300",
},
];

const downloadPDF = () => {
const doc = new jsPDF();

doc.setFontSize(20);
doc.text("Tax Report", 20, 20);

doc.setFontSize(14);
doc.text(`Income: ₹${income || 0}`, 20, 50);
doc.text(`Deductions: ₹${deduction || 0}`, 20, 70);
doc.text(`Taxable Income: ₹${taxable || 0}`, 20, 90);
doc.text(`Estimated Tax: ₹${tax || 0}`, 20, 110);
doc.text(`Net Income: ₹${netIncome || 0}`, 20, 130);

doc.save("tax-report.pdf");
};

return (
<Layout>
<div className="min-h-screen px-4 py-6 text-white sm:px-6 lg:px-8">
<div className="mx-auto max-w-7xl space-y-8">
<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
<div>
<p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-300">
{t("taxPlanning")}
</p>
<h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
{t("taxDashboard")}
</h1>
<p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
Estimate taxable income, deductions, tax payable, and net income
with a clear financial overview.
</p>
</div>

        <button
          onClick={downloadPDF}
          className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-400 hover:shadow-emerald-500/30 focus:outline-none focus:ring-2 focus:ring-emerald-300"
        >
          {t("downloadPdf")}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className={`group overflow-hidden rounded-lg border ${card.border} bg-slate-900/80 p-5 shadow-xl shadow-black/20 transition duration-200 hover:-translate-y-1 hover:bg-slate-900`}
          >
            <div
              className={`mb-5 h-1.5 w-16 rounded-full bg-gradient-to-r ${card.accent}`}
            />
            <p className="text-sm font-medium text-slate-300">
              {t(card.label.replace(/\s+/g, "").replace(/^./, (value) => value.toLowerCase()))}
            </p>
            <h2 className="mt-3 break-words text-2xl font-bold tracking-tight text-white">
              {formatCurrency(card.value)}
            </h2>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="rounded-lg border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-black/20 xl:col-span-2">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-white">
              {t("calculator")}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Enter your annual income and deductions.
            </p>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">
                {t("annualIncome")}
              </span>
              <input
                type="number"
                placeholder="Enter annual income"
                value={income}
                onChange={(e) => setIncome(Number(e.target.value))}
                className="w-full rounded-lg border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">
                {t("deductions")}
              </span>
              <input
                type="number"
                placeholder="Enter deductions"
                value={deduction}
                onChange={(e) => setDeduction(Number(e.target.value))}
                className="w-full rounded-lg border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-fuchsia-300 focus:ring-2 focus:ring-fuchsia-300/20"
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 xl:col-span-3">
          {resultCards.map((card) => (
            <div
              key={card.label}
              className="rounded-lg border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-black/20 transition duration-200 hover:-translate-y-1 hover:border-white/20"
            >
              <p className="text-sm font-medium text-slate-400">
                {t(card.label.replace(/\s+/g, "").replace(/^./, (value) => value.toLowerCase()))}
              </p>
              <h2
                className={`mt-4 break-words text-2xl font-bold tracking-tight sm:text-3xl ${card.text}`}
              >
                {formatCurrency(card.value)}
              </h2>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-lg border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-black/20 xl:col-span-2">
          <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">
                {t("financialOverview")}
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Income, deductions, and estimated tax comparison.
              </p>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#cbd5e1" tickLine={false} />
                <YAxis stroke="#cbd5e1" tickLine={false} />
                <Tooltip
                  cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
                  contentStyle={{
                    background: "#020617",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Legend />
                <Bar dataKey="Income" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Deduction" fill="#ec4899" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Tax" fill="#38bdf8" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-black/20">
          <h2 className="text-xl font-semibold text-white">
            {t("taxSavingSuggestions")}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Simple actions to improve yearly tax planning.
          </p>

          <div className="mt-5 space-y-3">
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion}
                className="flex gap-3 rounded-lg border border-white/10 bg-slate-950/60 p-3 transition duration-200 hover:border-cyan-300/40 hover:bg-slate-950"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 text-sm font-bold text-cyan-300">
                  {index + 1}
                </span>
                <p className="text-sm leading-6 text-slate-200">
                  {suggestion}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-black/20">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-white">{t("taxSlabs")}</h2>
          <p className="mt-1 text-sm text-slate-400">
            Current slab structure used by this calculator.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left">
            <thead>
              <tr className="border-b border-white/10 text-sm text-slate-300">
                <th className="py-3 font-semibold">Income Range</th>
                <th className="py-3 font-semibold">Tax Rate</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10 text-sm text-slate-200">
              <tr className="transition hover:bg-white/[0.03]">
                <td className="py-4">0 - 2.5L</td>
                <td className="py-4 font-semibold text-emerald-300">0%</td>
              </tr>

              <tr className="transition hover:bg-white/[0.03]">
                <td className="py-4">2.5L - 5L</td>
                <td className="py-4 font-semibold text-cyan-300">5%</td>
              </tr>

              <tr className="transition hover:bg-white/[0.03]">
                <td className="py-4">5L - 10L</td>
                <td className="py-4 font-semibold text-amber-300">20%</td>
              </tr>

              <tr className="transition hover:bg-white/[0.03]">
                <td className="py-4">Above 10L</td>
                <td className="py-4 font-semibold text-red-300">30%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</Layout>
);
}

export default TaxEstimator;
