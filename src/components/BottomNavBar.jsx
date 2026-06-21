import { LayoutList, Compass, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

export function BottomNavBar({ currentTab, setCurrentTab }) {
  const tabs = [
    { id: 'lists', label: 'Mis Listas', icon: LayoutList },
    { id: 'explore', label: 'Explorar', icon: Compass },
    { id: 'settings', label: 'Ajustes', icon: Settings },
  ];

  return (
    <div className="absolute bottom-0 w-full bg-white border-t border-gray-100 flex justify-around items-center py-3 pb-safe z-40">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              isActive ? 'text-[#0f62fe]' : 'text-gray-400'
            }`}
          >
            <motion.div
              whileTap={{ scale: 0.92 }}
              className="flex flex-col items-center"
            >
              <Icon size={22} strokeWidth={2} className="mb-0.5" />
              <span className="text-[10px] font-semibold">
                {tab.label}
              </span>
            </motion.div>
          </button>
        );
      })}
    </div>
  );
}
