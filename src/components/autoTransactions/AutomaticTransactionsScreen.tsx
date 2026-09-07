import React, { useState } from 'react';
import {
  PendingAutoTransaction,
  Account,
  UdhaarContact,
  Transaction,
} from '../../types';
import { formatCurrency } from '../../utils/calculations';
import { useLanguage } from '../../context/LanguageContext';
import {
  Bot,
  CheckCircle2,
  XCircle,
  Edit3,
  Users,
  RotateCcw,
  ArrowLeftRight,
  AlertTriangle,
  Info,
  SlidersHorizontal,
  Trash2,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';

interface AutomaticTransactionsScreenProps {
  pendingTransactions: PendingAutoTransaction[];
  accounts: Account[];
  udhaarContacts: UdhaarContact[];
  onConfirmTransaction: (
    item: PendingAutoTransaction,
    customAccount?: string,
    customCategory?: string
  ) => Promise<void>;
  onConfirmUdhaarPayment: (
    item: PendingAutoTransaction,
    contactId: string,
    amount: number,
    accountId: string
  ) => Promise<void>;
  onConfirmRefund: (
    item: PendingAutoTransaction,
    originalTxId: string
  ) => Promise<void>;
  onIgnoreTransaction: (id: string) => Promise<void>;
  onRestoreTransaction: (id: string) => Promise<void>;
  onDeletePermanently: (id: string) => Promise<void>;
  onOpenRulesManager: () => void;
  onOpenPrivacyPermissions: () => void;
}

export const AutomaticTransactionsScreen: React.FC<AutomaticTransactionsScreenProps> = ({
  pendingTransactions,
  accounts,
  udhaarContacts,
  onConfirmTransaction,
  onConfirmUdhaarPayment,
  onConfirmRefund,
  onIgnoreTransaction,
  onRestoreTransaction,
  onDeletePermanently,
  onOpenRulesManager,
  onOpenPrivacyPermissions,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<
    'all' | 'received' | 'paid' | 'refunds' | 'transfers' | 'ignored'
  >('all');
  const [editingItem, setEditingItem] = useState<PendingAutoTransaction | null>(null);

  // Filter items based on active tab
  const filteredList = pendingTransactions.filter((item) => {
    if (activeTab === 'ignored') return item.status === 'ignored';
    if (item.status === 'ignored') return false; // Hide ignored items in standard tabs

    if (activeTab === 'received') return item.direction === 'received' && item.type !== 'refund';
    if (activeTab === 'paid') return item.direction === 'paid' && item.type !== 'transfer';
    if (activeTab === 'refunds') return item.type === 'refund';
    if (activeTab === 'transfers') return item.type === 'transfer';
    return true;
  });

  const pendingCount = pendingTransactions.filter((i) => i.status === 'pending').length;

  return (
    <div className="space-y-4 pb-20">
      {/* Top Banner Header */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-500" />
              {t('autoTransactionsInboxTitle')}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Review and confirm auto-detected bank & UPI notifications
            </p>
          </div>

          <div className="flex gap-1.5">
            <button
              onClick={onOpenRulesManager}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
              title="Custom Rules Manager"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenPrivacyPermissions}
              className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100"
              title="Privacy & Permissions"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'all', label: `ALL (${pendingCount})` },
            { id: 'received', label: 'RECEIVED' },
            { id: 'paid', label: 'PAID' },
            { id: 'refunds', label: 'REFUNDS' },
            { id: 'transfers', label: 'TRANSFERS' },
            { id: 'ignored', label: 'IGNORED' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* List of Detected Transactions */}
      {filteredList.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl text-center space-y-3 border border-gray-100 dark:border-gray-700">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {t('allCaughtUp')}
            </h4>
            <p className="text-xs text-gray-400 mt-1">
              {activeTab === 'ignored'
                ? 'No ignored transactions.'
                : 'No pending automatic transactions waiting for review.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredList.map((item) => {
            const isReceived = item.direction === 'received';
            const isRefund = item.type === 'refund';
            const isTransfer = item.type === 'transfer';

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-3 transition-all"
              >
                {/* Header Strip */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          isRefund
                            ? 'bg-purple-100 text-purple-800'
                            : isTransfer
                            ? 'bg-blue-100 text-blue-800'
                            : isReceived
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isRefund
                          ? 'Refund'
                          : isTransfer
                          ? 'Transfer'
                          : isReceived
                          ? 'Money Received'
                          : 'Payment Paid'}
                      </span>
                      <span className="text-[10px] text-gray-400 font-semibold">
                        Source: {item.source}
                      </span>
                    </div>

                    <h3 className="text-sm font-extrabold text-gray-900 dark:text-gray-100 mt-1">
                      {item.personMerchant}
                    </h3>
                    <p className="text-[10px] text-gray-400">
                      {item.date} • {item.time} | Suggested: <span className="font-bold text-gray-700 dark:text-gray-300">{item.suggestedCategory}</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-lg font-black ${
                        isRefund
                          ? 'text-purple-600'
                          : isTransfer
                          ? 'text-blue-600'
                          : isReceived
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isReceived ? '+' : '-'}{formatCurrency(item.amount)}
                    </div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase">
                      {Math.round(item.confidence * 100)}% Confidence
                    </span>
                  </div>
                </div>

                {/* Raw Notification Text Bubble */}
                <div className="p-2.5 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-100 dark:border-gray-700/60 text-[11px] text-gray-600 dark:text-gray-300 font-mono italic">
                  "{item.rawText}"
                </div>

                {/* 1. Duplicate Warning Box */}
                {item.isPossibleDuplicate && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <span className="font-bold">{t('possibleDuplicate')}</span>
                        <p className="text-[10px] text-amber-700 dark:text-amber-300">
                          A similar transaction of {formatCurrency(item.amount)} exists on {item.date}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Udhaar Smart Match Box */}
                {item.matchedUdhaarContactId && (
                  <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-indigo-900 dark:text-indigo-200">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-indigo-600" />
                        {t('possibleUdhaarPayment')}
                      </span>
                      <span className="text-[10px] bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-0.5 rounded-full">
                        {item.matchedUdhaarContactName}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1 border-t border-indigo-200/60">
                      <div>
                        <span className="text-[10px] text-gray-500 block">Previously Due</span>
                        <span className="font-bold">
                          {formatCurrency(item.matchedUdhaarPreviousDue || 0)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 block">Detected Payment</span>
                        <span className="font-bold text-emerald-600">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 block">New Remaining</span>
                        <span className="font-black text-indigo-600">
                          {formatCurrency(
                            Math.max(0, (item.matchedUdhaarPreviousDue || 0) - item.amount)
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() =>
                          onConfirmUdhaarPayment(
                            item,
                            item.matchedUdhaarContactId!,
                            item.amount,
                            accounts[0]?.id || ''
                          )
                        }
                        className="flex-1 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow"
                      >
                        {t('addPayment')} (Udhaar)
                      </button>
                      <button
                        onClick={() => onConfirmTransaction(item)}
                        className="px-3 py-1.5 rounded-xl bg-white text-indigo-900 border border-indigo-200 font-semibold text-xs"
                      >
                        {t('addAsIncome')}
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. Refund Link Box */}
                {item.matchedRefundTxId && (
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-2xl space-y-2 text-xs text-purple-900 dark:text-purple-200">
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5">
                        <RotateCcw className="w-4 h-4 text-purple-600" />
                        {t('possibleRefundDetected')}
                      </span>
                    </div>

                    <p className="text-[11px] text-purple-800 dark:text-purple-300">
                      Original Expense: <span className="font-bold">{item.matchedRefundTxDescription}</span>
                    </p>

                    <button
                      onClick={() => onConfirmRefund(item, item.matchedRefundTxId!)}
                      className="w-full py-1.5 rounded-xl bg-purple-600 text-white font-bold text-xs shadow"
                    >
                      {t('confirmRefund')}
                    </button>
                  </div>
                )}

                {/* Main Action Buttons */}
                {activeTab === 'ignored' ? (
                  <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700/60">
                    <button
                      onClick={() => onRestoreTransaction(item.id)}
                      className="flex-1 py-2 rounded-xl bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 font-bold text-xs flex items-center justify-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Restore
                    </button>
                    <button
                      onClick={() => onDeletePermanently(item.id)}
                      className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 font-bold text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 dark:border-gray-700/60">
                    <button
                      onClick={() => onConfirmTransaction(item)}
                      className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {t('addTransaction')}
                    </button>

                    <button
                      onClick={() => setEditingItem(item)}
                      className="py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-xs flex items-center justify-center gap-1 hover:bg-gray-200"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>

                    <button
                      onClick={() => onIgnoreTransaction(item.id)}
                      className="py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 font-bold text-xs flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      {t('ignore')}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Before Confirm Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-2xl space-y-3">
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
              Edit Transaction Before Confirming
            </h3>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Amount (₹)
              </label>
              <input
                type="number"
                value={editingItem.amount}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, amount: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Merchant / Person
              </label>
              <input
                type="text"
                value={editingItem.personMerchant}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, personMerchant: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <input
                type="text"
                value={editingItem.suggestedCategory}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, suggestedCategory: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border rounded-xl text-xs"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await onConfirmTransaction(
                    editingItem,
                    accounts[0]?.id,
                    editingItem.suggestedCategory
                  );
                  setEditingItem(null);
                }}
                className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
              >
                Confirm & Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
