import React, { useState, useEffect } from 'react';
import { subscriptionServer } from '../../backend/subscriptionServer';
import { AdminSubscriptionStats } from '../../types/subscription';
import { formatCurrency } from '../../utils/calculations';
import {
  BarChart3,
  Users,
  Crown,
  TrendingUp,
  XCircle,
  Clock,
  ShieldCheck,
  ChevronLeft,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';

interface AdminSubscriptionDashboardProps {
  onBack?: () => void;
}

export const AdminSubscriptionDashboard: React.FC<AdminSubscriptionDashboardProps> = ({ onBack }) => {
  const [stats, setStats] = useState<AdminSubscriptionStats | null>(null);

  useEffect(() => {
    async function loadStats() {
      const data = await subscriptionServer.getAdminAnalytics();
      setStats(data);
    }
    loadStats();
  }, []);

  if (!stats) {
    return (
      <div className="p-8 text-center text-xs text-gray-400">
        Loading admin subscription metrics...
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20 max-w-md mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 rounded-2xl bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <h2 className="text-base font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-500" />
          Admin Subscription Dashboard
        </h2>
        <span className="w-8" />
      </div>

      {/* Revenue Stat Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-4 rounded-3xl shadow-lg space-y-1">
          <span className="text-[10px] text-emerald-100 font-semibold block flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" /> Monthly Revenue (MRR)
          </span>
          <span className="text-xl font-black block">
            {formatCurrency(stats.monthlyRevenue)}
          </span>
          <span className="text-[9px] text-emerald-200 block">Verified Store Receipts</span>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-4 rounded-3xl shadow-lg space-y-1">
          <span className="text-[10px] text-indigo-100 font-semibold block flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Yearly Revenue (ARR)
          </span>
          <span className="text-xl font-black block">
            {formatCurrency(stats.yearlyRevenue)}
          </span>
          <span className="text-[9px] text-indigo-200 block">Annual Pro Members</span>
        </div>
      </div>

      {/* User Entitlement Breakdown */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-indigo-500" /> User Distribution Metrics
        </h3>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-gray-50 dark:bg-gray-900 p-2.5 rounded-2xl border">
            <span className="text-[10px] text-gray-400 block font-semibold">Total Registered</span>
            <span className="text-sm font-black text-gray-900 dark:text-gray-100">{stats.totalUsers}</span>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-2xl border border-amber-200">
            <span className="text-[10px] text-amber-700 dark:text-amber-300 block font-semibold">Active Pro</span>
            <span className="text-sm font-black text-amber-900 dark:text-amber-200">{stats.proUsers}</span>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/40 p-2.5 rounded-2xl border border-blue-200">
            <span className="text-[10px] text-blue-700 dark:text-blue-300 block font-semibold">Free Users</span>
            <span className="text-sm font-black text-blue-900 dark:text-blue-200">{stats.freeUsers}</span>
          </div>
        </div>
      </div>

      {/* Subscription Lifecycle Status Grid */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
          <Crown className="w-4 h-4 text-amber-500" /> Subscription State Audit
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center p-2.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100">
            <span className="font-semibold text-emerald-900 dark:text-emerald-200">Active Subscriptions</span>
            <span className="font-black text-emerald-700 dark:text-emerald-400">{stats.activeSubscriptions}</span>
          </div>

          <div className="flex justify-between items-center p-2.5 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-100">
            <span className="font-semibold text-amber-900 dark:text-amber-200">Cancelled (Pro until expiry)</span>
            <span className="font-black text-amber-700 dark:text-amber-400">{stats.cancelledSubscriptions}</span>
          </div>

          <div className="flex justify-between items-center p-2.5 bg-rose-50 dark:bg-rose-950/30 rounded-2xl border border-rose-100">
            <span className="font-semibold text-rose-900 dark:text-rose-200">Expired Subscriptions</span>
            <span className="font-black text-rose-700 dark:text-rose-400">{stats.expiredSubscriptions}</span>
          </div>

          <div className="flex justify-between items-center p-2.5 bg-purple-50 dark:bg-purple-950/30 rounded-2xl border border-purple-100">
            <span className="font-semibold text-purple-900 dark:text-purple-200">Upcoming Renewals (30 days)</span>
            <span className="font-black text-purple-700 dark:text-purple-400">{stats.upcomingRenewals}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
