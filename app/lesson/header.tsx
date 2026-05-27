"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Heart } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { useExitModal } from "@/store/use-exit-modal";

type Props = {
  hearts: number;
  percentage: number;
  currentQuestion?: number;
  totalQuestions?: number;
};

export const Header = ({
  hearts,
  percentage,
  currentQuestion,
  totalQuestions,
}: Props) => {
  const router = useRouter();
  const { open } = useExitModal();

  const onBack = useCallback(() => {
    open();
  }, [open]);

  return (
    <header className="mx-auto flex w-full max-w-[1140px] items-center justify-between gap-x-7 px-10 pt-[20px] lg:pt-[50px]">
      <div className="flex items-center gap-x-4">
        <Button onClick={onBack} variant="ghost" size="sm">
          <ArrowLeft className="h-5 w-5 stroke-2 text-slate-400" />
        </Button>
        <motion.div
          key={hearts}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-x-2 text-rose-500"
        >
          <Heart className="h-6 w-6 fill-rose-500" />
          <span className="font-bold text-lg">{hearts}</span>
        </motion.div>
      </div>

      {/* Question indicator */}
      {currentQuestion !== undefined && totalQuestions !== undefined && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          key={currentQuestion}
          className="hidden sm:flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-600"
        >
          Question {currentQuestion}/{totalQuestions}
        </motion.div>
      )}

      <div className="flex-1 max-w-[400px]">
        <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background:
                percentage >= 80
                  ? "linear-gradient(90deg, #10B981, #34D399)"
                  : percentage >= 50
                  ? "linear-gradient(90deg, #7C3AED, #8B5CF6)"
                  : "linear-gradient(90deg, #F59E0B, #FBBF24)",
            }}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          />
        </div>
      </div>
    </header>
  );
};
