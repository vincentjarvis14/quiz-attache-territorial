import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Premium 2026 Pedagogical Answer Option
 * - Clean, spacious design
 * - Fluid micro-animations on interaction
 * - Sophisticated status visualization
 */
const AnswerOptionV2 = ({
  option,
  index,
  selected,
  isCorrect,
  isWrong,
  disabled,
  onClick,
}) => {
  const getOptionState = () => {
    if (isCorrect) {
      return {
        border: 'border-success',
        bg: 'bg-success-bg',
        text: 'text-foreground',
        icon: Check,
        iconColor: 'text-success',
      };
    }
    if (isWrong) {
      return {
        border: 'border-error',
        bg: 'bg-error-bg',
        text: 'text-foreground',
        icon: X,
        iconColor: 'text-error',
      };
    }
    if (selected) {
      return {
        border: 'border-primary',
        bg: 'bg-primary/5',
        text: 'text-foreground',
        icon: null,
        iconColor: null,
      };
    }
    return {
      border: 'border-border',
      bg: 'bg-card',
      text: 'text-foreground',
      icon: null,
      iconColor: null,
    };
  };

  const state = getOptionState();
  const Icon = state.icon;
  const keyboardShortcut = String.fromCharCode(65 + index); // A, B, C, D

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={!disabled ? { scale: 1.01 } : {}}
      whileTap={!disabled ? { scale: 0.99 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative group w-full text-left',
        'border-2 rounded-lg transition-all duration-200',
        'p-5 min-h-[72px]',
        'disabled:cursor-not-allowed',
        state.border,
        state.bg,
        !disabled && !selected && !isCorrect && !isWrong && 'hover:border-primary/40 hover:bg-muted/30',
        isWrong && 'animate-shake-gentle'
      )}
    >
      {/* Keyboard Shortcut Badge */}
      <div
        className={cn(
          'absolute top-3 right-3',
          'text-[10px] font-mono font-semibold tracking-wider',
          'px-1.5 py-0.5 rounded',
          'bg-muted text-muted-foreground',
          'opacity-60 group-hover:opacity-100 transition-opacity'
        )}
      >
        {keyboardShortcut}
      </div>

      {/* Option Text */}
      <div className={cn('pr-8 leading-relaxed', state.text)}>
        {option.text}
      </div>

      {/* Status Icon */}
      {Icon && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className={cn(
            'absolute bottom-3 right-3',
            'w-5 h-5 rounded-full flex items-center justify-center',
            isCorrect && 'bg-success',
            isWrong && 'bg-error'
          )}
        >
          <Icon className="w-3 h-3 text-white" strokeWidth={3} />
        </motion.div>
      )}

      {/* Selected State Indicator */}
      {selected && !Icon && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute inset-0 rounded-lg border-2 border-primary pointer-events-none"
        />
      )}
    </motion.button>
  );
};

export default AnswerOptionV2;
