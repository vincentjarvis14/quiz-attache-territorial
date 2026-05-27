import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, ArrowRight, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * V3 Professional Validation Bar
 * Corporate styling with source reference option
 */
const ProfessionalValidationBar = ({
  selectedAnswer,
  isAnswerChecked,
  isCorrect,
  explanation,
  sourceFile,
  onCheck,
  onNext,
  onRetry,
  onViewSource,
}) => {
  const getBarState = () => {
    if (!isAnswerChecked) {
      return {
        bg: 'bg-card border-t border-border',
        message: null,
        buttonText: 'Vérifier la réponse',
        buttonClass: 'bg-[hsl(215,25%,35%)] hover:bg-[hsl(215,25%,30%)] text-white',
        onClick: onCheck,
        disabled: !selectedAnswer,
        showSource: false,
      };
    }

    if (isCorrect) {
      return {
        bg: 'bg-[hsl(145,35%,95%)] border-t-2 border-[hsl(145,35%,45%)]',
        message: {
          icon: CheckCircle2,
          text: 'Réponse correcte',
          color: 'text-[hsl(145,35%,35%)]',
        },
        buttonText: 'Question suivante',
        buttonClass: 'bg-[hsl(145,35%,45%)] hover:bg-[hsl(145,35%,40%)] text-white',
        onClick: onNext,
        disabled: false,
        showSource: true,
      };
    }

    return {
      bg: 'bg-[hsl(0,40%,96%)] border-t-2 border-[hsl(0,40%,50%)]',
      message: {
        icon: XCircle,
        text: 'Réponse incorrecte',
        color: 'text-[hsl(0,40%,40%)]',
      },
      buttonText: 'Réessayer',
      buttonClass: 'bg-[hsl(0,40%,50%)] hover:bg-[hsl(0,40%,45%)] text-white',
      onClick: onRetry,
      disabled: false,
      showSource: true,
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
      <div className="max-w-5xl mx-auto px-6 py-5">
        {/* Feedback Message & Explanation */}
        <AnimatePresence mode="wait">
          {state.message ? (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mb-4"
            >
              <div className="flex items-start gap-3 mb-3">
                <state.message.icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', state.message.color)} strokeWidth={2} />
                <div className="flex-1">
                  <p className={cn('font-semibold text-sm mb-1', state.message.color)}>
                    {state.message.text}
                  </p>
                  {explanation && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {explanation}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Source Reference */}
              {state.showSource && sourceFile && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground pl-8">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Source : {sourceFile}</span>
                  {onViewSource && (
                    <button
                      onClick={onViewSource}
                      className="text-[hsl(215,25%,35%)] hover:underline font-medium"
                    >
                      Voir l'extrait
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-4"
            >
              <p className="text-sm text-muted-foreground">
                Sélectionnez une réponse pour continuer
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <Button
            onClick={state.onClick}
            disabled={state.disabled}
            className={cn(
              'min-w-[180px] font-medium shadow-sm',
              state.buttonClass
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

export default ProfessionalValidationBar;
