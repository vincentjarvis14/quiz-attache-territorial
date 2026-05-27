import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Trophy,
  Star,
  Target,
  CheckCircle2,
  XCircle,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const ResultScreen = ({ score, total, points, wrongAnswers, onContinue, onReview }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [animatedPoints, setAnimatedPoints] = useState(0);
  
  const percentage = (score / total) * 100;

  // Animate score counter
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = score / steps;
    const pointsIncrement = points / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setAnimatedScore(Math.min(Math.round(currentStep * increment), score));
      setAnimatedPoints(Math.min(Math.round(currentStep * pointsIncrement), points));
      
      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score, points]);

  const getResultConfig = () => {
    if (percentage >= 80) {
      return {
        icon: Trophy,
        emoji: '🎉',
        title: 'Félicitations !',
        message: 'Excellente performance ! Tu maîtrises parfaitement ce sujet.',
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-100',
        badgeText: 'Excellent',
      };
    }
    if (percentage >= 60) {
      return {
        icon: Star,
        emoji: '👍',
        title: 'Bon travail !',
        message: 'Tu es sur la bonne voie. Continue tes efforts !',
        color: 'text-violet-600',
        bgColor: 'bg-violet-100',
        badgeText: 'Bien',
      };
    }
    return {
      icon: Target,
      emoji: '💪',
      title: 'Continue comme ça !',
      message: 'Chaque erreur est une opportunité d’apprendre. Persiste !',
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
      badgeText: 'À améliorer',
    };
  };

  const config = getResultConfig();
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-violet-50/50 via-white to-purple-50/50"
    >
      <div className="w-full max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="flex flex-col items-center mb-8"
        >
          <div className={`w-24 h-24 rounded-full ${config.bgColor} flex items-center justify-center mb-4`}>
            <Icon className={`w-12 h-12 ${config.color}`} />
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold font-heading mb-2 text-center"
          >
            {config.emoji} {config.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground text-center max-w-md"
          >
            {config.message}
          </motion.p>
        </motion.div>

        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-8 mb-6 border-2 border-primary/20"
        >
          {/* Main Score */}
          <div className="text-center mb-6">
            <motion.p
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.6 }}
              className="text-7xl font-bold gradient-text mb-2"
            >
              {animatedScore}/{total}
            </motion.p>
            <Badge className={cn('text-sm px-4 py-1', config.bgColor, config.color)}>
              {config.badgeText}
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Progression</span>
              <span className="text-sm font-semibold">{Math.round(percentage)}%</span>
            </div>
            <Progress value={percentage} className="h-4" />
          </div>

          <Separator className="my-6" />

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-emerald-50 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-emerald-600">{score}</p>
              <p className="text-xs text-muted-foreground">Bonnes réponses</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-xl">
              <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-600">{total - score}</p>
              <p className="text-xs text-muted-foreground">Erreurs</p>
            </div>
          </div>

          {/* Points */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 1 }}
            className="mt-6 p-4 bg-gradient-purple rounded-xl text-center"
          >
            <p className="text-white text-sm mb-1">Points gagnés</p>
            <p className="text-white text-3xl font-bold">+{animatedPoints}</p>
          </motion.div>
        </motion.div>

        {/* Wrong Answers Section */}
        {wrongAnswers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-card rounded-2xl p-6 mb-6 shadow-soft"
          >
            <h3 className="text-lg font-semibold font-heading mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Tes erreurs
            </h3>
            <div className="space-y-4">
              {wrongAnswers.map((item, index) => (
                <div key={index} className="border-l-4 border-red-500 pl-4 py-2">
                  <p className="text-sm font-medium mb-2">{item.question}</p>
                  <div className="space-y-1 text-xs">
                    <p className="text-red-600">
                      <XCircle className="w-3 h-3 inline mr-1" />
                      Ta réponse : {item.userAnswer}
                    </p>
                    <p className="text-emerald-600">
                      <CheckCircle2 className="w-3 h-3 inline mr-1" />
                      Bonne réponse : {item.correctAnswer}
                    </p>
                    <p className="text-muted-foreground italic mt-2">
                      {item.explanation}
                    </p>
                    <p className="text-xs text-primary mt-1">
                      📄 Source : {item.sourceFile}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Button
            variant="outline"
            size="lg"
            onClick={onContinue}
            className="flex-1"
          >
            Retour à l'apprentissage
          </Button>
          {wrongAnswers.length > 0 && (
            <Button
              variant="premium"
              size="lg"
              onClick={onReview}
              className="flex-1 group"
            >
              Revoir les erreurs
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

// Missing import
import { cn } from '@/lib/utils';

export default ResultScreen;