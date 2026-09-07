import React from 'react';
import { Home, ArrowLeftRight, Users, Landmark, MoreHorizontal, Bot } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export type NavTab = 'home' | 'transactions' | 'udhaar' | 'accounts' | 'auto_inbox' | 'more';

interface BottomNavProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  pendingAutoCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  pendingAutoCount = 0,
}) => {
  const { t } = useLanguage();

  const navItems = [
    { id: 'home', label: t('home'), icon: Home },
    { id: 'transactions', label: t('transactions'), icon: ArrowLeftRight },
    { id: 'udhaar', label: t('udhaar'), icon: Users },
    { id: 'accounts', label: t('accounts'), icon: Landmark },
    { id: 'auto_inbox', label: t('autoTransactionsTab'), icon: Bot, badge: pendingAutoCount },
    { id: 'more', label: t('more'), icon: MoreHorizontal },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 shadow-lg transition-colors">
      <div className="max-w-md mx-auto px-1 flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as NavTab)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-0.5 transition-all relative ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
                  : 'text-gray-500 dark:text-gray-400 font-medium hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all relative ${
                  isActive ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' : ''
                }`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1 -right-1.5 px-1 py-0.2 bg-rose-500 text-white text-[8px] font-black rounded-full shadow animate-pulse">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] sm:text-[11px] leading-tight tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
