import React from 'react';
import { motion } from 'framer-motion';
import { X, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const QuizHeader = ({ progress, hearts, questionNumber, totalQuestions, onExit }) => {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 glass-strong border-b border-border"
    >
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          {/* Exit Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onExit}
            className="hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Hearts */}
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 1 }}
                animate={
                  i < hearts
                    ? { scale: [1, 1.2, 1] }
                    : { scale: 0.8, opacity: 0.3 }
                }
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Heart
                  className={`w-6 h-6 ${
                    i < hearts
                      ? 'fill-red-500 text-red-500'
                      : 'fill-gray-300 text-gray-300'
                  }`}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              Question {questionNumber}/{totalQuestions}
            </Badge>
            <span className="text-xs font-medium text-muted-foreground">
              {Math.round(progress)}%
            </span>
          </div>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.3 }}
            style={{ transformOrigin: 'left' }}
          >
            <Progress
              value={progress}
              className="h-3"
            />
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};

export default QuizHeader;