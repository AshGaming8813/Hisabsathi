import { ProFeatureKey } from '../types/subscription';
import { subscriptionServer } from '../backend/subscriptionServer';

export async function isProUser(userId: string = 'default_user_1'): Promise<boolean> {
  const sub = await subscriptionServer.getUserSubscription(userId);
  return sub.isPro;
}

export function checkFeatureEntitlement(isPro: boolean, feature: ProFeatureKey): {
  allowed: boolean;
  featureName: string;
  reason?: string;
} {
  if (isPro) {
    return { allowed: true, featureName: getFeatureName(feature) };
  }

  // Free Tier Feature Restrictions:
  switch (feature) {
    case 'auto_tracking':
      return {
        allowed: false,
        featureName: 'Automatic Money Tracking',
        reason: 'HisabSaathi Pro is required to review and confirm auto-detected bank & UPI notifications.',
      };
    case 'custom_rules':
      return {
        allowed: false,
        featureName: 'Custom Transaction Rules',
        reason: 'Upgrade to Pro to create unlimited custom merchant & category transaction rules.',
      };
    case 'pdf_export':
    case 'csv_export':
      return {
        allowed: false,
        featureName: 'PDF & CSV Export',
        reason: 'Exporting detailed PDF reports and CSV spreadsheets requires HisabSaathi Pro.',
      };
    case 'unlimited_accounts':
      return {
        allowed: true, // Free tier allows basic accounts
        featureName: 'Multiple Accounts',
      };
    case 'advanced_reports':
      return {
        allowed: false,
        featureName: 'Advanced Financial Analytics',
        reason: 'Detailed cash flow analytics and category breakdown reports are available on HisabSaathi Pro.',
      };
    case 'no_ads':
      return {
        allowed: false,
        featureName: 'Ad-Free Experience',
        reason: 'Enjoy an ad-free interface with HisabSaathi Pro.',
      };
    default:
      return { allowed: true, featureName: 'Feature' };
  }
}

function getFeatureName(feature: ProFeatureKey): string {
  switch (feature) {
    case 'auto_tracking':
      return 'Automatic Money Tracking';
    case 'custom_rules':
      return 'Custom Transaction Rules';
    case 'pdf_export':
      return 'PDF Report Export';
    case 'csv_export':
      return 'CSV File Download';
    case 'unlimited_accounts':
      return 'Unlimited Accounts';
    case 'advanced_reports':
      return 'Advanced Analytics';
    case 'no_ads':
      return 'Ad-Free Experience';
    default:
      return 'HisabSaathi Pro Feature';
  }
}
