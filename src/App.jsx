import React, { useState, useEffect, useRef } from 'react';
import { useLists } from './hooks/useLists';
import { useItems } from './hooks/useItems';
import { HomeView } from './views/HomeView';
import { ActiveListView } from './views/ActiveListView';
import { ExploreView } from './views/ExploreView';
import { ExploreDetailView } from './views/ExploreDetailView';
import { BottomSheet } from './components/BottomSheet';
import { BottomNavBar } from './components/BottomNavBar';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Smile, Mic, CheckCircle2, Bell } from 'lucide-react';
import { COMMON_PRODUCTS, formatQuantityText, formatListDate } from './utils/productDictionary';
import EmojiPicker from 'emoji-picker-react';
import { CustomDatePickerModal } from './components/CustomDatePickerModal';
import { SettingsView } from './views/SettingsView';
import { LoginView } from './views/LoginView';
import { COMMUNITY_LISTS } from './utils/communityLists';

const parseQuantityString = (qtyStr) => {
  if (!qtyStr) return { quantity: '', unit: '', customUnit: '' };
  const match = qtyStr.match(/^([\d.]+)\s*(.*)$/);
  if (match) {
    const qty = match[1];
    let unit = match[2].trim().toLowerCase();
    const standardUnits = ['unidades', 'gramos', 'kilogramos', 'litros', 'paquete', 'caja', 'bolsa'];
    let foundUnit = '';
    if (unit) {
      const matchedUnit = standardUnits.find(u => {
        if (u === 'unidades' && (unit === 'unidades' || unit === 'unidad')) return true;
        if (u === 'gramos' && (unit === 'gramos' || unit === 'g')) return true;
        if (u === 'kilogramos' && (unit === 'kilogramos' || unit === 'kg')) return true;
        if (u === 'litros' && (unit === 'litros' || unit === 'litro' || unit === 'l')) return true;
        if (u === 'paquete' && (unit === 'paquete' || unit === 'paquetes')) return true;
        if (u === 'caja' && (unit === 'caja' || unit === 'cajas')) return true;
        if (u === 'bolsa' && (unit === 'bolsa' || unit === 'bolsas')) return true;
        return false;
      });
      
      if (matchedUnit) {
        foundUnit = matchedUnit;
      } else {
        foundUnit = 'otro';
      }
    }
    return {
      quantity: qty,
      unit: foundUnit,
      customUnit: foundUnit === 'otro' ? unit : ''
    };
  }
  return {
    quantity: '',
    unit: 'otro',
    customUnit: qtyStr
  };
};

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('shopsync_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const { lists, loading: listsLoading, addList, removeList, reorderLists, updateList, refreshListStats } = useLists(currentUser?.id || 'guest');

  const handleLogin = (userId, userName) => {
    const userData = { id: userId, name: userName };
    setCurrentUser(userData);
    localStorage.setItem('shopsync_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('shopsync_user');
    setCurrentView('home');
    setCurrentTab('lists');
  };
  
  // 1. Estados de Navegación y Vistas
  const [currentTab, setCurrentTab] = useState('lists'); // 'lists' | 'explore' | 'settings'
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'activeList'
  const [selectedListId, setSelectedListId] = useState(null);
  const [bottomSheet, setBottomSheet] = useState(null); // null | 'addProduct'
  const [listToEdit, setListToEdit] = useState(null); // null | list object
  const [selectedTemplate, setSelectedTemplate] = useState(null); // null | template object
  const [listToClone, setListToClone] = useState(null); // null | template object to clone

  // Estado de listas de la comunidad para Explorar
  const [communityLists, setCommunityLists] = useState(() => {
    try {
      const stored = localStorage.getItem('shopsync_community_lists');
      return stored ? JSON.parse(stored) : COMMUNITY_LISTS;
    } catch {
      return COMMUNITY_LISTS;
    }
  });

  // Estado del Splash Screen
  const [showSplash, setShowSplash] = useState(true);

  // Estado para Toasts / Snackbars
  const [toastMessage, setToastMessage] = useState('');
  const toastTimeoutRef = useRef(null);
  const showToast = (message) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(message);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage('');
      toastTimeoutRef.current = null;
    }, 3000);
  };

  const handlePublishList = async (listData, description, category) => {
    const parsedItems = (listData.items || []).map((item, index) => {
      const parsed = parseQuantityString(item.quantity);
      return {
        id: `pub_i_${Date.now()}_${index}`,
        name: item.name,
        quantity: parsed.quantity || item.quantity || '',
        unit: parsed.unit === 'otro' ? parsed.customUnit : parsed.unit
      };
    });

    const publishedList = {
      id: `pub_${Date.now()}`,
      original_list_id: listData.id,
      name: listData.name,
      emoji: listData.emoji || '🛒',
      description: description,
      category: category,
      author: `@${currentUser?.name?.toLowerCase().replace(/\s+/g, '_') || 'anonimo'}`,
      items: parsedItems
    };

    setCommunityLists((prev) => {
      const updated = [publishedList, ...prev];
      try {
        localStorage.setItem('shopsync_community_lists', JSON.stringify(updated));
      } catch (err) {
        console.error('Error al guardar en localStorage:', err);
      }
      return updated;
    });

    showToast('Lista publicada en Explorar');
  };

  const handleUnpublishList = (originalListId) => {
    setCommunityLists((prev) => {
      const updated = prev.filter(cl => cl.original_list_id !== originalListId);
      try {
        localStorage.setItem('shopsync_community_lists', JSON.stringify(updated));
      } catch (err) {
        console.error('Error al guardar en localStorage:', err);
      }
      return updated;
    });
    showToast('Lista despublicada');
  };

  // Filtro de listas para HomeView
  const [activeFilter, setActiveFilter] = useState('Pendientes');

  // Formulario de creación de listas
  const [newListName, setNewListName] = useState('');
  const [newListEmoji, setNewListEmoji] = useState('🛒');
  const [listDate, setListDate] = useState('');
  const [enableReminder, setEnableReminder] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Sincronizar estados del formulario al seleccionar una lista para editar, crear o clonar
  useEffect(() => {
    if (listToClone) {
      setNewListName(listToClone.name || '');
      setNewListEmoji(listToClone.emoji || '🛒');
      setListDate('');
    } else if (listToEdit && listToEdit.id) {
      setNewListName(listToEdit.name || '');
      setNewListEmoji(listToEdit.emoji || '🛒');
      setListDate(listToEdit.plannedDate || listToEdit.date || '');
      setEnableReminder(listToEdit.reminder || false);
    } else {
      setNewListName('');
      setNewListEmoji('🛒');
      setListDate('');
      setEnableReminder(false);
    }
  }, [listToClone, listToEdit]);
  
  // Formulario de creación de ítems y estado de revelar campos opcionales
  const [productName, setProductName] = useState('');
  const [productQuantity, setProductQuantity] = useState('');
  const [productUnit, setProductUnit] = useState('');
  const [customUnit, setCustomUnit] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Estados y lógica de dictado de voz para el BottomSheet
  const [isListening, setIsListening] = useState(false);
  const [autoStartVoice, setAutoStartVoice] = useState(false);

  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Dictado no soportado en este navegador.");

    if (isListening) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = false; // Solo una frase corta
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        // FIX CRÍTICO: Añadido [0] para acceder correctamente al transcript
        const transcriptChunk = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcriptChunk;
        }
      }

      if (finalTranscript) {
        const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);
        setProductName(prev => prev ? `${prev} ${finalTranscript}` : capitalizeFirstLetter(finalTranscript));
      }
    };

    recognition.onerror = (e) => {
      console.warn("Error de dictado:", e.error);
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
      setAutoStartVoice(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.warn("No se pudo iniciar el dictado", e);
    }
  };

  useEffect(() => {
    if (bottomSheet === 'addProduct' && autoStartVoice) {
      toggleListening();
    }
  }, [bottomSheet, autoStartVoice]);

  // Hook para gestionar los items de la lista activa compartida entre la vista y el BottomSheet
  const activeListItemsState = useItems(selectedListId, refreshListStats, currentUser?.id || 'guest');

  // Sincronizar estados del formulario al seleccionar un producto para editar
  useEffect(() => {
    if (editingItem) {
      setProductName(editingItem.name || '');
      if (editingItem.quantity) {
        const parsed = parseQuantityString(editingItem.quantity);
        setProductQuantity(parsed.quantity);
        setProductUnit(parsed.unit);
        setCustomUnit(parsed.customUnit);
        setShowDetails(true);
      } else {
        setProductQuantity('');
        setProductUnit('');
        setCustomUnit('');
        setShowDetails(false);
      }
      setBottomSheet('addProduct');
    }
  }, [editingItem]);

  // Oculta el Splash Screen después de que carguen las listas y haya pasado un mínimo de 1.5s
  useEffect(() => {
    if (!listsLoading) {
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [listsLoading]);

  // Selección automática de la lista activa
  const activeList = lists.find((l) => l.id === selectedListId);

  // Manejo de la acción guardar lista (crear o editar) en BottomSheet
  const handleSaveList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    try {
      if (listToEdit && listToEdit.id) {
        await updateList(listToEdit.id, {
          name: newListName.trim(),
          emoji: newListEmoji,
          plannedDate: listDate,
          reminder: enableReminder
        });
        setListToEdit(null);
      } else {
        const templateItems = listToClone
          ? listToClone.items.map(item => ({
              name: item.name,
              quantity: formatQuantityText(item.quantity, item.unit)
            }))
          : (listToEdit?.templateItems || []);

        const newList = await addList(newListName.trim(), newListEmoji, listDate, templateItems, currentUser?.id, enableReminder);
        setListToEdit(null);
        setListToClone(null);
        setSelectedTemplate(null); // Cerrar el detalle de la plantilla si estaba abierto
        // Excelente UX: Navega directamente a la lista recién creada
        setSelectedListId(newList.id);
        setCurrentView('activeList');
        setCurrentTab('lists'); // Redirige a la pestaña principal de listas
      }
      setNewListName('');
      setNewListEmoji('🛒');
      setListDate('');
      setShowEmojiPicker(false);
    } catch (err) {
      alert(listToEdit && listToEdit.id ? 'Error al editar la lista' : 'Error al crear la lista');
    }
  };

  // Manejo de la acción agregar/editar producto en BottomSheet
  const addItemToList = async (e) => {
    e.preventDefault();
    if (!productName.trim() || !selectedListId) return;
    try {
      const finalQuantityString = formatQuantityText(productQuantity, productUnit === 'otro' ? customUnit.trim() : productUnit);

      if (editingItem) {
        await activeListItemsState.updateItem(editingItem.id, {
          name: productName.trim(),
          quantity: finalQuantityString
        });
      } else {
        await activeListItemsState.createItem(productName.trim(), finalQuantityString, currentUser?.id);
      }
      
      // Limpiar estados del formulario
      setProductName('');
      setProductQuantity('');
      setProductUnit('');
      setCustomUnit('');
      setShowDetails(false);
      setBottomSheet(null);
      setSuggestions([]);
      setShowSuggestions(false);
      setEditingItem(null);
    } catch (err) {
      alert(editingItem ? 'Error al actualizar el producto' : 'Error al agregar el producto');
    }
  };

  const emojiOptions = ['🛒', '🔥', '🍳', '🥦', '🛍️', '🎉', '💊', '🏠', '🍎', '🍺', '🥩'];

  return (
    <div className="relative w-full h-[100dvh] bg-slate-100 flex flex-col items-center justify-center overflow-hidden">
      
      {/* PWA Splash Screen */}
      <AnimatePresence>
        {showSplash && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.4, ease: 'easeInOut' } }}
            className="absolute inset-0 z-50 bg-[#0f62fe] flex flex-col items-center justify-center text-white select-none"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="flex flex-col items-center"
            >
              <img 
                src="/shopsync-logo.svg" 
                alt="ShopSync Logo" 
                className="w-24 h-24 mb-4 object-contain"
              />
              <h1 className="text-4xl font-bold tracking-tight">ShopSync</h1>
            </motion.div>
            
            <div className="w-28 h-1 bg-white/20 rounded-full mt-10 overflow-hidden relative">
              <div className="h-full bg-white w-1/2 rounded-full absolute left-0 top-0 animate-[shimmer_1.5s_infinite_linear]"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Viewport Container */}
      <div className="w-full max-w-md h-[100dvh] bg-white shadow-2xl flex flex-col overflow-hidden relative border-x border-slate-200">
        {!currentUser ? (
          <LoginView onLogin={handleLogin} />
        ) : (
          <>
            {/* Renderizado de Vistas según Navegación */}
        <div className="flex-1 min-h-0 flex flex-col">
          {currentTab === 'lists' ? (
            currentView === 'home' ? (
              <HomeView
                lists={lists}
                loading={listsLoading}
                removeList={removeList}
                onSelectList={(id) => {
                  setSelectedListId(id);
                  setCurrentView('activeList');
                }}
                onCreateListClick={() => setListToEdit({ name: '', emoji: '🛒', plannedDate: '' })}
                onReorder={reorderLists}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                showToast={showToast}
                updateList={updateList}
              />
            ) : (
              <ActiveListView
                list={activeList}
                onBack={() => {
                  setCurrentView('home');
                  setSelectedListId(null);
                }}
                onAddProductClick={(startVoice = false) => {
                  setBottomSheet('addProduct');
                  if (startVoice) setAutoStartVoice(true);
                }}
                itemsState={activeListItemsState}
                onCompleteList={async () => {
                  try {
                    await updateList(activeList.id, { status: 'Completada' });
                  } catch (err) {
                    alert('Error al completar la lista');
                  }
                }}
                updateList={updateList}
                setActiveTab={setActiveFilter}
                setItemToEdit={setEditingItem}
                onEditList={setListToEdit}
                showToast={showToast}
                onDuplicateList={(listWithItems) => {
                  setListToClone(listWithItems);
                }}
                onPublishList={handlePublishList}
                communityLists={communityLists}
                onUnpublishList={handleUnpublishList}
              />
            )
          ) : currentTab === 'explore' ? (
            selectedTemplate ? (
              <ExploreDetailView
                template={selectedTemplate}
                onBack={() => setSelectedTemplate(null)}
                onUseTemplate={(template) => {
                  setListToClone(template);
                }}
              />
            ) : (
              <ExploreView 
                onSelectTemplate={setSelectedTemplate} 
                onCloneTemplate={(template) => setListToClone(template)} 
                communityLists={communityLists}
              />
            )
          ) : currentTab === 'settings' ? (
            <SettingsView onLogout={handleLogout} currentUser={currentUser} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 font-semibold select-none">
              Próximamente...
            </div>
          )}
        </div>

        {/* Bottom NavBar Global */}
        {currentView !== 'activeList' && !selectedTemplate && (
          <BottomNavBar currentTab={currentTab} setCurrentTab={setCurrentTab} />
        )}

        {/* Modales Deslizantes (Bottom Sheets) */}
        <AnimatePresence>
          
          {/* BottomSheet: Nueva Lista */}
          {(listToEdit !== null || listToClone !== null) && (
            <BottomSheet
              isOpen={true}
              onClose={() => {
                setListToEdit(null);
                setListToClone(null);
                setNewListName('');
                setNewListEmoji('🛒');
                setListDate('');
                setShowEmojiPicker(false);
              }}
              title={listToClone ? (listToClone.author ? 'COPIAR LISTA' : 'DUPLICAR LISTA') : listToEdit?.id ? 'EDITAR LISTA' : 'CREAR NUEVA LISTA'}
            >
              <form onSubmit={handleSaveList} className="space-y-4 px-1 pt-1 pb-4">
                {/* 1. Nombre de la lista */}
                <div className="space-y-1.5 mb-5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                    Nombre de la lista
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Supermercado, Bebidas, Asado..."
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#0f62fe] focus:bg-white placeholder-slate-400 transition-all font-semibold"
                    autoFocus
                  />
                </div>

                {/* 2. Selecciona un Emoji */}
                <div className="space-y-1.5 mb-5 relative">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                    Selecciona un Emoji
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {emojiOptions.map((emoji) => {
                      const isSelected = newListEmoji === emoji;
                      return (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            setNewListEmoji(emoji);
                            setShowEmojiPicker(false);
                          }}
                          className={`h-10 rounded-xl flex items-center justify-center text-xl transition-all border ${
                            isSelected 
                              ? 'border-[#0f62fe] bg-blue-50/40 scale-105 shadow-sm shadow-blue-100' 
                              : 'border-slate-100 bg-slate-50/70 hover:bg-slate-100/60'
                          }`}
                        >
                          {emoji}
                        </button>
                      );
                    })}
                    {/* Botón extra para abrir selector completo */}
                    {(() => {
                      const isCustomEmoji = newListEmoji && !emojiOptions.includes(newListEmoji);
                      const isSmileSelected = isCustomEmoji;

                      return (
                        <button
                          type="button"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className={`h-10 rounded-xl flex items-center justify-center text-xl transition-all border ${
                            isSmileSelected 
                              ? 'border-[#0f62fe] bg-blue-50/40 scale-105 shadow-sm shadow-blue-100 font-semibold' 
                              : showEmojiPicker
                                ? 'border-[#0f62fe] bg-blue-50/40 text-[#0f62fe]' 
                                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-gray-500'
                          }`}
                        >
                          {isCustomEmoji ? (
                            <span>{newListEmoji}</span>
                          ) : (
                            <Smile size={18} />
                          )}
                        </button>
                      );
                    })()}
                  </div>

                  {/* Panel de Selector de Emojis */}
                  {showEmojiPicker && (
                    <div className="mt-3 flex justify-center border border-slate-100 rounded-2xl overflow-hidden shadow-md bg-white z-50 relative">
                      <EmojiPicker 
                        onEmojiClick={(emojiData) => {
                          setNewListEmoji(emojiData.emoji);
                          setShowEmojiPicker(false);
                        }}
                        width="100%"
                        height={320}
                        previewConfig={{ showPreview: false }}
                        skinTonesDisabled
                      />
                    </div>
                  )}
                </div>

                {/* 3. Fecha de compra (Opcional) */}
                <div className="space-y-1.5 mb-5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                    Fecha de compra (Opcional)
                  </label>
                  <button 
                    type="button"
                    onClick={() => setShowCustomDatePicker(true)}
                    className="w-full text-left bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#0f62fe] placeholder-slate-400 transition-all font-semibold text-slate-800 cursor-pointer hover:bg-slate-100/60"
                  >
                    {listDate ? formatListDate(listDate) : "Selecciona una fecha"}
                  </button>
                  {listDate && (
                    <div className="mt-4 mb-2 flex items-center justify-between bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                      <div className="flex items-center gap-3">
                        <Bell size={18} className={enableReminder ? "text-[#0f62fe]" : "text-gray-400"} />
                        <div>
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

                {/* Botón CTA (Validación y Estado Activo/Inactivo) */}
                <button
                  type="submit"
                  disabled={newListName.trim() === ''}
                  className={`w-full h-12 font-semibold text-sm rounded-2xl flex items-center justify-center transition-all pt-0.5 mt-2 ${
                    newListName.trim() === ''
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-[#0f62fe] text-white cursor-pointer hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-[0.99]'
                  }`}
                >
                  <span>{listToClone ? 'Confirmar' : 'Guardar Lista'}</span>
                </button>
              </form>
            </BottomSheet>
          )}

          {/* BottomSheet: Agregar Producto */}
          {bottomSheet === 'addProduct' && (
            <BottomSheet
              isOpen={true}
              onClose={() => {
                setBottomSheet(null);
                setProductName('');
                setProductQuantity('');
                setProductUnit('');
                setCustomUnit('');
                setShowDetails(false);
                setShowSuggestions(false);
                setSuggestions([]);
                setEditingItem(null);
              }}
              title={editingItem ? "Editar Producto" : `Agregar a ${activeList?.name}`}
            >
              <form onSubmit={addItemToList} className="space-y-4 px-1 pt-1 pb-4">
                {/* A. Campo: Nombre del Producto (Obligatorio) */}
                <div className="space-y-1.5 mb-4 relative">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                    Nombre del producto
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Ej. Manzanas, Leche, Detergente..."
                      value={productName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProductName(val);
                        if (val.trim()) {
                          const filtered = COMMON_PRODUCTS.filter(product =>
                            product.toLowerCase().includes(val.toLowerCase())
                          );
                          setSuggestions(filtered);
                          setShowSuggestions(filtered.length > 0);
                        } else {
                          setSuggestions([]);
                          setShowSuggestions(false);
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#0f62fe] focus:bg-white placeholder-slate-400 transition-all font-semibold pr-12"

                    />
                    <button 
                      type="button"
                      onClick={toggleListening}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${
                        isListening ? 'text-red-500 bg-red-50 animate-pulse' : 'text-gray-400 hover:text-[#0f62fe] hover:bg-blue-50'
                      }`}
                    >
                      <Mic size={18} />
                    </button>
                  </div>
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto mt-1 left-0">
                      {suggestions.map((suggestion, index) => (
                        <div 
                          key={index}
                          onClick={() => {
                            setProductName(suggestion);
                            setShowSuggestions(false);
                          }}
                          className="px-4 py-3 border-b last:border-b-0 border-gray-100 cursor-pointer hover:bg-gray-50 active:bg-gray-100 text-sm font-medium text-gray-800"
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Revelación Progresiva de Detalles (Cantidad y Unidad) */}
                <AnimatePresence>
                  {!showDetails ? (
                    <div className="mb-4">
                      <button
                        type="button"
                        onClick={() => setShowDetails(true)}
                        className="text-[#0f62fe] text-sm font-medium flex items-center gap-1.5 mt-1 hover:opacity-85 transition-opacity"
                      >
                        <Plus size={15} />
                        <span>Añadir cantidad o formato</span>
                      </button>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden space-y-4 mb-4"
                    >
                      {/* B. Campo: Cantidad (Opcional) */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                          Cantidad
                        </label>
                        <input
                          type="number"
                          inputMode="decimal"
                          placeholder="Ej. 2, 1.5, 500..."
                          value={productQuantity}
                          onChange={(e) => setProductQuantity(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#0f62fe] focus:bg-white placeholder-slate-400 transition-all font-semibold"
                        />
                      </div>

                      {/* C. Campo: Unidad de Medida (Opcional - Carrusel de Chips) */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                          Formato / Empaque (Opcional)
                        </label>
                        <div
                          onPointerDownCapture={(e) => e.stopPropagation()}
                          onTouchStartCapture={(e) => e.stopPropagation()}
                          onTouchMoveCapture={(e) => e.stopPropagation()}
                          onWheelCapture={(e) => e.stopPropagation()}
                          style={{ touchAction: 'pan-x', overscrollBehaviorX: 'contain' }}
                          className="flex w-full overflow-x-auto gap-2 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                        >
                          {['unidades', 'gramos', 'kilogramos', 'litros', 'paquete', 'caja', 'bolsa', 'otro'].map((unit) => {
                            const isSelected = productUnit === unit;
                            return (
                              <button
                                key={unit}
                                type="button"
                                onClick={() => setProductUnit(unit)}
                                className={`px-3 py-1.5 rounded-full text-sm shrink-0 border transition-colors font-medium ${
                                  isSelected
                                    ? 'bg-blue-50 border-[#0f62fe] text-[#0f62fe]'
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-slate-50'
                                }`}
                              >
                                {unit}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* D. Campo: Otra Unidad (Condicional) */}
                      {productUnit === 'otro' && (
                        <div className="space-y-1.5">
                          <input
                            type="text"
                            placeholder="Escribe la unidad..."
                            value={customUnit}
                            onChange={(e) => setCustomUnit(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#0f62fe] focus:bg-white placeholder-slate-400 transition-all font-semibold"
                          />
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Botón CTA (Validación y Estado Activo/Inactivo) */}
                <button
                  type="submit"
                  disabled={productName.trim() === ''}
                  className={`w-full h-12 font-semibold text-sm rounded-2xl flex items-center justify-center transition-all pt-0.5 mt-2 ${
                    productName.trim() === ''
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-[#0f62fe] text-white cursor-pointer hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-[0.99]'
                  }`}
                >
                  <span>{editingItem ? "Guardar" : "Agregar producto"}</span>
                </button>
              </form>
            </BottomSheet>
          )}

        </AnimatePresence>

        {/* Toast / Snackbar Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium"
            >
              <CheckCircle2 size={16} className="text-green-400" />
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>
          </>
        )}

      </div>

      {/* Selector de Fecha Custom */}
      <CustomDatePickerModal
        isOpen={showCustomDatePicker}
        onClose={() => setShowCustomDatePicker(false)}
        onSelectDate={(date) => setListDate(date)}
        currentDate={listDate}
      />
    </div>
  );
}

export default App;
