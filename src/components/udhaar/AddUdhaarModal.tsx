import React, { useState } from 'react';
import { UdhaarContact, UdhaarType, Account } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { X, UserPlus } from 'lucide-react';

interface AddUdhaarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contact: Partial<UdhaarContact>, initialPayment?: number, accountId?: string) => Promise<void>;
  accounts: Account[];
  initialType?: UdhaarType;
}

export const AddUdhaarModal: React.FC<AddUdhaarModalProps> = ({
  isOpen,
  onClose,
  onSave,
  accounts,
  initialType = 'given',
}) => {
  const { t } = useLanguage();
  const [type, setType] = useState<UdhaarType>(initialType);
  const [name, setName] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [initialPayment, setInitialPayment] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [accountId, setAccountId] = useState<string>(accounts[0]?.id || '');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalAmt = parseFloat(amount);
    if (!name.trim() || !totalAmt || totalAmt <= 0) return;

    const paidAmt = parseFloat(initialPayment) || 0;
    const remaining = totalAmt - paidAmt;

    let status: any = 'pending';
    if (remaining <= 0) status = 'fully_paid';
    else if (paidAmt > 0) status = 'partially_paid';

    await onSave(
      {
        name: name.trim(),
        mobile: mobile.trim(),
        type,
        givenAmount: type === 'given' ? totalAmt : 0,
        receivedAmount: type === 'given' ? paidAmt : 0,
        takenAmount: type === 'taken' ? totalAmt : 0,
        paidAmount: type === 'taken' ? paidAmt : 0,
        remainingBalance: remaining,
        dueDate,
        notes,
        status,
      },
      paidAmt,
      accountId
    );

    setName('');
    setMobile('');
    setAmount('');
    setInitialPayment('');
    setDueDate('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-indigo-500" />
            {t('addUdhaarEntry')}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Tabs: Given vs Taken */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-2xl">
            <button
              type="button"
              onClick={() => setType('given')}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                type === 'given'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              {t('tabMaineDiya')}
            </button>
            <button
              type="button"
              onClick={() => setType('taken')}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                type === 'taken'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              {t('tabMaineLiya')}
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              {t('personName')} *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rohit Sharma, Kirana Store"
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-gray-100 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {t('mobileNumber')}
              </label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-gray-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Total {type === 'given' ? 'Given' : 'Borrowed'} Amount (₹) *
              </label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-900 dark:text-gray-100 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Already {type === 'given' ? 'Received' : 'Paid'} (₹)
              </label>
              <input
                type="number"
                value={initialPayment}
                onChange={(e) => setInitialPayment(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-900 dark:text-gray-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {t('dueDate')}
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-gray-100 outline-none"
              />
            </div>
          </div>

          {accounts.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Associated Account / Wallet
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-gray-100 outline-none"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} (₹{acc.balance})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              {t('notes')}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reason or item details..."
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-gray-100 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30"
          >
            {t('save')}
          </button>
        </form>
      </div>
    </div>
  );
};
