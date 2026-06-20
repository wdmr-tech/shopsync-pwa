import React, { useState, useRef } from 'react';
import { ChevronLeft, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCategoryForProduct } from '../utils/productDictionary';

export function ExploreDetailView({ template, onBack, onUseTemplate }) {
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const [isExiting, setIsExiting] = useState(false);

  const handleBack = () => {
    setIsExiting(true);
    setTimeout(() => {
      onBack();
    }, 250);
  };

  // 1. Agrupar items de la lista por categoría
  const groupedItems = (template.items || []).reduce((acc, item) => {
    const category = getCategoryForProduct(item.name);
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  // 2. Ordenar categorías (para que 'Otros' siempre quede al final)
  const categories = Object.keys(groupedItems).sort((a, b) => {
    if (a === 'Otros') return 1;
    if (b === 'Otros') return -1;
    return a.localeCompare(b);
  });

  return (
    <div 
      className={`h-full w-full bg-white flex flex-col relative overflow-hidden transition-opacity duration-300 ${
        isExiting ? 'opacity-0' : 'opacity-100'
      }`}
      onTouchStart={(e) => {
        touchEndX.current = null;
        touchStartX.current = e.targetTouches[0].clientX;
      }}
      onTouchMove={(e) => {
        touchEndX.current = e.targetTouches[0].clientX;
      }}
      onTouchEnd={() => {
        if (!touchStartX.current || !touchEndX.current) return;
        
        const distance = touchEndX.current - touchStartX.current;
        const isRightSwipe = distance > 100; // Umbral de 100px para volver atrás

        if (isRightSwipe) {
          handleBack();
        }
      }}
    >
      {/* Scrollbar vertical minimalista para el detalle */}
      <style>{`
        .detail-scroll::-webkit-scrollbar { width: 4px; }
        .detail-scroll::-webkit-scrollbar-track { background: transparent; }
        .detail-scroll::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 999px; }
      `}</style>

      {/* ── HEADER ── */}
      <div className="shrink-0 px-4 pt-4 pb-3 border-b border-gray-200 mb-3 flex items-center gap-3">
        {/* Botón Volver */}
        <button
          onClick={handleBack}
          className="p-1.5 hover:bg-slate-100 active:bg-slate-200 rounded-xl transition-colors text-gray-500"
        >
          <ChevronLeft size={22} />
        </button>

        {/* Emoji */}
        <span className="text-2xl select-none leading-none">
          {template.emoji}
        </span>

        {/* Nombre de la Lista */}
        <h2 className="text-lg font-bold text-slate-800 truncate select-none leading-none mt-0.5">
          {template.name}
        </h2>
      </div>

      {/* ── LISTADO PRODUCTOS (SOLO LECTURA) ── */}
      <div className="flex-1 overflow-y-auto detail-scroll px-5 pt-2 pb-32 space-y-6">
        {/* Descripción de la plantilla */}
        <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-50/50">
          <p className="text-xs text-blue-800/80 font-bold uppercase tracking-wider mb-1">
            Descripción de la Lista
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            {template.description}
          </p>
          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-blue-100/50">
            <span className="text-[11px] font-bold text-slate-400">
              Creado por:
            </span>
            <span className="text-[11px] font-extrabold text-[#0f62fe]">
              {template.author}
            </span>
          </div>
        </div>

        {/* Productos agrupados */}
        {categories.length === 0 ? (
          <div className="py-10 text-center text-sm font-semibold text-slate-500">
            Esta lista no contiene productos.
          </div>
        ) : (
          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category} className="mb-6 last:mb-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">
                  {category}
                </h3>
                <div className="flex flex-col gap-2.5">
                  {groupedItems[category].map((item) => (
                    <div key={item.id} className="relative">
                      <div className="w-full border border-gray-100 rounded-xl p-4 shadow-sm flex items-center justify-between bg-slate-50/50 border-dashed">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-700 text-sm">
                            {item.name}
                          </span>
                          {item.quantity && (
                            <span className="text-xs text-gray-500 font-medium mt-0.5">
                              {item.quantity} {item.unit ? item.unit : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── PIE DE PÁGINA (CTA FIJO EN MÓVIL VIEWPORT) ── */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t pb-safe z-10">
        <button
          onClick={() => onUseTemplate(template)}
          className="w-full h-12 bg-[#0f62fe] hover:bg-[#0b51d4] active:bg-[#0943b1] text-white font-semibold text-sm rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/20 active:scale-[0.99] transition-all"
        >
          <Copy size={16} />
          <span>Copiar lista</span>
        </button>
      </div>
    </div>
  );
}
