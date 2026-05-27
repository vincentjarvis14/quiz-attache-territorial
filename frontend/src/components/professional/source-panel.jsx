import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, BookOpen, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/**
 * V3 Source Panel - Right sidebar showing PDF sources
 * Legal professional feature - cite sources
 */
const SourcePanel = ({ 
  sourceFile, 
  sourceSection, 
  explanation,
  isCorrect,
  showContent 
}) => {
  // Mock source content
  const sourceContent = `La loi n° 2015-991 du 7 août 2015 portant nouvelle organisation territoriale de la République (dite loi NOTRe) a profondément réformé l'organisation des compétences entre les collectivités territoriales.

L'article 15 de cette loi dispose que « La région est l'autorité organisatrice des transports publics de voyageurs d'intérêt régional, comprenant notamment les transports scolaires ».

Cette disposition transfère aux régions la compétence en matière de transports scolaires, auparavant exercée par les départements.`;

  if (!showContent) {
    return (
      <div className="card-professional p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[hsl(215,25%,95%)] flex items-center justify-center">
            <FileText className="w-5 h-5 text-[hsl(215,25%,35%)]" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Sources juridiques</h3>
            <p className="text-xs text-muted-foreground">Disponibles après réponse</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-2 bg-muted rounded-full w-full" />
          <div className="h-2 bg-muted rounded-full w-5/6" />
          <div className="h-2 bg-muted rounded-full w-4/6" />
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={isCorrect ? 'correct' : 'incorrect'}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'card-professional p-6 border-l-4',
          isCorrect ? 'border-l-[hsl(145,35%,45%)]' : 'border-l-[hsl(0,40%,50%)]'
        )}
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
            isCorrect ? 'bg-[hsl(145,35%,95%)]' : 'bg-[hsl(0,40%,96%)]'
          )}>
            {isCorrect ? (
              <CheckCircle2 className="w-5 h-5 text-[hsl(145,35%,45%)]" />
            ) : (
              <XCircle className="w-5 h-5 text-[hsl(0,40%,50%)]" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">
              {isCorrect ? 'Réponse correcte' : 'Réponse incorrecte'}
            </h3>
            <p className="text-xs text-muted-foreground">
              Référence juridique
            </p>
          </div>
        </div>

        {/* Explanation */}
        {explanation && (
          <div className="mb-4 pb-4 border-b border-border">
            <p className="text-sm leading-relaxed text-foreground">
              {explanation}
            </p>
          </div>
        )}

        {/* Source Reference */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-[hsl(215,25%,35%)]" />
            <span className="text-xs font-semibold text-[hsl(215,25%,35%)]">
              {sourceFile}
            </span>
          </div>
          {sourceSection && (
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[hsl(215,25%,97%)] text-xs font-mono text-[hsl(215,25%,35%)]">
              {sourceSection}
            </div>
          )}
        </div>

        {/* Source Content - Mock */}
        <div className="source-citation p-4 rounded-lg bg-[hsl(215,15%,98%)] text-sm leading-relaxed mb-4">
          {sourceContent}
        </div>

        {/* View Full Document Button */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => {}}
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Consulter le document complet
          <ExternalLink className="w-3 h-3 ml-2" />
        </Button>
      </motion.div>
    </AnimatePresence>
  );
};

export default SourcePanel;
