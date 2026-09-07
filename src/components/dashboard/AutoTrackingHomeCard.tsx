import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Bot, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';

interface AutoTrackingHomeCardProps {
  pendingCount: number;
  onReviewNow: () => void;
  onManageSettings: () => void;
}

export const AutoTrackingHomeCard: React.FC<AutoTrackingHomeCardProps> = ({
  pendingCount,
  onReviewNow,
  onManageSettings,
}) => {
  const { t } = useLanguage();

  return (
    <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-4 rounded-3xl shadow-md border border-indigo-700/50 space-y-2.5 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-indigo-300">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>🤖 {t('autoMoneyTrackingTitle')}</span>
            </h3>
            <p className="text-[10px] text-indigo-200 font-medium">
              Smart notification & SMS detection engine
            </p>
          </div>
        </div>

        {pendingCount > 0 ? (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
            {pendingCount} New
          </span>
        ) : (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Active
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-indigo-700/40">
        {pendingCount > 0 ? (
          <>
            <span className="text-xs font-semibold text-indigo-100">
              <span className="font-bold text-amber-300">{pendingCount}</span> {t('pendingReview')}
            </span>
            <button
              onClick={onReviewNow}
              className="px-3 py-1.5 rounded-xl bg-white text-indigo-900 font-extrabold text-xs flex items-center gap-1 hover:bg-indigo-50 active:scale-95 transition-all shadow-sm"
            >
              <span>{t('reviewNow')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <>
            <span className="text-xs font-medium text-indigo-200">
              {t('allCaughtUp')}
            </span>
            <button
              onClick={onManageSettings}
              className="text-xs font-bold text-indigo-300 hover:text-white underline flex items-center gap-0.5"
            >
              <span>{t('manageSettings')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
