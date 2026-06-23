// Capa de Servicio de Base de Datos para ShopSync (Fase 2: Supabase)
// Reemplaza la implementación anterior basada en localStorage

import { supabase } from './supabaseClient';

export const db = {
  // --- OPERACIONES DE LISTAS ---

  // Obtiene todas las listas con sus ítems incluidos para calcular stats
  getLists: async (userId) => {
    let query = supabase
      .from('lists')
      .select('*, items(*)');

    // Lógica estricta de aislamiento
    if (userId === 'guest') {
      query = query.is('user_id', null); // El invitado SOLO ve las listas sin dueño
    } else if (userId) {
      query = query.eq('user_id', userId); // El usuario logueado SOLO ve sus listas
    } else {
      // Si por algún motivo userId es undefined/falso y NO es guest, devolvemos vacío por seguridad
      return [];
    }

    const { data, error } = await query
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Enriquecer cada lista con stats calculadas a partir de sus ítems
    return (data || []).map((list) => {
      const items = list.items || [];
      const total = items.length;
      const completed = items.filter((i) => i.completed).length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      let status = list.status || 'Pendiente';
      if (status === 'Completada' || status === 'completada') {
        status = 'Completada';
      } else if (total > 0) {
        if (completed === total) status = 'Completada';
        else if (completed > 0) status = 'En progreso';
      }

      return {
        ...list,
        // Mapear planned_date → plannedDate para compatibilidad con el frontend
        plannedDate: list.planned_date || '',
        stats: { total, completed, percentage, status },
      };
    });
  },

  // Guarda el nuevo orden de las listas
  updateListsOrder: async (newOrder) => {
    // Actualizar sort_order de cada lista en batch
    const updates = newOrder.map((list, index) =>
      supabase
        .from('lists')
        .update({ sort_order: index })
        .eq('id', list.id)
    );

    const results = await Promise.all(updates);
    const failed = results.find((r) => r.error);
    if (failed) throw failed.error;
  },

  // Crea una nueva lista
  createList: async (name, emoji = '📝', plannedDate = '', reminder = false, userId) => {
    // Primero, intentar incrementar sort_order vía RPC (más eficiente y atómico)
    const { error: rpcError } = await supabase.rpc('increment_sort_order_not_exists');

    // Si la función RPC no existe o falla, hacemos el update manual
    if (rpcError) {
      let orderQuery = supabase
        .from('lists')
        .select('id, sort_order');

      if (userId === 'guest') {
        orderQuery = orderQuery.is('user_id', null);
      } else if (userId) {
        orderQuery = orderQuery.eq('user_id', userId);
      }

      const { data: existingLists } = await orderQuery
        .order('sort_order', { ascending: true });

      if (existingLists && existingLists.length > 0) {
        const batchUpdates = existingLists.map((list) =>
          supabase
            .from('lists')
            .update({ sort_order: list.sort_order + 1 })
            .eq('id', list.id)
        );
        const results = await Promise.all(batchUpdates);
        const failed = results.find((r) => r.error);
        if (failed) throw failed.error;
      }
    }

    const { data, error } = await supabase
      .from('lists')
      .insert({
        name,
        emoji: emoji || '📝',
        planned_date: plannedDate || null,
        sort_order: 0,
        user_id: userId === 'guest' ? null : userId,
        reminder: reminder,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      plannedDate: data.planned_date || '',
    };
  },

  // Elimina una lista (CASCADE borra sus ítems automáticamente)
  deleteList: async (listId) => {
    const { error } = await supabase
      .from('lists')
      .delete()
      .eq('id', listId);

    if (error) throw error;
  },

  // Actualiza una lista específica
  updateList: async (listId, updates) => {
    // Mapear plannedDate → planned_date si viene del frontend
    const dbUpdates = { ...updates };
    if ('plannedDate' in dbUpdates) {
      dbUpdates.planned_date = dbUpdates.plannedDate || null;
      delete dbUpdates.plannedDate;
    }
    // Eliminar campos que no son columnas de la tabla
    delete dbUpdates.items;
    delete dbUpdates.stats;

    const { data, error } = await supabase
      .from('lists')
      .update(dbUpdates)
      .eq('id', listId)
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      plannedDate: data.planned_date || '',
    };
  },

  // --- OPERACIONES DE ÍTEMS ---

  // Obtiene todos los ítems de una lista específica
  getItemsByListId: async (listId, userId) => {
    let query = supabase
      .from('items')
      .select('*')
      .eq('list_id', listId);

    // Lógica estricta de aislamiento
    if (userId === 'guest') {
      query = query.is('user_id', null); // El invitado SOLO ve los ítems sin dueño
    } else if (userId) {
      query = query.eq('user_id', userId); // El usuario logueado SOLO ve sus ítems
    } else {
      // Si por algún motivo userId es undefined/falso y NO es guest, devolvemos vacío por seguridad
      return [];
    }

    const { data, error } = await query
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Mapear list_id → listId para compatibilidad con el frontend
    return (data || []).map((item) => {
      // ENRIQUECER CON PRECIO, CANTIDAD REAL Y CATEGORIA DESDE LOCALSTORAGE (Evita errores de esquema en DB)
      let localPrice = 0;
      let localRealQty = null;
      let localCategory = null;
      try {
        const stored = localStorage.getItem(`shopsync_item_details_${item.id}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          localPrice = parsed.price || 0;
          localRealQty = parsed.real_quantity !== undefined ? parsed.real_quantity : null;
          localCategory = parsed.category || null;
        }
      } catch (e) {
        console.error("Error al cargar detalles de localStorage:", e);
      }

      const enriched = {
        ...item,
        listId: item.list_id,
        price: localPrice
      };

      if (localRealQty !== null) {
        enriched.real_quantity = localRealQty;
      }
      if (localCategory !== null) {
        enriched.category = localCategory;
      }

      return enriched;
    });
  },

  // Agrega un ítem a una lista
  addItem: async (listId, name, quantity = '', userId) => {
    const { data, error } = await supabase
      .from('items')
      .insert({
        list_id: listId,
        name,
        quantity,
        user_id: userId === 'guest' ? null : userId,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      listId: data.list_id,
    };
  },

  // Cambia el estado de completado de un ítem
  toggleItemStatus: async (itemId, completed) => {
    const { data, error } = await supabase
      .from('items')
      .update({ completed })
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      listId: data.list_id,
    };
  },

  // Elimina un ítem específico
  deleteItem: async (itemId) => {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
  },

  // Elimina todos los ítems completados de una lista específica
  clearCompletedItems: async (listId) => {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('list_id', listId)
      .eq('completed', true);

    if (error) throw error;
  },

  // Actualiza un ítem específico (nombre, cantidad, etc.)
  updateItem: async (itemId, updates) => {
    // Mapear listId → list_id si viene del frontend
    const dbUpdates = { ...updates };
    if ('listId' in dbUpdates) {
      dbUpdates.list_id = dbUpdates.listId;
      delete dbUpdates.listId;
    }

    // EXTRAER PRECIO, REAL_QUANTITY Y CATEGORIA PARA GUARDAR EN LOCALSTORAGE (Evita error PGRST204 de columna inexistente)
    let hasLocalDetails = false;
    let localDetails = {};
    
    if ('price' in dbUpdates) {
      localDetails.price = dbUpdates.price;
      delete dbUpdates.price;
      hasLocalDetails = true;
    }
    if ('real_quantity' in dbUpdates) {
      localDetails.real_quantity = dbUpdates.real_quantity;
      delete dbUpdates.real_quantity;
      hasLocalDetails = true;
    }
    if ('category' in dbUpdates) {
      localDetails.category = dbUpdates.category;
      delete dbUpdates.category;
      hasLocalDetails = true;
    }

    if (hasLocalDetails) {
      try {
        const currentStored = localStorage.getItem(`shopsync_item_details_${itemId}`);
        const current = currentStored ? JSON.parse(currentStored) : {};
        localStorage.setItem(
          `shopsync_item_details_${itemId}`, 
          JSON.stringify({ ...current, ...localDetails })
        );
      } catch (e) {
        console.error("Error al guardar detalles locales:", e);
      }
    }

    // Si no quedan columnas para actualizar en Supabase después de extraer precio/cantidad,
    // simplemente retornamos éxito simulado para evitar peticiones vacías a Supabase
    if (Object.keys(dbUpdates).length === 0) {
      return { id: itemId };
    }

    const { data, error } = await supabase
      .from('items')
      .update(dbUpdates)
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      listId: data.list_id,
    };
  },

  // Agrega múltiples ítems a una lista en lote (batch)
  addItems: async (listId, items, userId) => {
    const { data, error } = await supabase
      .from('items')
      .insert(
        items.map(item => ({
          list_id: listId,
          name: item.name,
          quantity: item.quantity || '',
          completed: false,
          user_id: userId === 'guest' ? null : userId,
        }))
      )
      .select();

    if (error) throw error;

    return (data || []).map((dbItem, index) => {
      const originalItem = items[index];
      let category = null;

      if (originalItem && originalItem.category) {
        category = originalItem.category;
      }

      if (category) {
        try {
          const currentStored = localStorage.getItem(`shopsync_item_details_${dbItem.id}`);
          const current = currentStored ? JSON.parse(currentStored) : {};
          localStorage.setItem(
            `shopsync_item_details_${dbItem.id}`, 
            JSON.stringify({ ...current, category })
          );
        } catch (e) {
          console.error("Error al guardar categoría local en addItems:", e);
        }
      }

      const enriched = {
        ...dbItem,
        listId: dbItem.list_id
      };

      if (category) {
        enriched.category = category;
      }

      return enriched;
    });
  },
};
