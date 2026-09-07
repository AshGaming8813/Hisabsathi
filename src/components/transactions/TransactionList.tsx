import React, { useState, useMemo } from 'react';
import { Transaction, Account } from '../../types';
import { formatCurrency } from '../../utils/calculations';
import { useLanguage } from '../../context/LanguageContext';
import {
  Search,
  Filter,
  Calendar,
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

interface TransactionListProps {
  transactions: Transaction[];
  accounts: Account[];
  onSelectTransaction: (tx: Transaction) => void;
  onOpenAddModal: () => void;
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

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  accounts,
  onSelectTransaction,
  onOpenAddModal,
}) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('month'); // 'all', 'today', 'week', 'month', 'last_month', 'custom'
  const [typeFilter, setTypeFilter] = useState<string>('all'); // 'all', 'income', 'expense', 'transfer'
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  const accountMap = useMemo(() => {
    const map = new Map<string, string>();
    accounts.forEach((acc) => map.set(acc.id, acc.name));
    return map;
  }, [accounts]);

  // Filter Logic
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    return transactions.filter((tx) => {
      // 1. Text Search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const personMatch = tx.person?.toLowerCase().includes(query);
        const categoryMatch = tx.category.toLowerCase().includes(query);
        const amountMatch = String(tx.amount).includes(query);
        const notesMatch = tx.notes?.toLowerCase().includes(query);
        const accName = accountMap.get(tx.accountId)?.toLowerCase() || '';
        const accMatch = accName.includes(query);

        if (!personMatch && !categoryMatch && !amountMatch && !notesMatch && !accMatch) {
          return false;
        }
      }

      // 2. Type Filter
      if (typeFilter !== 'all' && tx.type !== typeFilter) {
        return false;
      }

      // 3. Account Filter
      if (
        selectedAccountId !== 'all' &&
        tx.accountId !== selectedAccountId &&
        tx.toAccountId !== selectedAccountId
      ) {
        return false;
      }

      // 4. Date Range Filter
      if (!tx.date) return true;
      const txDate = new Date(tx.date);

      if (dateFilter === 'today') {
        return tx.date === todayStr;
      }

      if (dateFilter === 'week') {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return txDate >= oneWeekAgo && txDate <= now;
      }

      if (dateFilter === 'month') {
        return (
          txDate.getFullYear() === now.getFullYear() &&
          txDate.getMonth() === now.getMonth()
        );
      }

      if (dateFilter === 'last_month') {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return (
          txDate.getFullYear() === lastMonth.getFullYear() &&
          txDate.getMonth() === lastMonth.getMonth()
        );
      }

      if (dateFilter === 'custom') {
        if (customStartDate && tx.date < customStartDate) return false;
        if (customEndDate && tx.date > customEndDate) return false;
      }

      return true;
    });
  }, [transactions, searchTerm, dateFilter, typeFilter, selectedAccountId, customStartDate, customEndDate, accountMap]);

  // Group transactions by date
  const groupedByDate = useMemo(() => {
    const groups = new Map<string, Transaction[]>();
    filteredTransactions.forEach((tx) => {
      const dateKey = tx.date || 'Unknown Date';
      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }
      groups.get(dateKey)!.push(tx);
    });
    return Array.from(groups.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filteredTransactions]);

  return (
    <div className="space-y-4 pb-20">
      {/* Header & Search */}
      <div className="space-y-3 bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {t('transactions')}
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full">
            {filteredTransactions.length} items
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'month', label: t('filterThisMonth') },
            { id: 'today', label: t('filterToday') },
            { id: 'week', label: t('filterThisWeek') },
            { id: 'last_month', label: t('filterLastMonth') },
            { id: 'all', label: t('filterAll') },
            { id: 'custom', label: t('filterCustomDate') },
          ].map((df) => (
            <button
              key={df.id}
              onClick={() => setDateFilter(df.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                dateFilter === df.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {df.label}
            </button>
          ))}
        </div>

        {/* Custom Date Selector */}
        {dateFilter === 'custom' && (
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100 dark:border-gray-700">
            <div>
              <label className="text-[10px] font-bold text-gray-400 block">{t('startDate')}</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full px-2 py-1 bg-gray-50 dark:bg-gray-900 border rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 block">{t('endDate')}</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full px-2 py-1 bg-gray-50 dark:bg-gray-900 border rounded-lg text-xs"
              />
            </div>
          </div>
        )}

        {/* Type & Account Filters */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100 dark:border-gray-700">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 outline-none"
          >
            <option value="all">Type: All</option>
            <option value="expense">Type: Expense (-)</option>
            <option value="income">Type: Income (+)</option>
            <option value="transfer">Type: Transfer (↔)</option>
          </select>

          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 outline-none"
          >
            <option value="all">Account: All</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Itemized Grouped Transaction List */}
      {groupedByDate.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl text-center space-y-3 border border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-400 font-medium">
            No matching transactions found.
          </p>
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20"
          >
            + Add Transaction
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedByDate.map(([dateStr, items]) => {
            let dayIncome = 0;
            let dayExpense = 0;
            items.forEach((tx) => {
              if (tx.type === 'income' && !tx.isInternalTransfer) dayIncome += tx.amount;
              if (tx.type === 'expense' && !tx.isInternalTransfer) dayExpense += tx.amount;
            });

            return (
              <div
                key={dateStr}
                className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden"
              >
                {/* Date Header Strip */}
                <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900/60 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                    {dateStr}
                  </span>
                  <div className="text-[10px] font-bold space-x-2">
                    {dayIncome > 0 && (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(dayIncome)}
                      </span>
                    )}
                    {dayExpense > 0 && (
                      <span className="text-rose-600 dark:text-rose-400">
                        -{formatCurrency(dayExpense)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
                  {items.map((tx) => {
                    const IconComponent = categoryIconMap[tx.category] || MoreHorizontal;
                    const accountName = accountMap.get(tx.accountId) || 'Account';
                    const toAccountName = tx.toAccountId ? accountMap.get(tx.toAccountId) : null;

                    return (
                      <div
                        key={tx.id}
                        onClick={() => onSelectTransaction(tx)}
                        className="p-3.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/40 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm ${
                              tx.type === 'income'
                                ? 'bg-emerald-500'
                                : tx.type === 'expense'
                                ? 'bg-rose-500'
                                : 'bg-indigo-500'
                            }`}
                          >
                            <IconComponent className="w-5 h-5" />
                          </div>

                          <div>
                            <p className="text-xs font-bold text-gray-900 dark:text-gray-100">
                              {tx.person || tx.category}
                            </p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">
                              {tx.category} •{' '}
                              <span className="font-semibold">
                                {tx.type === 'transfer' && toAccountName
                                  ? `${accountName} → ${toAccountName}`
                                  : accountName}
                              </span>
                            </p>
                            {tx.notes && (
                              <p className="text-[10px] text-gray-400 italic truncate max-w-[180px]">
                                {tx.notes}
                              </p>
                            )}
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
                          <p className="text-[9px] text-gray-400 uppercase mt-0.5">
                            {tx.paymentMethod}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
