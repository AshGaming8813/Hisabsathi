import React from 'react';
import { Transaction, Account, UdhaarContact, PendingAutoTransaction } from '../../types';
import { formatCurrency } from '../../utils/calculations';
import { useLanguage } from '../../context/LanguageContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { BarChart3, TrendingUp, TrendingDown, PiggyBank, AlertTriangle, Bot, CheckCircle, XCircle, Edit3 } from 'lucide-react';

interface ReportsDashboardProps {
  transactions: Transaction[];
  accounts: Account[];
  udhaarContacts: UdhaarContact[];
  pendingAutoTransactions?: PendingAutoTransaction[];
}

const COLORS = ['#ef4444', '#f59e0b', '#ec4899', '#8b5cf6', '#eab308', '#3b82f6', '#06b6d4', '#10b981', '#6366f1', '#6b7280'];

export const ReportsDashboard: React.FC<ReportsDashboardProps> = ({
  transactions,
  accounts,
  udhaarContacts,
  pendingAutoTransactions = [],
}) => {
  const { t } = useLanguage();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Filter current month transactions excluding internal transfers
  const monthTxs = transactions.filter((tx) => {
    if (!tx.date || tx.isInternalTransfer) return false;
    const [y, m] = tx.date.split('-').map(Number);
    return y === currentYear && m === currentMonth + 1;
  });

  let totalIncome = 0;
  let totalExpense = 0;
  const categoryMap = new Map<string, number>();

  monthTxs.forEach((tx) => {
    if (tx.type === 'income') {
      totalIncome += tx.amount;
    } else if (tx.type === 'expense') {
      totalExpense += tx.amount;
      const current = categoryMap.get(tx.category) || 0;
      categoryMap.set(tx.category, current + tx.amount);
    }
  });

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  // Auto Tracking Stats
  const totalAutoDetected = pendingAutoTransactions.length;
  const autoConfirmed = pendingAutoTransactions.filter((p) => p.status === 'confirmed').length;
  const autoIgnored = pendingAutoTransactions.filter((p) => p.status === 'ignored').length;
  const autoPending = pendingAutoTransactions.filter((p) => p.status === 'pending').length;

  // Prepare Category Pie Data
  const categoryPieData = Array.from(categoryMap.entries()).map(([name, value]) => ({
    name,
    value,
  }));

  // Identify highest spending category
  let highestCategory = 'N/A';
  let highestAmount = 0;
  categoryMap.forEach((amt, cat) => {
    if (amt > highestAmount) {
      highestAmount = amt;
      highestCategory = cat;
    }
  });

  // Account spending breakdown
  const accountSpendingData = accounts.map((acc) => {
    let spent = 0;
    monthTxs.forEach((tx) => {
      if (tx.type === 'expense' && tx.accountId === acc.id) spent += tx.amount;
    });
    return { name: acc.name, spent };
  });

  return (
    <div className="space-y-4 pb-20">
      {/* Top Banner */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-500" />
            {t('financialReports')}
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full">
            This Month
          </span>
        </div>

        {/* 3 Overview Stat Cards */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-2xl border border-emerald-100 dark:border-emerald-800">
            <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold block flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Income
            </span>
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-200 mt-1 block">
              {formatCurrency(totalIncome)}
            </span>
          </div>

          <div className="bg-rose-50 dark:bg-rose-950/40 p-3 rounded-2xl border border-rose-100 dark:border-rose-800">
            <span className="text-[10px] text-rose-700 dark:text-rose-300 font-semibold block flex items-center gap-1">
              <TrendingDown className="w-3 h-3" /> Expense
            </span>
            <span className="text-xs font-bold text-rose-800 dark:text-rose-200 mt-1 block">
              {formatCurrency(totalExpense)}
            </span>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-950/40 p-3 rounded-2xl border border-indigo-100 dark:border-indigo-800">
            <span className="text-[10px] text-indigo-700 dark:text-indigo-300 font-semibold block flex items-center gap-1">
              <PiggyBank className="w-3 h-3" /> Savings
            </span>
            <span className="text-xs font-bold text-indigo-800 dark:text-indigo-200 mt-1 block">
              {formatCurrency(netSavings)}
            </span>
          </div>
        </div>

        {/* Savings Rate Bar */}
        <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-1.5">
          <div className="flex justify-between items-center text-xs font-bold text-gray-700 dark:text-gray-300">
            <span>{t('savingsRate')}</span>
            <span className={savingsRate >= 20 ? 'text-emerald-600' : 'text-amber-600'}>
              {savingsRate}% Savings Ratio
            </span>
          </div>
          <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                savingsRate >= 30 ? 'bg-emerald-500' : savingsRate >= 10 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.max(0, Math.min(100, savingsRate))}%` }}
            />
          </div>
        </div>

        {/* Highest Expense Category Warning */}
        {highestAmount > 0 && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <div>
                <span className="font-bold">{t('highestExpenseCategory')}:</span>
                <span className="ml-1 font-semibold text-rose-600 dark:text-rose-400">
                  {highestCategory}
                </span>
              </div>
            </div>
            <span className="font-bold">{formatCurrency(highestAmount)}</span>
          </div>
        )}
      </div>

      {/* Automatically Detected Transactions Stats Card (Requirement #25) */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <Bot className="w-4 h-4 text-indigo-500" />
          Automatically Detected Transactions Breakdown
        </h3>

        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="bg-indigo-50 dark:bg-indigo-950/40 p-2.5 rounded-2xl border border-indigo-100 dark:border-indigo-800">
            <span className="text-[10px] text-indigo-700 dark:text-indigo-300 block font-semibold">Total</span>
            <span className="text-sm font-black text-indigo-900 dark:text-indigo-200">{totalAutoDetected}</span>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-2xl border border-emerald-100 dark:border-emerald-800">
            <span className="text-[10px] text-emerald-700 dark:text-emerald-300 block font-semibold">Confirmed</span>
            <span className="text-sm font-black text-emerald-900 dark:text-emerald-200">{autoConfirmed}</span>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-2xl border border-amber-100 dark:border-amber-800">
            <span className="text-[10px] text-amber-700 dark:text-amber-300 block font-semibold">Pending</span>
            <span className="text-sm font-black text-amber-900 dark:text-amber-200">{autoPending}</span>
          </div>

          <div className="bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-2xl border border-rose-100 dark:border-rose-800">
            <span className="text-[10px] text-rose-700 dark:text-rose-300 block font-semibold">Ignored</span>
            <span className="text-sm font-black text-rose-900 dark:text-rose-200">{autoIgnored}</span>
          </div>
        </div>
      </div>

      {/* Category Pie Chart */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
          {t('categorySpending')}
        </h3>

        {categoryPieData.length === 0 ? (
          <p className="text-xs text-gray-400 py-6 text-center">No expense records for this month.</p>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="h-48 w-full sm:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryPieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category Legend List */}
            <div className="w-full sm:w-1/2 space-y-1.5 pt-2 sm:pt-0">
              {categoryPieData.map((item, idx) => (
                <div key={item.name} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {item.name}
                    </span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-gray-100">
                    {formatCurrency(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Account Activity Spending Bar Chart */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
          {t('accountSpending')}
        </h3>

        <div className="h-44 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={accountSpendingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" tickFormatter={(v) => `₹${v}`} />
              <Tooltip formatter={(v: any) => [`₹${v.toLocaleString('en-IN')}`, 'Spent']} />
              <Bar dataKey="spent" name="Spent" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
