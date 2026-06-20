import React, { useState } from 'react';
import { Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

export function SettingsView() {
  const [haptics, setHaptics] = useState(() => localStorage.getItem('haptic_enabled') !== 'false');

  const toggleHaptics = () => {
    const newValue = !haptics;
    setHaptics(newValue);
    localStorage.setItem('haptic_enabled', newValue.toString());
    if (newValue) {
      if (navigator.vibrate) {
        navigator.vibrate(30);
      }
    }
  };

  return (
    <div className="flex-1 bg-slate-50 flex flex-col h-full overflow-hidden select-none">
      {/* Header */}
      <header className="bg-white px-4 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
        <h1 className="text-xl font-bold tracking-tight text-slate-800">Ajustes</h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {/* Section Title */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            General
          </h3>
          
          {/* Card */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-4">
            {/* Setting Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-[#0f62fe] rounded-xl flex items-center justify-center shrink-0">
                  <Smartphone size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">Vibración táctil</h4>
                  <p className="text-xs text-slate-400">Retroalimentación física (Haptic Feedback) al realizar acciones.</p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={toggleHaptics}
                type="button"
                className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none shrink-0 ${
                  haptics ? 'bg-[#0f62fe]' : 'bg-slate-200'
                }`}
              >
                <motion.div
                  className="w-5 h-5 bg-white rounded-full shadow absolute top-0.5 left-0.5"
                  animate={{ x: haptics ? 20 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Info / Version */}
        <div className="mt-8 flex flex-col items-center justify-center text-center">
          <p className="text-sm font-semibold text-gray-400 mb-1">
            ShopSync v1.2.0
          </p>
          <p className="text-[11px] text-gray-400/80 px-8">
            Desarrollado por Wladimir Acevedo para módulo Diseño UX/UI + IA - 2026
          </p>
        </div>
      </div>
    </div>
  );
}
