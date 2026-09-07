export type SubscriptionPlanId = 'monthly' | 'yearly';

export type SubscriptionStatus =
  | 'active'
  | 'cancelled'
  | 'grace_period'
  | 'on_hold'
  | 'paused'
  | 'expired';

export type PaymentProviderType = 'google_play' | 'razorpay' | 'mock_dev';

export interface SubscriptionConfig {
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  currencySymbol: string;
  savingsAmount: number;
  trialDays: number;
  googlePlayProductIdMonthly: string;
  googlePlayProductIdYearly: string;
  razorpayPlanIdMonthly?: string;
  razorpayPlanIdYearly?: string;
}

export interface UserSubscription {
  userId: string;
  isPro: boolean;
  status: SubscriptionStatus;
  planId: SubscriptionPlanId;
  provider: PaymentProviderType;
  productId: string;
  purchaseToken: string;
  orderId?: string;
  startDate: string;
  expiryDate: string;
  autoRenew: boolean;
  cancellationReason?: string;
  lastVerifiedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionEvent {
  id: string;
  userId: string;
  eventType:
    | 'purchased'
    | 'renewed'
    | 'cancelled'
    | 'paused'
    | 'resumed'
    | 'expired'
    | 'restored'
    | 'failed';
  provider: PaymentProviderType;
  details: string;
  timestamp: string;
}

export interface AdminSubscriptionStats {
  totalUsers: number;
  freeUsers: number;
  proUsers: number;
  activeSubscriptions: number;
  cancelledSubscriptions: number;
  expiredSubscriptions: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  failedPayments: number;
  upcomingRenewals: number;
}

export type ProFeatureKey =
  | 'auto_tracking'
  | 'custom_rules'
  | 'pdf_export'
  | 'csv_export'
  | 'unlimited_accounts'
  | 'advanced_reports'
  | 'cloud_backup'
  | 'no_ads';
