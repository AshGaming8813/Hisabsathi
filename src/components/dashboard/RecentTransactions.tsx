import React from 'react';
import { Transaction, Account } from '../../types';
import { formatCurrency } from '../../utils/calculations';
import { useLanguage } from '../../context/LanguageContext';
import {
  Utensils,
  Car,
  ShoppingBag,
  Home as HomeIcon,
  Zap,
  Smartphone,
  Wifi,
  Stethoscope,
  GraduationCap,
  Briefcase,
  Store,
  TrendingUp,
  Gift,
  MoreHorizontal,
  ArrowLeftRight,
} from 'lucide-react';

interface RecentTransactionsProps {
  transactions: Transaction[];
  accounts: Account[];
  onViewAll: () => void;
  onSelectTransaction?: (tx: Transaction) => void;
}

const categoryIconMap: Record<string, any> = {
  Food: Utensils,
  Travel: Car,
  Shopping: ShoppingBag,
  Rent: HomeIcon,
  Electricity: Zap,
  'Mobile Recharge': Smartphone,
  Internet: Wifi,
  Medical: Stethoscope,
  Education: GraduationCap,
  Salary: Briefcase,
  Business: Store,
  Interest: TrendingUp,
  Gift: Gift,
  Other: MoreHorizontal,
  Transfer: ArrowLeftRight,
};

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  accounts,
  onViewAll,
  onSelectTransaction,
}) => {
  const { t } = useLanguage();
  const accountMap = new Map<string, string>();
  accounts.forEach((acc) => accountMap.set(acc.id, acc.name));

  const recentList = transactions.slice(0, 5);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
          {t('recentTransactions')}
        </h3>
        <button
          onClick={onViewAll}
          className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          {t('viewAll')} →
        </button>
      </div>

      {recentList.length === 0 ? (
        <div className="py-8 text-center text-xs text-gray-400">
          {t('noTransactionsYet')}
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
          {recentList.map((tx) => {
            const IconComponent = categoryIconMap[tx.category] || MoreHorizontal;
            const accountName = accountMap.get(tx.accountId) || 'Account';
            const toAccountName = tx.toAccountId ? accountMap.get(tx.toAccountId) : null;

            return (
              <div
                key={tx.id}
                onClick={() => onSelectTransaction && onSelectTransaction(tx)}
                className="py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/40 rounded-xl px-1 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm ${
                      tx.type === 'income'
                        ? 'bg-emerald-500 shadow-emerald-500/20'
                        : tx.type === 'expense'
                        ? 'bg-rose-500 shadow-rose-500/20'
                        : 'bg-indigo-500 shadow-indigo-500/20'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-gray-900 dark:text-gray-100 leading-snug">
                      {tx.person || tx.category}
                    </p>
                    <div className="flex items-center space-x-1.5 mt-0.5">
                      <span className="text-[10px] text-gray-400 font-medium">{tx.date}</span>
                      <span className="text-[10px] text-gray-300 dark:text-gray-600">•</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold">
                        {tx.type === 'transfer' && toAccountName
                          ? `${accountName} → ${toAccountName}`
                          : accountName}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={`text-xs font-extrabold ${
                      tx.type === 'income'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : tx.type === 'expense'
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-indigo-600 dark:text-indigo-400'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                    {formatCurrency(tx.amount)}
                  </p>
                  <p className="text-[9px] text-gray-400 capitalize mt-0.5">{tx.paymentMethod}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
