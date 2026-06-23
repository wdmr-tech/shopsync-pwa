import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { db } from '../services/db';
import { classifyProductWithGemini } from '../services/ai';

export function useItems(listId, refreshListStats = null, currentUserId = null) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ref para tener acceso al estado más reciente de items en los callbacks y evitar closures obsoletos
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Sincronizar stats de la lista automáticamente cuando cambien los items y la carga haya finalizado
  useEffect(() => {
    if (listId && typeof refreshListStats === 'function' && !loading) {
      refreshListStats(listId, items);
    }
  }, [listId, items, refreshListStats, loading]);

  // Cargar preferencia de ocultar completados desde localStorage
  const [hideCompleted, setHideCompletedState] = useState(() => {
    if (!listId) return false;
    const stored = localStorage.getItem(`shopsync_hide_completed_${listId}`);
    return stored === 'true';
  });

  const setHideCompleted = useCallback((val) => {
    setHideCompletedState(val);
    if (listId) {
      localStorage.setItem(`shopsync_hide_completed_${listId}`, String(val));
    }
  }, [listId]);

  // Carga de ítems
  const fetchItems = useCallback(async () => {
    if (!listId || !currentUserId) {
      setItems([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await db.getItemsByListId(listId, currentUserId);
      setItems(data);
      setError(null);
    } catch (err) {
      console.error('Error al cargar ítems:', err);
      setError('No se pudieron cargar los productos.');
    } finally {
      setLoading(false);
    }
  }, [listId, currentUserId]);

  // Cargar ítems al cambiar listId o al refetch
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Actualizar un ítem (ej. para cambiar su nombre o cantidad o detalles de modo compra)
  const updateItem = useCallback(async (itemId, updates) => {
    const currentItems = itemsRef.current;
    const itemToUpdate = currentItems.find((item) => item.id === itemId);
    if (!itemToUpdate) return;

    // Guardar valores anteriores para el rollback
    const previousValues = {};
    Object.keys(updates).forEach((key) => {
      previousValues[key] = itemToUpdate[key];
    });

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      )
    );

    try {
      await db.updateItem(itemId, updates);

      // Si el nombre cambió y no se especificó categoría, re-clasificar en segundo plano
      if (updates.name && updates.name !== itemToUpdate.name && !updates.category) {
        (async () => {
          try {
            const category = await classifyProductWithGemini(updates.name);
            if (category) {
              updateItem(itemId, { category });
            }
          } catch (err) {
            console.error("Error al re-clasificar producto al editar:", err);
          }
        })();
      }
    } catch (err) {
      console.error('Error al actualizar ítem:', err);
      // Revertir en caso de error
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId ? { ...item, ...previousValues } : item
        )
      );
      throw new Error('No se pudo actualizar el producto.');
    }
  }, []);

  // Agregar ítem
  const createItem = useCallback(async (name, quantity = '', userId = null) => {
    const finalUserId = userId || currentUserId;
    if (!listId || !finalUserId) return;
    try {
      const newItem = await db.addItem(listId, name, quantity, finalUserId);
      setItems((prevItems) => [...prevItems, newItem]);

      // Clasificación inteligente en segundo plano usando la API de Gemini
      (async () => {
        try {
          const category = await classifyProductWithGemini(name);
          if (category) {
            updateItem(newItem.id, { category });
          }
        } catch (err) {
          console.error("Error al clasificar producto en segundo plano:", err);
        }
      })();

      return newItem;
    } catch (err) {
      console.error('Error al crear ítem:', err);
      throw new Error('No se pudo crear el producto.');
    }
  }, [listId, currentUserId, updateItem]);

  // Alternar estado de completado (con actualización optimista)
  const toggleItem = useCallback(async (itemId, currentStatus) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, completed: !currentStatus } : item
      )
    );

    try {
      await db.toggleItemStatus(itemId, !currentStatus);
    } catch (err) {
      console.error('Error al actualizar ítem en storage:', err);
      // Revertir en caso de error
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId ? { ...item, completed: currentStatus } : item
        )
      );
      throw new Error('No se pudo actualizar el estado del producto.');
    }
  }, []);

  // Eliminar un ítem
  const removeItem = useCallback(async (itemId) => {
    const currentItems = itemsRef.current;
    const itemToRemove = currentItems.find((item) => item.id === itemId);
    if (!itemToRemove) return;

    setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));

    try {
      await db.deleteItem(itemId);
    } catch (err) {
      console.error('Error al eliminar ítem:', err);
      // Revertir en caso de error
      setItems((prevItems) => {
        if (prevItems.some((item) => item.id === itemId)) return prevItems;
        return [...prevItems, itemToRemove];
      });
      throw new Error('No se pudo eliminar el producto.');
    }
  }, []);

  // Eliminar todos los ítems completados
  const clearCompleted = useCallback(async () => {
    if (!listId) return;
    const currentItems = itemsRef.current;
    const completedItems = currentItems.filter((item) => item.completed);
    if (completedItems.length === 0) return;

    setItems((prevItems) => prevItems.filter((item) => !item.completed));

    try {
      await db.clearCompletedItems(listId);
    } catch (err) {
      console.error('Error al limpiar completados:', err);
      // Revertir en caso de error
      setItems((prevItems) => {
        const restored = [...prevItems];
        completedItems.forEach((item) => {
          if (!restored.some((r) => r.id === item.id)) {
            restored.push(item);
          }
        });
        return restored;
      });
      throw new Error('No se pudieron eliminar los ítems completados.');
    }
  }, [listId]);

  // Cálculo matemático del progreso
  const stats = useMemo(() => {
    const total = items.length;
    const completed = items.filter((item) => item.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  }, [items]);

  // Ítems filtrados por la preferencia de visualización
  const filteredItems = useMemo(() => {
    if (hideCompleted) {
      return items.filter((item) => !item.completed);
    }
    return items;
  }, [items, hideCompleted]);

  return {
    items: filteredItems,
    allItems: items,
    loading,
    error,
    hideCompleted,
    setHideCompleted,
    createItem,
    toggleItem,
    removeItem,
    clearCompleted,
    stats,
    refetch: fetchItems,
    updateItem,
  };
}
