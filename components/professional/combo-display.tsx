"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";

type Props = {
  combo: number;
};

export const ComboDisplay = ({ combo }: Props) => {
  if (combo < 3) return null;

  const getLabel = () => {
    if (combo >= 10) return "Exceptionnel !";
    if (combo >= 5) return "En pleine forme !";
    return "Série en cours !";
  };

  const getColor = () => {
    if (combo >= 10) return "from-amber-500 to-orange-600 shadow-amber-200";
    if (combo >= 5) return "from-amber-400 to-amber-600 shadow-amber-200";
    return "from-navy-500 to-navy-700 shadow-navy-200";
  };

  return (
    <AnimatePresence>
      <motion.div
        key={combo}
        initial={{ scale: 0, y: -20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        className={`fixed right-6 top-24 z-40 flex items-center gap-3 rounded-2xl bg-gradient-to-r ${getColor()} px-5 py-3 shadow-lg`}
      >
        <Zap className="w-5 h-5 text-white" />
        <div className="flex flex-col">
          <span className="text-lg font-bold text-white">x{combo}</span>
          <span className="text-[10px] font-medium text-white/80">{getLabel()}</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
