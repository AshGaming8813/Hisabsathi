import React, { useState, useEffect } from 'react';
import { subscriptionManager } from '../../services/subscription/SubscriptionManager';
import { ProductDetails, PurchaseResult } from '../../services/subscription/PaymentProvider';
import { UserSubscription, SubscriptionPlanId } from '../../types/subscription';
import { useLanguage } from '../../context/LanguageContext';
import {
  Crown,
  Check,
  ShieldCheck,
  Sparkles,
  ChevronLeft,
  RefreshCw,
  ExternalLink,
  Zap,
  Lock,
} from 'lucide-react';

interface SubscriptionScreenProps {
  userId: string;
  onBack?: () => void;
  onPaymentSuccess?: (sub: UserSubscription) => void;
  onPaymentFailed?: (msg: string) => void;
}

export const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({
  userId,
  onBack,
  onPaymentSuccess,
  onPaymentFailed,
}) => {
  const { t } = useLanguage();
  const config = subscriptionManager.getConfig();

  const [products, setProducts] = useState<ProductDetails[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanId>('yearly');
  const [userSub, setUserSub] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    async function loadSubscriptionData() {
      setIsLoading(true);
      try {
        const prods = await subscriptionManager.getProducts();
        setProducts(prods);
        const currentSub = await subscriptionManager.getUserSubscription(userId);
        setUserSub(currentSub);
      } catch (err) {
        console.error('Error loading subscription data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSubscriptionData();
  }, [userId]);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const result: PurchaseResult = await subscriptionManager.subscribe(userId, selectedPlan);
      if (result.success && result.userSubscription) {
        setUserSub(result.userSubscription);
        if (onPaymentSuccess) onPaymentSuccess(result.userSubscription);
      } else {
        if (onPaymentFailed) onPaymentFailed(result.errorMessage || 'Payment could not be completed.');
      }
    } catch (err: any) {
      if (onPaymentFailed) onPaymentFailed(err.message || 'Payment failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    setIsLoading(true);
    try {
      const result = await subscriptionManager.restorePurchases(userId);
      if (result.success && result.userSubscription) {
        setUserSub(result.userSubscription);
        alert('🎉 Active HisabSaathi Pro subscription restored successfully!');
      } else {
        alert(result.errorMessage || 'No active HisabSaathi Pro subscription was found.');
      }
    } catch (err) {
      alert('Failed to restore purchase.');
    } finally {
      setIsLoading(false);
    }
  };

  const isPro = userSub?.isPro ?? false;

  const benefitsList = [
    'Unlimited income & expense transactions',
    'Unlimited Udhaar ledger contacts',
    'Automatic money tracking & notification inbox',
    'Smart transaction auto-categorization',
    'Automatic refund detection & linking',
    'Own-account transfer detection (₹0 net change)',
    'Advanced financial reports & cash flow charts',
    'Download PDF financial statements',
    'Export Excel / CSV spreadsheets',
    'Multiple bank & wallet accounts',
    'Custom categorization transaction rules',
    'Cloud backup & multi-device sync',
    '100% Ad-free experience',
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 pb-20 space-y-4 max-w-md mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 rounded-2xl bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <h2 className="text-base font-extrabold text-gray-900 dark:text-gray-100">
          HisabSaathi Pro
        </h2>
        <span className="w-8" />
      </div>

      {/* Hero Badge Banner */}
      <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-amber-900 text-white p-5 rounded-3xl shadow-xl text-center space-y-3 relative overflow-hidden">
        <div className="w-14 h-14 rounded-3xl bg-amber-400/20 backdrop-blur-md text-yellow-300 flex items-center justify-center mx-auto shadow-inner border border-amber-300/30">
          <Crown className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-xl font-black tracking-tight text-white">
            Upgrade to HisabSaathi Pro
          </h1>
          <p className="text-xs text-amber-200 font-medium mt-1">
            Your complete smart money assistant.
          </p>
        </div>

        {isPro && (
          <div className="px-3 py-1 rounded-full bg-emerald-500 text-white font-extrabold text-xs inline-block shadow">
            ✓ ACTIVE PRO MEMBER
          </div>
        )}
      </div>

      {/* Active Subscription Details Card (If Pro User) */}
      {isPro && userSub && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-gray-500">Current Plan:</span>
            <span className="text-emerald-600 dark:text-emerald-400 uppercase font-extrabold">
              PRO ({userSub.planId})
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Subscription Status:</span>
            <span className="capitalize font-bold text-gray-800 dark:text-gray-200">
              {userSub.status}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Next Expiry / Renewal:</span>
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              {new Date(userSub.expiryDate).toLocaleDateString()}
            </span>
          </div>

          <div className="pt-2 flex gap-2 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={() => subscriptionManager.openManageSubscription()}
              className="flex-1 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold text-xs flex items-center justify-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Manage Subscription
            </button>
            <button
              onClick={handleRestore}
              className="px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-bold text-xs flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Restore
            </button>
          </div>
        </div>
      )}

      {/* Plan Selection Cards */}
      {!isPro && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 px-1">
            Select Your Subscription Plan:
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {/* Monthly Plan Card */}
            <div
              onClick={() => setSelectedPlan('monthly')}
              className={`p-4 rounded-3xl border-2 transition-all cursor-pointer space-y-2 relative ${
                selectedPlan === 'monthly'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-md'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              }`}
            >
              <div className="text-xs font-bold text-gray-500">MONTHLY</div>
              <div>
                <span className="text-2xl font-black text-gray-900 dark:text-gray-100">
                  {config.currencySymbol}{config.monthlyPrice}
                </span>
                <span className="text-[10px] text-gray-400 block">/ month</span>
              </div>
              <p className="text-[10px] text-gray-500">Flexible monthly billing</p>
            </div>

            {/* Yearly Plan Card (RECOMMENDED BEST VALUE) */}
            <div
              onClick={() => setSelectedPlan('yearly')}
              className={`p-4 rounded-3xl border-2 transition-all cursor-pointer space-y-2 relative overflow-hidden ${
                selectedPlan === 'yearly'
                  ? 'border-amber-500 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 dark:from-amber-950/50 dark:to-yellow-950/40 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              }`}
            >
              {/* Recommended Badge */}
              <span className="absolute top-0 right-0 px-2 py-0.5 rounded-bl-xl bg-amber-500 text-white font-black text-[8px] uppercase tracking-wider">
                Best Value
              </span>

              <div className="text-xs font-extrabold text-amber-600 dark:text-amber-400">
                YEARLY
              </div>
              <div>
                <span className="text-2xl font-black text-gray-900 dark:text-gray-100">
                  {config.currencySymbol}{config.yearlyPrice}
                </span>
                <span className="text-[10px] text-gray-400 block">/ year</span>
              </div>

              <div className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold text-[9px] text-center inline-block">
                Save {config.currencySymbol}{config.savingsAmount}/year
              </div>
            </div>
          </div>

          {/* Action Subscribe Button */}
          <button
            onClick={handleSubscribe}
            disabled={isLoading}
            className={`w-full py-3.5 rounded-2xl font-black text-sm text-white shadow-xl transition-all flex items-center justify-center gap-2 active:scale-98 ${
              selectedPlan === 'yearly'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-amber-500/20'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>
              {isLoading
                ? 'Processing...'
                : selectedPlan === 'yearly'
                ? 'Get Yearly — Best Value (₹799/yr)'
                : 'Continue with Monthly (₹99/mo)'}
            </span>
          </button>

          {/* Trust Footers */}
          <div className="flex justify-center items-center gap-4 text-[10px] text-gray-400 font-medium pt-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Official Google Play Store Payment
            </span>
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-indigo-500" /> Secure 256-Bit SSL
            </span>
          </div>
        </div>
      )}

      {/* Pro Benefits List */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-amber-500" /> Everything Included in HisabSaathi Pro
        </h3>

        <div className="grid grid-cols-1 gap-2 text-xs">
          {benefitsList.map((benefit, idx) => (
            <div key={idx} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3" />
              </div>
              <span className="font-medium text-[11px]">{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Restore Purchases Button */}
      {!isPro && (
        <div className="text-center pt-2">
          <button
            onClick={handleRestore}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Restore Previous Purchase
          </button>
        </div>
      )}
    </div>
  );
};
