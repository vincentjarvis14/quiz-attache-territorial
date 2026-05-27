import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * V3 Professional Answer Option
 * Clean corporate styling with subtle interactions
 */
const ProfessionalAnswerOption = ({
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
        border: 'border-[hsl(145,35%,45%)]',
        bg: 'bg-[hsl(145,35%,95%)]',
        text: 'text-foreground',
        icon: Check,
        iconBg: 'bg-[hsl(145,35%,45%)]',
      };
    }
    if (isWrong) {
      return {
        border: 'border-[hsl(0,40%,50%)]',
        bg: 'bg-[hsl(0,40%,96%)]',
        text: 'text-foreground',
        icon: X,
        iconBg: 'bg-[hsl(0,40%,50%)]',
      };
    }
    if (selected) {
      return {
        border: 'border-[hsl(215,25%,35%)]',
        bg: 'bg-[hsl(215,25%,97%)]',
        text: 'text-foreground',
        icon: null,
        iconBg: null,
      };
    }
    return {
      border: 'border-border',
      bg: 'bg-card',
      text: 'text-foreground',
      icon: null,
      iconBg: null,
    };
  };

  const state = getOptionState();
  const Icon = state.icon;
  const optionLabel = String.fromCharCode(65 + index); // A, B, C, D

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      whileHover={!disabled ? { x: 2 } : {}}
      whileTap={!disabled ? { scale: 0.99 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative group w-full text-left',
        'border-2 rounded-lg transition-all duration-200',
        'p-5 min-h-[68px]',
        'disabled:cursor-not-allowed',
        'flex items-start gap-4',
        state.border,
        state.bg,
        !disabled && !selected && !isCorrect && !isWrong && 'hover:border-[hsl(215,25%,45%)] hover:shadow-sm',
        isWrong && 'animate-gentle-shake'
      )}
    >
      {/* Option Letter */}
      <div className={cn(
        'flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center font-semibold text-sm transition-colors',
        selected || isCorrect || isWrong
          ? 'bg-foreground/10 text-foreground'
          : 'bg-muted text-muted-foreground group-hover:bg-foreground/5'
      )}>
        {optionLabel}
      </div>

      {/* Option Text */}
      <div className={cn('flex-1 pt-0.5 pr-8 leading-relaxed', state.text)}>
        {option.text}
      </div>

      {/* Status Icon */}
      {Icon && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className={cn(
            'absolute top-5 right-5',
            'w-6 h-6 rounded-md flex items-center justify-center',
            state.iconBg
          )}
        >
          <Icon className="w-4 h-4 text-white" strokeWidth={2.5} />
        </motion.div>
      )}
    </motion.button>
  );
};

export default ProfessionalAnswerOption;
