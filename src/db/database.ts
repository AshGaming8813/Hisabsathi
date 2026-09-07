import Dexie, { Table } from 'dexie';
import {
  User,
  Account,
  Transaction,
  Category,
  UdhaarContact,
  UdhaarTransaction,
  Bill,
  StatementImport,
  AppSettings,
  PendingAutoTransaction,
  TransactionRule,
  AutoTrackingSettings,
} from '../types';
import { defaultCategoriesList } from '../i18n/translations';

export class HisabSaathiDatabase extends Dexie {
  users!: Table<User>;
  accounts!: Table<Account>;
  transactions!: Table<Transaction>;
  categories!: Table<Category>;
  udhaarContacts!: Table<UdhaarContact>;
  udhaarTransactions!: Table<UdhaarTransaction>;
  bills!: Table<Bill>;
  importedStatements!: Table<StatementImport>;
  settings!: Table<AppSettings>;
  pendingAutoTransactions!: Table<PendingAutoTransaction>;
  transactionRules!: Table<TransactionRule>;
  autoTrackingSettings!: Table<AutoTrackingSettings>;

  constructor() {
    super('HisabSaathiDB');
    this.version(2).stores({
      users: 'id, mobile, email',
      accounts: 'id, userId, type, bankName',
      transactions: 'id, userId, type, category, accountId, toAccountId, date, paymentMethod, statementImportId, status, duplicateHash',
      categories: 'id, userId, name, type',
      udhaarContacts: 'id, userId, type, status, name',
      udhaarTransactions: 'id, userId, contactId, type, date',
      bills: 'id, userId, category, dueDate, isPaid',
      importedStatements: 'id, userId, dateImported',
      settings: 'userId',
      pendingAutoTransactions: 'id, userId, status, direction, date, duplicateHash',
      transactionRules: 'id, userId, conditionField, isEnabled',
      autoTrackingSettings: 'userId',
    });
  }
}

export const db = new HisabSaathiDatabase();

// Seed default categories
export async function seedCategories() {
  const count = await db.categories.count();
  if (count === 0) {
    await db.categories.bulkAdd(
      defaultCategoriesList.map((cat) => ({
        ...cat,
        isCustom: false,
      })) as Category[]
    );
  }
}

// Function to recalculate account balances from base transactions
export async function recalculateAccountBalances(userId: string = 'default_user_1') {
  const accounts = await db.accounts.where('userId').equals(userId).toArray();
  const transactions = await db.transactions.where('userId').equals(userId).toArray();

  for (const account of accounts) {
    let currentBal = account.initialBalance || 0;

    for (const tx of transactions) {
      // Exclude pending or ignored auto-transactions from actual financial balance calculations!
      if (tx.status && tx.status !== 'confirmed') continue;

      if (tx.type === 'income' && tx.accountId === account.id) {
        currentBal += tx.amount;
      } else if (tx.type === 'expense' && tx.accountId === account.id) {
        currentBal -= tx.amount;
      } else if (tx.type === 'refund' && tx.accountId === account.id) {
        currentBal += tx.amount; // Refund increases balance
      } else if (tx.type === 'transfer') {
        if (tx.accountId === account.id) {
          currentBal -= tx.amount; // Transfer Out
        }
        if (tx.toAccountId === account.id) {
          currentBal += tx.amount; // Transfer In
        }
      }
    }

    await db.accounts.update(account.id, { balance: currentBal });
  }
}

// Seed realistic demo data for testing every screen & automatic transaction inbox
export async function seedDemoData(userId: string = 'default_user_1') {
  // Clear existing user data
  await db.accounts.where('userId').equals(userId).delete();
  await db.transactions.where('userId').equals(userId).delete();
  await db.udhaarContacts.where('userId').equals(userId).delete();
  await db.udhaarTransactions.where('userId').equals(userId).delete();
  await db.bills.where('userId').equals(userId).delete();
  await db.pendingAutoTransactions.where('userId').equals(userId).delete();
  await db.transactionRules.where('userId').equals(userId).delete();
  await db.autoTrackingSettings.delete(userId);

  await seedCategories();

  const now = new Date();
  const year = now.getFullYear();
  const monthStr = String(now.getMonth() + 1).padStart(2, '0');
  const dayStr = String(now.getDate()).padStart(2, '0');
  const lastMonthStr = String(now.getMonth() === 0 ? 12 : now.getMonth()).padStart(2, '0');
  const lastMonthYear = now.getMonth() === 0 ? year - 1 : year;

  // 1. Create Accounts
  const cashAccId = 'acc_cash';
  const sbiAccId = 'acc_sbi';
  const hdfcAccId = 'acc_hdfc';
  const phonepeAccId = 'acc_phonepe';
  const gpayAccId = 'acc_gpay';

  await db.accounts.bulkAdd([
    {
      id: cashAccId,
      userId,
      name: 'Cash Wallet',
      type: 'cash',
      bankName: 'Cash',
      balance: 3500,
      initialBalance: 3500,
      color: '#10b981',
      createdAt: new Date().toISOString(),
    },
    {
      id: sbiAccId,
      userId,
      name: 'SBI Main Savings',
      type: 'bank',
      bankName: 'SBI',
      accountNumber: '•••• 4821',
      balance: 45200,
      initialBalance: 15000,
      color: '#2563eb',
      createdAt: new Date().toISOString(),
    },
    {
      id: hdfcAccId,
      userId,
      name: 'HDFC Salary Account',
      type: 'bank',
      bankName: 'HDFC',
      accountNumber: '•••• 9102',
      balance: 28500,
      initialBalance: 5000,
      color: '#0284c7',
      createdAt: new Date().toISOString(),
    },
    {
      id: phonepeAccId,
      userId,
      name: 'PhonePe Wallet',
      type: 'upi',
      bankName: 'PhonePe',
      balance: 4200,
      initialBalance: 1000,
      color: '#7c3aed',
      createdAt: new Date().toISOString(),
    },
    {
      id: gpayAccId,
      userId,
      name: 'Google Pay UPI',
      type: 'upi',
      bankName: 'Google Pay',
      balance: 2100,
      initialBalance: 500,
      color: '#ea4335',
      createdAt: new Date().toISOString(),
    },
  ]);

  // 2. Add Confirmed Transactions
  await db.transactions.bulkAdd([
    // Salary Income
    {
      id: 'tx_demo_1',
      userId,
      type: 'income',
      amount: 45000,
      category: 'Salary',
      accountId: hdfcAccId,
      date: `${year}-${monthStr}-01`,
      time: '09:30',
      person: 'TCS Private Ltd',
      notes: 'Monthly Salary Credit',
      paymentMethod: 'bank',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tx_demo_2',
      userId,
      type: 'income',
      amount: 6500,
      category: 'Business',
      accountId: sbiAccId,
      date: `${year}-${monthStr}-05`,
      time: '14:15',
      person: 'Sharma Electronics',
      notes: 'Freelance IT consulting payment',
      paymentMethod: 'upi',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    },

    // Expenses
    {
      id: 'tx_demo_3',
      userId,
      type: 'expense',
      amount: 8500,
      category: 'Rent',
      accountId: sbiAccId,
      date: `${year}-${monthStr}-02`,
      time: '10:00',
      person: 'Verma House Landlord',
      notes: 'House Rent Payment',
      paymentMethod: 'bank',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tx_demo_4',
      userId,
      type: 'expense',
      amount: 1450,
      category: 'Electricity',
      accountId: phonepeAccId,
      date: `${year}-${monthStr}-04`,
      time: '18:20',
      person: 'State Electricity Board',
      notes: 'Electricity bill receipt #82910',
      paymentMethod: 'upi',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tx_demo_5',
      userId,
      type: 'expense',
      amount: 1500,
      category: 'Shopping',
      accountId: phonepeAccId,
      date: `${year}-${monthStr}-06`,
      time: '15:10',
      person: 'Amazon India',
      notes: 'Amazon electronics order',
      paymentMethod: 'upi',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    },
  ]);

  // 3. Add Udhaar Contacts & Ledgers
  const contactRohit = 'udhaar_rohit';
  const contactPriya = 'udhaar_priya';
  const contactRamesh = 'udhaar_ramesh';

  await db.udhaarContacts.bulkAdd([
    {
      id: contactRohit,
      userId,
      name: 'Rohit Sharma (Friend)',
      mobile: '+91 98765 43210',
      type: 'given',
      givenAmount: 5000,
      receivedAmount: 2000,
      takenAmount: 0,
      paidAmount: 0,
      remainingBalance: 3000,
      dueDate: `${year}-${monthStr}-25`,
      notes: 'Borrowed for laptop repair emergency',
      status: 'partially_paid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: contactPriya,
      userId,
      name: 'Priya Verma (Colleague)',
      mobile: '+91 91234 56789',
      type: 'given',
      givenAmount: 2500,
      receivedAmount: 0,
      takenAmount: 0,
      paidAmount: 0,
      remainingBalance: 2500,
      dueDate: `${year}-${monthStr}-15`,
      notes: 'Event advance payment loan',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: contactRamesh,
      userId,
      name: 'Ramesh Kirana Store',
      mobile: '+91 94567 12345',
      type: 'taken',
      givenAmount: 0,
      receivedAmount: 0,
      takenAmount: 1500,
      paidAmount: 500,
      remainingBalance: 1000,
      dueDate: `${year}-${monthStr}-28`,
      notes: 'Udhaar grocery account balance',
      status: 'partially_paid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  await db.udhaarTransactions.bulkAdd([
    {
      id: 'utx_1',
      userId,
      contactId: contactRohit,
      type: 'given',
      amount: 5000,
      date: `${year}-${monthStr}-01`,
      notes: 'Given cash ₹5,000 for laptop repair',
      accountId: cashAccId,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'utx_2',
      userId,
      contactId: contactRohit,
      type: 'received',
      amount: 2000,
      date: `${year}-${monthStr}-07`,
      notes: 'Received ₹2,000 via PhonePe',
      accountId: phonepeAccId,
      createdAt: new Date().toISOString(),
    },
  ]);

  // 4. Add Bills & Reminders
  await db.bills.bulkAdd([
    {
      id: 'bill_1',
      userId,
      name: 'MSEDCL Electricity Bill',
      category: 'Electricity',
      amount: 1450,
      dueDate: `${year}-${monthStr}-20`,
      repeatFrequency: 'monthly',
      accountId: phonepeAccId,
      isPaid: false,
      notes: 'Consumer ID: 1982349012',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'bill_2',
      userId,
      name: 'Airtel Fiber Broadband',
      category: 'Internet',
      amount: 799,
      dueDate: `${year}-${monthStr}-18`,
      repeatFrequency: 'monthly',
      accountId: gpayAccId,
      isPaid: false,
      notes: 'Unlimited 100Mbps plan',
      createdAt: new Date().toISOString(),
    },
  ]);

  // 5. Add Pending Automatic Transactions (Demonstrates Test Cases 1, 3, 4, 5)
  await db.pendingAutoTransactions.bulkAdd([
    // Test Case 1: Income Received
    {
      id: 'pending_demo_1',
      userId,
      amount: 2500,
      type: 'income',
      direction: 'received',
      category: 'Salary',
      suggestedCategory: 'Income',
      paymentMethod: 'upi',
      source: 'SBI Banking Alert',
      date: `${year}-${monthStr}-${dayStr}`,
      time: '08:42',
      personMerchant: 'Client Payment',
      referenceId: 'UPI98102391',
      rawText: 'Rs 2,500.00 credited to A/C XX4821 via UPI on 06Sep26. Info: Client Payment',
      confidence: 0.95,
      status: 'pending',
      duplicateHash: `hash_demo_1`,
      createdAt: new Date().toISOString(),
    },

    // Test Case 3: Udhaar Customer Match (Rohit Sharma repayment)
    {
      id: 'pending_demo_2',
      userId,
      amount: 2000,
      type: 'income',
      direction: 'received',
      category: 'Udhaar Payment',
      suggestedCategory: 'Udhaar Received',
      paymentMethod: 'upi',
      source: 'PhonePe Notification',
      date: `${year}-${monthStr}-${dayStr}`,
      time: '14:20',
      personMerchant: 'Rohit Sharma',
      referenceId: 'TXN8291024',
      rawText: 'Received Rs. 2,000 from Rohit Sharma via PhonePe. Ref: TXN8291024',
      confidence: 0.9,
      status: 'pending',
      matchedUdhaarContactId: contactRohit,
      matchedUdhaarContactName: 'Rohit Sharma (Friend)',
      matchedUdhaarPreviousDue: 3000,
      duplicateHash: `hash_demo_2`,
      createdAt: new Date().toISOString(),
    },

    // Test Case 4: Internal Transfer Detection (SBI -> PhonePe)
    {
      id: 'pending_demo_3',
      userId,
      amount: 5000,
      type: 'transfer',
      direction: 'paid',
      category: 'Transfer',
      suggestedCategory: 'Transfer',
      paymentMethod: 'bank',
      source: 'SBI SMS',
      date: `${year}-${monthStr}-${dayStr}`,
      time: '11:15',
      personMerchant: 'PhonePe Wallet Loading',
      referenceId: 'TRANSFER901',
      rawText: 'Rs 5,000.00 transferred to own PhonePe wallet account from SBI A/C XX4821',
      confidence: 0.92,
      status: 'pending',
      duplicateHash: `hash_demo_3`,
      createdAt: new Date().toISOString(),
    },

    // Test Case 5: Refund Detection (Amazon Refund)
    {
      id: 'pending_demo_4',
      userId,
      amount: 1500,
      type: 'refund',
      direction: 'received',
      category: 'Shopping',
      suggestedCategory: 'Refund',
      paymentMethod: 'upi',
      source: 'HDFC Alert',
      date: `${year}-${monthStr}-${dayStr}`,
      time: '16:45',
      personMerchant: 'Amazon India',
      referenceId: 'REFUND7721',
      rawText: 'Rs 1,500.00 refunded to A/C XX9102 from Amazon India. Reversal complete.',
      confidence: 0.95,
      status: 'pending',
      matchedRefundTxId: 'tx_demo_5',
      matchedRefundTxDescription: 'Amazon India (₹1,500)',
      matchedRefundTxAmount: 1500,
      duplicateHash: `hash_demo_4`,
      createdAt: new Date().toISOString(),
    },
  ]);

  // 6. Add Custom Transaction Rules
  await db.transactionRules.bulkAdd([
    {
      id: 'rule_1',
      userId,
      conditionField: 'merchant',
      operator: 'contains',
      conditionValue: 'Amazon',
      actionType: 'set_category',
      actionValue: 'Shopping',
      isEnabled: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'rule_2',
      userId,
      conditionField: 'merchant',
      operator: 'contains',
      conditionValue: 'Swiggy',
      actionType: 'set_category',
      actionValue: 'Food',
      isEnabled: true,
      createdAt: new Date().toISOString(),
    },
  ]);

  // 7. Add Auto Tracking Settings
  await db.autoTrackingSettings.put({
    userId,
    enabled: true,
    detectReceived: true,
    detectPayments: true,
    detectRefunds: true,
    detectTransfers: true,
    detectUpi: true,
    detectBankNotifications: true,
    confirmationMode: 'confirm_before_adding',
    notificationPermissionGranted: false,
    smsPermissionGranted: false,
    contactsPermissionGranted: false,
  });

  // Recalculate account balances
  await recalculateAccountBalances(userId);
}

// Reset Database function
export async function clearAllUserData(userId: string = 'default_user_1') {
  await db.accounts.where('userId').equals(userId).delete();
  await db.transactions.where('userId').equals(userId).delete();
  await db.udhaarContacts.where('userId').equals(userId).delete();
  await db.udhaarTransactions.where('userId').equals(userId).delete();
  await db.bills.where('userId').equals(userId).delete();
  await db.importedStatements.where('userId').equals(userId).delete();
  await db.pendingAutoTransactions.where('userId').equals(userId).delete();
  await db.transactionRules.where('userId').equals(userId).delete();
}
