export type Language = 'en' | 'hi';

export type AccountType = 'cash' | 'bank' | 'upi' | 'other';

export type BankName =
  | 'Cash'
  | 'SBI'
  | 'HDFC'
  | 'ICICI'
  | 'Axis'
  | 'PhonePe'
  | 'Google Pay'
  | 'Paytm'
  | 'Other Bank'
  | 'Other UPI';

export type TransactionType = 'income' | 'expense' | 'transfer' | 'refund';

export type PaymentMethod = 'cash' | 'bank' | 'upi' | 'other';

export interface User {
  id: string;
  name: string;
  mobile?: string;
  email?: string;
  pinHash?: string;
  isPinEnabled: boolean;
  biometricEnabled: boolean;
  createdAt: string;
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  bankName: BankName;
  accountNumber?: string;
  balance: number;
  initialBalance: number;
  color?: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  accountId: string;
  toAccountId?: string; // For transfers
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  person?: string;
  notes?: string;
  receiptPhoto?: string; // Base64 or Blob URL
  paymentMethod: PaymentMethod;
  isInternalTransfer?: boolean;
  udhaarContactId?: string;
  statementImportId?: string;
  duplicateHash?: string;
  source?: string;
  referenceId?: string;
  confidence?: number;
  isAutomatic?: boolean;
  isRefund?: boolean;
  originalTransactionId?: string;
  status?: 'confirmed' | 'pending' | 'ignored';
  createdAt: string;
}

export interface PendingAutoTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'income' | 'expense' | 'refund' | 'transfer';
  direction: 'received' | 'paid';
  category: string;
  suggestedCategory: string;
  paymentMethod: PaymentMethod;
  source: string; // e.g. "Bank Notification", "SMS", "UPI Alert"
  date: string;
  time: string;
  personMerchant: string;
  referenceId?: string;
  rawText: string;
  confidence: number;
  status: 'pending' | 'confirmed' | 'ignored';
  matchedUdhaarContactId?: string;
  matchedUdhaarContactName?: string;
  matchedUdhaarPreviousDue?: number;
  matchedRefundTxId?: string;
  matchedRefundTxDescription?: string;
  matchedRefundTxAmount?: number;
  duplicateHash: string;
  isPossibleDuplicate?: boolean;
  existingDuplicateTxId?: string;
  createdAt: string;
}

export interface TransactionRule {
  id: string;
  userId: string;
  conditionField: 'merchant' | 'source' | 'person' | 'rawText';
  operator: 'contains' | 'equals' | 'startsWith';
  conditionValue: string;
  actionType: 'set_category' | 'set_type' | 'suggest_udhaar_payment';
  actionValue: string;
  isEnabled: boolean;
  createdAt: string;
}

export interface AutoTrackingSettings {
  userId: string;
  enabled: boolean;
  detectReceived: boolean;
  detectPayments: boolean;
  detectRefunds: boolean;
  detectTransfers: boolean;
  detectUpi: boolean;
  detectBankNotifications: boolean;
  confirmationMode: 'confirm_before_adding' | 'auto_add_high_confidence' | 'manual_only';
  notificationPermissionGranted: boolean;
  smsPermissionGranted: boolean;
  contactsPermissionGranted: boolean;
}

export interface Category {
  id: string;
  userId?: string; // null for system defaults
  name: string;
  hindiName: string;
  icon: string;
  type: 'income' | 'expense' | 'both';
  color: string;
  isCustom: boolean;
}

export type UdhaarType = 'given' | 'taken'; // given = Maine Diya, taken = Maine Liya
export type UdhaarStatus = 'pending' | 'partially_paid' | 'fully_paid' | 'overdue';

export interface UdhaarContact {
  id: string;
  userId: string;
  name: string;
  mobile?: string;
  type: UdhaarType;
  givenAmount: number;
  receivedAmount: number;
  takenAmount: number;
  paidAmount: number;
  remainingBalance: number;
  dueDate?: string;
  notes?: string;
  status: UdhaarStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UdhaarTransaction {
  id: string;
  userId: string;
  contactId: string;
  type: 'given' | 'received' | 'taken' | 'repaid';
  amount: number;
  date: string;
  notes?: string;
  accountId?: string;
  createdAt: string;
}

export type BillCategory =
  | 'Electricity'
  | 'Mobile Recharge'
  | 'Internet'
  | 'Rent'
  | 'EMI'
  | 'School/College Fee'
  | 'Insurance'
  | 'Other';

export interface Bill {
  id: string;
  userId: string;
  name: string;
  category: BillCategory;
  amount: number;
  dueDate: string;
  repeatFrequency: 'once' | 'monthly' | 'quarterly' | 'yearly';
  accountId?: string;
  isPaid: boolean;
  lastPaidDate?: string;
  notes?: string;
  createdAt: string;
}

export interface StatementImport {
  id: string;
  userId: string;
  fileName: string;
  fileType: 'csv' | 'pdf';
  importedCount: number;
  dateImported: string;
}

export interface AppSettings {
  userId: string;
  theme: 'light' | 'dark';
  language: Language;
  currency: string;
  notificationsEnabled: boolean;
  biometricEnabled: boolean;
  pinLockEnabled: boolean;
  pinHash?: string;
  autoCategorization: boolean;
  isPro?: boolean;
}
