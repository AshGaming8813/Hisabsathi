import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  db,
  seedDemoData,
  seedCategories,
  recalculateAccountBalances,
  clearAllUserData,
} from './db/database';
import { computeFinancialSummary } from './utils/calculations';
import { parseFinancialMessage } from './utils/smartParser';
import { useAuth } from './context/AuthContext';
import {
  Account,
  Transaction,
  UdhaarContact,
  Bill,
  UdhaarTransaction,
  TransactionType,
  PendingAutoTransaction,
  TransactionRule,
  AutoTrackingSettings,
} from './types';

// Layout
import { AppLayout } from './components/layout/AppLayout';
import { Header } from './components/layout/Header';
import { BottomNav, NavTab } from './components/layout/BottomNav';
import { PinLockModal } from './components/layout/PinLockModal';

// Dashboard
import { SummaryCards } from './components/dashboard/SummaryCards';
import { AutoTrackingHomeCard } from './components/dashboard/AutoTrackingHomeCard';
import { QuickActions } from './components/dashboard/QuickActions';
import { IncomeExpenseChart } from './components/dashboard/IncomeExpenseChart';
import { RecentTransactions } from './components/dashboard/RecentTransactions';
import { FloatingAddButton } from './components/dashboard/FloatingAddButton';

// Modules
import { TransactionList } from './components/transactions/TransactionList';
import { AddEditTransactionModal } from './components/transactions/AddEditTransactionModal';
import { CategoryManagerModal } from './components/transactions/CategoryManagerModal';

import { AutomaticTransactionsScreen } from './components/autoTransactions/AutomaticTransactionsScreen';
import { TransactionRulesModal } from './components/autoTransactions/TransactionRulesModal';
import { PrivacyPermissionsModal } from './components/more/PrivacyPermissionsModal';

import { UdhaarDashboard } from './components/udhaar/UdhaarDashboard';

import { AccountsList } from './components/accounts/AccountsList';
import { AccountTransferModal } from './components/accounts/AccountTransferModal';

import { ReportsDashboard } from './components/reports/ReportsDashboard';
import { BillReminders } from './components/bills/BillReminders';
import { StatementImportModal } from './components/import/StatementImportModal';
import { MoreMenu } from './components/more/MoreMenu';
import { OnboardingModal } from './components/more/OnboardingModal';

// Declare global window property for native Android SMS Receiver
declare global {
  interface Window {
    onSmsReceived?: (body: string) => void;
    onNotificationReceived?: (rawText: string, source: string) => void;
  }
}

export const App: React.FC = () => {
  const { userId, isOnboarded } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab | 'reports' | 'bills'>('home');

  // Modals state
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState<boolean>(false);
  const [txInitialType, setTxInitialType] = useState<TransactionType>('expense');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState<boolean>(false);
  const [isPrivacyPermissionsOpen, setIsPrivacyPermissionsOpen] = useState<boolean>(false);

  // Live Database Queries
  const accounts = useLiveQuery(() => db.accounts.where('userId').equals(userId).toArray(), [userId]) || [];
  const transactions =
    useLiveQuery(() => db.transactions.where('userId').equals(userId).toArray(), [userId]) || [];
  const categories = useLiveQuery(() => db.categories.toArray()) || [];
  const udhaarContacts =
    useLiveQuery(() => db.udhaarContacts.where('userId').equals(userId).toArray(), [userId]) || [];
  const udhaarTransactions =
    useLiveQuery(() => db.udhaarTransactions.where('userId').equals(userId).toArray(), [userId]) || [];
  const bills = useLiveQuery(() => db.bills.where('userId').equals(userId).toArray(), [userId]) || [];

  const pendingAutoTransactions =
    useLiveQuery(() => db.pendingAutoTransactions.where('userId').equals(userId).toArray(), [userId]) || [];
  const transactionRules =
    useLiveQuery(() => db.transactionRules.where('userId').equals(userId).toArray(), [userId]) || [];
  const autoSettings =
    useLiveQuery(() => db.autoTrackingSettings.get(userId), [userId]);

  // Seed initial data if first boot
  useEffect(() => {
    async function initDB() {
      await seedCategories();
      const accCount = await db.accounts.where('userId').equals(userId).count();
      if (accCount === 0 && isOnboarded) {
        await seedDemoData(userId);
      }
    }
    initDB();
  }, [userId, isOnboarded]);

  // Handle incoming SMS or Android Notifications dynamically
  useEffect(() => {
    const handleIncomingMessage = async (rawText: string, source: string) => {
      if (autoSettings && !autoSettings.enabled) return;

      const parsed = parseFinancialMessage(rawText, {
        userId,
        source,
        existingTransactions: transactions,
        existingPending: pendingAutoTransactions,
        udhaarContacts,
        userRules: transactionRules,
      });

      if (parsed) {
        // If mode is auto_add_high_confidence and confidence >= 0.9
        if (
          autoSettings?.confirmationMode === 'auto_add_high_confidence' &&
          parsed.confidence >= 0.9 &&
          !parsed.isPossibleDuplicate &&
          !parsed.matchedUdhaarContactId
        ) {
          // Auto add
          await handleConfirmAutoTransaction(parsed);
        } else {
          // Save to pending inbox
          await db.pendingAutoTransactions.put(parsed);
        }
      }
    };

    window.onSmsReceived = (body: string) => handleIncomingMessage(body, 'Bank SMS');
    window.onNotificationReceived = (text: string, src: string) => handleIncomingMessage(text, src || 'Notification Listener');

    return () => {
      delete window.onSmsReceived;
      delete window.onNotificationReceived;
    };
  }, [userId, autoSettings, transactions, pendingAutoTransactions, udhaarContacts, transactionRules]);

  // Compute financial summary
  const summary = computeFinancialSummary(accounts, transactions, udhaarContacts, bills);
  const pendingCount = pendingAutoTransactions.filter((p) => p.status === 'pending').length;

  // ----------------------------------------------------
  // AUTOMATIC TRANSACTION CONFIRMATION HANDLERS
  // ----------------------------------------------------
  const handleConfirmAutoTransaction = async (
    item: PendingAutoTransaction,
    customAccountId?: string,
    customCategory?: string
  ) => {
    const accId = customAccountId || accounts[0]?.id || '';

    // Add confirmed transaction
    await db.transactions.add({
      id: `tx_auto_${Date.now()}`,
      userId,
      type: item.type,
      amount: item.amount,
      category: customCategory || item.category || 'Other',
      accountId: accId,
      date: item.date,
      time: item.time,
      person: item.personMerchant,
      notes: `Auto-confirmed from ${item.source}`,
      paymentMethod: item.paymentMethod,
      isInternalTransfer: item.type === 'transfer',
      duplicateHash: item.duplicateHash,
      source: item.source,
      referenceId: item.referenceId,
      confidence: item.confidence,
      isAutomatic: true,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    });

    // Update pending status
    await db.pendingAutoTransactions.update(item.id, { status: 'confirmed' });
    await recalculateAccountBalances(userId);
  };

  const handleConfirmUdhaarPayment = async (
    item: PendingAutoTransaction,
    contactId: string,
    amount: number,
    accountId: string
  ) => {
    const contact = await db.udhaarContacts.get(contactId);
    if (!contact) return;

    const isGiven = contact.type === 'given';
    let newReceived = contact.receivedAmount + (isGiven ? amount : 0);
    let newPaid = contact.paidAmount + (!isGiven ? amount : 0);
    let totalOriginal = isGiven ? contact.givenAmount : contact.takenAmount;
    let totalSettled = isGiven ? newReceived : newPaid;
    let newRemaining = Math.max(0, totalOriginal - totalSettled);

    let status: any = 'partially_paid';
    if (newRemaining <= 0) status = 'fully_paid';

    await db.udhaarContacts.update(contactId, {
      receivedAmount: newReceived,
      paidAmount: newPaid,
      remainingBalance: newRemaining,
      status,
      updatedAt: new Date().toISOString(),
    });

    await db.udhaarTransactions.add({
      id: `utx_${Date.now()}`,
      userId,
      contactId,
      type: isGiven ? 'received' : 'repaid',
      amount,
      date: item.date,
      notes: `Payment auto-matched from ${item.source}`,
      accountId,
      createdAt: new Date().toISOString(),
    });

    await db.transactions.add({
      id: `tx_udhaar_pay_${Date.now()}`,
      userId,
      type: isGiven ? 'income' : 'expense',
      amount,
      category: isGiven ? 'Udhaar Received' : 'Udhaar Repaid',
      accountId: accountId || accounts[0]?.id || '',
      date: item.date,
      time: item.time,
      person: contact.name,
      notes: `Udhaar payment from ${contact.name}`,
      paymentMethod: item.paymentMethod,
      udhaarContactId: contactId,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    });

    await db.pendingAutoTransactions.update(item.id, { status: 'confirmed' });
    await recalculateAccountBalances(userId);
  };

  const handleConfirmRefund = async (
    item: PendingAutoTransaction,
    originalTxId: string
  ) => {
    await db.transactions.add({
      id: `tx_refund_${Date.now()}`,
      userId,
      type: 'refund',
      amount: item.amount,
      category: item.category || 'Refund',
      accountId: accounts[0]?.id || '',
      date: item.date,
      time: item.time,
      person: item.personMerchant,
      notes: `Refund linked to original transaction #${originalTxId}`,
      paymentMethod: item.paymentMethod,
      isRefund: true,
      originalTransactionId: originalTxId,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    });

    await db.pendingAutoTransactions.update(item.id, { status: 'confirmed' });
    await recalculateAccountBalances(userId);
  };

  const handleIgnoreTransaction = async (id: string) => {
    await db.pendingAutoTransactions.update(id, { status: 'ignored' });
  };

  const handleRestoreTransaction = async (id: string) => {
    await db.pendingAutoTransactions.update(id, { status: 'pending' });
  };

  const handleDeletePermanently = async (id: string) => {
    await db.pendingAutoTransactions.delete(id);
  };

  // ----------------------------------------------------
  // STANDARD TRANSACTION HANDLERS
  // ----------------------------------------------------
  const handleSaveTransaction = async (txData: Partial<Transaction>) => {
    if (txData.id) {
      await db.transactions.update(txData.id, txData);
    } else {
      await db.transactions.add({
        id: `tx_${Date.now()}`,
        userId,
        type: txData.type || 'expense',
        amount: txData.amount || 0,
        category: txData.category || 'Other',
        accountId: txData.accountId || accounts[0]?.id || '',
        toAccountId: txData.toAccountId,
        date: txData.date || new Date().toISOString().split('T')[0],
        time: txData.time || new Date().toTimeString().split(' ')[0].slice(0, 5),
        person: txData.person || '',
        notes: txData.notes || '',
        receiptPhoto: txData.receiptPhoto || '',
        paymentMethod: txData.paymentMethod || 'upi',
        isInternalTransfer: txData.isInternalTransfer || false,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      });
    }

    await recalculateAccountBalances(userId);
  };

  const handleDeleteTransaction = async (id: string) => {
    await db.transactions.delete(id);
    await recalculateAccountBalances(userId);
  };

  // ----------------------------------------------------
  // ACCOUNT HANDLERS
  // ----------------------------------------------------
  const handleSaveAccount = async (accData: Partial<Account>) => {
    if (accData.id) {
      await db.accounts.update(accData.id, accData);
    } else {
      await db.accounts.add({
        id: `acc_${Date.now()}`,
        userId,
        name: accData.name || 'New Account',
        type: accData.type || 'bank',
        bankName: accData.bankName || 'SBI',
        accountNumber: accData.accountNumber,
        balance: accData.initialBalance || 0,
        initialBalance: accData.initialBalance || 0,
        color: accData.color || '#2563eb',
        createdAt: new Date().toISOString(),
      });
    }
    await recalculateAccountBalances(userId);
  };

  const handleDeleteAccount = async (id: string) => {
    await db.accounts.delete(id);
  };

  // ----------------------------------------------------
  // UDHAAR HANDLERS
  // ----------------------------------------------------
  const handleSaveUdhaarContact = async (
    contactData: Partial<UdhaarContact>,
    initialPayment: number = 0,
    accountId?: string
  ) => {
    const contactId = `udhaar_${Date.now()}`;
    await db.udhaarContacts.add({
      id: contactId,
      userId,
      name: contactData.name || 'Contact',
      mobile: contactData.mobile || '',
      type: contactData.type || 'given',
      givenAmount: contactData.givenAmount || 0,
      receivedAmount: contactData.receivedAmount || 0,
      takenAmount: contactData.takenAmount || 0,
      paidAmount: contactData.paidAmount || 0,
      remainingBalance: contactData.remainingBalance || 0,
      dueDate: contactData.dueDate,
      notes: contactData.notes,
      status: contactData.status || 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const isGiven = contactData.type === 'given';
    const totalAmt = isGiven ? contactData.givenAmount : contactData.takenAmount;

    await db.udhaarTransactions.add({
      id: `utx_${Date.now()}_1`,
      userId,
      contactId,
      type: isGiven ? 'given' : 'taken',
      amount: totalAmt || 0,
      date: new Date().toISOString().split('T')[0],
      notes: contactData.notes || `${isGiven ? 'Given' : 'Borrowed'} initial amount`,
      accountId,
      createdAt: new Date().toISOString(),
    });

    if (accountId && totalAmt && totalAmt > 0) {
      await db.transactions.add({
        id: `tx_udhaar_${Date.now()}`,
        userId,
        type: isGiven ? 'expense' : 'income',
        amount: totalAmt,
        category: isGiven ? 'Udhaar Diya' : 'Udhaar Liya',
        accountId,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].slice(0, 5),
        person: contactData.name,
        notes: `Udhaar ${isGiven ? 'Given to' : 'Borrowed from'} ${contactData.name}`,
        paymentMethod: 'other',
        udhaarContactId: contactId,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      });
      await recalculateAccountBalances(userId);
    }
  };

  const handleAddUdhaarPayment = async (
    contactId: string,
    amount: number,
    accountId: string,
    notes: string
  ) => {
    const contact = await db.udhaarContacts.get(contactId);
    if (!contact) return;

    const isGiven = contact.type === 'given';
    let newReceived = contact.receivedAmount + (isGiven ? amount : 0);
    let newPaid = contact.paidAmount + (!isGiven ? amount : 0);
    let totalOriginal = isGiven ? contact.givenAmount : contact.takenAmount;
    let totalSettled = isGiven ? newReceived : newPaid;
    let newRemaining = Math.max(0, totalOriginal - totalSettled);

    let status: any = 'partially_paid';
    if (newRemaining <= 0) status = 'fully_paid';

    await db.udhaarContacts.update(contactId, {
      receivedAmount: newReceived,
      paidAmount: newPaid,
      remainingBalance: newRemaining,
      status,
      updatedAt: new Date().toISOString(),
    });

    await db.udhaarTransactions.add({
      id: `utx_${Date.now()}`,
      userId,
      contactId,
      type: isGiven ? 'received' : 'repaid',
      amount,
      date: new Date().toISOString().split('T')[0],
      notes: notes || `Payment ${isGiven ? 'received' : 'repaid'}`,
      accountId,
      createdAt: new Date().toISOString(),
    });

    if (accountId) {
      await db.transactions.add({
        id: `tx_udhaar_pay_${Date.now()}`,
        userId,
        type: isGiven ? 'income' : 'expense',
        amount,
        category: isGiven ? 'Udhaar Received' : 'Udhaar Repaid',
        accountId,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].slice(0, 5),
        person: contact.name,
        notes: `Udhaar payment ${isGiven ? 'received from' : 'paid to'} ${contact.name}`,
        paymentMethod: 'other',
        udhaarContactId: contactId,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      });
      await recalculateAccountBalances(userId);
    }
  };

  const handleMarkUdhaarFullyPaid = async (contactId: string) => {
    const contact = await db.udhaarContacts.get(contactId);
    if (!contact) return;

    const isGiven = contact.type === 'given';
    const totalOriginal = isGiven ? contact.givenAmount : contact.takenAmount;

    await db.udhaarContacts.update(contactId, {
      receivedAmount: isGiven ? totalOriginal : contact.receivedAmount,
      paidAmount: !isGiven ? totalOriginal : contact.paidAmount,
      remainingBalance: 0,
      status: 'fully_paid',
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDeleteUdhaarContact = async (contactId: string) => {
    await db.udhaarContacts.delete(contactId);
    await db.udhaarTransactions.where('contactId').equals(contactId).delete();
  };

  // ----------------------------------------------------
  // BILL HANDLERS
  // ----------------------------------------------------
  const handleSaveBill = async (billData: Partial<Bill>) => {
    await db.bills.add({
      id: `bill_${Date.now()}`,
      userId,
      name: billData.name || 'New Bill',
      category: billData.category || 'Electricity',
      amount: billData.amount || 0,
      dueDate: billData.dueDate || new Date().toISOString().split('T')[0],
      repeatFrequency: billData.repeatFrequency || 'monthly',
      accountId: billData.accountId,
      isPaid: false,
      notes: billData.notes,
      createdAt: new Date().toISOString(),
    });
  };

  const handlePayBill = async (bill: Bill, accountId: string) => {
    await db.bills.update(bill.id, {
      isPaid: true,
      lastPaidDate: new Date().toISOString().split('T')[0],
    });

    await db.transactions.add({
      id: `tx_bill_${Date.now()}`,
      userId,
      type: 'expense',
      amount: bill.amount,
      category: bill.category,
      accountId: accountId || accounts[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0].slice(0, 5),
      person: bill.name,
      notes: `Bill payment for ${bill.name}`,
      paymentMethod: 'upi',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    });

    await recalculateAccountBalances(userId);
  };

  const handleDeleteBill = async (id: string) => {
    await db.bills.delete(id);
  };

  // ----------------------------------------------------
  // STATEMENT IMPORT CONFIRMATION
  // ----------------------------------------------------
  const handleImportConfirm = async (rows: any[], targetAccountId: string) => {
    const newTxs: Transaction[] = rows.map((r) => ({
      id: `tx_imp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      type: r.type,
      amount: r.amount,
      category: r.category,
      accountId: targetAccountId,
      date: r.date,
      time: '12:00',
      person: r.description,
      notes: 'Imported from bank statement',
      paymentMethod: 'bank',
      isInternalTransfer: r.type === 'transfer',
      duplicateHash: r.duplicateHash,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    }));

    await db.transactions.bulkAdd(newTxs);
    await recalculateAccountBalances(userId);
  };

  // ----------------------------------------------------
  // QUICK ACTION BUTTONS
  // ----------------------------------------------------
  const openAddIncome = () => {
    setEditingTransaction(null);
    setTxInitialType('income');
    setIsAddTxModalOpen(true);
  };

  const openAddExpense = () => {
    setEditingTransaction(null);
    setTxInitialType('expense');
    setIsAddTxModalOpen(true);
  };

  const openAddUdhaarDiya = () => {
    setActiveTab('udhaar');
  };

  const openAddUdhaarLiya = () => {
    setActiveTab('udhaar');
  };

  return (
    <AppLayout>
      {/* PIN Security Overlay */}
      <PinLockModal />

      {/* Onboarding Welcome Flow (First Launch) */}
      <OnboardingModal
        isOpen={!isOnboarded}
        onClose={() => {}}
        onLoadDemoData={() => seedDemoData(userId)}
      />

      {/* App Header */}
      <Header onOpenImport={() => setIsImportModalOpen(true)} />

      {/* Main Screen Content Router */}
      <main className="flex-1 px-4 py-4 overflow-y-auto">
        {activeTab === 'home' && (
          <div className="space-y-4 pb-20">
            {/* Hero & Financial Overview Cards */}
            <SummaryCards summary={summary} onNavigateTab={(tab) => setActiveTab(tab)} />

            {/* Compact Automatic Money Tracking Card (Requirement #14) */}
            <AutoTrackingHomeCard
              pendingCount={pendingCount}
              onReviewNow={() => setActiveTab('auto_inbox')}
              onManageSettings={() => setIsPrivacyPermissionsOpen(true)}
            />

            {/* 4 Prominent Quick Action Buttons */}
            <QuickActions
              onAddIncome={openAddIncome}
              onAddExpense={openAddExpense}
              onAddUdhaarDiya={openAddUdhaarDiya}
              onAddUdhaarLiya={openAddUdhaarLiya}
            />

            {/* Income vs Expense Chart */}
            <IncomeExpenseChart transactions={transactions} />

            {/* Recent Transactions List */}
            <RecentTransactions
              transactions={transactions}
              accounts={accounts}
              onViewAll={() => setActiveTab('transactions')}
              onSelectTransaction={(tx) => {
                setEditingTransaction(tx);
                setIsAddTxModalOpen(true);
              }}
            />
          </div>
        )}

        {activeTab === 'transactions' && (
          <TransactionList
            transactions={transactions}
            accounts={accounts}
            onSelectTransaction={(tx) => {
              setEditingTransaction(tx);
              setIsAddTxModalOpen(true);
            }}
            onOpenAddModal={() => {
              setEditingTransaction(null);
              setTxInitialType('expense');
              setIsAddTxModalOpen(true);
            }}
          />
        )}

        {activeTab === 'auto_inbox' && (
          <AutomaticTransactionsScreen
            pendingTransactions={pendingAutoTransactions}
            accounts={accounts}
            udhaarContacts={udhaarContacts}
            onConfirmTransaction={handleConfirmAutoTransaction}
            onConfirmUdhaarPayment={handleConfirmUdhaarPayment}
            onConfirmRefund={handleConfirmRefund}
            onIgnoreTransaction={handleIgnoreTransaction}
            onRestoreTransaction={handleRestoreTransaction}
            onDeletePermanently={handleDeletePermanently}
            onOpenRulesManager={() => setIsRulesModalOpen(true)}
            onOpenPrivacyPermissions={() => setIsPrivacyPermissionsOpen(true)}
          />
        )}

        {activeTab === 'udhaar' && (
          <UdhaarDashboard
            contacts={udhaarContacts}
            transactions={udhaarTransactions}
            accounts={accounts}
            onSaveContact={handleSaveUdhaarContact}
            onAddPayment={handleAddUdhaarPayment}
            onMarkFullyPaid={handleMarkUdhaarFullyPaid}
            onDeleteContact={handleDeleteUdhaarContact}
          />
        )}

        {activeTab === 'accounts' && (
          <AccountsList
            accounts={accounts}
            transactions={transactions}
            onSaveAccount={handleSaveAccount}
            onDeleteAccount={handleDeleteAccount}
            onOpenTransferModal={() => setIsTransferModalOpen(true)}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsDashboard
            transactions={transactions}
            accounts={accounts}
            udhaarContacts={udhaarContacts}
            pendingAutoTransactions={pendingAutoTransactions}
          />
        )}

        {activeTab === 'bills' && (
          <BillReminders
            bills={bills}
            accounts={accounts}
            onSaveBill={handleSaveBill}
            onPayBill={handlePayBill}
            onDeleteBill={handleDeleteBill}
          />
        )}

        {activeTab === 'more' && (
          <MoreMenu
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenImport={() => setIsImportModalOpen(true)}
            onLoadDemoData={() => seedDemoData(userId)}
            onClearAllData={() => clearAllUserData(userId)}
            transactions={transactions}
            accounts={accounts}
            pendingAutoTransactions={pendingAutoTransactions}
            rules={transactionRules}
            autoSettings={autoSettings}
          />
        )}
      </main>

      {/* Floating Add Transaction (+) Button */}
      <FloatingAddButton
        onClick={() => {
          setEditingTransaction(null);
          setTxInitialType('expense');
          setIsAddTxModalOpen(true);
        }}
      />

      {/* Bottom Navigation (With Auto Transactions Inbox Tab & Notification Badge) */}
      <BottomNav
        activeTab={activeTab === 'reports' || activeTab === 'bills' ? 'more' : (activeTab as NavTab)}
        setActiveTab={(tab) => setActiveTab(tab)}
        pendingAutoCount={pendingCount}
      />

      {/* Modal Dialogs */}
      <AddEditTransactionModal
        isOpen={isAddTxModalOpen}
        onClose={() => {
          setIsAddTxModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        onDelete={handleDeleteTransaction}
        accounts={accounts}
        categories={categories}
        initialType={txInitialType}
        editingTransaction={editingTransaction}
        onAddCustomCategoryClick={() => setIsCategoryModalOpen(true)}
      />

      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />

      <AccountTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        accounts={accounts}
        onSaveTransfer={handleSaveTransaction}
      />

      <StatementImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        accounts={accounts}
        existingTransactions={transactions}
        onImportConfirm={handleImportConfirm}
      />

      <TransactionRulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
        rules={transactionRules}
      />

      <PrivacyPermissionsModal
        isOpen={isPrivacyPermissionsOpen}
        onClose={() => setIsPrivacyPermissionsOpen(false)}
        settings={autoSettings}
      />
    </AppLayout>
  );
};
