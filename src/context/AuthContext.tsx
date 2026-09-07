import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  userId: string;
  userName: string;
  isLocked: boolean;
  hasPin: boolean;
  isOnboarded: boolean;
  verifyPin: (pin: string) => boolean;
  setPin: (pin: string) => void;
  removePin: () => void;
  lockApp: () => void;
  unlockApp: () => void;
  completeOnboarding: (name: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId] = useState<string>('default_user_1');
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('hisab_user_name') || 'मुख्य उपयोगकर्ता';
  });
  
  const [hasPin, setHasPin] = useState<boolean>(() => {
    return !!localStorage.getItem('hisab_pin_code');
  });

  const [isLocked, setIsLocked] = useState<boolean>(() => {
    const pin = localStorage.getItem('hisab_pin_code');
    return !!pin;
  });

  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    return localStorage.getItem('hisab_onboarded') === 'true';
  });

  const verifyPin = (pin: string): boolean => {
    const savedPin = localStorage.getItem('hisab_pin_code');
    if (savedPin === pin) {
      setIsLocked(false);
      return true;
    }
    return false;
  };

  const setPin = (pin: string) => {
    localStorage.setItem('hisab_pin_code', pin);
    setHasPin(true);
    setIsLocked(false);
  };

  const removePin = () => {
    localStorage.removeItem('hisab_pin_code');
    setHasPin(false);
    setIsLocked(false);
  };

  const lockApp = () => {
    if (hasPin) {
      setIsLocked(true);
    }
  };

  const unlockApp = () => {
    setIsLocked(false);
  };

  const completeOnboarding = (name: string) => {
    setUserName(name || 'उपयोगकर्ता');
    localStorage.setItem('hisab_user_name', name || 'उपयोगकर्ता');
    localStorage.setItem('hisab_onboarded', 'true');
    setIsOnboarded(true);
  };

  return (
    <AuthContext.Provider
      value={{
        userId,
        userName,
        isLocked,
        hasPin,
        isOnboarded,
        verifyPin,
        setPin,
        removePin,
        lockApp,
        unlockApp,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
