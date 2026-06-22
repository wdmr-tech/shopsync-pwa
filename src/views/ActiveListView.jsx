import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  Plus, 
  Trash2, 
  Check, 
  CheckCircle2,
  ShoppingBag,
  Calendar,
  Edit2,
  ArrowRight,
  Copy,
  Globe,
  Bell,
  MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { getCategoryForProduct, formatListDate, getListStatus, formatQuantityText } from '../utils/productDictionary';
import { CustomDatePickerModal } from '../components/CustomDatePickerModal';

const ItemCard = ({ item, toggleItem, setItemToDelete, setItemToEdit }) => {
  const controls = useAnimation();
  const isDragging = useRef(false);

  useEffect(() => { controls.start({ x: 0 }); }, [item.id, controls]);

  const handleDragEnd = (event, info) => {
    setTimeout(() => { isDragging.current = false; }, 150);
    // Solo permitimos swipe para borrar si NO está completado
    if (!item.completed && info.offset.x < -60) {
      setItemToDelete(item.id);
    }
    controls.start({ x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } });
  };

  return (
    <div className="relative mb-2">
      {/* Capa Base: Fondo Rojo para borrar (Ligeramente encogido para evitar sangrado en esquinas) */}
      {!item.completed && (
        <div className="absolute top-[1px] bottom-[1px] right-[1px] w-[80%] bg-red-500 rounded-xl flex items-center justify-end pr-4 text-white -z-0">
          <Trash2 size={20} />
        </div>
      )}

      {/* Tarjeta Deslizable Blanca */}
      <motion.div
        drag={item.completed ? false : "x"} // Desactiva drag si está completado
        dragConstraints={{ left: -80, right: 0 }}
        dragElastic={0.1}
        onDragStart={() => { isDragging.current = true; }}
        onDragEnd={handleDragEnd}
        animate={controls}
        initial={{ x: 0 }}
        style={{ touchAction: "pan-y" }}
        onClick={(e) => {
          if (isDragging.current) { e.preventDefault(); return; }
          toggleItem(item.id, item.completed);
        }}
        className={`relative z-10 w-full border border-gray-100 rounded-xl p-4 shadow-sm flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all duration-200 ${
          item.completed ? 'bg-gray-50 opacity-60' : 'bg-white'
        }`}
      >
        {/* Contenido Izquierdo */}
        <div className="flex items-center gap-3 overflow-hidden">
          <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
            item.completed ? 'bg-[#0f62fe] border-[#0f62fe]' : 'border-gray-300'
          }`}>
            {item.completed && <Check size={14} className="text-white" />}
          </div>
          <div className="flex flex-col">
            <span className={`font-medium ${item.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
              {item.name}
            </span>
            {item.quantity && (
              <span className={`text-xs ${item.completed ? 'line-through text-gray-400' : 'text-gray-500'}`}>
                {item.quantity}
              </span>
            )}
          </div>
        </div>

        {/* Botón de Editar (Solo si NO está completado) */}
        {!item.completed && (
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation(); 
              if (!isDragging.current) setItemToEdit(item); 
            }}
            className="p-2 text-gray-400 hover:text-[#0f62fe] transition-colors"
          >
            <Edit2 size={16} />
          </button>
        )}
      </motion.div>
    </div>
  );
};

export function ActiveListView({ list, onBack, onAddProductClick, itemsState, onCompleteList, updateList, setActiveTab, setItemToEdit, onEditList, showToast, onDuplicateList, onPublishList, communityLists = [], onUnpublishList }) {
  const {
    items,
    allItems,
    loading,
    hideCompleted,
    setHideCompleted,
    toggleItem,
    removeItem,
    clearCompleted,
    stats,
    updateItem,
  } = itemsState;

  const [itemToDelete, setItemToDelete] = useState(null);

  // Estados de finalización de lista
  const [isListCompleted, setIsListCompleted] = useState(() => {
    return list?.status === 'Completada' || list?.status === 'completada' || list?.isCompleted === true;
  });
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [modalType, setModalType] = useState('auto');

  // Estados para modal de edición de fecha
  const [showDateModal, setShowDateModal] = useState(false);
  const [tempDate, setTempDate] = useState('');
  const [enableReminder, setEnableReminder] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Estados para modal de publicación en la comunidad
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareDescription, setShareDescription] = useState('');
  const [shareCategory, setShareCategory] = useState('Recetas');

  // Estado para menú kebab
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const isPublished = communityLists.some(cl => cl.original_list_id === list?.id);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);


  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const [isExiting, setIsExiting] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(false);

  useEffect(() => {
    const hasSeenHint = localStorage.getItem('hasSeenSwipeHint');
    if (!hasSeenHint) {
      setShowSwipeHint(true);
      // Ocultar la pista automáticamente después de 4 segundos
      const timer = setTimeout(() => {
        setShowSwipeHint(false);
        localStorage.setItem('hasSeenSwipeHint', 'true');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Refs para evitar clausuras obsoletas en el callback del popstate
  const listRef = useRef(list);
  const itemsRef = useRef(items);

  useEffect(() => {
    listRef.current = list;
    itemsRef.current = items;
  }, [list, items]);

  // Interceptar el botón de atrás físico / Hardware Back Button
  useEffect(() => {
    // 1. Al montar el componente, añadimos un estado al historial del navegador
    window.history.pushState({ isInsideList: true }, '');

    // 2. Definimos qué hacer cuando el usuario presiona "Atrás" (botón físico o gesto de borde del SO)
    const handlePopState = (event) => {
      // Evita que el navegador cierre la PWA
      event.preventDefault(); 
      
      // Ejecutamos nuestra lógica de salir de la lista
      try {
        if (typeof setActiveTab === 'function') {
          const currentStatus = getListStatus({ ...listRef.current, items: itemsRef.current });
          const tabToSelect = currentStatus === 'en progreso' ? 'En progreso' 
                            : currentStatus === 'completada' ? 'Completadas' 
                            : 'Pendientes';
          setActiveTab(tabToSelect);
        }
        if (typeof onBack === 'function') onBack();
      } catch (err) {
        if (typeof onBack === 'function') onBack();
      }
    };

    // 3. Escuchamos el evento 'popstate' que lanza el botón Atrás
    window.addEventListener('popstate', handlePopState);

    // 4. Limpieza al desmontar el componente (SOLO remover el listener, sin window.history.back())
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const totalItems = items?.length || 0;
  const completedItems = items?.filter(item => item.completed)?.length || 0;
  const progressPercentage = totalItems === 0 ? 0 : (completedItems / totalItems) * 100;

  // Determinamos el estado real
  let currentStatus = 'pendiente';
  if (isListCompleted || (totalItems > 0 && completedItems === totalItems)) {
    currentStatus = 'completada';
  } else if (totalItems > 0 && completedItems > 0) {
    currentStatus = 'en progreso';
  }

  // Variables de color
  const progressBarColor = currentStatus === 'completada' ? 'bg-green-500' 
                         : currentStatus === 'en progreso' ? 'bg-yellow-500' 
                         : 'bg-gray-300';

  const badgeStyles = currentStatus === 'completada' ? 'bg-green-100 text-green-800' 
                    : currentStatus === 'en progreso' ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-gray-100 text-gray-600';

  // Sincronizar estado local si cambia la prop list
  useEffect(() => {
    if (list) {
      setIsListCompleted(list.status === 'Completada' || list.status === 'completada' || list.isCompleted === true);
    }
  }, [list]);

  // Disparador automático al completar el 100% de la lista
  useEffect(() => {
    if (totalItems > 0 && completedItems === totalItems && !isListCompleted) {
      setModalType('auto');
      setShowCompleteModal(true);
    }
  }, [items, isListCompleted, totalItems, completedItems]);

  const handleManualCompleteClick = () => {
    if (totalItems === 0) return;
    if (completedItems === totalItems) {
      setModalType('auto');
    } else {
      setModalType('manual');
    }
    setShowCompleteModal(true);
  };

  const handleConfirmCompletion = async () => {
    setIsListCompleted(true);
    setShowCompleteModal(false);
    if (onCompleteList) {
      await onCompleteList();
    }
  };

  // 1. Agrupar items
  const groupedItems = items.reduce((acc, item) => {
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
      className={`h-full w-full bg-white flex flex-col relative overflow-hidden transition-opacity duration-300 ${isExiting ? 'opacity-0' : 'opacity-100'}`}
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
          if (typeof triggerHaptic === 'function') triggerHaptic(30);
          window.history.back(); // Esto disparará el popstate y cerrará la vista
        }
      }}
    >
      <AnimatePresence>
        {showSwipeHint && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-1/3 left-4 z-50 bg-black/70 text-white px-4 py-2 rounded-full flex items-center gap-2 pointer-events-none"
          >
            <motion.div
              animate={{ x: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <ArrowRight size={16} />
            </motion.div>
            <span className="text-xs font-medium">Desliza para volver</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Cabecera Móvil (Estática) */}
      <header className="px-5 py-4 border-b border-slate-100 bg-white flex items-center justify-between shrink-0 relative">
        <div className="flex items-center justify-between w-full relative z-30">
          {/* Izquierda: Volver y Título */}
          <div className="flex items-center gap-3 overflow-hidden">
            <button onClick={() => window.history.back()} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full shrink-0">
              <ChevronLeft size={24} />
            </button>
            <button onClick={() => onEditList && onEditList(list)} className="flex items-center gap-2 max-w-[200px] group text-left">
              <span className="text-2xl leading-none flex items-center shrink-0">{list?.emoji}</span>
              <h2 className="text-xl font-bold text-gray-800 truncate leading-tight pb-1">{list?.name}</h2>
              <Edit2 size={14} className="text-gray-400 group-hover:text-[#0f62fe] shrink-0" />
            </button>
          </div>

          <div ref={menuRef} className="relative shrink-0">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
            >
              <MoreVertical size={20} />
            </button>

            <AnimatePresence>
              {showMenu && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: -10 }} 
                  animate={{ opacity: 1, scale: 1, y: 0 }} 
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 z-50 flex flex-col"
                >
                  <button 
                    onClick={() => { setShowMenu(false); if(typeof onDuplicateList === 'function') onDuplicateList({ ...listRef.current, items: itemsRef.current }); }}
                    className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 text-left"
                  >
                    <Copy size={16} className="text-gray-400" /> Duplicar Lista
                  </button>

                  {!isPublished ? (
                    <button 
                      onClick={() => { setShowMenu(false); setShowShareModal(true); }}
                      className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 text-left"
                    >
                      <Globe size={16} className="text-[#0f62fe]" /> Publicar
                    </button>
                  ) : (
                    <button 
                      onClick={() => { 
                        setShowMenu(false); 
                        if (typeof onUnpublishList === 'function') onUnpublishList(list.id); 
                      }}
                      className="px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 text-left"
                    >
                      <Trash2 size={16} className="text-red-500" /> Despublicar
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Barra de progreso y estado */}
      <div className="px-4 py-3 bg-white border-b border-gray-100 mb-4 shrink-0">
        <div className="flex items-center justify-between mb-2">
          {/* Izquierda: Porcentaje y texto */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-800">{Math.round(progressPercentage)}%</span>
            <span className="text-sm text-gray-500">{completedItems} de {totalItems} productos</span>
          </div>
          
          {/* Derecha: Badge de estado */}
          <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${badgeStyles}`}>
            {currentStatus === 'en progreso' ? 'En progreso' : currentStatus === 'completada' ? 'Completada' : 'Pendiente'}
          </span>
        </div>

        {/* Barra de Progreso Dinámica */}
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ease-out ${progressBarColor}`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Debajo de la barra de progreso */}
        <div className="flex items-center justify-between mt-3">
          {/* Izquierda: Botón Completar */}
          <div className="flex items-center gap-4">
            {!isListCompleted && (
              <button 
                onClick={() => { setModalType('manual'); setShowCompleteModal(true); }}
                className="text-[#0f62fe] font-semibold text-sm tracking-wide active:opacity-70 flex items-center gap-1.5 py-1"
              >
                <CheckCircle2 size={16} />
                Completar
              </button>
            )}
          </div>
          
          {/* Derecha: Fecha de Compra */}
          <div>
            {(list?.plannedDate || list?.date) && (
              <button 
                type="button"
                onClick={() => {
                  setTempDate(list?.plannedDate || list?.date || ''); // Carga la fecha actual en el estado temporal
                  setEnableReminder(list?.reminder || false);
                  setShowDateModal(true);
                }}
                className="flex items-center gap-1.5 leading-none bg-blue-50/50 px-3 py-2 rounded-md cursor-pointer hover:bg-blue-50 active:bg-blue-100 transition-colors"
              >
                <Calendar size={13} className="text-blue-400" />
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  {formatListDate(list?.plannedDate || list?.date)}
                </span>
                <Edit2 size={10} className="text-gray-400 ml-1" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Listado Scrolleable */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-5 pt-4 pb-32 space-y-2.5">
        {loading ? (
          <div className="space-y-2.5 py-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-14 bg-slate-50 border border-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
              <ShoppingBag size={20} />
            </div>
            {allItems.length === 0 ? (
              <>
                <p className="text-sm font-semibold text-slate-500">Esta lista está vacía</p>
                <p className="text-xs text-slate-400">Agrega productos con el botón de abajo.</p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-slate-500">Todo listo por aquí</p>
                <p className="text-xs text-slate-400">Tienes ítems completados ocultos.</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category} className="mb-6 last:mb-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">
                  {category}
                </h3>
                <div className="flex flex-col gap-2.5">
                  <AnimatePresence initial={false}>
                    {groupedItems[category].map((item) => (
                      <ItemCard 
                        key={item.id} 
                        item={item} 
                        toggleItem={toggleItem} 
                        setItemToDelete={setItemToDelete} 
                        setItemToEdit={setItemToEdit} 
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de confirmación para eliminar */}
      <AnimatePresence>
        {itemToDelete && (
          <>
            {/* Backdrop de fondo */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setItemToDelete(null)}
              className="absolute inset-0 bg-black/45 backdrop-blur-[1px] z-40 cursor-pointer"
            />

            {/* Contenedor del Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute top-1/2 left-5 right-5 -translate-y-1/2 bg-white rounded-3xl p-6 shadow-2xl z-50 flex flex-col space-y-4 border border-slate-100"
            >
              <div className="space-y-1.5 flex flex-col items-center">
                <h3 className="font-bold text-slate-800 text-lg text-center">¿Eliminar producto?</h3>
                <p className="text-sm text-slate-500 font-medium text-center">Esta acción no se puede deshacer.</p>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setItemToDelete(null)}
                  className="flex-1 h-11 bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold text-sm rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await removeItem(itemToDelete);
                      if (showToast) showToast('Producto eliminado');
                    } catch (err) {
                      // El error lo maneja el hook
                    } finally {
                      setItemToDelete(null);
                    }
                  }}
                  className="flex-1 h-11 bg-red-500 hover:bg-red-600 text-white font-semibold text-sm rounded-xl transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal de confirmación para finalizar lista */}
      <AnimatePresence>
        {showCompleteModal && (
          <>
            {/* Backdrop de fondo */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCompleteModal(false)}
              className="absolute inset-0 bg-black/45 backdrop-blur-[1px] z-40 cursor-pointer"
            />

            {/* Contenedor del Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute top-1/2 left-5 right-5 -translate-y-1/2 bg-white rounded-3xl p-6 shadow-2xl z-50 flex flex-col space-y-4 border border-slate-100"
            >
              <div className="space-y-1.5 flex flex-col items-center">
                <h3 className="text-xl font-bold text-slate-800 text-center mb-2">
                  {modalType === 'auto' ? '¡Lista completada!' : '¿Completar lista antes?'}
                </h3>
                {modalType === 'auto' ? (
                  <p className="text-gray-500 text-center text-sm mb-4 font-medium">
                    Has marcado todos los productos. ¿Deseas dar por finalizada esta compra?
                  </p>
                ) : (
                  <p className="text-gray-500 text-center text-sm mb-4 font-medium">
                    Aún faltan <span className="font-bold text-[#0f62fe]">{totalItems - completedItems}</span> productos por marcar. ¿Seguro que quieres finalizarla?
                  </p>
                )}
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="flex-1 h-11 bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold text-sm rounded-xl transition-colors"
                >
                  Aún no
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCompletion}
                  className={`flex-1 h-11 font-semibold text-sm rounded-xl transition-colors ${
                    modalType === 'auto'
                      ? 'bg-[#24a148] hover:bg-green-600 text-white'
                      : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                  }`}
                >
                  Completar
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal de confirmación de cambio de fecha */}
      <AnimatePresence>
        {showDateModal && (
          <>
            {/* Backdrop de fondo */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDateModal(false)}
              className="absolute inset-0 bg-black/45 backdrop-blur-[1px] z-40 cursor-pointer"
            />

            {/* Contenedor del Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute top-1/2 left-5 right-5 -translate-y-1/2 bg-white rounded-3xl p-6 shadow-2xl z-50 flex flex-col space-y-4 border border-slate-100"
            >
              <div className="flex flex-col items-center mb-2">
                <div className="w-12 h-12 bg-blue-50 text-[#0f62fe] rounded-full flex items-center justify-center mb-4">
                  <Calendar size={24} />
                </div>
                <h3 className="text-xl font-bold text-center text-slate-800 mb-2">Cambiar fecha de compra</h3>
                <p className="text-gray-500 text-center text-sm mb-4">
                  Selecciona la nueva fecha para esta lista.
                </p>
                
                {/* Input de Fecha (Clickable en toda el área) */}
                <button 
                  type="button"
                  onClick={() => setShowDatePicker(true)}
                  className="w-full text-left border border-gray-200 rounded-2xl px-4 py-3 text-slate-800 focus:outline-none focus:border-[#0f62fe] focus:ring-1 focus:ring-[#0f62fe] font-semibold bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  {tempDate ? formatListDate(tempDate) : "Selecciona una fecha"}
                </button>

                {tempDate && (
                  <div className="w-full mt-2 flex items-center justify-between bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-3">
                      <Bell size={18} className={enableReminder ? "text-[#0f62fe]" : "text-gray-400"} />
                      <div className="text-left">
                        <p className="text-sm font-semibold text-gray-800">Recordatorio</p>
                        <p className="text-[11px] text-gray-500">Notificar el día de la compra</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={enableReminder} onChange={(e) => setEnableReminder(e.target.checked)} />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0f62fe]"></div>
                    </label>
                  </div>
                )}
              </div>

              <div className="flex gap-3 w-full pt-2">
                <button 
                  type="button"
                  onClick={() => setShowDateModal(false)}
                  className="flex-1 h-11 bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold text-sm rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="button"
                  onClick={async () => {
                    if (tempDate && updateList) {
                      try {
                        await updateList(list.id, { 
                          plannedDate: tempDate, 
                          reminder: enableReminder 
                        });
                      } catch (err) {
                        alert('Error al actualizar la fecha');
                      }
                    }
                    setShowDateModal(false);
                  }}
                  disabled={!tempDate}
                  className="flex-1 h-11 bg-[#0f62fe] hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Guardar
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal de Publicación en la Comunidad */}
      <AnimatePresence>
        {showShareModal && (
          <>
            {/* Backdrop de fondo */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShareModal(false)}
              className="absolute inset-0 bg-black/45 backdrop-blur-[1px] z-40 cursor-pointer"
            />

            {/* Contenedor del Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute top-1/2 left-5 right-5 -translate-y-1/2 bg-white rounded-3xl p-6 shadow-2xl z-50 flex flex-col space-y-4 border border-slate-100"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-50 text-[#0f62fe] rounded-full flex items-center justify-center mb-4">
                  <Globe size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Publicar en Explorar</h3>
                <p className="text-gray-500 text-sm mb-4">
                  Comparte "{list.name}" con la comunidad. Añade una breve descripción.
                </p>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider pl-1 mb-1 block">Descripción</label>
                  <input 
                    type="text" 
                    value={shareDescription} 
                    onChange={(e) => setShareDescription(e.target.value)}
                    placeholder="Ej: Kit de supervivencia para la montaña..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#0f62fe] focus:bg-white placeholder-slate-400 transition-all font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Categoría</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {['Recetas', 'Viajes', 'Hogar', 'Eventos', 'Otros'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setShareCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                          shareCategory === cat 
                            ? 'bg-[#0f62fe] text-white border-[#0f62fe]' 
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 w-full pt-2">
                <button 
                  type="button"
                  onClick={() => setShowShareModal(false)} 
                  className="flex-1 h-11 bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold text-sm rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="button"
                  disabled={!shareDescription.trim()}
                  onClick={() => {
                    if (typeof onPublishList === 'function') {
                      onPublishList({ ...listRef.current, items: itemsRef.current }, shareDescription, shareCategory);
                    }
                    setShowShareModal(false);
                    setShareDescription('');
                  }} 
                  className="flex-1 h-11 bg-[#0f62fe] hover:bg-[#0b51d4] text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Publicar
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>



      {/* ── Dock Inferior ─────────────────────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 w-full p-5 bg-white border-t border-slate-100 z-10 pb-safe">
        {/* Botón principal Agregar Producto (Único y de ancho completo) */}
        <button
          onClick={() => onAddProductClick(false)} // Abre el Bottom Sheet normal
          className="w-full h-12 bg-[#0f62fe] hover:bg-[#0b51d4] active:bg-[#0943b1] text-white font-semibold text-sm rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/20 active:scale-[0.99] transition-all"
        >
          <Plus size={16} />
          <span>Agregar Producto</span>
        </button>
      </div>

      {/* Selector de fecha custom */}
      <CustomDatePickerModal
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelectDate={(date) => setTempDate(date)}
        currentDate={tempDate}
      />
    </div>
  );
}
