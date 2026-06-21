export const checkReminders = (lists) => {
  if (!lists || !Array.isArray(lists)) return { today: [], tomorrow: [], overdue: [], count: 0 };

  const todayLists = [];
  const tomorrowLists = [];
  const overdueLists = [];

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  lists.forEach(list => {
    // Solo listas no completadas, con recordatorio activo y fecha planificada
    const status = list.stats?.status || list.status;
    const isCompleted = status === 'Completada' || status === 'completada' || list.isCompleted;
    
    if (isCompleted || !list.reminder || !list.plannedDate) return;

    const parts = list.plannedDate.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const listDate = new Date(year, month, day);

      const timeDiff = listDate.getTime() - today.getTime();
      const daysDiff = Math.round(timeDiff / (1000 * 3600 * 24));

      if (daysDiff === 0) {
        todayLists.push(list);
      } else if (daysDiff === 1) {
        tomorrowLists.push(list);
      } else if (daysDiff < 0) {
        overdueLists.push(list);
      }
    }
  });

  return {
    today: todayLists,
    tomorrow: tomorrowLists,
    overdue: overdueLists,
    count: todayLists.length + tomorrowLists.length + overdueLists.length
  };
};
