"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Circle } from "lucide-react";

type Props = {
  text: string;
  letter: string;
  isSelected: boolean;
  isCorrect: boolean | null;
  isRevealed: boolean;
  onClick: () => void;
  disabled?: boolean;
};

export const AnswerOption = ({
  text,
  letter,
  isSelected,
  isCorrect,
  isRevealed,
  onClick,
  disabled = false,
}: Props) => {
  const getStateStyles = () => {
    if (!isRevealed) {
      return isSelected
        ? "border-navy-700 bg-navy-50 shadow-sm"
        : "border-slate-200 bg-white hover:border-navy-300 hover:bg-slate-50";
    }

    if (isCorrect === true) {
      return "border-emerald-500 bg-emerald-50 shadow-sm";
    }

    if (isCorrect === false && isSelected) {
      return "border-rose-500 bg-rose-50 shadow-sm";
    }

    return "border-slate-200 bg-white opacity-60";
  };

  const getIcon = () => {
    if (!isRevealed) {
      return (
        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold transition-colors ${
          isSelected
            ? "bg-navy-700 text-white"
            : "bg-slate-100 text-slate-600"
        }`}>
          {letter}
        </span>
      );
    }

    if (isCorrect === true) {
      return (
        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        </div>
      );
    }

    if (isCorrect === false && isSelected) {
      return (
        <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
          <XCircle className="w-5 h-5 text-rose-600" />
        </div>
      );
    }

    return (
      <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-400">
        {letter}
      </span>
    );
  };

  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left ${getStateStyles()} ${
        disabled ? "cursor-default" : "cursor-pointer"
      }`}
    >
      {getIcon()}
      <span className={`text-sm sm:text-base flex-1 leading-relaxed ${
        isRevealed && isCorrect === true
          ? "text-emerald-800 font-medium"
          : isRevealed && isCorrect === false && isSelected
          ? "text-rose-800 font-medium"
          : "text-slate-700"
      }`}>
        {text}
      </span>
    </motion.button>
  );
};
