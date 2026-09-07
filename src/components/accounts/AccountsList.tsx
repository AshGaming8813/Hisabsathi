import React, { useState } from 'react';
import { Account, Transaction } from '../../types';
import { formatCurrency } from '../../utils/calculations';
import { useLanguage } from '../../context/LanguageContext';
import { Landmark, Wallet, Smartphone, Plus, ArrowLeftRight, CreditCard, ChevronRight } from 'lucide-react';
import { AddEditAccountModal } from './AddEditAccountModal';

interface AccountsListProps {
  accounts: Account[];
  transactions: Transaction[];
  onSaveAccount: (acc: Partial<Account>) => Promise<void>;
  onDeleteAccount: (id: string) => Promise<void>;
  onOpenTransferModal: () => void;
}

export const AccountsList: React.FC<AccountsListProps> = ({
  accounts,
  transactions,
  onSaveAccount,
  onDeleteAccount,
  onOpenTransferModal,
}) => {
  const { t } = useLanguage();
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  // Compute total money across all accounts
  const totalBalance = accounts.reduce((acc, a) => acc + (a.balance || 0), 0);

  return (
    <div className="space-y-4 pb-20">
      {/* Top Banner */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Landmark className="w-5 h-5 text-emerald-500" />
              {t('accountManagement')}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Cash, Bank Accounts & UPI Wallets
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onOpenTransferModal}
              className="px-3 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-bold text-xs flex items-center gap-1 border border-indigo-200 dark:border-indigo-800"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              {t('transferMoney')}
            </button>

            <button
              onClick={() => {
                setEditingAccount(null);
                setIsAddModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
            >
              <Plus className="w-4 h-4" />
              {t('addAccount')}
            </button>
          </div>
        </div>

        {/* Total Summary */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md flex justify-between items-center">
          <div>
            <span className="text-[10px] text-emerald-100 uppercase font-semibold">
              Net Stored Liquidity
            </span>
            <div className="text-2xl font-black">{formatCurrency(totalBalance)}</div>
          </div>
          <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
            {accounts.length} Active Accounts
          </span>
        </div>

        {/* Info Note on Internal Transfers */}
        <p className="text-[11px] text-gray-400 dark:text-gray-400 italic">
          💡 {t('internalTransferInfo')}
        </p>
      </div>

      {/* Account Cards */}
      <div className="space-y-3">
        {accounts.map((acc) => {
          // Compute total received & spent for this specific account
          let totalReceived = 0;
          let totalSpent = 0;

          transactions.forEach((tx) => {
            if (tx.type === 'income' && tx.accountId === acc.id) totalReceived += tx.amount;
            if (tx.type === 'expense' && tx.accountId === acc.id) totalSpent += tx.amount;
            if (tx.type === 'transfer') {
              if (tx.toAccountId === acc.id) totalReceived += tx.amount;
              if (tx.accountId === acc.id) totalSpent += tx.amount;
            }
          });

          const IconComponent =
            acc.type === 'cash' ? Wallet : acc.type === 'upi' ? Smartphone : CreditCard;

          return (
            <div
              key={acc.id}
              className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-3 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold shadow-md ${
                      acc.type === 'cash'
                        ? 'bg-emerald-500 shadow-emerald-500/20'
                        : acc.type === 'bank'
                        ? 'bg-blue-600 shadow-blue-600/20'
                        : 'bg-purple-600 shadow-purple-600/20'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {acc.name}
                    </h3>
                    <p className="text-[10px] text-gray-400 capitalize">
                      {acc.bankName} {acc.accountNumber ? `• ${acc.accountNumber}` : ''}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold block">
                    {t('currentBalance')}
                  </span>
                  <span className="text-lg font-black text-gray-900 dark:text-gray-100">
                    {formatCurrency(acc.balance)}
                  </span>
                </div>
              </div>

              {/* Stats Breakdown Strip */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-gray-700/60 text-xs">
                <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-xl">
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-300 block font-medium">
                    {t('totalReceived')}
                  </span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">
                    +{formatCurrency(totalReceived)}
                  </span>
                </div>

                <div className="bg-rose-50 dark:bg-rose-950/40 p-2 rounded-xl">
                  <span className="text-[10px] text-rose-700 dark:text-rose-300 block font-medium">
                    {t('totalSpent')}
                  </span>
                  <span className="font-bold text-rose-700 dark:text-rose-300">
                    -{formatCurrency(totalSpent)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => {
                    setEditingAccount(acc);
                    setIsAddModalOpen(true);
                  }}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Edit Account Settings →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Account Modal */}
      <AddEditAccountModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingAccount(null);
        }}
        onSave={onSaveAccount}
        editingAccount={editingAccount}
      />
    </div>
  );
};
