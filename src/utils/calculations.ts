import { Account, Transaction, UdhaarContact, Bill } from '../types';

export interface FinancialSummary {
  totalMoney: number;
  cashBalance: number;
  bankBalance: number;
  upiBalance: number;
  incomeThisMonth: number;
  expenseThisMonth: number;
  netSavingsThisMonth: number;
  totalGiven: number;
  totalTaken: number;
  pendingUdhaarCount: number;
  upcomingBillsCount: number;
  upcomingBillsTotal: number;
}

export function computeFinancialSummary(
  accounts: Account[],
  transactions: Transaction[],
  udhaarContacts: UdhaarContact[],
  bills: Bill[]
): FinancialSummary {
  let totalMoney = 0;
  let cashBalance = 0;
  let bankBalance = 0;
  let upiBalance = 0;

  accounts.forEach((acc) => {
    totalMoney += acc.balance || 0;
    if (acc.type === 'cash') cashBalance += acc.balance || 0;
    else if (acc.type === 'bank') bankBalance += acc.balance || 0;
    else if (acc.type === 'upi') upiBalance += acc.balance || 0;
  });

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  let incomeThisMonth = 0;
  let expenseThisMonth = 0;

  transactions.forEach((tx) => {
    if (!tx.date) return;
    const [y, m] = tx.date.split('-').map(Number);
    if (y === currentYear && m === currentMonth + 1) {
      // Exclude internal transfers from normal Income & Expense totals!
      if (tx.type === 'income' && !tx.isInternalTransfer) {
        incomeThisMonth += tx.amount || 0;
      } else if (tx.type === 'expense' && !tx.isInternalTransfer) {
        expenseThisMonth += tx.amount || 0;
      }
    }
  });

  let totalGiven = 0;
  let totalTaken = 0;
  let pendingUdhaarCount = 0;

  udhaarContacts.forEach((contact) => {
    if (contact.type === 'given') {
      totalGiven += contact.remainingBalance || 0;
    } else {
      totalTaken += contact.remainingBalance || 0;
    }

    if (contact.remainingBalance > 0) {
      pendingUdhaarCount += 1;
    }
  });

  let upcomingBillsCount = 0;
  let upcomingBillsTotal = 0;

  bills.forEach((bill) => {
    if (!bill.isPaid) {
      upcomingBillsCount += 1;
      upcomingBillsTotal += bill.amount || 0;
    }
  });

  return {
    totalMoney,
    cashBalance,
    bankBalance,
    upiBalance,
    incomeThisMonth,
    expenseThisMonth,
    netSavingsThisMonth: incomeThisMonth - expenseThisMonth,
    totalGiven,
    totalTaken,
    pendingUdhaarCount,
    upcomingBillsCount,
    upcomingBillsTotal,
  };
}

export function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));
  return amount < 0 ? `-₹${formatted}` : `₹${formatted}`;
}
