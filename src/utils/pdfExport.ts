import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction, Account } from '../types';
import { formatCurrency } from './calculations';

export function exportTransactionsPDF(
  transactions: Transaction[],
  accounts: Account[],
  startDateStr?: string,
  endDateStr?: string
) {
  const doc = new jsPDF();

  // Header Title
  doc.setFontSize(20);
  doc.setTextColor(22, 163, 74); // Emerald 600
  doc.text('HisabSaathi Financial Statement', 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const dateRangeText =
    startDateStr && endDateStr
      ? `Date Period: ${startDateStr} to ${endDateStr}`
      : `Generated On: ${new Date().toLocaleDateString('en-IN')}`;
  doc.text(dateRangeText, 14, 28);

  // Financial Summary Cards
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach((tx) => {
    if (tx.type === 'income' && !tx.isInternalTransfer) totalIncome += tx.amount;
    if (tx.type === 'expense' && !tx.isInternalTransfer) totalExpense += tx.amount;
  });

  const netSavings = totalIncome - totalExpense;

  doc.setFillColor(240, 253, 244);
  doc.roundedRect(14, 34, 55, 20, 2, 2, 'F');
  doc.setFontSize(9);
  doc.setTextColor(21, 128, 61);
  doc.text('Total Income', 18, 41);
  doc.setFontSize(12);
  doc.text(formatCurrency(totalIncome), 18, 49);

  doc.setFillColor(254, 242, 242);
  doc.roundedRect(75, 34, 55, 20, 2, 2, 'F');
  doc.setFontSize(9);
  doc.setTextColor(220, 38, 38);
  doc.text('Total Expense', 79, 41);
  doc.setFontSize(12);
  doc.text(formatCurrency(totalExpense), 79, 49);

  doc.setFillColor(245, 243, 255);
  doc.roundedRect(136, 34, 60, 20, 2, 2, 'F');
  doc.setFontSize(9);
  doc.setTextColor(124, 58, 237);
  doc.text('Net Savings', 140, 41);
  doc.setFontSize(12);
  doc.text(formatCurrency(netSavings), 140, 49);

  // Map Accounts map for quick lookup
  const accountMap = new Map<string, string>();
  accounts.forEach((acc) => accountMap.set(acc.id, acc.name));

  // Transactions Table
  const tableRows = transactions.map((tx, idx) => [
    idx + 1,
    tx.date,
    tx.type.toUpperCase(),
    tx.category,
    accountMap.get(tx.accountId) || 'Account',
    tx.person || '-',
    tx.type === 'income' ? `+₹${tx.amount}` : tx.type === 'expense' ? `-₹${tx.amount}` : `₹${tx.amount}`,
    tx.notes || '-',
  ]);

  autoTable(doc, {
    startY: 60,
    head: [['#', 'Date', 'Type', 'Category', 'Account', 'Person/Merchant', 'Amount', 'Notes']],
    body: tableRows,
    headStyles: {
      fillColor: [22, 163, 74],
      textColor: 255,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  // Save PDF file
  const fileName = `HisabSaathi_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
