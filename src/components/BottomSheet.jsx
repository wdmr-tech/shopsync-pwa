import React from 'react';
import { motion } from 'framer-motion';

export function BottomSheet({ isOpen, onClose, title, children }) {
  return (
    <>
      {/* Backdrop de fondo */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/45 backdrop-blur-[1.5px] z-40 cursor-pointer"
      />

      {/* Contenedor del Sheet que desliza desde abajo */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 240 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.1, bottom: 0.8 }}
        onDragEnd={(e, info) => {
          if (info.offset.y > 100) {
            onClose();
          }
        }}
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[2rem] z-50 p-6 pb-8 border-t border-slate-100 shadow-2xl flex flex-col max-h-[85dvh] overflow-y-auto overscroll-contain no-scrollbar"
      >
        {/* Manilla / Notch superior tipo iOS para arrastrar/visualizar */}
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 shrink-0" />

        {title && (
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 shrink-0">
            {title}
          </h3>
        )}

        {children}
      </motion.div>
    </>
  );
}
