import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  MoreVertical,
  Apple,
  Egg,
  Package,
  Croissant,
  Beef,
  Sparkles,
  CupSoda,
  Snowflake,
  MoreHorizontal,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { getCategoryForProduct, formatListDate, getListStatus, formatQuantityText } from '../utils/productDictionary';
import { CustomDatePickerModal } from '../components/CustomDatePickerModal';
import { BottomSheet } from '../components/BottomSheet';

const formatPrice = (amount) => {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
};

const getItemQuantity = (item) => {
  if (item.real_quantity !== undefined && item.real_quantity !== null) {
    return item.real_quantity;
  }
  if (item.quantity) {
    const match = item.quantity.toString().match(/\d+/);
    if (match) {
      const qty = parseInt(match[0], 10);
      return qty > 20 ? 1 : qty;
    }
  }
  return 1;
};

const AISLE_STYLES = {
  'Frutas y Verduras': {
    Icon: Apple,
    bgClass: 'bg-green-50 text-green-600 border-green-100/50'
  },
  'Lácteos y Huevos': {
    Icon: Egg,
    bgClass: 'bg-yellow-50 text-yellow-600 border-yellow-100/50'
  },
  'Despensa': {
    Icon: Package,
    bgClass: 'bg-amber-50 text-amber-600 border-amber-100/50'
  },
  'Panadería y Pastelería': {
    Icon: Croissant,
    bgClass: 'bg-orange-50 text-orange-600 border-orange-100/50'
  },
  'Carnes y Fiambres': {
    Icon: Beef,
    bgClass: 'bg-red-50 text-red-600 border-red-100/50'
  },
  'Limpieza y Aseo': {
    Icon: Sparkles,
    bgClass: 'bg-teal-50 text-teal-600 border-teal-100/50'
  },
  'Bebidas y Snacks': {
    Icon: CupSoda,
    bgClass: 'bg-indigo-50 text-indigo-600 border-indigo-100/50'
  },
  'Congelados': {
    Icon: Snowflake,
    bgClass: 'bg-cyan-50 text-cyan-600 border-cyan-100/50'
  },
  'Otros': {
    Icon: MoreHorizontal,
    bgClass: 'bg-slate-50 text-slate-600 border-slate-200/50'
  }
};

const ItemCard = ({ 
  item, 
  setItemToDelete, 
  setItemToEdit, 
  isShoppingMode, 
  isFocused,
  isEditing,
  focusedItemPrice,
  setFocusedItemPrice,
  focusedItemQty,
  setFocusedItemQty,
  onFocus,
  onListo,
  onDesmarcar,
  toggleItem 
}) => {
  const controls = useAnimation();
  const isDragging = useRef(false);
  const [isDraggingActive, setIsDraggingActive] = useState(false);

  const handleDragEnd = (event, info) => {
    setTimeout(() => { isDragging.current = false; }, 150);
    if (!item.completed && info.offset.x < -60) {
      setItemToDelete(item.id);
    }
    controls.start({ x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } }).then(() => {
      setIsDraggingActive(false);
    });
  };

  // Bloquear drag si el producto está completado
  const isDragEnabled = !item.completed;

  return (
    <div className="relative mb-2">
      {/* Fondo Rojo (Solo visible si el drag está permitido y se está arrastrando) */}
      {isDragEnabled && isDraggingActive && (
        <div className="absolute top-[1px] bottom-[1px] right-[1px] w-[80%] bg-red-500 rounded-xl flex items-center justify-end pr-4 text-white -z-0">
          <Trash2 size={20} />
        </div>
      )}

      <motion.div
        drag={isDragEnabled ? "x" : false}
        dragConstraints={{ left: -80, right: 0 }}
        dragElastic={0.1}
        onDragStart={() => { isDragging.current = true; setIsDraggingActive(true); }}
        onDragEnd={handleDragEnd}
        animate={controls}
        initial={{ x: 0 }}
        style={{ touchAction: "pan-y" }}
        onClick={(e) => {
          if (isDragging.current) { e.preventDefault(); return; }
          if (isShoppingMode) {
            onFocus(item);
          } else {
            // Modo Simple: Toggle completion status directly when clicked!
            toggleItem(item.id, item.completed);
          }
        }}
        className={`relative z-10 w-full border rounded-xl p-4 shadow-sm flex flex-col transition-all duration-200 ${
          isFocused 
            ? 'bg-blue-50/30 border-[#0f62fe] border-2 shadow-md' 
            : item.completed 
              ? isShoppingMode 
                ? 'bg-blue-50/40 border-blue-100' 
                : 'bg-gray-50 opacity-60 border-gray-100'
              : 'bg-white border-gray-100'
        }`}
      >
        <div className="flex items-center justify-between w-full gap-3">
          <div className="flex-1 min-w-0 flex flex-col">
            <span className={`font-medium line-clamp-2 ${item.completed && !isFocused ? 'line-through text-gray-500' : 'text-gray-800'}`}>
              {item.name}
            </span>
            {item.quantity && (
              <span className={`text-xs ${item.completed && !isFocused ? 'line-through text-gray-400' : 'text-gray-500'}`}>
                {item.quantity}
              </span>
            )}
            {item.completed && !isFocused && isShoppingMode && (item.price || item.real_quantity) && (
              <span className="text-base text-[#0f62fe] font-semibold mt-1 block">
                {formatPrice(item.price || 0)} x {item.real_quantity || getItemQuantity(item)}
              </span>
            )}
          </div>

          {/* Botón Editar (Solo en Modo Compra, si está completado y no enfocado) */}
          {isShoppingMode && item.completed && !isFocused && (
            <button 
              onClick={(e) => { e.stopPropagation(); onFocus(item); }}
              className="p-2 text-[#0f62fe] hover:opacity-85 shrink-0 active:scale-95 transition-all"
              aria-label="Editar"
            >
              <Edit2 size={18} />
            </button>
          )}

          {!item.completed && !isShoppingMode && (
            <button 
              onClick={(e) => { e.stopPropagation(); setItemToEdit(item); }}
              className="p-2 text-[#0f62fe] hover:opacity-85 shrink-0 active:scale-95 transition-all"
              aria-label="Editar"
            >
              <Edit2 size={18} />
            </button>
          )}
        </div>

        {/* CONTENEDOR DE PRECIOS CON PROPAGACIÓN BLOQUEADA */}
        <AnimatePresence>
          {isShoppingMode && isFocused && (
            <motion.div 
              initial={{ height: 0, opacity: 0, marginTop: 0 }} 
              animate={{ height: 'auto', opacity: 1, marginTop: 12 }} 
              exit={{ height: 0, opacity: 0, marginTop: 0 }}
              className="flex items-end gap-2.5 overflow-hidden border-t border-blue-100/50 pt-3"
              onClick={(e) => e.stopPropagation()} // Evita que tocar el input desmarque la tarjeta o cambie el foco
              onPointerDown={(e) => e.stopPropagation()} // Evita que Framer Motion capture el toque
            >
              {/* Precio Unitario */}
              <div className="w-[100px] shrink-0">
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Precio</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">$</span>
                  <input 
                    id={`price-${item.id}`}
                    type="number" 
                    value={focusedItemPrice} 
                    onChange={(e) => setFocusedItemPrice(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg py-1.5 pl-6 pr-1.5 text-sm focus:border-[#0f62fe] outline-none shadow-sm font-semibold"
                    placeholder="0"
                  />
                </div>
              </div>
              
              {/* Cantidades / Unidades (Con botones +/-) */}
              <div className="w-[96px] shrink-0 flex flex-col items-center">
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Cantidad</label>
                <div className="flex items-center h-[34px] w-full">
                  {/* Botón Decremento (-) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const currentVal = parseFloat(focusedItemQty) || 0;
                      if (currentVal > 1) {
                        setFocusedItemQty(currentVal - 1);
                      }
                    }}
                    className="w-7 h-full rounded-l-lg bg-blue-50 text-[#0f62fe] hover:bg-blue-100 flex items-center justify-center font-bold text-base active:scale-95 transition-all shrink-0"
                  >
                    -
                  </button>
                  
                  {/* Input de Cantidad */}
                  <input 
                    id={`qty-${item.id}`}
                    type="number" 
                    value={focusedItemQty} 
                    onChange={(e) => setFocusedItemQty(e.target.value)}
                    onBlur={() => {
                      const finalQty = parseFloat(focusedItemQty) || 1;
                      setFocusedItemQty(finalQty);
                    }}
                    className="w-10 h-full border-y border-gray-200 bg-white text-center text-sm font-semibold focus:outline-none focus:border-y-[#0f62fe] outline-none"
                  />
                  
                  {/* Botón Incremento (+) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const currentVal = parseFloat(focusedItemQty) || 0;
                      setFocusedItemQty(currentVal + 1);
                    }}
                    className="w-7 h-full rounded-r-lg bg-blue-50 text-[#0f62fe] hover:bg-blue-100 flex items-center justify-center font-bold text-base active:scale-95 transition-all shrink-0"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Botón de acción: Listo / Guardar */}
              <div className="flex-1 flex justify-end h-[34px]">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onListo(item.id);
                  }}
                  className="w-20 h-full bg-[#0f62fe] hover:bg-blue-700 text-white rounded-lg text-xs font-extrabold flex items-center justify-center transition-all active:scale-95 shadow-sm shrink-0"
                >
                  {isEditing ? 'Guardar' : 'Listo'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

const PUBLISH_CATEGORY_STYLES = {
  'Recetas': 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200/50',
  'Viajes': 'bg-teal-100 text-teal-700 border-teal-200 hover:bg-teal-200/50',
  'Hogar': 'bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200/50',
  'Eventos': 'bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200/50',
  'Otros': 'bg-blue-100 text-[#0f62fe] border-blue-200 hover:bg-blue-200/50'
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

  const [isShoppingMode, setIsShoppingMode] = useState(false);
  const [focusedItemId, setFocusedItemId] = useState(null);
  const [focusedItemPrice, setFocusedItemPrice] = useState('');
  const [focusedItemQty, setFocusedItemQty] = useState(1);
  const [wasCompletedBeforeFocus, setWasCompletedBeforeFocus] = useState(false);

  useEffect(() => {
    setIsShoppingMode(false);
    setFocusedItemId(null);
    setFocusedItemPrice('');
    setFocusedItemQty(1);
    setWasCompletedBeforeFocus(false);
  }, [list?.id]);

  const handleFocusItem = async (item) => {
    // Si ya hay un item enfocado y es distinto, guardamos sus valores antes de cambiar
    if (focusedItemId && focusedItemId !== item.id) {
      const prevItem = allItems.find(it => it.id === focusedItemId);
      if (prevItem) {
        const finalPrice = parseFloat(focusedItemPrice) || 0;
        const finalQty = parseFloat(focusedItemQty) || 1;
        if (prevItem.price !== finalPrice || getItemQuantity(prevItem) !== finalQty) {
          try {
            await updateItem(focusedItemId, { price: finalPrice, real_quantity: finalQty });
          } catch (err) {
            console.error("Error saving previous item details:", err);
          }
        }
      }
    }

    // Enfocar el nuevo item
    setWasCompletedBeforeFocus(item.completed);
    setFocusedItemId(item.id);
    setFocusedItemPrice(item.price !== undefined && item.price !== null ? item.price : '');
    setFocusedItemQty(getItemQuantity(item));

    // Si el producto estaba completado, se desmarca al entrar en edición
    if (item.completed) {
      try {
        await toggleItem(item.id, true); // toggleItem(id, true) lo marca como completado = false
      } catch (err) {
        console.error("Error desmarcando al editar:", err);
      }
    }
  };

  const handleListo = async (itemId) => {
    const finalPrice = parseFloat(focusedItemPrice) || 0;
    const finalQty = parseFloat(focusedItemQty) || 1;
    
    try {
      // 1. Guardar precio y cantidad en base de datos
      await updateItem(itemId, { price: finalPrice, real_quantity: finalQty });
      
      // 2. Si no estaba completado, marcarlo como completado
      const item = allItems.find(it => it.id === itemId);
      if (item && !item.completed) {
        await toggleItem(itemId, false); // toggleItem(itemId, false) lo marca como completado = true
      }
      
      // 3. Limpiar el estado de enfoque
      setFocusedItemId(null);
      setFocusedItemPrice('');
      setFocusedItemQty(1);
    } catch (err) {
      console.error("Error setting item ready:", err);
    }
  };

  const handleDesmarcar = async (itemId) => {
    try {
      // Si estaba completado, lo marcamos como incompleto
      const item = allItems.find(it => it.id === itemId);
      if (item && item.completed) {
        await toggleItem(itemId, true); // toggleItem(itemId, true) lo marca como completado = false
      }
      
      // Limpiar enfoque
      setFocusedItemId(null);
      setFocusedItemPrice('');
      setFocusedItemQty(1);
    } catch (err) {
      console.error("Error unmarking item:", err);
    }
  };

  const toggleShoppingMode = () => {
    const nextMode = !isShoppingMode;
    setIsShoppingMode(nextMode);
    setFocusedItemId(null);
    setFocusedItemPrice('');
    setFocusedItemQty(1);
  };

  const calculateTotal = () => {
    return allItems.reduce((total, item) => {
      if (isShoppingMode && item.id === focusedItemId) {
        const price = parseFloat(focusedItemPrice) || 0;
        const qty = parseFloat(focusedItemQty) || 1;
        return total + (price * qty);
      }
      if (!item.completed) return total;
      const price = item.price || 0;
      const qty = getItemQuantity(item);
      return total + (price * qty);
    }, 0);
  };

  // Estados de finalización de lista
  const [isListCompleted, setIsListCompleted] = useState(() => {
    return list?.status === 'Completada' || list?.status === 'completada' || list?.isCompleted === true;
  });
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [modalType, setModalType] = useState('auto');
  const [showEmptyListModal, setShowEmptyListModal] = useState(false);

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

  const isCompletedEarly = isListCompleted && completedItems < totalItems;

  // Variables de color
  const progressBarColor = currentStatus === 'completada'
    ? (isCompletedEarly ? 'bg-amber-500' : 'bg-green-500')
    : currentStatus === 'en progreso' ? 'bg-yellow-500'
    : 'bg-gray-300';

  const badgeStyles = currentStatus === 'completada'
    ? (isCompletedEarly ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800')
    : currentStatus === 'en progreso' ? 'bg-yellow-100 text-yellow-800'
    : 'bg-gray-100 text-gray-600';

  // Sincronizar estado local si cambia la prop list
  useEffect(() => {
    if (list) {
      setIsListCompleted(list.status === 'Completada' || list.status === 'completada' || list.isCompleted === true);
    }
  }, [list]);

  // Disparador automático al completar el 100% de la lista removido según requerimiento de UX

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
    const category = item.category || getCategoryForProduct(item.name);
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

      
      {/* Cabecera Móvil (Estática) */}
      <header className="px-5 py-4 border-b border-slate-100 bg-white flex items-center justify-between shrink-0 relative">
        <div className="flex-1 min-w-0 flex items-center justify-between w-full relative z-30">
          {/* Izquierda: Volver y Título */}
          <div className="flex-1 min-w-0 flex items-center gap-3 overflow-hidden mr-2">
            <button onClick={() => window.history.back()} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full shrink-0">
              <ChevronLeft size={24} />
            </button>
            <button onClick={() => onEditList && onEditList(list)} className="flex-1 min-w-0 flex items-center gap-2 group text-left">
              <span className="text-2xl leading-none flex items-center shrink-0">{list?.emoji}</span>
              <h2 className="text-xl font-bold text-gray-800 truncate leading-tight pb-1 flex-1 min-w-0">{list?.name}</h2>
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
                  className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 z-50 flex flex-col"
                >
                  {/* 1. Editar Lista */}
                  <button 
                    onClick={() => { setShowMenu(false); if(typeof onEditList === 'function') onEditList(list); }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 text-left whitespace-nowrap"
                  >
                    <Edit2 size={16} className="text-[#0f62fe]" /> Editar lista
                  </button>

                  {/* 2. Duplicar Lista */}
                  <button 
                    onClick={() => { setShowMenu(false); if(typeof onDuplicateList === 'function') onDuplicateList({ ...listRef.current, items: itemsRef.current }); }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 text-left whitespace-nowrap"
                  >
                    <Copy size={16} className="text-[#0f62fe]" /> Duplicar lista
                  </button>

                  {/* 3. Publicar Lista */}
                  {!isPublished ? (
                    <button 
                      onClick={() => { setShowMenu(false); setShowShareModal(true); }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 text-left whitespace-nowrap"
                    >
                      <Globe size={16} className="text-[#0f62fe]" /> Publicar lista
                    </button>
                  ) : (
                    <button 
                      onClick={() => { 
                        setShowMenu(false); 
                        if (typeof onUnpublishList === 'function') onUnpublishList(list.id); 
                      }}
                      className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 text-left whitespace-nowrap"
                    >
                      <Globe size={16} className="text-red-500" /> Despublicar lista
                    </button>
                  )}

                  {/* 4. Completar ahora (solo si no está completada) */}
                  {!isListCompleted && (
                    <button 
                      onClick={() => { setShowMenu(false); setModalType('manual'); setShowCompleteModal(true); }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 text-left whitespace-nowrap"
                    >
                      <CheckCircle2 size={16} className="text-[#0f62fe]" /> Completar ahora
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
          <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full flex items-center gap-1 whitespace-nowrap ${badgeStyles}`}>
            {isCompletedEarly && <AlertTriangle size={12} className="text-amber-600 shrink-0" />}
            {currentStatus === 'en progreso' 
              ? 'En progreso' 
              : currentStatus === 'completada' 
                ? (isCompletedEarly ? 'Completada antes' : 'Completada') 
                : 'Pendiente'}
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
          {/* Izquierda: Modo Compra Toggle */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                if (allItems.length === 0) {
                  setShowEmptyListModal(true);
                } else {
                  toggleShoppingMode();
                }
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isShoppingMode ? 'bg-[#0f62fe]' : 'bg-gray-300'
              }`}
            >
              <motion.span 
                layout
                className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm"
                animate={{ x: isShoppingMode ? 24 : 4 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
            <span className={`text-sm font-semibold transition-colors ${isShoppingMode ? 'text-[#0f62fe]' : 'text-gray-500'}`}>
              Modo Compra
            </span>
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
                <Calendar size={13} className="text-[#0f62fe] shrink-0" />
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
      <div className={`flex-1 overflow-y-auto hide-scrollbar px-5 pt-4 space-y-2.5 ${(!loading && items.length === 0) ? 'flex flex-col justify-center pb-[160px]' : 'pb-32'}`}>
        {loading ? (
          <div className="space-y-2.5 py-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-14 bg-slate-50 border border-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="w-full max-w-full text-center flex flex-col items-center justify-center space-y-3 px-6 select-none">
            <img 
              src="/empty_state.png" 
              alt="Sin productos" 
              className="w-28 h-28 object-contain mb-1 select-none opacity-80" 
            />
            {allItems.length === 0 ? (
              <p className="text-base font-semibold text-[#b0b7c5] max-w-[280px] leading-relaxed">
                Agrega productos para iniciar tu lista
              </p>
            ) : (
              <p className="text-base font-semibold text-[#b0b7c5] max-w-[280px] leading-relaxed">
                Todo listo por aquí
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {categories.map((category) => {
              const style = AISLE_STYLES[category] || AISLE_STYLES['Otros'];
              const CategoryIcon = style.Icon;
              return (
                <div key={category} className="mb-6 last:mb-2">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider mb-3 ml-1 ${style.bgClass} border`}>
                    <CategoryIcon size={13} className="shrink-0" />
                    <span>{category}</span>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    <AnimatePresence initial={false}>
                      {groupedItems[category].map((item) => (
                        <ItemCard 
                          key={item.id} 
                          item={item} 
                          setItemToDelete={setItemToDelete} 
                          setItemToEdit={setItemToEdit} 
                          isShoppingMode={isShoppingMode}
                          isFocused={item.id === focusedItemId}
                          isEditing={item.id === focusedItemId && wasCompletedBeforeFocus}
                          focusedItemPrice={focusedItemPrice}
                          setFocusedItemPrice={setFocusedItemPrice}
                          focusedItemQty={focusedItemQty}
                          setFocusedItemQty={setFocusedItemQty}
                          onFocus={handleFocusItem}
                          onListo={handleListo}
                          onDesmarcar={handleDesmarcar}
                          toggleItem={toggleItem}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
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
          <BottomSheet
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
          >
            <div className="flex flex-col space-y-4">
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
                    {['Recetas', 'Viajes', 'Hogar', 'Eventos', 'Otros'].map((cat) => {
                      const isActive = shareCategory === cat;
                      const activeClass = PUBLISH_CATEGORY_STYLES[cat] || 'bg-blue-100 text-[#0f62fe] border-blue-200';
                      
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setShareCategory(cat)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                            isActive 
                              ? activeClass 
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
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
            </div>
          </BottomSheet>
        )}
      </AnimatePresence>

      {/* Modal para indicar que la lista está vacía */}
      <AnimatePresence>
        {showEmptyListModal && (
          <>
            {/* Backdrop de fondo */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEmptyListModal(false)}
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
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                  <ShoppingBag size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 text-center mb-2">
                  Lista vacía
                </h3>
                <p className="text-gray-500 text-center text-sm mb-4 font-medium">
                  Debes agregar al menos un producto a la lista antes de activar el Modo Compra.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowEmptyListModal(false)}
                  className="w-full h-11 bg-[#0f62fe] hover:bg-[#0b51d4] text-white font-semibold text-sm rounded-xl transition-colors"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>



      {/* ── Dock Inferior ─────────────────────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 w-full p-5 bg-white border-t border-slate-100 z-10 pb-safe">
        <AnimatePresence mode="popLayout">
          {!isShoppingMode ? (
            /* DOCK NORMAL (Planificación) */
            <motion.div 
              key="dock-normal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <button 
                onClick={() => onAddProductClick(false)} 
                className="w-full h-12 bg-[#0f62fe] hover:bg-[#0b51d4] active:bg-[#0943b1] text-white font-semibold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-[0.99] transition-all"
              >
                <Plus size={16} /> <span>Agregar producto</span>
              </button>
            </motion.div>
          ) : (
            /* DOCK MODO COMPRA (Ejecución) */
            <motion.div 
              key="dock-shopping"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex flex-col gap-3"
            >
              {/* Fila del Total */}
              <div className="flex justify-between items-end px-2">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total estimado</span>
                <span className="text-2xl font-black text-gray-900">{formatPrice(calculateTotal())}</span>
              </div>

              {/* Fila de Botones (Agregar rápido y Finalizar) */}
              <div className="flex gap-2 w-full">
                <button 
                  onClick={() => onAddProductClick(false)} 
                  className="w-12 h-12 flex-shrink-0 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl flex items-center justify-center transition-colors animate-none"
                  aria-label="Agregar producto"
                >
                  <div className="relative flex items-center justify-center">
                    <ShoppingBag size={20} />
                    <span className="absolute -top-2.5 -right-1 text-[#0f62fe] text-sm font-extrabold select-none">
                      +
                    </span>
                  </div>
                </button>
                
                <button 
                  onClick={() => { setModalType('manual'); setShowCompleteModal(true); }}
                  className={`flex-1 h-12 font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] transition-all ${
                    progressPercentage === 100 && totalItems > 0
                      ? 'bg-[#24a148] hover:bg-[#1f8b3d] active:bg-[#1b7534] text-white shadow-green-500/20'
                      : 'bg-[#0f62fe] hover:bg-[#0b51d4] active:bg-[#0943b1] text-white shadow-blue-500/20'
                  }`}
                >
                  <CheckCircle2 size={18} /> Finalizar Compra
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
