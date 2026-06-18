import React from 'react';
import { motion } from 'framer-motion';

export function ProgressBar({ percentage, status = 'pendiente' }) {
  // Asegurar límites del porcentaje entre 0 y 100
  const cleanPercentage = Math.max(0, Math.min(100, percentage));
  
  // Asignar color según estado
  const getFillColor = () => {
    if (status === 'completada') return '#22c55e'; // bg-green-500
    if (status === 'en progreso') return '#f1c21b'; // bg-yellow-500 (#f1c21b)
    return '#9ca3af'; // bg-gray-400
  };
  const fillColor = getFillColor();

  return (
    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${cleanPercentage}%` }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{ backgroundColor: fillColor }}
        className="h-full rounded-full"
      />
    </div>
  );
}
