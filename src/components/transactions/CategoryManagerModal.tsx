import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { db } from '../../db/database';
import { X, Tag } from 'lucide-react';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryAdded?: () => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  onCategoryAdded,
}) => {
  const { t } = useLanguage();
  const [name, setName] = useState<string>('');
  const [hindiName, setHindiName] = useState<string>('');
  const [type, setType] = useState<'income' | 'expense'>('expense');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await db.categories.add({
      id: `cat_custom_${Date.now()}`,
      name: name.trim(),
      hindiName: hindiName.trim() || name.trim(),
      icon: 'Tag',
      type,
      color: type === 'income' ? '#10b981' : '#ef4444',
      isCustom: true,
    });

    setName('');
    setHindiName('');
    if (onCategoryAdded) onCategoryAdded();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Tag className="w-4 h-4 text-emerald-500" />
            {t('addCustomCategory')}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Category Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-2 rounded-xl text-xs font-bold ${
                  type === 'expense'
                    ? 'bg-rose-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                Expense Category
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-2 rounded-xl text-xs font-bold ${
                  type === 'income'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                Income Category
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              {t('categoryName')} (English) *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Festival, Dairy, Gym"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-gray-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              {t('categoryHindiName')} (हिंदी)
            </label>
            <input
              type="text"
              value={hindiName}
              onChange={(e) => setHindiName(e.target.value)}
              placeholder="उदा. त्यौहार, दूध का खर्च"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-gray-100 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-600/30 hover:bg-emerald-700"
          >
            {t('save')}
          </button>
        </form>
      </div>
    </div>
  );
};
