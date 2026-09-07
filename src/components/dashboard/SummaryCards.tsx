import React from 'react';
import { FinancialSummary, formatCurrency } from '../../utils/calculations';
import { useLanguage } from '../../context/LanguageContext';
import { Wallet, Landmark, Smartphone, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, Bell, Clock } from 'lucide-react';

interface SummaryCardsProps {
  summary: FinancialSummary;
  onNavigateTab: (tab: any) => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary, onNavigateTab }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-3">
      {/* 1. Main Balance Hero Card */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 dark:from-emerald-700 dark:to-teal-900 rounded-3xl p-5 text-white shadow-xl shadow-emerald-600/20 relative overflow-hidden">
        {/* Background Decorative Circles */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute right-12 -top-12 w-24 h-24 rounded-full bg-white/10 blur-lg pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100/90 flex items-center gap-1.5">
              <Wallet className="w-4 h-4" />
              {t('totalMoney')}
            </span>
            <span className="text-[10px] font-bold bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-md">
              Net Financial Balance
            </span>
          </div>

          <div className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {formatCurrency(summary.totalMoney)}
          </div>

          {/* Breakdown Badges */}
          <div className="pt-2 grid grid-cols-3 gap-2 border-t border-white/15 text-center">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-2">
              <div className="text-[10px] text-emerald-100 flex items-center justify-center gap-1">
                <Wallet className="w-3 h-3" />
                {t('cash')}
              </div>
              <div className="text-xs font-bold mt-0.5">{formatCurrency(summary.cashBalance)}</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-2">
              <div className="text-[10px] text-emerald-100 flex items-center justify-center gap-1">
                <Landmark className="w-3 h-3" />
                {t('bank')}
              </div>
              <div className="text-xs font-bold mt-0.5">{formatCurrency(summary.bankBalance)}</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-2">
              <div className="text-[10px] text-emerald-100 flex items-center justify-center gap-1">
                <Smartphone className="w-3 h-3" />
                {t('upi')}
              </div>
              <div className="text-xs font-bold mt-0.5">{formatCurrency(summary.upiBalance)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Monthly Income & Expense Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {t('incomeThisMonth')}
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(summary.incomeThisMonth)}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {t('expenseThisMonth')}
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-rose-600 dark:text-rose-400">
            {formatCurrency(summary.expenseThisMonth)}
          </div>
        </div>
      </div>

      {/* 3. Udhaar Given vs Taken Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onNavigateTab('udhaar')}
          className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:border-indigo-300 transition-colors text-left flex flex-col justify-between space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {t('moneyGiven')}
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
              {formatCurrency(summary.totalGiven)}
            </div>
            <p className="text-[10px] text-gray-400 mt-0.5">Maine Diya (Asset)</p>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('udhaar')}
          className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:border-amber-300 transition-colors text-left flex flex-col justify-between space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {t('moneyTaken')}
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
              {formatCurrency(summary.totalTaken)}
            </div>
            <p className="text-[10px] text-gray-400 mt-0.5">Maine Liya (Liability)</p>
          </div>
        </button>
      </div>

      {/* 4. Quick Notification Chips */}
      {(summary.pendingUdhaarCount > 0 || summary.upcomingBillsCount > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {summary.pendingUdhaarCount > 0 && (
            <button
              onClick={() => onNavigateTab('udhaar')}
              className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl p-3 flex items-center justify-between text-xs font-medium text-indigo-900 dark:text-indigo-200 hover:bg-indigo-100 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Pending Udhaar Records</span>
              </span>
              <span className="bg-indigo-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
                {summary.pendingUdhaarCount} Contact{summary.pendingUdhaarCount > 1 ? 's' : ''}
              </span>
            </button>
          )}

          {summary.upcomingBillsCount > 0 && (
            <button
              onClick={() => onNavigateTab('more')}
              className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex items-center justify-between text-xs font-medium text-amber-900 dark:text-amber-200 hover:bg-amber-100 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-pulse" />
                <span>Upcoming Bill Due</span>
              </span>
              <span className="bg-amber-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
                {formatCurrency(summary.upcomingBillsTotal)}
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
