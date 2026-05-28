"use client";

import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";

type Props = {
  question: string;
  questionNumber: number;
  totalQuestions: number;
  difficulty?: number;
  source?: string;
};

export const QuestionCard = ({
  question,
  questionNumber,
  totalQuestions,
  difficulty,
  source,
}: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-navy-100 flex items-center justify-center">
            <HelpCircle className="w-4 h-4 text-navy-700" />
          </div>
          <div>
            <span className="text-sm font-medium text-navy-700">
              Question {questionNumber}/{totalQuestions}
            </span>
            {difficulty && (
              <span className={`ml-3 text-xs font-medium px-2 py-0.5 rounded-full ${
                difficulty === 1
                  ? "bg-emerald-100 text-emerald-700"
                  : difficulty === 2
                  ? "bg-amber-100 text-amber-700"
                  : "bg-rose-100 text-rose-700"
              }`}>
                {difficulty === 1 ? "Facile" : difficulty === 2 ? "Moyen" : "Difficile"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="mb-6">
        <p className="text-base sm:text-lg font-medium text-slate-800 leading-relaxed">
          {question}
        </p>
      </div>

      {/* Source badge */}
      {source && (
        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
          <span className="text-xs text-slate-500">Source:</span>
          <span className="text-xs font-medium text-slate-700">{source}</span>
        </div>
      )}
    </motion.div>
  );
};
