import React, { useState } from 'react';
import { TransactionRule } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { db } from '../../db/database';
import { X, SlidersHorizontal, Plus, Trash2, CheckCircle, Power } from 'lucide-react';

interface TransactionRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: TransactionRule[];
}

export const TransactionRulesModal: React.FC<TransactionRulesModalProps> = ({
  isOpen,
  onClose,
  rules,
}) => {
  const { t } = useLanguage();
  const [conditionField, setConditionField] = useState<'merchant' | 'source' | 'person' | 'rawText'>('merchant');
  const [operator, setOperator] = useState<'contains' | 'equals' | 'startsWith'>('contains');
  const [conditionValue, setConditionValue] = useState<string>('');
  const [actionType, setActionType] = useState<'set_category' | 'set_type' | 'suggest_udhaar_payment'>('set_category');
  const [actionValue, setActionValue] = useState<string>('Shopping');

  if (!isOpen) return null;

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conditionValue.trim()) return;

    await db.transactionRules.add({
      id: `rule_${Date.now()}`,
      userId: 'default_user_1',
      conditionField,
      operator,
      conditionValue: conditionValue.trim(),
      actionType,
      actionValue: actionValue.trim(),
      isEnabled: true,
      createdAt: new Date().toISOString(),
    });

    setConditionValue('');
  };

  const handleToggleRule = async (id: string, current: boolean) => {
    await db.transactionRules.update(id, { isEnabled: !current });
  };

  const handleDeleteRule = async (id: string) => {
    await db.transactionRules.delete(id);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-indigo-500" />
            {t('transactionRulesTitle')}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add New Rule Form */}
        <form onSubmit={handleAddRule} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl space-y-2 border border-gray-200 dark:border-gray-700">
          <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1">
            <Plus className="w-3.5 h-3.5 text-indigo-500" /> Create Custom Rule
          </h4>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-gray-400 block">IF Field</label>
              <select
                value={conditionField}
                onChange={(e) => setConditionField(e.target.value as any)}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-gray-800 border rounded-xl text-xs"
              >
                <option value="merchant">Merchant / Person</option>
                <option value="source">Notification Source</option>
                <option value="rawText">Raw Message Text</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 block">Operator</label>
              <select
                value={operator}
                onChange={(e) => setOperator(e.target.value as any)}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-gray-800 border rounded-xl text-xs"
              >
                <option value="contains">Contains</option>
                <option value="equals">Equals</option>
                <option value="startsWith">Starts With</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 block">Condition Value</label>
            <input
              type="text"
              required
              value={conditionValue}
              onChange={(e) => setConditionValue(e.target.value)}
              placeholder="e.g. Swiggy, Amazon, Rahul"
              className="w-full px-2.5 py-1.5 bg-white dark:bg-gray-800 border rounded-xl text-xs font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-gray-400 block">THEN Action</label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value as any)}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-gray-800 border rounded-xl text-xs"
              >
                <option value="set_category">Set Category</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 block">Target Category</label>
              <select
                value={actionValue}
                onChange={(e) => setActionValue(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-gray-800 border rounded-xl text-xs"
              >
                <option value="Shopping">Shopping</option>
                <option value="Food">Food</option>
                <option value="Travel">Travel</option>
                <option value="Electricity">Electricity</option>
                <option value="Mobile Recharge">Mobile Recharge</option>
                <option value="Rent">Rent</option>
                <option value="Medical">Medical</option>
                <option value="Salary">Salary</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow"
          >
            Save Rule
          </button>
        </form>

        {/* Existing Rules List */}
        <div className="flex-1 overflow-y-auto space-y-2">
          <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300">
            Active Custom Rules ({rules.length})
          </h4>

          {rules.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No custom rules created yet.</p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700 bg-gray-50 dark:bg-gray-900 rounded-2xl border">
              {rules.map((rule) => (
                <div key={rule.id} className="p-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-gray-900 dark:text-gray-100">
                      IF {rule.conditionField} {rule.operator} "{rule.conditionValue}"
                    </span>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold block">
                      THEN Category = {rule.actionValue}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleRule(rule.id, rule.isEnabled)}
                      className={`p-1.5 rounded-lg ${
                        rule.isEnabled ? 'text-emerald-600 bg-emerald-100' : 'text-gray-400 bg-gray-200'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-1.5 rounded-lg text-rose-600 bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
