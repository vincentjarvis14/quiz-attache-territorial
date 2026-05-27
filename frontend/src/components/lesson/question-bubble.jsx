import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

const QuestionBubble = ({ question }) => {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200 }}
      className="flex flex-col items-center"
    >
      {/* Mascot Icon */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-purple rounded-2xl blur-xl opacity-50" />
          <div className="relative w-16 h-16 bg-gradient-purple rounded-2xl flex items-center justify-center shadow-large">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
        </div>
      </motion.div>

      {/* Question Bubble */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative max-w-[600px] w-full"
      >
        {/* Speech bubble tail */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-card rotate-45 border-l border-t border-border" />
        
        {/* Bubble content */}
        <div className="relative bg-card rounded-2xl p-6 sm:p-8 shadow-medium border border-border">
          <p className="text-lg sm:text-xl font-semibold font-heading text-foreground text-center leading-relaxed">
            {question}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QuestionBubble;