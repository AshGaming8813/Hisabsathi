import {
  SubscriptionConfig,
  SubscriptionPlanId,
  UserSubscription,
  PaymentProviderType,
} from '../../types/subscription';

export interface ProductDetails {
  productId: string;
  planId: SubscriptionPlanId;
  title: string;
  description: string;
  price: number;
  formattedPrice: string;
  currency: string;
  period: string;
  savingsText?: string;
}

export interface PurchaseResult {
  success: boolean;
  userSubscription?: UserSubscription;
  purchaseToken?: string;
  orderId?: string;
  errorMessage?: string;
  requiresVerificationPending?: boolean;
}

export interface PaymentProvider {
  providerType: PaymentProviderType;
  initialize(config: SubscriptionConfig): Promise<void>;
  getProducts(): Promise<ProductDetails[]>;
  purchase(userId: string, planId: SubscriptionPlanId): Promise<PurchaseResult>;
  restorePurchases(userId: string): Promise<PurchaseResult>;
  manageSubscriptionUrl(): string;
}
