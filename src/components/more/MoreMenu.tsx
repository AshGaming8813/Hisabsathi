import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import {
  BarChart3,
  UploadCloud,
  Bell,
  Download,
  Lock,
  Sparkles,
  ShieldCheck,
  Languages,
  Sun,
  Moon,
  Trash2,
  ChevronRight,
  Bot,
  SlidersHorizontal,
  Crown,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { ExportModal } from './ExportModal';
import { SecurityNoticeModal } from './SecurityNoticeModal';
import { PrivacyPermissionsModal } from './PrivacyPermissionsModal';
import { TransactionRulesModal } from '../autoTransactions/TransactionRulesModal';
import { ProMonetizationCard } from './ProMonetizationCard';
import { subscriptionManager } from '../../services/subscription/SubscriptionManager';
import { Transaction, Account, PendingAutoTransaction, TransactionRule, AutoTrackingSettings } from '../../types';

interface MoreMenuProps {
  onNavigateTab: (tab: any) => void;
  onOpenImport: () => void;
  onOpenSubscription: () => void;
  onOpenAdminDashboard: () => void;
  onLoadDemoData: () => Promise<void>;
  onClearAllData: () => Promise<void>;
  transactions: Transaction[];
  accounts: Account[];
  pendingAutoTransactions: PendingAutoTransaction[];
  rules: TransactionRule[];
  autoSettings?: AutoTrackingSettings;
  isPro?: boolean;
}

export const MoreMenu: React.FC<MoreMenuProps> = ({
  onNavigateTab,
  onOpenImport,
  onOpenSubscription,
  onOpenAdminDashboard,
  onLoadDemoData,
  onClearAllData,
  transactions,
  accounts,
  pendingAutoTransactions,
  rules,
  autoSettings,
  isPro = false,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { hasPin, setPin, removePin, userId } = useAuth();

  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState<boolean>(false);
  const [isPrivacyPermissionsOpen, setIsPrivacyPermissionsOpen] = useState<boolean>(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState<boolean>(false);

  const [showPinSetup, setShowPinSetup] = useState<boolean>(false);
  const [newPin, setNewPin] = useState<string>('');

  const pendingCount = pendingAutoTransactions.filter((p) => p.status === 'pending').length;

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length === 4) {
      setPin(newPin);
      setNewPin('');
      setShowPinSetup(false);
      alert('4-Digit PIN Lock Enabled Successfully!');
    }
  };

  const handleRestorePurchase = async () => {
    try {
      const res = await subscriptionManager.restorePurchases(userId);
      if (res.success && res.userSubscription?.isPro) {
        alert('🎉 Active HisabSaathi Pro subscription restored!');
      } else {
        alert(res.errorMessage || 'No active HisabSaathi Pro subscription found.');
      }
    } catch (err) {
      alert('Restore purchases failed.');
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Top Banner */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {t('more')}
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Har Rupaye Ka Saaf Hisab.
        </p>
      </div>

      {/* Pro Subscription Banner & Settings Section (Requirement #20) */}
      <ProMonetizationCard isPro={isPro} onUpgradeClick={onOpenSubscription} />

      {/* Subscription Management Section */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
            <Crown className="w-4 h-4 text-amber-500" />
            HisabSaathi Pro Subscription
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
              isPro ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {isPro ? 'PRO ✓' : 'FREE'}
          </span>
        </div>

        <div className="flex gap-2">
          {isPro ? (
            <button
              onClick={() => subscriptionManager.openManageSubscription()}
              className="flex-1 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold text-xs flex items-center justify-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Manage Subscription
            </button>
          ) : (
            <button
              onClick={onOpenSubscription}
              className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs flex items-center justify-center gap-1 shadow-md shadow-amber-500/20"
            >
              <Sparkles className="w-3.5 h-3.5" /> Upgrade to Pro
            </button>
          )}

          <button
            onClick={handleRestorePurchase}
            className="px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-bold text-xs flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Restore
          </button>
        </div>
      </div>

      {/* Main Menu Groups */}
      <div className="space-y-3">
        {/* 1. Automatic Transactions & Rules Section */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
          <button
            onClick={() => onNavigateTab('auto_inbox')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/40 text-left transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold relative">
                <Bot className="w-5 h-5" />
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                )}
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                  <span>{t('autoTransactionsInboxTitle')}</span>
                  {pendingCount > 0 && (
                    <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-black">
                      {pendingCount}
                    </span>
                  )}
                </h3>
                <p className="text-[10px] text-gray-400">
                  Review and confirm detected bank & UPI notifications
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          <button
            onClick={() => setIsRulesModalOpen(true)}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/40 text-left transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100">
                  {t('transactionRulesTitle')}
                </h3>
                <p className="text-[10px] text-gray-400">
                  Manage custom merchant & category rules ({rules.length} Active)
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          <button
            onClick={() => setIsPrivacyPermissionsOpen(true)}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/40 text-left transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100">
                  {t('privacyPermissionsTitle')}
                </h3>
                <p className="text-[10px] text-gray-400">
                  Control permission access & turn off auto tracking
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* 2. Core Utilities */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
          <button
            onClick={() => onNavigateTab('reports')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/40 text-left transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100">
                  {t('financialReports')}
                </h3>
                <p className="text-[10px] text-gray-400">
                  Monthly cash flow, category breakdown & auto stats
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          <button
            onClick={onOpenImport}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/40 text-left transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100">
                  {t('importStatement')}
                </h3>
                <p className="text-[10px] text-gray-400">
                  Upload CSV bank statement with auto-categorization
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          <button
            onClick={() => onNavigateTab('bills')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/40 text-left transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100">
                  {t('billReminders')}
                </h3>
                <p className="text-[10px] text-gray-400">
                  Electricity, mobile recharge, rent & insurance due dates
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          <button
            onClick={() => setIsExportOpen(true)}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/40 text-left transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100">
                  {t('exportData')}
                </h3>
                <p className="text-[10px] text-gray-400">
                  Download statement as PDF or CSV file
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          <button
            onClick={onOpenAdminDashboard}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/40 text-left transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100">
                  Admin Subscription Analytics
                </h3>
                <p className="text-[10px] text-gray-400">
                  View MRR, ARR, active/cancelled subscriptions breakdown
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* 3. Language & Preferences */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 space-y-3">
          <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300">
            {t('settings')}
          </h3>

          <div className="flex items-center justify-between py-1">
            <div className="flex items-center space-x-2.5">
              <Languages className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                {t('language')}
              </span>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => setLanguage('hi')}
                className={`px-3 py-1 rounded-xl text-xs font-bold ${
                  language === 'hi' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                हिंदी
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-xl text-xs font-bold ${
                  language === 'en' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                English
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between py-1 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-2.5">
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-indigo-500" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                {t('theme')}
              </span>
            </div>
            <button
              onClick={toggleTheme}
              className="px-3 py-1 rounded-xl bg-gray-100 dark:bg-gray-700 text-xs font-bold capitalize text-gray-800 dark:text-gray-200"
            >
              {theme} Mode
            </button>
          </div>
        </div>

        {/* 4. Security & PIN Lock */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Lock className="w-4 h-4 text-rose-500" />
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                {t('appLock')}
              </span>
            </div>

            {hasPin ? (
              <button
                onClick={removePin}
                className="px-3 py-1 rounded-xl bg-rose-100 text-rose-700 text-xs font-bold"
              >
                Disable PIN
              </button>
            ) : (
              <button
                onClick={() => setShowPinSetup(!showPinSetup)}
                className="px-3 py-1 rounded-xl bg-emerald-600 text-white text-xs font-bold"
              >
                {t('enablePin')}
              </button>
            )}
          </div>

          {showPinSetup && !hasPin && (
            <form
              onSubmit={handleSavePin}
              className="bg-gray-50 dark:bg-gray-900 p-3 rounded-2xl border space-y-2"
            >
              <label className="text-[10px] font-bold text-gray-400 block">
                Enter 4-Digit PIN Code
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  maxLength={4}
                  required
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="••••"
                  className="px-3 py-1.5 bg-white dark:bg-gray-800 border rounded-xl text-xs font-bold w-28 tracking-widest text-center"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                >
                  Save PIN
                </button>
              </div>
            </form>
          )}

          <button
            onClick={() => setIsSecurityOpen(true)}
            className="w-full pt-2 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline border-t border-gray-100 dark:border-gray-700"
          >
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              {t('securityNoticeTitle')}
            </span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 5. Demo Data & Reset Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 space-y-2">
          <button
            onClick={async () => {
              if (confirm('Load realistic demo data & pending auto transactions for testing?')) {
                await onLoadDemoData();
                alert(t('demoDataLoaded'));
              }
            }}
            className="w-full py-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-indigo-500" />
            {t('loadDemoData')}
          </button>

          <button
            onClick={async () => {
              if (confirm(t('confirmReset'))) {
                await onClearAllData();
                alert('All data has been reset.');
              }
            }}
            className="w-full py-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 font-bold text-xs flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            {t('clearAllData')}
          </button>
        </div>

        {/* App Footer */}
        <div className="text-center pt-2 text-[10px] text-gray-400 space-y-1">
          <p className="font-bold text-gray-600 dark:text-gray-300">HisabSaathi v1.2.0 • Har Rupaye Ka Saaf Hisab.</p>
          <p>Made for Normal People, Farmers, Workers & Businessmen across India 🇮🇳</p>
        </div>
      </div>

      {/* Modals */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        transactions={transactions}
        accounts={accounts}
      />

      <SecurityNoticeModal
        isOpen={isSecurityOpen}
        onClose={() => setIsSecurityOpen(false)}
      />

      <PrivacyPermissionsModal
        isOpen={isPrivacyPermissionsOpen}
        onClose={() => setIsPrivacyPermissionsOpen(false)}
        settings={autoSettings}
      />

      <TransactionRulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
        rules={rules}
      />
    </div>
  );
};
