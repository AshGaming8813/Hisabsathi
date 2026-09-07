import {
  SubscriptionConfig,
  SubscriptionPlanId,
  UserSubscription,
  PaymentProviderType,
} from '../../types/subscription';
import { PaymentProvider, ProductDetails, PurchaseResult } from './PaymentProvider';
import { GooglePlayBillingProvider } from './GooglePlayBillingProvider';
import { RazorpayWebProvider } from './RazorpayWebProvider';
import { subscriptionServer } from '../../backend/subscriptionServer';
import { db } from '../../db/database';
import { analytics } from '../analytics';

export class SubscriptionManager {
  private config: SubscriptionConfig = {
    monthlyPrice: 99,
    yearlyPrice: 799,
    currency: 'INR',
    currencySymbol: '₹',
    savingsAmount: 389,
    trialDays: 7,
    googlePlayProductIdMonthly: 'hisabsaathi_pro_monthly',
    googlePlayProductIdYearly: 'hisabsaathi_pro_yearly',
    razorpayPlanIdMonthly: 'plan_hisabsaathi_monthly',
    razorpayPlanIdYearly: 'plan_hisabsaathi_yearly',
  };

  private activeProvider: PaymentProvider;

  constructor(providerType: PaymentProviderType = 'google_play') {
    this.activeProvider = this.createProvider(providerType);
    this.activeProvider.initialize(this.config);
  }

  private createProvider(providerType: PaymentProviderType): PaymentProvider {
    if (providerType === 'razorpay') {
      return new RazorpayWebProvider();
    }
    return new GooglePlayBillingProvider();
  }

  public setProvider(providerType: PaymentProviderType) {
    this.activeProvider = this.createProvider(providerType);
    this.activeProvider.initialize(this.config);
  }

  public getConfig(): SubscriptionConfig {
    return { ...this.config };
  }

  public async getProducts(): Promise<ProductDetails[]> {
    return this.activeProvider.getProducts();
  }

  public async getUserSubscription(userId: string): Promise<UserSubscription> {
    const sub = await subscriptionServer.getUserSubscription(userId);
    // Update local app settings to reflect server entitlement state
    await db.settings.where('userId').equals(userId).modify({ isPro: sub.isPro });
    return sub;
  }

  public async subscribe(userId: string, planId: SubscriptionPlanId): Promise<PurchaseResult> {
    analytics.trackSubscriptionEvent('checkout_started', { userId, planId, provider: this.activeProvider.providerType });

    const result = await this.activeProvider.purchase(userId, planId);

    if (result.success && result.userSubscription) {
      await db.settings.where('userId').equals(userId).modify({ isPro: true });
    }

    return result;
  }

  public async restorePurchases(userId: string): Promise<PurchaseResult> {
    const result = await this.activeProvider.restorePurchases(userId);
    if (result.success && result.userSubscription) {
      await db.settings.where('userId').equals(userId).modify({ isPro: result.userSubscription.isPro });
    }
    return result;
  }

  public openManageSubscription() {
    const url = this.activeProvider.manageSubscriptionUrl();
    window.open(url, '_blank');
  }
}

export const subscriptionManager = new SubscriptionManager('google_play');
