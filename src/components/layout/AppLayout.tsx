import React from 'react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors flex justify-center items-start">
      {/* Mobile-first centered frame (Full width on mobile, max-w-md on desktop) */}
      <div className="w-full max-w-md min-h-screen bg-gray-50 dark:bg-gray-900 shadow-2xl relative flex flex-col border-x border-gray-200 dark:border-gray-800">
        {children}
      </div>
    </div>
  );
};
