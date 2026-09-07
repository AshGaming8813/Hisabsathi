import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { db } from '../../db/database';
import { Languages, Sparkles, Check, ChevronRight } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadDemoData: () => Promise<void>;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onLoadDemoData,
}) => {
  const { completeOnboarding } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [step, setStep] = useState<number>(1);
  const [userName, setUserName] = useState<string>('');
  const [firstAccountName, setFirstAccountName] = useState<string>('SBI Savings Account');
  const [openingBalance, setOpeningBalance] = useState<string>('5000');

  if (!isOpen) return null;

  const handleFinishOnboarding = async (loadDemo: boolean) => {
    completeOnboarding(userName.trim() || 'उपयोगकर्ता');

    if (loadDemo) {
      await onLoadDemoData();
    } else {
      // Create initial first account
      const bal = parseFloat(openingBalance) || 0;
      await db.accounts.add({
        id: `acc_init_${Date.now()}`,
        userId: 'default_user_1',
        name: firstAccountName.trim() || 'Main Cash Account',
        type: 'bank',
        bankName: 'SBI',
        balance: bal,
        initialBalance: bal,
        color: '#2563eb',
        createdAt: new Date().toISOString(),
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/95 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
        {/* Step 1: Language & Welcome */}
        {step === 1 && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center font-black text-3xl mx-auto shadow-xl shadow-emerald-500/30">
              H
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
                {t('welcomeTitle')}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('welcomeSubtitle')}
              </p>
            </div>

            {/* Language Selector Card */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-gray-400 flex items-center justify-center gap-1">
                <Languages className="w-4 h-4 text-emerald-500" />
                Select Language / भाषा चुनें
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLanguage('hi')}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                    language === 'hi'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <span className="text-base font-extrabold">हिंदी</span>
                  <span className="text-[10px] text-gray-400">Hindi</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                    language === 'en'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <span className="text-base font-extrabold">English</span>
                  <span className="text-[10px] text-gray-400">English</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1"
            >
              <span>{t('getStarted')}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Name & Account Setup */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Personalize Your Setup
              </h3>
              <p className="text-xs text-gray-400">Enter your name and initial account balance</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  First Account Name
                </label>
                <input
                  type="text"
                  value={firstAccountName}
                  onChange={(e) => setFirstAccountName(e.target.value)}
                  placeholder="e.g. SBI Bank, Cash Wallet"
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Opening Balance (₹)
                </label>
                <input
                  type="number"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                  placeholder="5000"
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleFinishOnboarding(false)}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1"
              >
                <Check className="w-4 h-4" /> Start Fresh with My Account
              </button>

              <button
                onClick={() => handleFinishOnboarding(true)}
                className="w-full py-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>Load Demo Data (Recommended to Test)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
