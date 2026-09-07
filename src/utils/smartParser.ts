import {
  PendingAutoTransaction,
  Transaction,
  UdhaarContact,
  TransactionRule,
  PaymentMethod,
} from '../types';
import { autoCategorizeDescription, generateDuplicateHash } from './autoCategorize';

export interface SmartParseOptions {
  userId: string;
  source?: string;
  existingTransactions?: Transaction[];
  existingPending?: PendingAutoTransaction[];
  udhaarContacts?: UdhaarContact[];
  userRules?: TransactionRule[];
}

export function parseFinancialMessage(
  rawText: string,
  options: SmartParseOptions
): PendingAutoTransaction | null {
  const text = rawText.trim();
  if (!text) return null;

  const lower = text.toLowerCase();

  // 1. Amount Extraction (e.g. Rs. 2,500.00 or INR 800 or ₹2500)
  const amountMatch = text.match(/(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d+)?)/i);
  if (!amountMatch) return null;

  const rawAmountStr = amountMatch[1].replace(/,/g, '');
  const amount = parseFloat(rawAmountStr);
  if (isNaN(amount) || amount <= 0) return null;

  // 2. Determine Transaction Type & Direction
  let type: 'income' | 'expense' | 'refund' | 'transfer' = 'expense';
  let direction: 'received' | 'paid' = 'paid';

  // Refund Indicators
  if (
    lower.includes('refund') ||
    lower.includes('refunded') ||
    lower.includes('reversed') ||
    lower.includes('reversal') ||
    lower.includes('amount returned')
  ) {
    type = 'refund';
    direction = 'received';
  }
  // Own Account Transfer Indicators
  else if (
    lower.includes('sent to own account') ||
    lower.includes('bank transfer between') ||
    (lower.includes('moved to') && lower.includes('account')) ||
    (lower.includes('atm') && (lower.includes('wdl') || lower.includes('withdrawal')))
  ) {
    type = 'transfer';
    direction = lower.includes('credited') ? 'received' : 'paid';
  }
  // Received / Income Indicators
  else if (
    lower.includes('credited') ||
    lower.includes('credit') ||
    lower.includes('received') ||
    lower.includes('deposited') ||
    lower.includes('money received') ||
    lower.includes('payment received') ||
    lower.includes('upi received')
  ) {
    type = 'income';
    direction = 'received';
  }
  // Payment / Expense Indicators
  else if (
    lower.includes('debited') ||
    lower.includes('debit') ||
    lower.includes('paid') ||
    lower.includes('payment successful') ||
    lower.includes('purchase') ||
    lower.includes('spent') ||
    lower.includes('upi payment') ||
    lower.includes('transaction')
  ) {
    type = 'expense';
    direction = 'paid';
  }

  // 3. Payment Method Determination
  let paymentMethod: PaymentMethod = 'upi';
  if (lower.includes('cash') || lower.includes('atm')) paymentMethod = 'cash';
  else if (lower.includes('card') || lower.includes('netbanking') || lower.includes('neft') || lower.includes('imps')) paymentMethod = 'bank';
  else if (lower.includes('upi') || lower.includes('gpay') || lower.includes('phonepe') || lower.includes('paytm')) paymentMethod = 'upi';

  // 4. Reference ID Extraction
  const refMatch = text.match(/(?:ref(?:erence)?|txn|id|utr)[:\s]*([a-z0-9]+)/i);
  const referenceId = refMatch ? refMatch[1] : undefined;

  // 5. Merchant / Person Name Extraction
  let personMerchant = 'Financial Notification';
  const personMatch = text.match(/(?:to|from|at|vpa|info|towards|for)\s+([a-z0-9\s._-]+?)(?:\s+on|\s+ref|\s+avail|\.|$)/i);
  if (personMatch && personMatch[1].length < 35) {
    personMerchant = personMatch[1].trim();
  }

  // 6. Smart Categorization
  const catRes = autoCategorizeDescription(`${personMerchant} ${text}`);
  let category = type === 'transfer' ? 'Transfer' : catRes.category;
  let suggestedCategory = category;

  // 7. Apply Custom Transaction Rules if defined by user
  if (options.userRules && options.userRules.length > 0) {
    for (const rule of options.userRules) {
      if (!rule.isEnabled) continue;

      let fieldValue = '';
      if (rule.conditionField === 'merchant') fieldValue = personMerchant;
      else if (rule.conditionField === 'source') fieldValue = options.source || '';
      else if (rule.conditionField === 'person') fieldValue = personMerchant;
      else if (rule.conditionField === 'rawText') fieldValue = text;

      fieldValue = fieldValue.toLowerCase();
      const ruleVal = rule.conditionValue.toLowerCase();

      let isMatch = false;
      if (rule.operator === 'contains') isMatch = fieldValue.includes(ruleVal);
      else if (rule.operator === 'equals') isMatch = fieldValue === ruleVal;
      else if (rule.operator === 'startsWith') isMatch = fieldValue.startsWith(ruleVal);

      if (isMatch) {
        if (rule.actionType === 'set_category') {
          suggestedCategory = rule.actionValue;
          category = rule.actionValue;
        } else if (rule.actionType === 'set_type') {
          type = rule.actionValue as any;
        }
      }
    }
  }

  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().split(' ')[0].slice(0, 5);
  const dupHash = generateDuplicateHash(date, amount, `${personMerchant}_${text}`);

  // 8. Smart Customer Matching (Udhaar Connection)
  let matchedUdhaarContactId: string | undefined;
  let matchedUdhaarContactName: string | undefined;
  let matchedUdhaarPreviousDue: number | undefined;

  if (options.udhaarContacts && options.udhaarContacts.length > 0 && personMerchant !== 'Financial Notification') {
    const pLower = personMerchant.toLowerCase();
    const matchedContact = options.udhaarContacts.find((c) => {
      const cName = c.name.toLowerCase();
      return (
        cName.includes(pLower) ||
        pLower.includes(cName) ||
        (c.mobile && text.includes(c.mobile.replace(/[^0-9]/g, '')))
      );
    });

    if (matchedContact) {
      matchedUdhaarContactId = matchedContact.id;
      matchedUdhaarContactName = matchedContact.name;
      matchedUdhaarPreviousDue = matchedContact.remainingBalance;
    }
  }

  // 9. Refund Link Matching
  let matchedRefundTxId: string | undefined;
  let matchedRefundTxDescription: string | undefined;
  let matchedRefundTxAmount: number | undefined;

  if (type === 'refund' && options.existingTransactions && options.existingTransactions.length > 0) {
    const matchedTx = options.existingTransactions.find((tx) => {
      if (tx.type !== 'expense') return false;
      if (Math.abs(tx.amount - amount) < 1) return true;
      if (tx.person && personMerchant.toLowerCase().includes(tx.person.toLowerCase())) return true;
      return false;
    });

    if (matchedTx) {
      matchedRefundTxId = matchedTx.id;
      matchedRefundTxDescription = `${matchedTx.person || matchedTx.category} (₹${matchedTx.amount})`;
      matchedRefundTxAmount = matchedTx.amount;
    }
  }

  // 10. Duplicate Transaction Check
  let isPossibleDuplicate = false;
  let existingDuplicateTxId: string | undefined;

  if (options.existingTransactions) {
    const existing = options.existingTransactions.find(
      (tx) => tx.duplicateHash === dupHash || (tx.amount === amount && tx.date === date && tx.person === personMerchant)
    );
    if (existing) {
      isPossibleDuplicate = true;
      existingDuplicateTxId = existing.id;
    }
  }

  if (!isPossibleDuplicate && options.existingPending) {
    const existingPending = options.existingPending.find(
      (p) => p.duplicateHash === dupHash || (p.amount === amount && p.date === date && p.personMerchant === personMerchant)
    );
    if (existingPending) {
      isPossibleDuplicate = true;
      existingDuplicateTxId = existingPending.id;
    }
  }

  // Calculate confidence rating (0.0 to 1.0)
  let confidence = 0.85;
  if (referenceId) confidence += 0.1;
  if (matchedUdhaarContactId || matchedRefundTxId) confidence += 0.05;
  if (isPossibleDuplicate) confidence -= 0.2;
  confidence = Math.min(1.0, Math.max(0.4, confidence));

  return {
    id: `pending_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId: options.userId,
    amount,
    type,
    direction,
    category,
    suggestedCategory,
    paymentMethod,
    source: options.source || 'Authorized Notification',
    date,
    time,
    personMerchant,
    referenceId,
    rawText: text,
    confidence,
    status: 'pending',
    matchedUdhaarContactId,
    matchedUdhaarContactName,
    matchedUdhaarPreviousDue,
    matchedRefundTxId,
    matchedRefundTxDescription,
    matchedRefundTxAmount,
    duplicateHash: dupHash,
    isPossibleDuplicate,
    existingDuplicateTxId,
    createdAt: new Date().toISOString(),
  };
}
