import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CustomDatePickerModal = ({ isOpen, onClose, onSelectDate, currentDate }) => {
  // Parsing YYYY-MM-DD safely
  const parseDate = (dateStr) => {
    if (!dateStr) return new Date();
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return new Date(dateStr);
  };

  // State: current month/year being viewed
  const [viewDate, setViewDate] = useState(() => parseDate(currentDate));
  
  // Update view date if currentDate changes and modal opens
  useEffect(() => {
    if (isOpen) {
      setViewDate(parseDate(currentDate));
    }
  }, [isOpen, currentDate]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth(); // 0-indexed

  // Header helpers
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  // Generate calendar days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  
  // Monday as first day of week. JS getDay() returns 0 for Sunday, 1 for Monday...
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const days = [];
  
  // Previous month filling
  const prevMonth = new Date(year, month, 0);
  const daysInPrevMonth = prevMonth.getDate();
  for (let i = startOffset - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const d = new Date(year, month - 1, day);
    days.push({
      date: d,
      dayNumber: day,
      isCurrentMonth: false,
      formatted: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    });
  }

  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    days.push({
      date: d,
      dayNumber: i,
      isCurrentMonth: true,
      formatted: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    });
  }

  // Next month filling to make it 42 days (6 weeks)
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i);
    days.push({
      date: d,
      dayNumber: i,
      isCurrentMonth: false,
      formatted: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    });
  }

  const selectedDateStr = currentDate ? parseDate(currentDate).toDateString() : null;
  const todayStr = new Date().toDateString();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/45 backdrop-blur-[1px] cursor-pointer"
          />

          {/* Calendar Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-[340px] bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 flex flex-col z-[101]"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-slate-800">
                {monthNames[month]} {year}
              </h4>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 hover:bg-slate-100 active:bg-slate-200 rounded-lg transition-colors text-slate-600"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 hover:bg-slate-100 active:bg-slate-200 rounded-lg transition-colors text-slate-600"
                >
                  <ChevronRight size={18} />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 hover:bg-slate-100 active:bg-slate-200 rounded-lg transition-colors text-slate-600 ml-2"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-1 mb-2 text-center">
              {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'].map((day) => (
                <span key={day} className="text-xs font-bold text-slate-400 select-none py-1">
                  {day}
                </span>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, idx) => {
                const isSelected = selectedDateStr === day.date.toDateString();
                const isToday = todayStr === day.date.toDateString();
                
                return (
                  <button
                    key={`${day.formatted}-${idx}`}
                    type="button"
                    onClick={() => {
                      onSelectDate(day.formatted);
                      onClose();
                    }}
                    className={`aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-semibold transition-all relative ${
                      isSelected
                        ? 'bg-[#0f62fe] text-white shadow-md shadow-blue-500/20'
                        : day.isCurrentMonth
                        ? 'text-slate-800 hover:bg-slate-100'
                        : 'text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span>{day.dayNumber}</span>
                    {isToday && !isSelected && (
                      <span className="absolute bottom-1 w-1 h-1 bg-[#0f62fe] rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
