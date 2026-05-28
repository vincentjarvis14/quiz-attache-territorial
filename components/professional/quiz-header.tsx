"use client";

import { ArrowLeft, Timer, HelpCircle } from "lucide-react";
import Link from "next/link";

type Props = {
  title: string;
  currentQuestion: number;
  totalQuestions: number;
  hearts?: number;
  timeElapsed?: number;
};

export const QuizHeader = ({
  title,
  currentQuestion,
  totalQuestions,
  hearts,
  timeElapsed,
}: Props) => {
  const progress = ((currentQuestion) / totalQuestions) * 100;

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-[1056px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Back button */}
          <Link
            href="/learn"
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Retour</span>
          </Link>

          {/* Title & Progress */}
          <div className="flex-1 max-w-md mx-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-slate-500 truncate">
                {title}
              </span>
              <span className="text-xs font-medium text-navy-700">
                {currentQuestion + 1}/{totalQuestions}
              </span>
            </div>
            <div className="relative h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-navy-700 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4">
            {hearts !== undefined && (
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-rose-500">{hearts}</span>
                <span className="text-rose-400">♥</span>
              </div>
            )}
            {timeElapsed !== undefined && (
              <div className="flex items-center gap-1.5 text-slate-500">
                <Timer className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, "0")}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
