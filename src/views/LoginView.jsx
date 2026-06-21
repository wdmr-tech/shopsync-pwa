import React from 'react';
import { ArrowRight } from 'lucide-react';

export function LoginView({ onLogin }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 select-none">
      <div className="w-full max-w-sm flex flex-col justify-between h-[85vh]">
        {/* Logo and Welcome Area */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-24 h-24 bg-white border border-slate-100 rounded-3xl flex items-center justify-center shadow-sm mb-6 p-4">
            <img src="/shopsync-logo.svg" alt="ShopSync Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#0f62fe] tracking-tight">ShopSync</h1>
          <p className="text-slate-500 text-sm mt-3 text-center max-w-[280px] leading-relaxed">
            Sincroniza tus compras cotidianas en tiempo real. Selecciona tu perfil para ingresar.
          </p>
        </div>

        {/* Profiles Selector Card */}
        <div className="space-y-3.5 mb-10">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
            Selecciona tu perfil
          </h3>

          {/* Developer Profile Button */}
          <button 
            onClick={() => onLogin('developer', 'Developer')}
            className="w-full bg-white hover:bg-blue-50/50 border border-slate-100 text-slate-800 font-semibold py-4 rounded-2xl transition-all shadow-sm flex items-center justify-between px-6 active:scale-[0.99]"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0f62fe] flex items-center justify-center shrink-0 font-bold text-xs">
                DEV
              </div>
              <span className="text-sm text-slate-700 font-semibold">Entrar como Developer</span>
            </div>
            <ArrowRight size={18} className="text-slate-400" />
          </button>

          {/* Test Profile Button */}
          <button 
            onClick={() => onLogin('tester', 'Test')}
            className="w-full bg-white hover:bg-yellow-50/40 border border-slate-100 text-slate-800 font-semibold py-4 rounded-2xl transition-all shadow-sm flex items-center justify-between px-6 active:scale-[0.99]"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center shrink-0 font-bold text-xs">
                TST
              </div>
              <span className="text-sm text-slate-700 font-semibold">Entrar como Test</span>
            </div>
            <ArrowRight size={18} className="text-slate-400" />
          </button>

          {/* Reviewer Profile Button */}
          <button 
            onClick={() => onLogin('profejp', 'Reviewer')}
            className="w-full bg-white hover:bg-purple-50/40 border border-slate-100 text-slate-800 font-semibold py-4 rounded-2xl transition-all shadow-sm flex items-center justify-between px-6 active:scale-[0.99]"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 font-bold text-xs">
                REV
              </div>
              <span className="text-sm text-slate-700 font-semibold">Entrar como Reviewer</span>
            </div>
            <ArrowRight size={18} className="text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
