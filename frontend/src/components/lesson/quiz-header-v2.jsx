import React from 'react';
import { motion } from 'framer-motion';
import { X, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Premium 2026 Pedagogical Quiz Header
 * - Sleek minimal top bar
 * - Discrete progress indicator
 * - Subtle status visualization
 */
const QuizHeaderV2 = ({ progress, hearts, questionNumber, totalQuestions, onExit }) => {
  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border"
    >
      <div className="max-w-3xl mx-auto px-6 py-4">
        {/* Top Row: Exit + Question Counter + Hearts */}
        <div className="flex items-center justify-between mb-3">
          {/* Exit Button - Minimal */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onExit}
            className="text-muted-foreground hover:text-foreground transition-colors h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
            <span className="sr-only">Quitter</span>
          </Button>

          {/* Question Counter - Discrete */}
          <div className="text-xs font-medium text-muted-foreground tracking-wide">
            {questionNumber} / {totalQuestions}
          </div>

          {/* Hearts - Minimal representation */}
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 1 }}
                animate={i < hearts ? { scale: [1, 1.1, 1] } : { scale: 0.85, opacity: 0.25 }}
                transition={{ duration: 0.2, delay: i * 0.02 }}
              >
                <Heart
                  className={cn(
                    'w-3.5 h-3.5 transition-colors duration-200',
                    i < hearts
                      ? 'fill-error text-error'
                      : 'fill-muted text-muted stroke-muted'
                  )}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Progress Bar - Minimalist */}
        <div className="relative h-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-y-0 left-0 bg-primary rounded-full"
          />
        </div>
      </div>
    </motion.header>
  );
};

export default QuizHeaderV2;
