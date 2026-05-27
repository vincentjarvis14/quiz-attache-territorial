import React from 'react';
import { motion } from 'framer-motion';
import { X, Heart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * V3 Professional Quiz Header
 * Minimal top bar with essential info
 */
const ProfessionalQuizHeader = ({ 
  progress, 
  hearts, 
  questionNumber, 
  totalQuestions,
  difficulty = 2,
  onExit 
}) => {
  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-40 bg-card border-b border-border"
    >
      <div className="max-w-5xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          {/* Left: Exit */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onExit}
            className="text-muted-foreground hover:text-foreground h-9 px-3"
          >
            <X className="w-4 h-4 mr-2" />
            <span className="text-sm">Quitter</span>
          </Button>

          {/* Center: Question counter & Difficulty */}
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-muted-foreground">
              Question <span className="text-foreground font-semibold">{questionNumber}</span> / {totalQuestions}
            </div>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3].map((level) => (
                <Star
                  key={level}
                  className={cn(
                    'w-3.5 h-3.5',
                    level <= difficulty
                      ? 'fill-[hsl(42,90%,55%)] text-[hsl(42,90%,55%)]'
                      : 'fill-none text-muted'
                  )}
                />
              ))}
            </div>
          </div>

          {/* Right: Hearts */}
          <div className="flex items-center gap-1.5">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 1 }}
                animate={i < hearts ? { scale: [1, 1.15, 1] } : { scale: 0.85, opacity: 0.3 }}
                transition={{ duration: 0.2, delay: i * 0.02 }}
              >
                <Heart
                  className={cn(
                    'w-4 h-4 transition-colors',
                    i < hearts
                      ? 'fill-[hsl(0,40%,50%)] text-[hsl(0,40%,50%)]'
                      : 'fill-muted text-muted'
                  )}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-y-0 left-0 bg-[hsl(215,25%,35%)] rounded-full"
          />
        </div>
      </div>
    </motion.header>
  );
};

export default ProfessionalQuizHeader;
