import { useState } from 'react';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { COMMUNITY_CATEGORIES, COMMUNITY_LISTS } from '../utils/communityLists';

export function ExploreView({ onSelectTemplate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todas');

  // Filtrado de listas basado en categoría y query de búsqueda
  const filteredLists = COMMUNITY_LISTS.filter((list) => {
    const matchesCategory = activeFilter === 'Todas' || list.category === activeFilter;
    const matchesQuery =
      list.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      list.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      list.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const getCountForExploreTab = (categoryName) => {
    if (categoryName === 'Todas') return COMMUNITY_LISTS.length;
    return COMMUNITY_LISTS.filter(list => list.category === categoryName).length;
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Scrollbar vertical minimalista para el listado */}
      <style>{`
        .explore-scroll::-webkit-scrollbar { width: 4px; }
        .explore-scroll::-webkit-scrollbar-track { background: transparent; }
        .explore-scroll::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 999px; }
      `}</style>

      {/* ── HEADER ── */}
      <div className="shrink-0 px-4 pt-4 flex items-center justify-between pb-3 border-b border-gray-200 mb-3">
        <span className="font-bold text-xl text-[#0f62fe]">ShopSync</span>
        <span className="text-lg font-bold text-gray-800">
          Explorar
        </span>
      </div>

      {/* ── BUSCADOR ── */}
      <div className="shrink-0 px-4 mb-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar listas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#0f62fe] focus:bg-white placeholder-slate-400 transition-all font-semibold"
          />
        </div>
      </div>

      {/* ── CHIPS DE CATEGORÍAS ── */}
      <div className="shrink-0 flex mx-4 overflow-x-auto gap-2 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {COMMUNITY_CATEGORIES.map((category) => {
          const isActive = activeFilter === category;
          return (
            <button
              key={category}
              onClick={() => setActiveFilter(category)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center justify-center gap-2 ${
                isActive
                  ? 'bg-blue-100 text-[#0f62fe]'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <span>{category}</span>
              <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                isActive ? 'bg-[#0f62fe]/10 text-[#0f62fe]' : 'bg-gray-200 text-gray-500'
              }`}>
                {getCountForExploreTab(category)}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── LISTADO CON SCROLL ── */}
      <div className="flex-1 min-h-0 overflow-y-auto explore-scroll px-4 pb-[100px]">
        <AnimatePresence mode="popLayout">
          {filteredLists.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="py-20 text-center flex flex-col items-center justify-center space-y-3"
            >
              <span className="text-5xl select-none">🔍</span>
              <p className="text-sm font-semibold text-slate-500">
                Sin listas encontradas
              </p>
              <p className="text-xs text-slate-400">
                Prueba buscando otra lista o categoría.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3 py-1">
              {filteredLists.map((list) => (
                <motion.div
                  key={list.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  onClick={() => onSelectTemplate(list)}
                  className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-start gap-3 hover:border-gray-200 transition-colors select-none cursor-pointer active:scale-[0.99]"
                >
                  {/* Emoji */}
                  <div className="w-12 h-12 shrink-0 bg-slate-50 rounded-xl flex items-center justify-center select-none">
                    <span className="text-3xl leading-none flex items-center">{list.emoji}</span>
                  </div>

                  {/* Detalles */}
                  <div className="flex-1 min-w-0 space-y-1">
                    {/* Fila superior: Categoría y Autor */}
                    <div className="flex justify-between items-center w-full mb-1">
                      <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-blue-50 text-[#0f62fe]">
                        {list.category}
                      </span>
                      <span className="text-[11px] font-bold text-gray-400">
                        {list.author}
                      </span>
                    </div>

                    {/* Título de la Plantilla */}
                    <h3 className="font-semibold text-slate-800 text-sm truncate leading-snug">
                      {list.name}
                    </h3>

                    {/* Descripción de la Plantilla */}
                    <p className="text-xs text-slate-500 leading-normal line-clamp-2">
                      {list.description}
                    </p>

                    {/* Fila inferior: Número de productos */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                      <span className="text-[11px] font-semibold text-gray-400">
                        {list.items.length} {list.items.length === 1 ? 'producto' : 'productos'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
