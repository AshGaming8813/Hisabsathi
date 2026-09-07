import React from 'react';
import { Crown, Sparkles, X, Lock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { ProFeatureKey } from '../../types/subscription';

interface ProFeatureGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewPro: () => void;
  featureKey?: ProFeatureKey;
  customTitle?: string;
  customDescription?: string;
}

export const ProFeatureGateModal: React.FC<ProFeatureGateModalProps> = ({
  isOpen,
  onClose,
  onViewPro,
  featureKey,
  customTitle,
  customDescription,
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-2xl space-y-4 text-center border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in-95">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner border border-amber-300/30">
          <Crown className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-gray-900 dark:text-gray-100">
            {customTitle || 'HisabSaathi Pro Required'}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {customDescription ||
              'Unlock automatic money tracking, custom rules, PDF reports, and advanced financial analytics.'}
          </p>
        </div>

        <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 rounded-2xl border border-amber-200 dark:border-amber-800 text-left text-xs space-y-1">
          <span className="font-extrabold text-amber-900 dark:text-amber-200 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Included in Pro (₹99/mo or ₹799/yr):
          </span>
          <ul className="text-[11px] text-amber-800 dark:text-amber-300 font-medium space-y-0.5 list-disc pl-4">
            <li>Automatic bank & UPI SMS transaction parser</li>
            <li>Custom categorization rules & refund linking</li>
            <li>PDF statement export & CSV download</li>
          </ul>
        </div>

        <div className="space-y-2 pt-1">
          <button
            onClick={() => {
              onClose();
              onViewPro();
            }}
            className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 active:scale-98 transition-all"
          >
            <Crown className="w-4 h-4" /> View Pro Plans
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold text-xs hover:bg-gray-200"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};
