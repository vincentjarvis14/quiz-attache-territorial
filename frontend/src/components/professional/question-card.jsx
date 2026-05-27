import React from 'react';
import { motion } from 'framer-motion';
import { FileText, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * V3 Professional Question Card
 * Legal serif typography with source citation
 */
const ProfessionalQuestionCard = ({ 
  question, 
  questionNumber,
  difficulty = 2,
  sourceSection,
  sousTheme 
}) => {
  const difficultyLabel = {
    1: { text: 'Fondamental', color: 'text-[hsl(145,35%,45%)]', bg: 'bg-[hsl(145,35%,95%)]' },
    2: { text: 'Intermédiaire', color: 'text-[hsl(35,45%,50%)]', bg: 'bg-[hsl(35,45%,95%)]' },
    3: { text: 'Expert', color: 'text-[hsl(0,40%,50%)]', bg: 'bg-[hsl(0,40%,96%)]' },
  }[difficulty];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto"
    >
      {/* Metadata Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="font-normal">
            {sousTheme || 'Environnement Territorial'}
          </Badge>
          {sourceSection && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <FileText className="w-3.5 h-3.5" />
              <span>{sourceSection}</span>
            </div>
          )}
        </div>
        <Badge className={cn(difficultyLabel.bg, difficultyLabel.color, 'border-0')}>
          {difficultyLabel.text}
        </Badge>
      </div>

      {/* Question Card */}
      <div className="card-professional p-8">
        {/* Question Number Badge */}
        <div className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-md bg-muted">
          <AlertCircle className="w-3.5 h-3.5 text-[hsl(215,25%,35%)]" />
          <span className="text-xs font-medium text-muted-foreground">
            Question {questionNumber}
          </span>
        </div>

        {/* Question Text - Serif Legal Style */}
        <div className="legal-text">
          {question}
        </div>
      </div>
    </motion.div>
  );
};

export default ProfessionalQuestionCard;
