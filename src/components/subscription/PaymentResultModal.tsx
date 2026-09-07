import React from 'react';
import { UserSubscription } from '../../types/subscription';
import { CheckCircle2, AlertCircle, Clock, Sparkles, X } from 'lucide-react';
import { formatCurrency } from '../../utils/calculations';

interface PaymentResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'success' | 'failed' | 'pending';
  subscription?: UserSubscription | null;
  errorMessage?: string;
  onTryAgain?: () => void;
}

export const PaymentResultModal: React.FC<PaymentResultModalProps> = ({
  isOpen,
  onClose,
  status,
  subscription,
  errorMessage,
  onTryAgain,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-2xl space-y-4 text-center border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in-95">
        {status === 'success' && (
          <>
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 flex items-center justify-center gap-1">
                <span>🎉 Welcome to HisabSaathi Pro!</span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                You now have access to all premium features.
              </p>
            </div>

            {subscription && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs space-y-1 text-left text-emerald-900 dark:text-emerald-200 font-medium">
                <div className="flex justify-between">
                  <span>Plan:</span>
                  <span className="font-bold uppercase">{subscription.planId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Price:</span>
                  <span className="font-bold">{subscription.planId === 'yearly' ? '₹799' : '₹99'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Next Renewal:</span>
                  <span className="font-bold">{new Date(subscription.expiryDate).toLocaleDateString()}</span>
                </div>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/20 active:scale-98 transition-all"
            >
              Start Using Pro
            </button>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-inner">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-gray-900 dark:text-gray-100">
                Payment wasn't completed
              </h3>
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                {errorMessage || 'Your payment attempt was cancelled or declined.'}
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  onClose();
                  if (onTryAgain) onTryAgain();
                }}
                className="w-full py-3 rounded-2xl bg-indigo-600 text-white font-extrabold text-xs shadow-md"
              >
                Try Again
              </button>

              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold text-xs"
              >
                Choose Another Plan
              </button>
            </div>
          </>
        )}

        {status === 'pending' && (
          <>
            <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner animate-pulse">
              <Clock className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-gray-900 dark:text-gray-100">
                Verification Pending
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Payment status is being verified with Google Play. Please check again shortly.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-amber-500 text-white font-extrabold text-xs shadow-md"
            >
              OK, Got It
            </button>
          </>
        )}
      </div>
    </div>
  );
};
