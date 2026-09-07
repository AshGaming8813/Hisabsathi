import React, { useState } from 'react';
import { Bill, Account } from '../../types';
import { formatCurrency } from '../../utils/calculations';
import { useLanguage } from '../../context/LanguageContext';
import { Bell, Plus, CheckCircle, Trash2, Calendar, AlertCircle } from 'lucide-react';
import { AddBillModal } from './AddBillModal';

interface BillRemindersProps {
  bills: Bill[];
  accounts: Account[];
  onSaveBill: (bill: Partial<Bill>) => Promise<void>;
  onPayBill: (bill: Bill, accountId: string) => Promise<void>;
  onDeleteBill: (id: string) => Promise<void>;
}

export const BillReminders: React.FC<BillRemindersProps> = ({
  bills,
  accounts,
  onSaveBill,
  onPayBill,
  onDeleteBill,
}) => {
  const { t } = useLanguage();
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" />
            {t('billReminders')}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Electricity, Mobile Recharge, Rent, EMI, Fees & Insurance
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-3.5 py-2 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-600/30 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          {t('addBill')}
        </button>
      </div>

      {/* Bill Items List */}
      {bills.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl text-center space-y-2 border border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-400 font-medium">No bill reminders set yet.</p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold shadow"
          >
            {t('addBill')}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {bills.map((bill) => {
            const isDueToday = bill.dueDate === todayStr;
            const isOverdue = !bill.isPaid && bill.dueDate < todayStr;

            return (
              <div
                key={bill.id}
                className={`bg-white dark:bg-gray-800 p-4 rounded-3xl border shadow-sm space-y-3 transition-all ${
                  bill.isPaid
                    ? 'border-gray-100 dark:border-gray-700 opacity-80'
                    : isOverdue
                    ? 'border-rose-300 dark:border-rose-800 bg-rose-50/20'
                    : isDueToday
                    ? 'border-amber-300 dark:border-amber-800 bg-amber-50/20'
                    : 'border-gray-100 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold shadow-md ${
                        bill.isPaid
                          ? 'bg-gray-400'
                          : isOverdue
                          ? 'bg-rose-500'
                          : 'bg-amber-500'
                      }`}
                    >
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {bill.name}
                      </h4>
                      <p className="text-[10px] text-gray-400">
                        {bill.category} • Repeat: <span className="capitalize">{bill.repeatFrequency}</span>
                      </p>
                      {bill.notes && (
                        <p className="text-[10px] text-gray-500 italic mt-0.5">{bill.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-gray-900 dark:text-gray-100 block">
                      {formatCurrency(bill.amount)}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                        bill.isPaid
                          ? 'bg-emerald-100 text-emerald-800'
                          : isOverdue
                          ? 'bg-rose-100 text-rose-800 animate-pulse'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {bill.isPaid
                        ? 'Paid ✓'
                        : isOverdue
                        ? `Overdue (${bill.dueDate})`
                        : isDueToday
                        ? t('dueToday')
                        : `Due: ${bill.dueDate}`}
                    </span>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700/60">
                  <button
                    onClick={async () => {
                      if (confirm(`Delete bill reminder ${bill.name}?`)) {
                        await onDeleteBill(bill.id);
                      }
                    }}
                    className="text-rose-500 hover:text-rose-700 text-xs font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>

                  {!bill.isPaid && (
                    <button
                      onClick={async () => {
                        const accId = bill.accountId || accounts[0]?.id || '';
                        await onPayBill(bill, accId);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-emerald-600/20"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      {t('payNow')}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      <AddBillModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={onSaveBill}
        accounts={accounts}
      />
    </div>
  );
};
