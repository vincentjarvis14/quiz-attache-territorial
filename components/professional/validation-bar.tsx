"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle, ArrowRight, RotateCcw } from "lucide-react";

type Props = {
  isCorrect: boolean | null;
  isRevealed: boolean;
  hasSelection: boolean;
  onValidate: () => void;
  onNext: () => void;
  onRetry?: () => void;
  isLastQuestion: boolean;
  explanation?: string | null;
};

export const ValidationBar = ({
  isCorrect,
  isRevealed,
  hasSelection,
  onValidate,
  onNext,
  onRetry,
  isLastQuestion,
  explanation,
}: Props) => {
  if (!isRevealed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-t border-slate-200 p-4"
      >
        <div className="max-w-[1056px] mx-auto flex justify-center">
          <button
            onClick={onValidate}
            disabled={!hasSelection}
            className={`px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
              hasSelection
                ? "bg-navy-700 text-white hover:bg-navy-800 shadow-md hover:shadow-lg"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            Valider la réponse
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border-t p-4 ${
        isCorrect
          ? "bg-emerald-50 border-emerald-200"
          : "bg-rose-50 border-rose-200"
      }`}
    >
      <div className="max-w-[1056px] mx-auto">
        <div className="flex items-start gap-3 mb-4">
          {isCorrect ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mt-0.5 shrink-0" />
          ) : (
            <XCircle className="w-6 h-6 text-rose-600 mt-0.5 shrink-0" />
          )}
          <div>
            <p className={`text-sm font-semibold ${
              isCorrect ? "text-emerald-800" : "text-rose-800"
            }`}>
              {isCorrect ? "Bonne réponse !" : "Mauvaise réponse"}
            </p>
            {explanation && (
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                {explanation}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-center gap-3">
          {!isCorrect && onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm border-2 border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Réessayer
            </button>
          )}
          <button
            onClick={onNext}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm bg-navy-700 text-white hover:bg-navy-800 shadow-md transition-all"
          >
            {isLastQuestion ? "Voir les résultats" : "Question suivante"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
