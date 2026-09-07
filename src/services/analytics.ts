export type SubscriptionAnalyticsEvent =
  | 'subscription_page_viewed'
  | 'plan_selected'
  | 'checkout_started'
  | 'purchase_successful'
  | 'purchase_failed'
  | 'subscription_cancelled'
  | 'subscription_restored'
  | 'feature_gate_shown';

export interface AnalyticsParams {
  userId?: string;
  planId?: string;
  provider?: string;
  featureKey?: string;
  errorMessage?: string;
  [key: string]: any;
}

class AnalyticsService {
  private eventsLog: Array<{ event: string; params: AnalyticsParams; timestamp: string }> = [];

  trackSubscriptionEvent(event: SubscriptionAnalyticsEvent, params: AnalyticsParams = {}) {
    // Sanitize parameters: Ensure NO sensitive credentials, card numbers, or UPI PINs are ever logged
    const sanitizedParams = { ...params };
    delete sanitizedParams.cardNumber;
    delete sanitizedParams.cvv;
    delete sanitizedParams.upiPin;
    delete sanitizedParams.bankPassword;
    delete sanitizedParams.rawText;

    const entry = {
      event,
      params: sanitizedParams,
      timestamp: new Date().toISOString(),
    };

    this.eventsLog.push(entry);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Analytics] ${event}`, sanitizedParams);
    }
  }

  getEventsLog() {
    return [...this.eventsLog];
  }
}

export const analytics = new AnalyticsService();
