import React, { useState } from 'react';
import { Account, Transaction } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { parseCSVStatement, ParsedStatementRow } from '../../utils/statementParser';
import { formatCurrency } from '../../utils/calculations';
import { X, UploadCloud, CheckCircle2, ShieldCheck } from 'lucide-react';

interface StatementImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  existingTransactions: Transaction[];
  onImportConfirm: (rows: ParsedStatementRow[], targetAccountId: string) => Promise<void>;
}

export const StatementImportModal: React.FC<StatementImportModalProps> = ({
  isOpen,
  onClose,
  accounts,
  existingTransactions,
  onImportConfirm,
}) => {
  const { t } = useLanguage();
  const [selectedAccountId, setSelectedAccountId] = useState<string>(accounts[0]?.id || '');
  const [parsedRows, setParsedRows] = useState<ParsedStatementRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  if (!isOpen) return null;

  const existingHashes = new Set(
    existingTransactions.map((tx) => tx.duplicateHash).filter(Boolean)
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const rows = await parseCSVStatement(file);
      setParsedRows(rows);

      // Select all non-duplicate rows by default
      const initialIndices = new Set<number>();
      rows.forEach((r, idx) => {
        if (!existingHashes.has(r.duplicateHash)) {
          initialIndices.add(idx);
        }
      });
      setSelectedIndices(initialIndices);
    } catch (err) {
      alert('Error reading CSV statement. Please ensure it is a valid bank or UPI statement CSV.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelectRow = (idx: number) => {
    const next = new Set(selectedIndices);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setSelectedIndices(next);
  };

  const handleConfirmImport = async () => {
    const toImport = parsedRows.filter((_, idx) => selectedIndices.has(idx));
    if (toImport.length === 0) return;

    await onImportConfirm(toImport, selectedAccountId);
    setParsedRows([]);
    setSelectedIndices(new Set());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-emerald-500" />
            {t('importStatement')}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Rule Warning */}
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-900 dark:text-emerald-200">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            100% Offline & Secure: No PIN, password, or login credentials required. We scan CSV/PDF text files locally on your device.
          </span>
        </div>

        {/* Target Account Selection */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
            Target Account for Import *
          </label>
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-gray-100 outline-none"
          >
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({acc.bankName})
              </option>
            ))}
          </select>
        </div>

        {/* File Upload Box */}
        {parsedRows.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-8 text-center space-y-3 hover:border-emerald-500 transition-colors">
            <UploadCloud className="w-10 h-10 text-emerald-500 mx-auto" />
            <div>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                {t('uploadCSVorPDF')}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Supports SBI, HDFC, ICICI, PhonePe, Paytm & custom bank CSV statements
              </p>
            </div>
            <label className="inline-block px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md">
              <span>Select CSV File</span>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          <div className="space-y-3 flex-1 overflow-hidden flex flex-col">
            <div className="flex justify-between items-center text-xs font-bold">
              <span>
                Parsed {parsedRows.length} Rows ({selectedIndices.size} Selected)
              </span>
              <button
                onClick={() => setParsedRows([])}
                className="text-rose-500 hover:underline text-[11px]"
              >
                Change File
              </button>
            </div>

            {/* Scrollable Preview Table */}
            <div className="flex-1 overflow-y-auto border border-gray-100 dark:border-gray-700 rounded-2xl divide-y divide-gray-100 dark:divide-gray-700">
              {parsedRows.map((row, idx) => {
                const isDuplicate = existingHashes.has(row.duplicateHash);
                const isSelected = selectedIndices.has(idx);

                return (
                  <div
                    key={idx}
                    onClick={() => toggleSelectRow(idx)}
                    className={`p-3 flex items-center justify-between text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/30'
                        : 'bg-white dark:bg-gray-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectRow(idx)}
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <p className="font-bold text-gray-900 dark:text-gray-100">
                          {row.description}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400">
                          <span>{row.date}</span>
                          <span>•</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            Auto Category: {row.category}
                          </span>
                          {isDuplicate && (
                            <span className="text-rose-500 font-bold">⚠️ Duplicate</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`font-black ${
                        row.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {row.type === 'income' ? '+' : '-'}
                      {formatCurrency(row.amount)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Confirm Import Button */}
            <button
              onClick={handleConfirmImport}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {t('importNow')} ({selectedIndices.size} Items)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
