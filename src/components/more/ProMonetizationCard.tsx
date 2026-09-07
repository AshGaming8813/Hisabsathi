import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Sparkles, Check, Crown } from 'lucide-react';

interface ProMonetizationCardProps {
  isPro?: boolean;
  onUpgradeClick?: () => void;
}

export const ProMonetizationCard: React.FC<ProMonetizationCardProps> = ({
  isPro = false,
  onUpgradeClick,
}) => {
  const { t } = useLanguage();

  return (
    <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 text-white p-4 rounded-3xl shadow-lg border border-amber-400/40 space-y-3 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-yellow-100 font-extrabold shadow-inner">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold tracking-tight flex items-center gap-1.5">
              {t('proUpgradeTitle')}
            </h3>
            <p className="text-[10px] text-amber-100 font-medium">
              {isPro ? 'Pro Subscription Active' : 'Har Rupaye Ka Saaf Hisab.'}
            </p>
          </div>
        </div>

        {isPro ? (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-white text-amber-800 shadow">
            PRO MEMBER
          </span>
        ) : (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-900/40 text-yellow-200 border border-yellow-300/30">
            ₹49 / month
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/20 text-[11px]">
        <div className="flex items-center gap-1.5 text-amber-100">
          <Check className="w-3.5 h-3.5 text-yellow-300" />
          <span>Unlimited Auto Tracking</span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-100">
          <Check className="w-3.5 h-3.5 text-yellow-300" />
          <span>Custom Smart Rules</span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-100">
          <Check className="w-3.5 h-3.5 text-yellow-300" />
          <span>PDF & CSV Statement Exports</span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-100">
          <Check className="w-3.5 h-3.5 text-yellow-300" />
          <span>Unlimited Bank Accounts</span>
        </div>
      </div>

      {!isPro && (
        <button
          onClick={() => {
            if (onUpgradeClick) onUpgradeClick();
            else alert('Upgraded to HisabSaathi Pro successfully!');
          }}
          className="w-full py-2.5 rounded-2xl bg-white text-amber-900 font-extrabold text-xs shadow-md hover:bg-amber-50 active:scale-98 transition-all flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>{t('upgradeToProBtn')}</span>
        </button>
      )}
    </div>
  );
};
