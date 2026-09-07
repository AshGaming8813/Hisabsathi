import React, { useState, useEffect } from 'react';
import { Transaction, Account, Category, TransactionType, PaymentMethod } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { defaultCategoriesList } from '../../i18n/translations';
import { X, Camera, Plus, Trash2 } from 'lucide-react';

interface AddEditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Partial<Transaction>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  accounts: Account[];
  categories: Category[];
  initialType?: TransactionType;
  editingTransaction?: Transaction | null;
  onAddCustomCategoryClick?: () => void;
}

export const AddEditTransactionModal: React.FC<AddEditTransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  accounts,
  categories,
  initialType = 'expense',
  editingTransaction,
  onAddCustomCategoryClick,
}) => {
  const { t } = useLanguage();

  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('Food');
  const [accountId, setAccountId] = useState<string>('');
  const [toAccountId, setToAccountId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>(
    new Date().toTimeString().split(' ')[0].slice(0, 5)
  );
  const [person, setPerson] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [receiptPhoto, setReceiptPhoto] = useState<string>('');

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(String(editingTransaction.amount));
      setCategory(editingTransaction.category);
      setAccountId(editingTransaction.accountId);
      setToAccountId(editingTransaction.toAccountId || '');
      setDate(editingTransaction.date);
      setTime(editingTransaction.time || '12:00');
      setPerson(editingTransaction.person || '');
      setNotes(editingTransaction.notes || '');
      setPaymentMethod(editingTransaction.paymentMethod || 'upi');
      setReceiptPhoto(editingTransaction.receiptPhoto || '');
    } else {
      setType(initialType);
      setAmount('');
      setCategory(initialType === 'income' ? 'Salary' : initialType === 'transfer' ? 'Transfer' : 'Food');
      if (accounts.length > 0) {
        setAccountId(accounts[0].id);
        if (accounts.length > 1) setToAccountId(accounts[1].id);
      }
      setDate(new Date().toISOString().split('T')[0]);
      setTime(new Date().toTimeString().split(' ')[0].slice(0, 5));
      setPerson('');
      setNotes('');
      setReceiptPhoto('');
    }
  }, [editingTransaction, initialType, accounts, isOpen]);

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;
    if (!accountId) return;
    if (type === 'transfer' && (!toAccountId || accountId === toAccountId)) return;

    await onSave({
      id: editingTransaction?.id,
      type,
      amount: numAmount,
      category: type === 'transfer' ? 'Transfer' : category,
      accountId,
      toAccountId: type === 'transfer' ? toAccountId : undefined,
      date,
      time,
      person,
      notes,
      paymentMethod,
      receiptPhoto,
      isInternalTransfer: type === 'transfer',
    });

    onClose();
  };

  const availableCategories =
    categories.length > 0
      ? categories
      : (defaultCategoriesList as Category[]);

  const filteredCategories = availableCategories.filter(
    (c) => c.type === type || c.type === 'both'
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
            {editingTransaction ? t('editTransaction') : t('newTransaction')}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Type Selector Pills */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 dark:bg-gray-700/60 rounded-2xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              {t('expense')}
            </button>

            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              {t('income')}
            </button>

            <button
              type="button"
              onClick={() => setType('transfer')}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                type === 'transfer'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              {t('transfer')}
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              {t('amount')} *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-extrabold text-gray-400">
                ₹
              </span>
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full pl-8 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-2xl font-black text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Category Dropdown (if not transfer) */}
          {type !== 'transfer' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {t('category')} *
                </label>
                {onAddCustomCategoryClick && (
                  <button
                    type="button"
                    onClick={onAddCustomCategoryClick}
                    className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" />
                    {t('addCustomCategory')}
                  </button>
                )}
              </div>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-gray-100 outline-none"
              >
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name} ({cat.hindiName})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Account Selection */}
          {type === 'transfer' ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {t('fromAccount')} *
                </label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-gray-100 outline-none"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} (₹{acc.balance})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {t('toAccount')} *
                </label>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-gray-100 outline-none"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id} disabled={acc.id === accountId}>
                      {acc.name} (₹{acc.balance})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {t('account')} *
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-gray-100 outline-none"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} (₹{acc.balance})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Payment Method Pills */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              {t('paymentMethod')}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'upi', label: t('upi') },
                { id: 'cash', label: t('cash') },
                { id: 'bank', label: t('bank') },
                { id: 'other', label: t('other') },
              ].map((pm) => (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => setPaymentMethod(pm.id as PaymentMethod)}
                  className={`py-2 rounded-xl text-xs font-bold transition-colors ${
                    paymentMethod === pm.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {pm.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {t('date')}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-gray-100 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {t('time')}
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-gray-100 outline-none"
              />
            </div>
          </div>

          {/* Person / Merchant */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              {t('personMerchant')}
            </label>
            <input
              type="text"
              value={person}
              onChange={(e) => setPerson(e.target.value)}
              placeholder="e.g. Swiggy, D-Mart, Rohit"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-gray-100 outline-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              {t('notes')}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional remarks..."
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-gray-100 outline-none"
            />
          </div>

          {/* Receipt Photo Upload */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              {t('receiptPhoto')}
            </label>
            <div className="flex items-center space-x-3">
              <label className="cursor-pointer px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold flex items-center gap-1.5 hover:bg-gray-200">
                <Camera className="w-4 h-4 text-emerald-600" />
                <span>Upload Bill/Receipt</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
              {receiptPhoto && (
                <div className="relative">
                  <img
                    src={receiptPhoto}
                    alt="Receipt"
                    className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => setReceiptPhoto('')}
                    className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-0.5 text-[8px]"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Save & Delete Buttons */}
          <div className="pt-3 flex gap-3">
            {editingTransaction && onDelete && (
              <button
                type="button"
                onClick={async () => {
                  if (confirm('Delete this transaction?')) {
                    await onDelete(editingTransaction.id);
                    onClose();
                  }
                }}
                className="px-4 py-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 font-bold text-xs flex items-center justify-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                {t('delete')}
              </button>
            )}

            <button
              type="submit"
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 active:scale-98 transition-all"
            >
              {t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
