import Papa from 'papaparse';
import { Transaction, Account } from '../types';

export function exportTransactionsCSV(transactions: Transaction[], accounts: Account[]) {
  const accountMap = new Map<string, string>();
  accounts.forEach((acc) => accountMap.set(acc.id, acc.name));

  const csvData = transactions.map((tx) => ({
    Date: tx.date,
    Time: tx.time || '',
    Type: tx.type,
    Category: tx.category,
    Account: accountMap.get(tx.accountId) || '',
    'To Account': tx.toAccountId ? accountMap.get(tx.toAccountId) || '' : '',
    Amount: tx.amount,
    'Person/Merchant': tx.person || '',
    'Payment Method': tx.paymentMethod || '',
    Notes: tx.notes || '',
  }));

  const csvString = Papa.unparse(csvData);
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `HisabSaathi_Export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
