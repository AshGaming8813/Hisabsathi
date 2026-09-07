import React, { useState } from 'react';
import { Transaction, Account } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { exportTransactionsPDF } from '../../utils/pdfExport';
import { exportTransactionsCSV } from '../../utils/csvExport';
import { X, FileText, Download, Calendar } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  accounts: Account[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  accounts,
}) => {
  const { t } = useLanguage();

  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [format, setFormat] = useState<'pdf' | 'csv'>('pdf');

  if (!isOpen) return null;

  const handleExport = () => {
    let filtered = transactions;
    if (startDate) {
      filtered = filtered.filter((tx) => tx.date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter((tx) => tx.date <= endDate);
    }

    if (format === 'pdf') {
      exportTransactionsPDF(filtered, accounts, startDate, endDate);
    } else {
      exportTransactionsCSV(filtered, accounts);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-500" />
            {t('exportData')}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              {t('exportFormat')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormat('pdf')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                  format === 'pdf'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                📄 PDF Statement Report
              </button>
              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                  format === 'csv'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                📊 CSV Excel File
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-500" />
              {t('dateRange')} (Optional)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-gray-400 block">{t('startDate')}</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs"
                />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block">{t('endDate')}</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleExport}
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            {format === 'pdf' ? t('downloadPDF') : t('downloadCSV')}
          </button>
        </div>
      </div>
    </div>
  );
};
