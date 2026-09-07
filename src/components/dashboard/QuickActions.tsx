import React from 'react';
import { PlusCircle, MinusCircle, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface QuickActionsProps {
  onAddIncome: () => void;
  onAddExpense: () => void;
  onAddUdhaarDiya: () => void;
  onAddUdhaarLiya: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onAddIncome,
  onAddExpense,
  onAddUdhaarDiya,
  onAddUdhaarLiya,
}) => {
  const { t } = useLanguage();

  const actions = [
    {
      label: t('addIncome'),
      subLabel: '+ Income',
      icon: PlusCircle,
      bg: 'bg-emerald-500 hover:bg-emerald-600',
      shadow: 'shadow-emerald-500/25',
      onClick: onAddIncome,
    },
    {
      label: t('addExpense'),
      subLabel: '- Expense',
      icon: MinusCircle,
      bg: 'bg-rose-500 hover:bg-rose-600',
      shadow: 'shadow-rose-500/25',
      onClick: onAddExpense,
    },
    {
      label: t('udhaarDiya'),
      subLabel: 'Money Given',
      icon: ArrowUpRight,
      bg: 'bg-indigo-600 hover:bg-indigo-700',
      shadow: 'shadow-indigo-500/25',
      onClick: onAddUdhaarDiya,
    },
    {
      label: t('udhaarLiya'),
      subLabel: 'Money Taken',
      icon: ArrowDownLeft,
      bg: 'bg-amber-600 hover:bg-amber-700',
      shadow: 'shadow-amber-500/25',
      onClick: onAddUdhaarLiya,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
      {actions.map((act, idx) => {
        const Icon = act.icon;
        return (
          <button
            key={idx}
            onClick={act.onClick}
            className={`${act.bg} text-white p-3.5 rounded-2xl shadow-md ${act.shadow} flex flex-col items-start justify-between transition-transform active:scale-95 space-y-2`}
          >
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold leading-tight">{act.label}</p>
              <p className="text-[10px] text-white/80 font-medium">{act.subLabel}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
};
