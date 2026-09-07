import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Lock, Delete } from 'lucide-react';

export const PinLockModal: React.FC = () => {
  const { verifyPin, isLocked } = useAuth();
  const { t } = useLanguage();
  const [pin, setPinState] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  if (!isLocked) return null;

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPinState(newPin);
      setError(false);

      if (newPin.length === 4) {
        setTimeout(() => {
          const success = verifyPin(newPin);
          if (!success) {
            setError(true);
            setPinState('');
          }
        }, 150);
      }
    }
  };

  const handleDelete = () => {
    setPinState((prev) => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/95 backdrop-blur-md flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xs text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">{t('enterPin')}</h2>
          <p className="text-xs text-gray-400 mt-1">HisabSaathi Protected Access</p>
        </div>

        {/* PIN Indicators */}
        <div className="flex justify-center space-x-4">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                pin.length > idx
                  ? 'bg-emerald-500 border-emerald-500 scale-110 shadow-lg shadow-emerald-500/50'
                  : 'border-gray-600 bg-gray-800'
              } ${error ? 'border-rose-500 bg-rose-500/20 animate-bounce' : ''}`}
            />
          ))}
        </div>

        {error && <p className="text-xs text-rose-400 font-medium">Incorrect PIN. Please try again.</p>}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-4 pt-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="w-16 h-16 rounded-full bg-gray-800 hover:bg-gray-700 active:bg-emerald-600 text-white text-xl font-bold transition-all shadow"
            >
              {num}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleKeyPress('0')}
            className="w-16 h-16 rounded-full bg-gray-800 hover:bg-gray-700 active:bg-emerald-600 text-white text-xl font-bold transition-all shadow"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="w-16 h-16 rounded-full bg-gray-800/60 hover:bg-gray-700 text-gray-300 flex items-center justify-center transition-all"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
