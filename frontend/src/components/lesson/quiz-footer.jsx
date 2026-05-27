import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const QuizFooter = ({
  selectedAnswer,
  isAnswerChecked,
  isCorrect,
  onCheck,
  onNext,
  onRetry,
}) => {
  const getFooterState = () => {
    if (!isAnswerChecked) {
      return {
        bg: 'bg-card',
        message: null,
        buttonText: 'Vérifier',
        buttonVariant: 'premium',
        onClick: onCheck,
        disabled: !selectedAnswer,
      };
    }

    if (isCorrect) {
      return {
        bg: 'bg-emerald-50 border-t-2 border-emerald-200',
        message: {
          icon: CheckCircle2,
          text: 'Bonne réponse !',
          color: 'text-emerald-600',
        },
        buttonText: 'Suivant',
        buttonVariant: 'success',
        onClick: onNext,
        disabled: false,
      };
    }

    return {
      bg: 'bg-red-50 border-t-2 border-red-200',
      message: {
        icon: XCircle,
        text: 'Mauvaise réponse',
        color: 'text-red-600',
      },
      buttonText: 'Réessayer',
      buttonVariant: 'destructive',
      onClick: onRetry,
      disabled: false,
    };
  };

  const state = getFooterState();

  return (
    <motion.footer
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40',
        'transition-colors duration-300',
        state.bg
      )}
    >
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-4">
          {/* Message */}
          <AnimatePresence mode="wait">
            {state.message ? (
              <motion.div
                key="message"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-3"
              >
                <state.message.icon className={cn('w-6 h-6', state.message.color)} />
                <span className={cn('font-semibold text-lg', state.message.color)}>
                  {state.message.text}
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
          </AnimatePresence>

          {/* Button */}
          <Button
            size="lg"
            variant={state.buttonVariant}
            onClick={state.onClick}
            disabled={state.disabled}
            className="min-w-[160px]"
          >
            {state.buttonText}
          </Button>
        </div>
      </div>
    </motion.footer>
  );
};

export default QuizFooter;