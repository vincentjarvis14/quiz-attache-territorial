import React from 'react';
import { motion } from 'framer-motion';

/**
 * Premium 2026 Pedagogical Question Display
 * - Clean, centered, focused presentation
 * - Maximum readability with generous whitespace
 * - No decorative elements - pure content focus
 */
const QuestionCardV2 = ({ question, questionNumber }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="max-w-2xl mx-auto"
    >
      {/* Question Number Badge - Subtle */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium tracking-wide">
          Question {questionNumber}
        </div>
      </div>

      {/* Question Text - Premium Typography */}
      <div className="bg-card rounded-lg border border-border p-8 shadow-sm">
        <h2 className="text-headline text-center text-foreground leading-relaxed">
          {question}
        </h2>
      </div>
    </motion.div>
  );
};

export default QuestionCardV2;
