import { useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '../services/db';

export function useItems(listId) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    if (!listId) {
      setItems([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await db.getItemsByListId(listId);
      setItems(data);
      setError(null);
    } catch (err) {
      console.error('Error al cargar ítems:', err);
      setError('No se pudieron cargar los productos.');
    } finally {
      setLoading(false);
    }
  }, [listId]);

  // Cargar ítems al cambiar listId o al refetch
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Agregar ítem
  const createItem = useCallback(async (name, quantity = '') => {
    if (!listId) return;
    try {
      const newItem = await db.addItem(listId, name, quantity);
      setItems((prevItems) => [...prevItems, newItem]);
      return newItem;
    } catch (err) {
      console.error('Error al crear ítem:', err);
      throw new Error('No se pudo crear el producto.');
    }
  }, [listId]);

  // Alternar estado de completado (con actualización optimista)
  const toggleItem = useCallback(async (itemId, currentStatus) => {
    // Actualización optimista para respuesta táctil instantánea
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
    try {
      await db.deleteItem(itemId);
      setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
    } catch (err) {
      console.error('Error al eliminar ítem:', err);
      throw new Error('No se pudo eliminar el producto.');
    }
  }, []);

  // Eliminar todos los ítems completados
  const clearCompleted = useCallback(async () => {
    if (!listId) return;
    try {
      await db.clearCompletedItems(listId);
      setItems((prevItems) => prevItems.filter((item) => !item.completed));
    } catch (err) {
      console.error('Error al limpiar completados:', err);
      throw new Error('No se pudieron eliminar los ítems completados.');
    }
  }, [listId]);

  // Actualizar un ítem (ej. para cambiar su nombre o cantidad)
  const updateItem = useCallback(async (itemId, updates) => {
    // Actualización optimista para cambios fluidos
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      )
    );

    try {
      await db.updateItem(itemId, updates);
    } catch (err) {
      console.error('Error al actualizar ítem:', err);
      // Recargar desde el storage en caso de error para revertir el cambio optimista
      fetchItems();
      throw new Error('No se pudo actualizar el producto.');
    }
  }, [fetchItems]);

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
