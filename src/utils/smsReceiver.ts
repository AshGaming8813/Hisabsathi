import { autoCategorizeDescription, generateDuplicateHash } from './autoCategorize';
import { Transaction } from '../types';
import { db, recalculateAccountBalances } from '../db/database';

export interface ParsedBankSMS {
  amount: number;
  type: 'income' | 'expense';
  bankName: string;
  accountNumber?: string;
  merchantPerson: string;
  category: string;
  date: string;
  time: string;
  rawSms: string;
}

export function parseIndianBankSMS(smsBody: string): ParsedBankSMS | null {
  const text = smsBody.trim();
  if (!text) return null;

  // Filter out non-financial marketing SMSes
  const lower = text.toLowerCase();
  if (
    !lower.includes('debited') &&
    !lower.includes('credited') &&
    !lower.includes('spent') &&
    !lower.includes('deposited') &&
    !lower.includes('paid to') &&
    !lower.includes('received from') &&
    !lower.includes('sent to') &&
    !lower.includes('a/c') &&
    !lower.includes('acct')
  ) {
    return null;
  }

  // 1. Amount Extraction (Matches Rs. 1,250.00 or INR 500 or Rs 450)
  const amountMatch = text.match(/(?:rs\.?|inr)\s*([\d,]+(?:\.\d+)?)/i);
  if (!amountMatch) return null;

  const rawAmountStr = amountMatch[1].replace(/,/g, '');
  const amount = parseFloat(rawAmountStr);
  if (isNaN(amount) || amount <= 0) return null;

  // 2. Transaction Type Determination
  let type: 'income' | 'expense' = 'expense';
  if (
    lower.includes('credited') ||
    lower.includes('deposited') ||
    lower.includes('received') ||
    lower.includes('added to')
  ) {
    type = 'income';
  }

  // 3. Bank / Wallet Identification
  let bankName = 'Bank';
  if (lower.includes('sbi') || lower.includes('state bank')) bankName = 'SBI';
  else if (lower.includes('hdfc')) bankName = 'HDFC';
  else if (lower.includes('icici')) bankName = 'ICICI';
  else if (lower.includes('axis')) bankName = 'Axis';
  else if (lower.includes('phonepe')) bankName = 'PhonePe';
  else if (lower.includes('paytm')) bankName = 'Paytm';
  else if (lower.includes('google pay') || lower.includes('gpay')) bankName = 'Google Pay';

  // 4. Account Number Last Digits
  const accMatch = text.match(/(?:a\/c|acct|card|ending)\s*[:\s]*[x*]*(\d{3,4})/i);
  const accountNumber = accMatch ? accMatch[1] : undefined;

  // 5. Merchant / Person Name Extraction
  let merchantPerson = 'Bank Transaction';
  const merchantMatch =
    text.match(/(?:to|at|vpa|info|towards|for)\s+([a-z0-9\s._-]+?)(?:\s+on|\s+ref|\s+avail|\.|$)/i);
  if (merchantMatch && merchantMatch[1].length < 30) {
    merchantPerson = merchantMatch[1].trim();
  }

  // 6. Auto-Categorization
  const autoCat = autoCategorizeDescription(`${merchantPerson} ${text}`);

  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().split(' ')[0].slice(0, 5);

  return {
    amount,
    type,
    bankName,
    accountNumber,
    merchantPerson,
    category: autoCat.category,
    date,
    time,
    rawSms: text,
  };
}

export async function processReceivedSms(smsBody: string, userId: string = 'default_user_1') {
  const parsed = parseIndianBankSMS(smsBody);
  if (!parsed) return null;

  // Generate Duplicate Hash
  const dupHash = generateDuplicateHash(parsed.date, parsed.amount, parsed.rawSms);

  // Check if already processed
  const existing = await db.transactions.where('duplicateHash').equals(dupHash).first();
  if (existing) {
    console.log('[SMS Receiver] Duplicate transaction ignored:', dupHash);
    return null;
  }

  // Find matching account or fallback to first active account
  const accounts = await db.accounts.where('userId').equals(userId).toArray();
  let targetAcc = accounts.find((a) => a.bankName.toLowerCase() === parsed.bankName.toLowerCase());
  if (!targetAcc && accounts.length > 0) {
    targetAcc = accounts[0];
  }

  if (!targetAcc) return null;

  // Insert Transaction into Database
  const newTx: Transaction = {
    id: `tx_sms_${Date.now()}`,
    userId,
    type: parsed.type,
    amount: parsed.amount,
    category: parsed.category,
    accountId: targetAcc.id,
    date: parsed.date,
    time: parsed.time,
    person: parsed.merchantPerson,
    notes: `Auto-recorded from ${parsed.bankName} SMS`,
    paymentMethod: targetAcc.type === 'upi' ? 'upi' : 'bank',
    duplicateHash: dupHash,
    createdAt: new Date().toISOString(),
  };

  await db.transactions.add(newTx);
  await recalculateAccountBalances(userId);

  console.log('[SMS Receiver] Auto-posted transaction:', newTx);
  return newTx;
}
