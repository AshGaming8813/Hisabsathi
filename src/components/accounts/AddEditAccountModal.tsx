import React, { useState, useEffect } from 'react';
import { Account, AccountType, BankName } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { X, Landmark } from 'lucide-react';

interface AddEditAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (acc: Partial<Account>) => Promise<void>;
  editingAccount?: Account | null;
}

export const AddEditAccountModal: React.FC<AddEditAccountModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingAccount,
}) => {
  const { t } = useLanguage();
  const [name, setName] = useState<string>('');
  const [type, setType] = useState<AccountType>('bank');
  const [bankName, setBankName] = useState<BankName>('SBI');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [initialBalance, setInitialBalance] = useState<string>('0');

  useEffect(() => {
    if (editingAccount) {
      setName(editingAccount.name);
      setType(editingAccount.type);
      setBankName(editingAccount.bankName);
      setAccountNumber(editingAccount.accountNumber || '');
      setInitialBalance(String(editingAccount.initialBalance || 0));
    } else {
      setName('');
      setType('bank');
      setBankName('SBI');
      setAccountNumber('');
      setInitialBalance('0');
    }
  }, [editingAccount, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const initBal = parseFloat(initialBalance) || 0;

    await onSave({
      id: editingAccount?.id,
      name: name.trim(),
      type,
      bankName,
      accountNumber,
      initialBalance: initBal,
      balance: editingAccount ? editingAccount.balance : initBal,
      color: type === 'cash' ? '#10b981' : type === 'bank' ? '#2563eb' : '#7c3aed',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-emerald-500" />
            {editingAccount ? 'Edit Account' : t('addAccount')}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              {t('accountType')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'bank', label: 'Bank' },
                { id: 'upi', label: 'UPI Wallet' },
                { id: 'cash', label: 'Cash' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setType(item.id as AccountType)}
                  className={`py-2 rounded-xl text-xs font-bold ${
                    type === item.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              {t('accountName')} *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. SBI Savings, PhonePe Wallet"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-gray-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              {t('bankName')}
            </label>
            <select
              value={bankName}
              onChange={(e) => setBankName(e.target.value as BankName)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-gray-100 outline-none"
            >
              <option value="Cash">Cash Wallet</option>
              <option value="SBI">SBI (State Bank of India)</option>
              <option value="HDFC">HDFC Bank</option>
              <option value="ICICI">ICICI Bank</option>
              <option value="Axis">Axis Bank</option>
              <option value="PhonePe">PhonePe</option>
              <option value="Google Pay">Google Pay</option>
              <option value="Paytm">Paytm</option>
              <option value="Other Bank">Other Bank</option>
              <option value="Other UPI">Other UPI</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Last 4 Digits of Account Number (Optional)
            </label>
            <input
              type="text"
              maxLength={6}
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="e.g. 4821"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-gray-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              {t('initialBalance')}
            </label>
            <input
              type="number"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-900 dark:text-gray-100 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 hover:bg-emerald-700"
          >
            {t('save')}
          </button>
        </form>
      </div>
    </div>
  );
};
