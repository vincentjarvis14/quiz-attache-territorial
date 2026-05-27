import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Premium 2026 Pedagogical Validation Bar
 * - Fixed bottom position
 * - Sophisticated desaturated color coding
 * - Clear educational feedback without disruption
 */
const ValidationBarV2 = ({
  selectedAnswer,
  isAnswerChecked,
  isCorrect,
  onCheck,
  onNext,
  onRetry,
}) => {
  const getBarState = () => {
    if (!isAnswerChecked) {
      return {
        bg: 'bg-card border-t border-border',
        message: null,
        buttonText: 'Vérifier',
        buttonClassName: 'bg-primary text-primary-foreground hover:bg-primary/90',
        onClick: onCheck,
        disabled: !selectedAnswer,
      };
    }

    if (isCorrect) {
      return {
        bg: 'bg-success-bg border-t-2 border-success',
        message: {
          icon: CheckCircle2,
          text: 'Bonne réponse',
          color: 'text-success',
        },
        buttonText: 'Continuer',
        buttonClassName: 'bg-success text-white hover:bg-success/90',
        onClick: onNext,
        disabled: false,
      };
    }

    return {
      bg: 'bg-error-bg border-t-2 border-error',
      message: {
        icon: XCircle,
        text: 'Réponse incorrecte',
        color: 'text-error',
      },
      buttonText: 'Réessayer',
      buttonClassName: 'bg-error text-white hover:bg-error/90',
      onClick: onRetry,
      disabled: false,
    };
  };

  const state = getBarState();

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40',
        'transition-colors duration-300',
        state.bg
      )}
    >
      <div className="max-w-3xl mx-auto px-6 py-5">
        <div className="flex items-center justify-between gap-6">
          {/* Feedback Message */}
          <AnimatePresence mode="wait">
            {state.message ? (
              <motion.div
                key="message"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3"
              >
                <state.message.icon className={cn('w-5 h-5', state.message.color)} strokeWidth={2} />
                <span className={cn('font-medium text-sm', state.message.color)}>
                  {state.message.text}
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm text-muted-foreground"
              >
                Sélectionnez une réponse
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Button */}
          <Button
            onClick={state.onClick}
            disabled={state.disabled}
            className={cn(
              'min-w-[140px] font-medium',
              'transition-all duration-200',
              'shadow-sm hover:shadow-md',
              state.buttonClassName
            )}
          >
            {state.buttonText}
            {isCorrect && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ValidationBarV2;
