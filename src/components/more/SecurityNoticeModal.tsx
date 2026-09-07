import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { ShieldCheck, X, Lock, FileCheck, EyeOff } from 'lucide-react';

interface SecurityNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityNoticeModal: React.FC<SecurityNoticeModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            {t('securityNoticeTitle')}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-gray-600 dark:text-gray-300">
          <p className="leading-relaxed font-medium bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200">
            {t('securityNoticeDesc')}
          </p>

          <div className="space-y-2 pt-1">
            <div className="flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-gray-900 dark:text-gray-100">Zero Credential Collection</h4>
                <p className="text-[11px] text-gray-400">
                  We NEVER ask for or store your UPI PIN, ATM PIN, Banking Password, CVV, or OTP.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <EyeOff className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-gray-900 dark:text-gray-100">Local Device Database</h4>
                <p className="text-[11px] text-gray-400">
                  Your accounts, transactions, and Udhaar ledgers remain strictly on your phone using IndexedDB.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <FileCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-gray-900 dark:text-gray-100">Consent & Statement Import</h4>
                <p className="text-[11px] text-gray-400">
                  Statements are parsed client-side using standard CSV & text parsers without remote screen scraping.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-md"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
