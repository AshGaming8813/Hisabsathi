import React, { useState } from 'react';
import { UdhaarContact, UdhaarType, UdhaarTransaction, Account } from '../../types';
import { formatCurrency } from '../../utils/calculations';
import { useLanguage } from '../../context/LanguageContext';
import { Users, Plus, ArrowUpRight, ArrowDownLeft, Phone, Search, ChevronRight } from 'lucide-react';
import { AddUdhaarModal } from './AddUdhaarModal';
import { ContactDetailModal } from './ContactDetailModal';

interface UdhaarDashboardProps {
  contacts: UdhaarContact[];
  transactions: UdhaarTransaction[];
  accounts: Account[];
  onSaveContact: (contact: Partial<UdhaarContact>, initialPayment?: number, accountId?: string) => Promise<void>;
  onAddPayment: (contactId: string, amount: number, accountId: string, notes: string) => Promise<void>;
  onMarkFullyPaid: (contactId: string) => Promise<void>;
  onDeleteContact: (contactId: string) => Promise<void>;
}

export const UdhaarDashboard: React.FC<UdhaarDashboardProps> = ({
  contacts,
  transactions,
  accounts,
  onSaveContact,
  onAddPayment,
  onMarkFullyPaid,
  onDeleteContact,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<UdhaarType>('given'); // 'given' (Maine Diya) vs 'taken' (Maine Liya)
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [selectedContact, setSelectedContact] = useState<UdhaarContact | null>(null);

  // Filter contacts by active tab & search
  const filteredContacts = contacts.filter((c) => {
    if (c.type !== activeTab) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return c.name.toLowerCase().includes(q) || (c.mobile && c.mobile.includes(q));
    }
    return true;
  });

  // Calculate totals
  let totalGiven = 0;
  let totalTaken = 0;

  contacts.forEach((c) => {
    if (c.type === 'given') totalGiven += c.remainingBalance || 0;
    if (c.type === 'taken') totalTaken += c.remainingBalance || 0;
  });

  const selectedContactHistory = selectedContact
    ? transactions.filter((utx) => utx.contactId === selectedContact.id)
    : [];

  return (
    <div className="space-y-4 pb-20">
      {/* Header Banner */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" />
              {t('udhaarManagement')}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Maintain complete Udhaar ledger & payment history
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            {t('addUdhaarEntry')}
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-gray-700/60 rounded-2xl">
          <button
            onClick={() => setActiveTab('given')}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'given'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>{t('tabMaineDiya')}</span>
          </button>

          <button
            onClick={() => setActiveTab('taken')}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'taken'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>{t('tabMaineLiya')}</span>
          </button>
        </div>

        {/* Total Stat Box */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800/50 flex justify-between items-center">
          <div>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">
              {activeTab === 'given' ? 'Total Money to Receive' : 'Total Money to Pay'}
            </span>
            <div
              className={`text-2xl font-black ${
                activeTab === 'given' ? 'text-indigo-600 dark:text-indigo-400' : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {formatCurrency(activeTab === 'given' ? totalGiven : totalTaken)}
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-200/50 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 rounded-full">
            {filteredContacts.length} Contacts
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search contact by name or mobile..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-gray-100 outline-none"
          />
        </div>
      </div>

      {/* Contacts List */}
      {filteredContacts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl text-center space-y-2 border border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-400 font-medium">{t('noUdhaarRecords')}</p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow"
          >
            {t('addUdhaarEntry')}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredContacts.map((c) => {
            const isGiven = c.type === 'given';
            const original = isGiven ? c.givenAmount : c.takenAmount;
            const settled = isGiven ? c.receivedAmount : c.paidAmount;

            return (
              <div
                key={c.id}
                onClick={() => setSelectedContact(c)}
                className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 cursor-pointer transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-black text-lg flex items-center justify-center shadow-inner">
                      {c.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {c.name}
                      </h4>
                      {c.mobile && (
                        <p className="text-[10px] text-gray-400 flex items-center gap-1">
                          <Phone className="w-2.5 h-2.5" /> {c.mobile}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold block">
                      Remaining
                    </span>
                    <span
                      className={`text-base font-black ${
                        isGiven ? 'text-indigo-600 dark:text-indigo-400' : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {formatCurrency(c.remainingBalance)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs pt-2 border-t border-gray-100 dark:border-gray-700/60">
                  <span className="text-gray-400 text-[10px]">
                    Total: {formatCurrency(original)} | Settled: {formatCurrency(settled)}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold capitalize ${
                        c.status === 'fully_paid'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : c.status === 'partially_paid'
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                          : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                      }`}
                    >
                      {c.status.replace('_', ' ')}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      <AddUdhaarModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={onSaveContact}
        accounts={accounts}
        initialType={activeTab}
      />

      {/* Detail & History Modal */}
      <ContactDetailModal
        isOpen={!!selectedContact}
        onClose={() => setSelectedContact(null)}
        contact={selectedContact}
        history={selectedContactHistory}
        accounts={accounts}
        onAddPayment={onAddPayment}
        onMarkFullyPaid={onMarkFullyPaid}
        onDeleteContact={onDeleteContact}
      />
    </div>
  );
};
