import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { AutoTrackingSettings } from '../../types';
import { db } from '../../db/database';
import { ShieldCheck, X, Bell, MessageSquare, Users, Lock, Power } from 'lucide-react';

interface PrivacyPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings?: AutoTrackingSettings;
}

export const PrivacyPermissionsModal: React.FC<PrivacyPermissionsModalProps> = ({
  isOpen,
  onClose,
  settings,
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const handleToggleAutoTracking = async () => {
    if (!settings) return;
    await db.autoTrackingSettings.put({
      ...settings,
      enabled: !settings.enabled,
    });
  };

  const isAutoEnabled = settings?.enabled ?? true;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            {t('privacyPermissionsTitle')}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Box */}
        <div
          className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs font-bold ${
            isAutoEnabled
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Power className="w-4 h-4" />
            <span>Automatic Money Detection: {isAutoEnabled ? 'ACTIVE' : 'OFF'}</span>
          </div>

          <button
            onClick={handleToggleAutoTracking}
            className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] ${
              isAutoEnabled ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
            }`}
          >
            {isAutoEnabled ? 'Turn OFF' : 'Turn ON'}
          </button>
        </div>

        {/* Permissions Breakdown */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300">
            Android Permissions & Access Control
          </h4>

          {/* Notification Access */}
          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-amber-500" /> Notification Listener Access
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                User Authorized
              </span>
            </div>
            <p className="text-[10px] text-gray-400">
              Reads bank & UPI push notifications locally to detect received/paid amounts.
            </p>
          </div>

          {/* SMS Access */}
          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-blue-500" /> SMS Access (RECEIVE_SMS / READ_SMS)
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                Granted (Native APK)
              </span>
            </div>
            <p className="text-[10px] text-gray-400">
              Parses incoming bank SMS messages locally without sending text to any external server.
            </p>
          </div>

          {/* Contacts Access */}
          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-500" /> Contacts Matching Access
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-200 text-gray-700">
                Optional
              </span>
            </div>
            <p className="text-[10px] text-gray-400">
              Matches payment sender names with existing Udhaar contacts to suggest loan repayments.
            </p>
          </div>
        </div>

        {/* Security Rule Guarantees */}
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-1.5 text-xs text-emerald-900 dark:text-emerald-200">
          <span className="font-bold flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-emerald-600" /> Privacy First Principles
          </span>
          <ul className="text-[10px] space-y-1 text-emerald-800 dark:text-emerald-300 font-medium list-disc pl-4">
            <li>Never reads private personal SMS, OTPs, or passwords.</li>
            <li>No data sent to third-party servers. All parsing is 100% on-device.</li>
            <li>Default setting is "Confirm Before Adding". You retain complete accounting control.</li>
          </ul>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-md"
        >
          Close Privacy Center
        </button>
      </div>
    </div>
  );
};
