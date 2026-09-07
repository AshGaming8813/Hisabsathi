import React from 'react';
import { Transaction } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface IncomeExpenseChartProps {
  transactions: Transaction[];
}

export const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({ transactions }) => {
  const { t } = useLanguage();

  // Aggregate monthly data for last 6 months
  const prepareChartData = () => {
    const monthsMap = new Map<string, { month: string; income: number; expense: number }>();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = `${months[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
      monthsMap.set(key, { month: label, income: 0, expense: 0 });
    }

    transactions.forEach((tx) => {
      if (!tx.date || tx.isInternalTransfer) return;
      const [y, m] = tx.date.split('-');
      const key = `${y}-${m}`;
      if (monthsMap.has(key)) {
        const item = monthsMap.get(key)!;
        if (tx.type === 'income') item.income += tx.amount;
        if (tx.type === 'expense') item.expense += tx.amount;
      }
    });

    return Array.from(monthsMap.values());
  };

  const chartData = prepareChartData();

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
          {t('incomeVsExpense')}
        </h3>
        <span className="text-[10px] text-gray-400 font-medium">Last 6 Months</span>
      </div>

      <div className="h-48 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#9ca3af" />
            <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" tickFormatter={(val) => `₹${val / 1000}k`} />
            <Tooltip
              formatter={(value: any) => [`₹${value.toLocaleString('en-IN')}`, '']}
              contentStyle={{
                backgroundColor: '#1f2937',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
            <Bar dataKey="income" name={t('income')} fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" name={t('expense')} fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
