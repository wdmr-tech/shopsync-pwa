import { useState, useEffect, useCallback } from 'react';
import { db } from '../services/db';

export function useLists() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carga inicial de listas — db.getLists() ya devuelve listas enriquecidas con items y stats
  const fetchLists = useCallback(async () => {
    try {
      setLoading(true);
      const data = await db.getLists();
      setLists(data);
      setError(null);
    } catch (err) {
      console.error('Error al cargar listas:', err);
      setError('No se pudieron cargar las listas.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Agregar una lista
  const addList = useCallback(async (name, emoji, plannedDate = '') => {
    try {
      const newList = await db.createList(name, emoji, plannedDate);
      // Nueva lista: 0 ítems → stats iniciales en Pendiente
      const enriched = {
        ...newList,
        items: [],
        stats: { total: 0, completed: 0, percentage: 0, status: 'Pendiente' },
      };
      setLists((prev) => [enriched, ...prev]);
      return newList;
    } catch (err) {
      console.error('Error al crear lista:', err);
      throw new Error('No se pudo crear la lista.');
    }
  }, []);

  // Eliminar una lista
  const removeList = useCallback(async (listId) => {
    try {
      await db.deleteList(listId);
      setLists((prev) => prev.filter((list) => list.id !== listId));
    } catch (err) {
      console.error('Error al eliminar lista:', err);
      throw new Error('No se pudo eliminar la lista.');
    }
  }, []);

  // Recalcular stats de una lista específica (llamar tras toggle/add/remove de ítem)
  const refreshListStats = useCallback(async (listId, customItems) => {
    try {
      const items = customItems || await db.getItemsByListId(listId);
      const total = items.length;
      const completed = items.filter((i) => i.completed).length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      setLists((prev) =>
        prev.map((list) => {
          if (list.id !== listId) return list;

          let status = list.status || 'Pendiente';
          if (status === 'Completada' || status === 'completada') {
            status = 'Completada';
          } else if (total > 0) {
            if (completed === total) status = 'Completada';
            else if (completed > 0) status = 'En progreso';
            else status = 'Pendiente';
          } else {
            status = 'Pendiente';
          }

          return {
            ...list,
            items,
            stats: { total, completed, percentage, status },
          };
        })
      );
    } catch (err) {
      console.error('Error al refrescar stats:', err);
    }
  }, []);

  // Reordenar las listas (actualiza localmente y persiste en Supabase)
  const reorderLists = useCallback(async (newOrder) => {
    // Actualización optimista del estado local
    setLists(newOrder);
    try {
      await db.updateListsOrder(newOrder);
    } catch (err) {
      console.error('Error al guardar el nuevo orden de las listas:', err);
    }
  }, []);

  // Actualizar una lista
  const updateList = useCallback(async (listId, updates) => {
    try {
      const updatedList = await db.updateList(listId, updates);
      // Refrescar stats de la lista después de actualizarla
      const items = await db.getItemsByListId(listId);
      const total = items.length;
      const completed = items.filter((i) => i.completed).length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      let status = updatedList.status || 'Pendiente';
      if (status === 'Completada' || status === 'completada') {
        status = 'Completada';
      } else if (total > 0) {
        if (completed === total) status = 'Completada';
        else if (completed > 0) status = 'En progreso';
      }

      setLists((prev) =>
        prev.map((list) =>
          list.id === listId
            ? {
                ...list,
                ...updatedList,
                items,
                stats: { total, completed, percentage, status },
              }
            : list
        )
      );
      return updatedList;
    } catch (err) {
      console.error('Error al actualizar lista:', err);
      throw new Error('No se pudo actualizar la lista.');
    }
  }, []);

  // Cargar las listas al montar
  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  return {
    lists,
    loading,
    error,
    refetch: fetchLists,
    addList,
    removeList,
    refreshListStats,
    reorderLists,
    updateList,
  };
}
