import { PaymentProvider, ProductDetails, PurchaseResult } from './PaymentProvider';
import { SubscriptionConfig, SubscriptionPlanId, PaymentProviderType } from '../../types/subscription';
import { subscriptionServer } from '../../backend/subscriptionServer';

export class RazorpayWebProvider implements PaymentProvider {
  public providerType: PaymentProviderType = 'razorpay';
  private config!: SubscriptionConfig;
  private isInitialized = false;

  async initialize(config: SubscriptionConfig): Promise<void> {
    this.config = config;
    this.isInitialized = true;
  }

  async getProducts(): Promise<ProductDetails[]> {
    return [
      {
        productId: this.config.razorpayPlanIdMonthly || 'plan_monthly',
        planId: 'monthly',
        title: 'HisabSaathi Pro Monthly',
        description: 'Full automatic tracking & premium financial tools.',
        price: this.config.monthlyPrice,
        formattedPrice: `${this.config.currencySymbol}${this.config.monthlyPrice}`,
        currency: this.config.currency,
        period: '/ month',
      },
      {
        productId: this.config.razorpayPlanIdYearly || 'plan_yearly',
        planId: 'yearly',
        title: 'HisabSaathi Pro Yearly',
        description: 'Best Value — Complete financial peace of mind.',
        price: this.config.yearlyPrice,
        formattedPrice: `${this.config.currencySymbol}${this.config.yearlyPrice}`,
        currency: this.config.currency,
        period: '/ year',
        savingsText: `Save ${this.config.currencySymbol}${this.config.savingsAmount}/year`,
      },
    ];
  }

  async purchase(userId: string, planId: SubscriptionPlanId): Promise<PurchaseResult> {
    try {
      // Simulate Razorpay Web Checkout JS modal
      const razorpayPaymentId = `pay_rzr_${Date.now()}`;
      const razorpaySubscriptionId = `sub_rzr_${Date.now()}`;
      const razorpaySignature = `sig_${Date.now()}_sha256`;

      // Verify on backend server
      const serverRes = await subscriptionServer.verifyRazorpaySubscription(
        userId,
        razorpayPaymentId,
        razorpaySubscriptionId,
        razorpaySignature,
        planId
      );

      if (serverRes.success && serverRes.subscription) {
        return {
          success: true,
          userSubscription: serverRes.subscription,
          purchaseToken: razorpaySubscriptionId,
          orderId: razorpayPaymentId,
        };
      } else {
        return {
          success: false,
          errorMessage: serverRes.message || 'Razorpay payment verification failed.',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        errorMessage: error.message || 'Razorpay checkout cancelled.',
      };
    }
  }

  async restorePurchases(userId: string): Promise<PurchaseResult> {
    const res = await subscriptionServer.restoreUserPurchases(userId);
    return {
      success: res.success,
      userSubscription: res.subscription,
      errorMessage: res.message,
    };
  }

  manageSubscriptionUrl(): string {
    return 'https://hisabsaathi-seven.vercel.app/account/subscription';
  }
}
