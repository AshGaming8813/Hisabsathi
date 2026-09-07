import React, { useState } from 'react';
import { UdhaarContact, UdhaarTransaction, Account } from '../../types';
import { formatCurrency } from '../../utils/calculations';
import { useLanguage } from '../../context/LanguageContext';
import { X, CheckCircle, PlusCircle, Trash2, Bell, Phone } from 'lucide-react';

interface ContactDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: UdhaarContact | null;
  history: UdhaarTransaction[];
  accounts: Account[];
  onAddPayment: (contactId: string, amount: number, accountId: string, notes: string) => Promise<void>;
  onMarkFullyPaid: (contactId: string) => Promise<void>;
  onDeleteContact: (contactId: string) => Promise<void>;
}

export const ContactDetailModal: React.FC<ContactDetailModalProps> = ({
  isOpen,
  onClose,
  contact,
  history,
  accounts,
  onAddPayment,
  onMarkFullyPaid,
  onDeleteContact,
}) => {
  const { t } = useLanguage();
  const [showPaymentForm, setShowPaymentForm] = useState<boolean>(false);
  const [payAmount, setPayAmount] = useState<string>('');
  const [payAccountId, setPayAccountId] = useState<string>(accounts[0]?.id || '');
  const [payNotes, setPayNotes] = useState<string>('');

  if (!isOpen || !contact) return null;

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(payAmount);
    if (!amt || amt <= 0) return;

    await onAddPayment(contact.id, amt, payAccountId, payNotes);
    setPayAmount('');
    setPayNotes('');
    setShowPaymentForm(false);
  };

  const isGiven = contact.type === 'given';
  const totalOriginal = isGiven ? contact.givenAmount : contact.takenAmount;
  const totalSettled = isGiven ? contact.receivedAmount : contact.paidAmount;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 space-y-4 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              {contact.name}
            </h3>
            {contact.mobile && (
              <a
                href={`tel:${contact.mobile}`}
                className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline mt-0.5"
              >
                <Phone className="w-3 h-3" />
                {contact.mobile}
              </a>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto space-y-4 flex-1">
          {/* Summary Box */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-100 dark:border-indigo-800 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center text-xs font-semibold text-indigo-900 dark:text-indigo-200">
              <span>{isGiven ? 'Given (Maine Diya)' : 'Borrowed (Maine Liya)'}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                  contact.status === 'fully_paid'
                    ? 'bg-emerald-500 text-white'
                    : contact.status === 'partially_paid'
                    ? 'bg-amber-500 text-white'
                    : 'bg-indigo-600 text-white'
                }`}
              >
                {contact.status.replace('_', ' ')}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-indigo-200 dark:border-indigo-800">
              <div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 block">Total</span>
                <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
                  {formatCurrency(totalOriginal)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 block">
                  {isGiven ? 'Received' : 'Paid'}
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(totalSettled)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 block">Remaining</span>
                <span className="text-sm font-black text-rose-600 dark:text-rose-400">
                  {formatCurrency(contact.remainingBalance)}
                </span>
              </div>
            </div>

            {contact.dueDate && (
              <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center justify-between pt-1">
                <span>Due Date: {contact.dueDate}</span>
                <button
                  type="button"
                  onClick={() => alert(`Reminder set for ${contact.name} on ${contact.dueDate}`)}
                  className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1 hover:underline"
                >
                  <Bell className="w-3 h-3" /> Remind
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowPaymentForm(!showPaymentForm)}
              className="py-2.5 px-3 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
            >
              <PlusCircle className="w-4 h-4" />
              {t('addPayment')}
            </button>

            <button
              onClick={async () => {
                if (confirm('Mark this entire Udhaar record as fully settled?')) {
                  await onMarkFullyPaid(contact.id);
                  onClose();
                }
              }}
              className="py-2.5 px-3 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20"
            >
              <CheckCircle className="w-4 h-4" />
              {t('markFullyPaid')}
            </button>
          </div>

          {/* Inline Payment Entry Form */}
          {showPaymentForm && (
            <form
              onSubmit={handlePaymentSubmit}
              className="bg-gray-50 dark:bg-gray-900 p-3 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3"
            >
              <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">
                Record New Payment
              </h4>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 block">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    placeholder="0"
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-gray-800 border rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-500 block">Account</label>
                  <select
                    value={payAccountId}
                    onChange={(e) => setPayAccountId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-gray-800 border rounded-xl text-xs"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="Notes (e.g. GPay repayment)"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-gray-800 border rounded-xl text-xs"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(false)}
                  className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                >
                  Save Payment
                </button>
              </div>
            </form>
          )}

          {/* Ledger History List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300">
              {t('history')} ({history.length})
            </h4>

            {history.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No payments logged yet.</p>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700/60 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                {history.map((tx) => (
                  <div key={tx.id} className="p-3 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-gray-900 dark:text-gray-100 capitalize">
                        {tx.type}
                      </span>
                      <span className="text-[10px] text-gray-400 block">{tx.date}</span>
                      {tx.notes && (
                        <span className="text-[10px] text-gray-500 italic block">{tx.notes}</span>
                      )}
                    </div>
                    <span
                      className={`font-black ${
                        tx.type === 'received' || tx.type === 'repaid'
                          ? 'text-emerald-600'
                          : 'text-indigo-600'
                      }`}
                    >
                      {tx.type === 'received' || tx.type === 'repaid' ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Delete Footer */}
        <div className="pt-2 border-t border-gray-100 dark:border-gray-700 flex justify-end">
          <button
            onClick={async () => {
              if (confirm(`Delete Udhaar record for ${contact.name}?`)) {
                await onDeleteContact(contact.id);
                onClose();
              }
            }}
            className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Record
          </button>
        </div>
      </div>
    </div>
  );
};
