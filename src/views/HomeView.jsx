import { useState, useEffect, useRef } from 'react';
import { Plus, GripVertical, Trash2, AlertTriangle, Calendar, Bell, X, Sparkles, Wand2, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence, useAnimation, Reorder, useDragControls } from 'framer-motion';
import { getListStatus } from '../utils/productDictionary';
import { checkReminders } from '../utils/reminders';



// ─── Filtros disponibles ───────────────────────────────────────────────────────
const FILTERS = ['Pendientes', 'En progreso', 'Completadas', 'Todas'];



// ─── Componente de tarjeta con Swipe-to-Delete ────────────────────────────────
function ListCard({ list, onListClick, onSwipeDelete, onDragHandleDown }) {
  const controls = useAnimation(); // Control manual de la animación
  const isDragging = useRef(false);

  // Formatear fecha para mostrarse de forma amigable (ej. "25 Oct")
  const formatListDate = (dateString) => {
    if (!dateString) return null;
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Mes en JS es 0-11
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(date);
    }
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(date);
  };

  // Forzar que vuelva a 0 si cambian las dependencias o se cancela
  useEffect(() => {
    controls.start({ x: 0 });
  }, [list.id, controls]);

  const handleDragEnd = async (event, info) => {
    // Retrasamos el reset para que el onClick no se dispare justo al soltar
    setTimeout(() => { isDragging.current = false; }, 150);

    if (info.offset.x < -60) {
      onSwipeDelete(list.id); 
    }
    // IMPORTANTE: Inmediatamente después del drag, fuerza la tarjeta de vuelta a su lugar suavemente
    controls.start({ x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } });
  };

  const totalItems = list.items?.length || 0;
  const completedItems = list.items?.filter(item => item.completed)?.length || 0;
  const progressPercentage = totalItems === 0 ? 0 : (completedItems / totalItems) * 100;

  // Calculamos el estado de forma síncrona aquí mismo, usando siempre la data más fresca
  const status = getListStatus(list);

  // Asignación estricta de colores
  const progressBarColor = status === 'completada' ? 'bg-green-500' 
                         : status === 'en progreso' ? 'bg-yellow-500' 
                         : 'bg-gray-300';

  const badgeStyles = status === 'completada' ? 'bg-green-100 text-green-800' 
                    : status === 'en progreso' ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-gray-100 text-gray-500';

  return (
    <div className="relative rounded-2xl">
      {/* Fondo rojo absoluto, ligeramente retraído (top/bottom de 1px) para evitar sangrado en las esquinas */}
      <div className="absolute top-[1px] bottom-[1px] right-[1px] w-[80%] bg-red-500 rounded-2xl flex items-center justify-end pr-5 text-white -z-0">
        <Trash2 size={24} />
      </div>

      {/* Tarjeta Deslizable */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -80, right: 0 }}
        dragElastic={0.1}
        onDragStart={() => { isDragging.current = true; }}
        onDragEnd={handleDragEnd}
        animate={controls}
        initial={{ x: 0 }}
        style={{ touchAction: "pan-y" }}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        onClick={(e) => {
          if (isDragging.current) {
            e.preventDefault();
            return;
          }
          if (onListClick) onListClick(list.id);
        }}
        className="relative z-10 w-full bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-3 cursor-pointer hover:border-gray-200 transition-colors select-none"
      >
        {/* Emoji */}
        <div className="w-12 h-12 shrink-0 bg-slate-50 rounded-xl flex items-center justify-center text-3xl select-none">
          {list.emoji}
        </div>

        {/* Detalles */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Título */}
          <h3 className="font-semibold text-slate-800 text-sm truncate leading-tight pb-1 pr-2 mb-1">
            {list.name}
          </h3>

          <div className="space-y-2 mt-3">
            {/* Barra de Progreso Dinámica */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className={`h-full rounded-full ${progressBarColor}`}
              />
            </div>

            {/* Fila Inferior (Productos y Fecha) */}
            <div className="flex items-center justify-between">
              {/* Izquierda: Productos y Progreso */}
              <span className="text-[11px] font-medium text-gray-400">
                {completedItems} de {totalItems} productos ({Math.round(progressPercentage)}%)
              </span>

              {/* Derecha: Fecha (si existe) */}
              {list.plannedDate && (
                <div className="flex items-center gap-1.5 leading-none">
                  <Calendar size={13} className="text-blue-400" />
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    {formatListDate(list.plannedDate)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ícono de reordenar */}
        <div 
          onPointerDown={(e) => {
            e.preventDefault(); 
            if (onDragHandleDown) onDragHandleDown(e);
          }}
          className="p-2 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 touch-none shrink-0"
        >
          <GripVertical size={16} />
        </div>
      </motion.div>
    </div>
  );
}

// ─── Componente Envoltorio para manejar el Arrastre (Drag) ─────────────────────
function DraggableListCard({ list, activeFilter, onListClick, onSwipeDelete }) {
  const dragControls = useDragControls();
  const [isDragging, setIsDragging] = useState(false);

  return (
    <Reorder.Item 
      value={list} 
      id={list.id}
      dragListener={false} // Desactiva el arrastre en toda la tarjeta
      dragControls={dragControls} // Asigna los controles manuales
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      className="relative mb-3 rounded-2xl bg-transparent"
      layout
      initial={{ opacity: 0, x: 8 }}
      animate={{
        opacity: 1,
        x: 0,
        scale: isDragging ? 1.02 : 1,
        boxShadow: isDragging ? "0px 10px 20px rgba(15, 98, 254, 0.15)" : "0px 1px 2px rgba(0, 0, 0, 0.05)",
        zIndex: isDragging ? 50 : 1
      }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ 
        duration: 0.2,
        ease: "easeOut"
      }}
    >
      <ListCard
        list={list}
        onListClick={onListClick}
        onSwipeDelete={onSwipeDelete}
        onDragHandleDown={(e) => dragControls.start(e)}
      />
    </Reorder.Item>
  );
}

// ─── Modal de confirmación de eliminación ─────────────────────────────────────
function DeleteConfirmModal({ listName, onConfirm, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onCancel} // toque fuera del modal = cancelar
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.97 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()} // evitar cierre al tocar dentro
        className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
      >
        {/* Icono de advertencia */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
            <AlertTriangle size={28} className="text-red-500" />
          </div>
        </div>

        <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
          ¿Eliminar lista?
        </h3>
        <p className="text-gray-500 text-sm text-center mb-6 leading-relaxed">
          Esta acción no se puede deshacer y perderás todos los productos guardados
          {listName ? ` en "${listName}"` : ''}.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="bg-gray-100 text-gray-700 flex-1 rounded-xl py-3 font-medium text-sm transition-colors hover:bg-gray-200 active:scale-[0.98]"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600 active:bg-red-700 text-white flex-1 rounded-xl py-3 font-medium text-sm transition-colors active:scale-[0.98]"
          >
            Eliminar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Vista principal ───────────────────────────────────────────────────────────
export function HomeView({ lists, loading, removeList, onSelectList, onCreateListClick, onReorder, activeFilter, setActiveFilter, showToast, updateList }) {
  const [listToDelete, setListToDelete] = useState(null); // id de la lista pendiente de confirmar
  const [showRemindersModal, setShowRemindersModal] = useState(false);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const filterRefs = useRef({});

  const reminders = checkReminders(lists);

  useEffect(() => {
    if (filterRefs.current[activeFilter]) {
      filterRefs.current[activeFilter].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [activeFilter]);

  // Sincronizar la lógica de filtrado con los nuevos textos plurales
  const filteredLists = lists.filter(list => {
    if (activeFilter === 'Todas') return true;
    
    const status = getListStatus(list);
    
    if (activeFilter === 'Pendientes' && status === 'pendiente') return true;
    if (activeFilter === 'En progreso' && status === 'en progreso') return true;
    if (activeFilter === 'Completadas' && status === 'completada') return true;
    
    return false;
  });

  // Nombre de la lista a eliminar (para mostrarlo en el modal)
  const listToDeleteName = lists.find((l) => l.id === listToDelete)?.name ?? '';

  // Confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!listToDelete) return;
    try {
      await removeList(listToDelete);
      if (showToast) showToast('Lista eliminada');
    } catch {
      // El error lo maneja removeList; mantenemos la UX limpia
    } finally {
      setListToDelete(null);
    }
  };

  // Manejo de reordenamiento de listas, soportando filtros activos
  const handleReorder = (newFiltered) => {
    if (activeFilter === 'Todas') {
      onReorder(newFiltered);
    } else {
      const newLists = [...lists];
      
      // Encontramos los índices de los elementos que coinciden con el filtro
      const indices = [];
      lists.forEach((item, index) => {
        const status = getListStatus(item);
        if (
          (activeFilter === 'Pendientes' && status === 'pendiente') ||
          (activeFilter === 'En progreso' && status === 'en progreso') ||
          (activeFilter === 'Completadas' && status === 'completada')
        ) {
          indices.push(index);
        }
      });
      
      // Reemplazamos en esos índices con el nuevo orden de los elementos filtrados
      newFiltered.forEach((item, i) => {
        newLists[indices[i]] = item;
      });
      
      onReorder(newLists);
    }
  };



  return (
    <div className="flex flex-col h-full relative">

      {/* ── Modal de Recordatorios ── */}
      <AnimatePresence>
        {showRemindersModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRemindersModal(false)}
              className="absolute inset-0 bg-black/45 backdrop-blur-[1px] z-40 cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute top-1/2 left-5 right-5 -translate-y-1/2 bg-white rounded-3xl p-6 shadow-2xl z-50 flex flex-col space-y-4 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex flex-col items-center mb-2 text-center">
                <div className="w-12 h-12 bg-blue-50 text-[#0f62fe] rounded-full flex items-center justify-center mb-4">
                  <Bell size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Tus Recordatorios</h3>
                {reminders.count === 0 ? (
                  <p className="text-gray-500 text-sm">No tienes recordatorios pendientes.</p>
                ) : (
                  <p className="text-gray-500 text-sm">Tienes {reminders.count} listas programadas para estos días.</p>
                )}
              </div>

              {reminders.overdue.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">Atrasadas</h4>
                  {reminders.overdue.map(l => (
                    <div key={l.id} className="flex items-center justify-between w-full p-3 bg-red-50 rounded-xl mb-2">
                      <button 
                        onClick={() => { setShowRemindersModal(false); onSelectList(l.id); }}
                        className="flex items-center gap-3 flex-1 text-left animate-none"
                      >
                        <span className="text-2xl shrink-0">{l.emoji}</span>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 leading-snug">{l.name}</p>
                          <p className="text-xs text-red-500 font-medium leading-none mt-0.5">Atrasada</p>
                        </div>
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (typeof updateList === 'function') {
                            updateList(l.id, { reminder: false });
                          }
                        }}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors ml-2 shrink-0"
                        aria-label="Marcar como visto"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {reminders.today.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[#0f62fe] uppercase tracking-wider mb-2">Para Hoy</h4>
                  {reminders.today.map(l => (
                    <div key={l.id} className="flex items-center justify-between w-full p-3 bg-blue-50 rounded-xl mb-2">
                      <button 
                        onClick={() => { setShowRemindersModal(false); onSelectList(l.id); }}
                        className="flex items-center gap-3 flex-1 text-left animate-none"
                      >
                        <span className="text-2xl shrink-0">{l.emoji}</span>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 leading-snug">{l.name}</p>
                          <p className="text-xs text-blue-600 font-medium leading-none mt-0.5">¡Hoy es el día!</p>
                        </div>
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (typeof updateList === 'function') {
                            updateList(l.id, { reminder: false });
                          }
                        }}
                        className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors ml-2 shrink-0"
                        aria-label="Marcar como visto"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {reminders.tomorrow.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-2">Mañana</h4>
                  {reminders.tomorrow.map(l => (
                    <div key={l.id} className="flex items-center justify-between w-full p-3 bg-orange-50 rounded-xl mb-2">
                      <button 
                        onClick={() => { setShowRemindersModal(false); onSelectList(l.id); }}
                        className="flex items-center gap-3 flex-1 text-left animate-none"
                      >
                        <span className="text-2xl shrink-0">{l.emoji}</span>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 leading-snug">{l.name}</p>
                          <p className="text-xs text-orange-600 font-medium leading-none mt-0.5">Mañana</p>
                        </div>
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (typeof updateList === 'function') {
                            updateList(l.id, { reminder: false });
                          }
                        }}
                        className="p-2 text-orange-400 hover:text-orange-600 hover:bg-orange-100 rounded-lg transition-colors ml-2 shrink-0"
                        aria-label="Marcar como visto"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2">
                <button 
                  onClick={() => setShowRemindersModal(false)}
                  className="w-full h-11 bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold text-sm rounded-xl transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Scrollbar vertical minimalista */}
      <style>{`
        .lists-scroll::-webkit-scrollbar { width: 4px; }
        .lists-scroll::-webkit-scrollbar-track { background: transparent; }
        .lists-scroll::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 999px; }
      `}</style>

      {/* ── HEADER ── */}
      <div className="shrink-0 px-4 pt-4 relative flex items-center justify-between pb-3 border-b border-gray-200 mb-3">
        <h1 className="text-xl font-bold tracking-tight text-[#0f62fe]">ShopSync</h1>

        <span className="absolute left-1/2 -translate-x-1/2 text-lg font-semibold text-gray-800 pointer-events-none">
          Mis listas
        </span>

        <button 
          type="button" 
          onClick={() => setShowRemindersModal(true)}
          className="relative p-2 text-gray-400 hover:text-[#0f62fe] transition-colors"
        >
          <Bell size={20} />
          {reminders.count > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </button>
      </div>

      {/* ── CHIPS DE FILTRO ── */}
      <div className="shrink-0 flex mx-4 overflow-x-auto gap-2 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {FILTERS.map((filter) => {
          const getCountForTab = (tabName) => {
            if (tabName === 'Todas') return lists.length;
            return lists.filter(list => {
              const status = getListStatus(list);
              return (tabName === 'Pendientes' && status === 'pendiente') ||
                     (tabName === 'En progreso' && status === 'en progreso') ||
                     (tabName === 'Completadas' && status === 'completada');
            }).length;
          };

          let chipClass = '';
          let countBadgeClass = '';
          
          if (activeFilter === filter) {
            if (filter === 'Pendientes') {
              chipClass = 'bg-slate-200 text-slate-700';
              countBadgeClass = 'bg-slate-300 text-slate-700';
            } else if (filter === 'En progreso') {
              chipClass = 'bg-yellow-100 text-yellow-800';
              countBadgeClass = 'bg-yellow-200 text-yellow-800';
            } else if (filter === 'Completadas') {
              chipClass = 'bg-green-100 text-green-800';
              countBadgeClass = 'bg-green-200 text-green-800';
            } else { // 'Todas'
              chipClass = 'bg-blue-100 text-[#0f62fe]';
              countBadgeClass = 'bg-[#0f62fe]/10 text-[#0f62fe]';
            }
          } else {
            chipClass = 'bg-gray-100 text-gray-600';
            countBadgeClass = 'bg-gray-200 text-gray-500';
          }

          return (
            <button
              ref={(el) => { filterRefs.current[filter] = el; }}
              key={filter}
              onClick={() => {
                setActiveFilter(filter);
              }}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center justify-center ${chipClass}`}
            >
              <span>{filter}</span>
              <span className={`ml-2 w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold transition-colors ${countBadgeClass}`}>
                {getCountForTab(filter)}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── LISTADO CON SCROLL Y SWIPE HORIZONTAL DE PESTAÑAS ── */}
      <div 
        className="flex-1 min-h-0 flex flex-col"
        onTouchStart={(e) => {
          touchEndX.current = null;
          touchStartX.current = e.targetTouches[0].clientX;
        }}
        onTouchMove={(e) => {
          touchEndX.current = e.targetTouches[0].clientX;
        }}
        onTouchEnd={() => {
          if (!touchStartX.current || !touchEndX.current) return;
          
          const distance = touchStartX.current - touchEndX.current;
          const isLeftSwipe = distance > 50; // Deslizar hacia la izquierda (Siguiente tab)
          const isRightSwipe = distance < -50; // Deslizar hacia la derecha (Tab anterior)

          if (isLeftSwipe || isRightSwipe) {
            const currentIndex = FILTERS.indexOf(activeFilter);
            let newIndex = currentIndex;

            if (isLeftSwipe && currentIndex < FILTERS.length - 1) {
              newIndex = currentIndex + 1;
            } else if (isRightSwipe && currentIndex > 0) {
              newIndex = currentIndex - 1;
            }

            if (newIndex !== currentIndex) {
              setActiveFilter(FILTERS[newIndex]);
            }
          }
        }}
      >
        {loading ? (
          <div className="flex-1 overflow-y-auto lists-scroll px-4 pb-[140px]">
            <div className="space-y-3 py-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-20 bg-slate-50 border border-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          </div>
        ) : filteredLists.length === 0 ? (
          <div className="flex-1 overflow-y-auto lists-scroll px-4 pb-[140px] flex flex-col justify-center">
            <div className="text-center flex flex-col items-center justify-center space-y-3">
              <img 
                src="/empty_state.png" 
                alt="Sin listas" 
                className="w-28 h-28 object-contain mb-1 select-none opacity-80" 
              />
              <p className="text-base font-semibold text-[#b0b7c5] whitespace-nowrap">
                {activeFilter === 'Todas'
                  ? 'Sin listas'
                  : `Sin listas ${activeFilter.toLowerCase()}`}
              </p>
            </div>
          </div>
        ) : (
          <Reorder.Group
            axis="y"
            values={filteredLists}
            onReorder={handleReorder}
            className="flex-1 overflow-y-auto lists-scroll px-4 pb-[140px]"
          >
            <AnimatePresence mode="popLayout">
              {filteredLists.map((list) => {
                return (
                  <DraggableListCard
                    key={`${activeFilter}-${list.id}`}
                    list={list}
                    activeFilter={activeFilter}
                    onListClick={onSelectList}
                    onSwipeDelete={setListToDelete}
                  />
                );
              })}
            </AnimatePresence>
          </Reorder.Group>
        )}
      </div>

      {/* ── CTA CON MÁSCARA DE DEGRADADO ── */}
      <div className="absolute bottom-[70px] left-0 right-0 px-4 pb-4 pt-10 bg-gradient-to-t from-white via-white/90 to-transparent z-10">
        <button
          onClick={onCreateListClick}
          className="w-full h-12 bg-[#0f62fe] hover:bg-[#0b51d4] active:bg-[#0943b1] text-white font-semibold text-sm rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/20 active:scale-[0.99] transition-all"
        >
          <Plus size={16} />
          <span>Crear nueva lista</span>
        </button>
      </div>

      {/* ── MODAL DE CONFIRMACIÓN ── */}
      <AnimatePresence>
        {listToDelete && (
          <DeleteConfirmModal
            listName={listToDeleteName}
            onConfirm={handleConfirmDelete}
            onCancel={() => setListToDelete(null)}
          />
        )}
      </AnimatePresence>



    </div>
  );
}
