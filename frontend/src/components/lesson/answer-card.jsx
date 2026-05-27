import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const AnswerCard = ({
  option,
  index,
  selected,
  isCorrect,
  isWrong,
  disabled,
  onClick,
}) => {
  const getCardState = () => {
    if (isCorrect) {
      return {
        border: 'border-emerald-500',
        bg: 'bg-emerald-50',
        borderBottom: 'border-b-emerald-600',
        icon: Check,
        iconBg: 'bg-emerald-500',
      };
    }
    if (isWrong) {
      return {
        border: 'border-red-500',
        bg: 'bg-red-50',
        borderBottom: 'border-b-red-600',
        icon: X,
        iconBg: 'bg-red-500',
      };
    }
    if (selected) {
      return {
        border: 'border-primary',
        bg: 'bg-primary/5',
        borderBottom: 'border-b-primary',
        icon: null,
        iconBg: 'bg-primary',
      };
    }
    return {
      border: 'border-border',
      bg: 'bg-card',
      borderBottom: 'border-b-gray-300',
      icon: null,
      iconBg: 'bg-muted',
    };
  };

  const state = getCardState();
  const Icon = state.icon;
  const keyboardShortcut = index + 1;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative group p-5 rounded-xl border-2 transition-all duration-200',
        'border-b-4 cursor-pointer text-left',
        'disabled:cursor-not-allowed',
        state.border,
        state.bg,
        state.borderBottom,
        !disabled && !selected && 'hover:bg-primary/5 hover:border-primary/50',
        isWrong && 'animate-shake'
      )}
    >
      {/* Keyboard Shortcut Badge */}
      <Badge
        variant="secondary"
        className={cn(
          'absolute top-3 right-3 text-xs font-mono transition-colors',
          selected && 'bg-primary text-primary-foreground'
        )}
      >
        {keyboardShortcut}
      </Badge>

      {/* Option Text */}
      <div className="pr-10">
        <p className="font-medium text-foreground leading-relaxed">
          {option.text}
        </p>
      </div>

      {/* Status Icon */}
      {Icon && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className={cn(
            'absolute bottom-3 right-3 w-6 h-6 rounded-full',
            'flex items-center justify-center',
            state.iconBg
          )}
        >
          <Icon className="w-4 h-4 text-white" />
        </motion.div>
      )}

      {/* Selected Indicator (no icon yet) */}
      {selected && !Icon && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute inset-0 rounded-xl border-2 border-primary pointer-events-none"
          style={{ boxShadow: '0 0 0 4px hsl(var(--primary) / 0.1)' }}
        />
      )}
    </motion.button>
  );
};

export default AnswerCard;