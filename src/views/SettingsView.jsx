import React, { useState } from 'react';
import { LogOut, X, ShoppingCart, ChevronRight, Key, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function SettingsView({ onLogout, currentUser }) {
  const [showAbout, setShowAbout] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    return localStorage.getItem('VITE_GEMINI_API_KEY') || '';
  });
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSaveApiKey = (val) => {
    setGeminiApiKey(val);
    if (val.trim() === '') {
      localStorage.removeItem('VITE_GEMINI_API_KEY');
    } else {
      localStorage.setItem('VITE_GEMINI_API_KEY', val.trim());
    }
  };

  return (
    <div className="flex-1 bg-slate-50 flex flex-col h-full overflow-hidden select-none">
      {/* Header */}
      <header className="bg-white px-4 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
        <h1 className="text-xl font-bold tracking-tight text-slate-800">Ajustes</h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col">
        {/* Usuario Actual */}
        <div className="bg-white rounded-2xl p-4 mb-6 flex items-center gap-4 border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-blue-100 text-[#0f62fe] rounded-full flex items-center justify-center font-bold text-lg select-none">
            {currentUser?.name?.charAt(0) || 'I'}
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Sesión iniciada como</p>
            <p className="text-lg font-bold text-gray-900">{currentUser?.name || 'Invitado'}</p>
          </div>
        </div>

        {/* Configuración de IA (Gemini) */}
        <div className="bg-white rounded-2xl p-5 mb-6 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
            <Key size={16} className="text-purple-500" />
            Clave API de Gemini
          </h3>
          <p className="text-xs text-gray-500 mb-4 leading-relaxed">
            Se requiere una clave API para el Generador Inteligente. Puedes crear una gratis en <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-purple-600 underline font-semibold hover:text-purple-700">Google AI Studio</a>.
          </p>
          <div className="relative flex items-center">
            <input
              type={showApiKey ? "text" : "password"}
              placeholder="Ingresa tu clave de Gemini..."
              value={geminiApiKey}
              onChange={(e) => handleSaveApiKey(e.target.value)}
              className="w-full text-sm bg-slate-50 border border-gray-200 rounded-xl pl-4 pr-11 py-2.5 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 font-mono transition-all text-slate-800"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
              title={showApiKey ? "Ocultar clave" : "Mostrar clave"}
            >
              {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {geminiApiKey ? (
            <p className="text-[11px] text-green-600 font-semibold mt-2.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              Clave guardada y activa localmente
            </p>
          ) : (
            <p className="text-[11px] text-amber-600 font-semibold mt-2.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span>
              Sin configurar (usa el fallback del archivo .env)
            </p>
          )}
        </div>

        {/* Opciones de Ajustes */}
        <div className="space-y-4 mb-6">
          <button
            onClick={() => setShowAbout(true)}
            className="w-full bg-white hover:bg-gray-50 text-slate-800 font-semibold py-4 rounded-2xl transition-all flex items-center justify-between px-6 border border-gray-100 shadow-sm active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <ShoppingCart size={18} className="text-[#0f62fe]" />
              <span className="text-sm font-semibold">Acerca de ShopSync</span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Botón de Cerrar Sesión reubicado en el fondo */}
        <div className="mt-auto mb-20">
          <button
            onClick={onLogout}
            className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-3.5 rounded-2xl transition-all flex items-center justify-between px-6 border border-red-100 active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <LogOut size={18} className="text-red-500" />
              <span className="text-sm">Cerrar sesión</span>
            </div>
          </button>
        </div>
      </div>

      {/* Modal Acerca de */}
      <AnimatePresence>
        {showAbout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm flex flex-col items-center text-center relative shadow-xl border border-gray-50"
            >
              <button 
                onClick={() => setShowAbout(false)} 
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Cerrar modal"
              >
                <X size={20} />
              </button>
              
              <div className="w-16 h-16 bg-[#0f62fe] rounded-2xl flex items-center justify-center mb-4 mt-2 shadow-lg shadow-blue-500/20">
                <ShoppingCart size={32} color="white" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-1">ShopSync</h2>
              <p className="text-sm font-semibold text-[#0f62fe] mb-6">v1.2.0</p>
              
              <div className="bg-gray-50 w-full p-4 rounded-2xl">
                <p className="text-sm text-gray-600 font-medium">Desarrollado por Wladimir Acevedo</p>
                <p className="text-[11px] text-gray-400 mt-1">Módulo Diseño UX/UI + IA - 2026</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
