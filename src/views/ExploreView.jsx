import { useState, useEffect, useRef } from 'react';
import { Search, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { COMMUNITY_CATEGORIES, COMMUNITY_LISTS } from '../utils/communityLists';

const CATEGORY_COLORS = {
  'Recetas': 'bg-orange-100 text-orange-700',
  'Viajes': 'bg-teal-100 text-teal-700',
  'Hogar': 'bg-indigo-100 text-indigo-700',
  'Eventos': 'bg-rose-100 text-rose-700',
  'Todas': 'bg-gray-100 text-gray-700'
};

const ACTIVE_CATEGORY_STYLES = {
  'Todas': {
    chip: 'bg-blue-100 text-[#0f62fe]',
    count: 'bg-blue-200/60 text-[#0f62fe]'
  },
  'Recetas': {
    chip: 'bg-orange-100 text-orange-700',
    count: 'bg-orange-200/60 text-orange-800'
  },
  'Viajes': {
    chip: 'bg-teal-100 text-teal-700',
    count: 'bg-teal-200/60 text-teal-800'
  },
  'Hogar': {
    chip: 'bg-indigo-100 text-indigo-700',
    count: 'bg-indigo-200/60 text-indigo-800'
  },
  'Eventos': {
    chip: 'bg-rose-100 text-rose-700',
    count: 'bg-rose-200/60 text-rose-800'
  }
};

export function ExploreView({ onSelectTemplate, onCloneTemplate, communityLists = COMMUNITY_LISTS }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todas');
  const scrollRef = useRef(null);

  // Lógica de scroll horizontal mediante arrastre de mouse y rueda para desktop
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    // 1. Scroll con la rueda del mouse (transformar scroll vertical en horizontal)
    const handleWheel = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY * 0.8;
      }
    };

    // 2. Scroll con arrastre del mouse (Drag to scroll)
    let isDown = false;
    let startXVal = 0;
    let scrollLeftVal = 0;
    let hasDragged = false;

    const handleMouseDown = (e) => {
      if (e.button !== 0) return;
      isDown = true;
      el.classList.add('cursor-grabbing');
      el.classList.remove('cursor-grab');
      startXVal = e.pageX - el.offsetLeft;
      scrollLeftVal = el.scrollLeft;
      hasDragged = false;
    };

    const handleMouseLeave = () => {
      isDown = false;
      el.classList.remove('cursor-grabbing');
      el.classList.add('cursor-grab');
    };

    const handleMouseUp = (e) => {
      isDown = false;
      el.classList.remove('cursor-grabbing');
      el.classList.add('cursor-grab');
    };

    const handleMouseMove = (e) => {
      if (!isDown) return;
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startXVal) * 1.5;
      if (Math.abs(walk) > 5) {
        hasDragged = true;
      }
      el.scrollLeft = scrollLeftVal - walk;
    };

    const handleCaptureClick = (e) => {
      if (hasDragged) {
        e.preventDefault();
        e.stopPropagation();
        hasDragged = false;
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('mousedown', handleMouseDown);
    el.addEventListener('mouseleave', handleMouseLeave);
    el.addEventListener('mouseup', handleMouseUp);
    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('click', handleCaptureClick, true);

    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('mousedown', handleMouseDown);
      el.removeEventListener('mouseleave', handleMouseLeave);
      el.removeEventListener('mouseup', handleMouseUp);
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('click', handleCaptureClick, true);
    };
  }, []);

  // Filtrado de listas basado en categoría y query de búsqueda
  const filteredLists = communityLists.filter((list) => {
    const matchesCategory = activeFilter === 'Todas' || list.category === activeFilter;
    const matchesQuery =
      list.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      list.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      list.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const getCountForExploreTab = (categoryName) => {
    if (categoryName === 'Todas') return communityLists.length;
    return communityLists.filter(list => list.category === categoryName).length;
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full relative overflow-hidden">
      {/* Scrollbar vertical minimalista para el listado */}
      <style>{`
        .explore-scroll::-webkit-scrollbar { width: 4px; }
        .explore-scroll::-webkit-scrollbar-track { background: transparent; }
        .explore-scroll::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 999px; }
      `}</style>

      {/* ── HEADER ── */}
      <div className="shrink-0 px-4 pt-4 relative flex items-center justify-between pb-3 border-b border-gray-200 mb-3">
        <h1 className="text-xl font-bold tracking-tight text-[#0f62fe]">ShopSync</h1>

        <span className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-gray-800 pointer-events-none">
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
      <div 
        ref={scrollRef}
        className="shrink-0 flex mx-4 overflow-x-auto gap-2 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] cursor-grab select-none"
      >
        {COMMUNITY_CATEGORIES.map((category) => {
          const isActive = activeFilter === category;
          const styles = ACTIVE_CATEGORY_STYLES[category] || {
            chip: 'bg-blue-100 text-[#0f62fe]',
            count: 'bg-blue-200/60 text-[#0f62fe]'
          };
          
          return (
            <button
              key={category}
              onClick={() => setActiveFilter(category)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center justify-center gap-2 ${
                isActive
                  ? styles.chip
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <span>{category}</span>
              <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                isActive ? styles.count : 'bg-gray-200 text-gray-500'
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
                  className="relative bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-3 hover:border-gray-200 transition-colors select-none cursor-pointer active:scale-[0.99]"
                >
                  {/* Emoji */}
                  <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-gray-50 rounded-xl text-3xl leading-none select-none">
                    {list.emoji}
                  </div>

                  {/* Detalles */}
                  <div className="flex-1 min-w-0 space-y-1 pr-8">
                    {/* Fila superior: Categoría y Autor */}
                    <div className="flex justify-between items-center w-full mb-1">
                      <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${CATEGORY_COLORS[list.category] || 'bg-blue-100 text-blue-700'}`}>
                        {list.category}
                      </span>
                      <span className="text-[11px] font-bold text-gray-400">
                        {list.author}
                      </span>
                    </div>

                    {/* Título de la Plantilla */}
                    <h3 className="font-semibold text-slate-800 text-sm truncate leading-tight pb-1">
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

                  {/* Botón de copia rápida superpuesto */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // MUY IMPORTANTE: Evita abrir el detalle
                      onCloneTemplate(list); // Activa el Bottom Sheet en modo clonación
                    }}
                    className="absolute bottom-4 right-4 p-2 bg-blue-50 text-[#0f62fe] hover:bg-[#0f62fe] hover:text-white rounded-lg transition-colors flex items-center justify-center active:scale-95"
                    aria-label="Copiar lista"
                  >
                    <Copy size={16} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
