"use client";

import { motion, AnimatePresence } from "framer-motion";

type Props = {
  combo: number;
};

export const ComboDisplay = ({ combo }: Props) => {
  if (combo < 3) return null;

  const getEmoji = () => {
    if (combo >= 10) return "🔥🔥🔥";
    if (combo >= 5) return "🔥";
    return "🔥";
  };

  const getLabel = () => {
    if (combo >= 10) return "ON FIRE !";
    if (combo >= 5) return "En pleine forme !";
    return "Série en cours !";
  };

  return (
    <AnimatePresence>
      <motion.div
        key={combo}
        initial={{ scale: 0, y: -20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        className="fixed right-6 top-24 z-40 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 shadow-lg shadow-amber-200"
      >
        <span className="text-xl">{getEmoji()}</span>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-white">x{combo}</span>
          <span className="text-[10px] font-medium text-white/80">{getLabel()}</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
