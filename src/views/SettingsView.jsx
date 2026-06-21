import React from 'react';

export function SettingsView() {
  return (
    <div className="flex-1 bg-slate-50 flex flex-col h-full overflow-hidden select-none">
      {/* Header */}
      <header className="bg-white px-4 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
        <h1 className="text-xl font-bold tracking-tight text-slate-800">Ajustes</h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col">
        {/* Empty area to keep spacing consistent */}
        <div className="flex-1" />

        {/* Info / Version / Credits */}
        <div className="mt-auto pt-8 pb-28 flex flex-col items-center justify-center text-center">
          <p className="text-sm font-bold text-gray-500 mb-2">ShopSync v1.2.0</p>
          <p className="text-xs text-gray-400">Desarrollado usando IA por Wladimir Acevedo</p>
          <p className="text-[11px] text-gray-400/80 mt-1">Módulo Diseño UX/UI + IA - 2026</p>
        </div>
      </div>
    </div>
  );
}
