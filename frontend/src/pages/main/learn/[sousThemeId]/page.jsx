import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Zap, ArrowLeft, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const SousThemeDetailPage = () => {
  const { sousThemeId } = useParams();
  const navigate = useNavigate();

  // Mock theme data
  const theme = {
    id: sousThemeId,
    title: 'Organisation territoriale',
    description: 'Structure et organisation des collectivités territoriales en France',
    totalQuestions: 25,
    completedQuestions: 20,
    correctAnswers: 16,
    status: 'in-progress',
  };

  const progress = (theme.completedQuestions / theme.totalQuestions) * 100;
  const accuracy = theme.completedQuestions > 0 
    ? (theme.correctAnswers / theme.completedQuestions) * 100 
    : 0;

  const getStatusMessage = () => {
    if (accuracy >= 90) return { text: 'Excellent travail !', icon: '🎉', color: 'text-emerald-600' };
    if (accuracy >= 70) return { text: 'Bon progrès !', icon: '👍', color: 'text-violet-600' };
    if (accuracy >= 50) return { text: 'Continue comme ça !', icon: '💪', color: 'text-amber-600' };
    return { text: 'Persiste, tu vas y arriver !', icon: '🚀', color: 'text-blue-600' };
  };

  const statusMessage = getStatusMessage();

  const gameModes = [
    {
      id: 'libre',
      title: 'Mode Libre',
      description: 'Entraîne-toi à ton rythme sans limite de temps',
      icon: BookOpen,
      gradient: 'from-violet-500 to-purple-600',
      bgLight: 'bg-violet-50',
      borderColor: 'border-violet-300',
      features: [
        'Pas de limite de temps',
        'Aucune pénalité pour les erreurs',
        'Progression sauvegardée',
      ],
    },
    {
      id: 'challenge',
      title: 'Mode Challenge',
      description: 'Teste tes connaissances avec des contraintes réelles',
      icon: Zap,
      gradient: 'from-emerald-500 to-teal-600',
      bgLight: 'bg-emerald-50',
      borderColor: 'border-emerald-300',
      features: [
        'Chrono activé',
        'Système de vies',
        'Combo et streaks',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50/50 via-white to-purple-50/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/main/learn')}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>

          <div className="glass rounded-2xl p-6 sm:p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold font-heading mb-2">
                  {theme.title}
                </h1>
                <p className="text-muted-foreground mb-3">{theme.description}</p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  <TrendingUp className="w-4 h-4" />
                  {theme.totalQuestions} questions disponibles
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Game Modes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-8"
        >
          {gameModes.map((mode, index) => {
            const Icon = mode.icon;
            return (
              <motion.div
                key={mode.id}
                initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/lesson', { state: { theme, mode: mode.id } })}
                className={cn(
                  'bg-card rounded-2xl p-6 cursor-pointer group',
                  'border-2 shadow-soft hover:shadow-large',
                  'transition-all duration-300',
                  mode.borderColor
                )}
              >
                <div className={cn(
                  'w-14 h-14 rounded-xl flex items-center justify-center mb-4',
                  `bg-gradient-to-br ${mode.gradient}`,
                  'shadow-md group-hover:shadow-lg transition-all'
                )}>
                  <Icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-xl font-semibold font-heading mb-2 group-hover:text-primary transition-colors">
                  {mode.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {mode.description}
                </p>

                <ul className="space-y-2">
                  {mode.features.map((feature, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Progress Section */}
        {theme.completedQuestions > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-6 border-2 border-primary/20"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{statusMessage.icon}</span>
              <div>
                <h3 className="text-lg font-semibold font-heading">Ta progression</h3>
                <p className={cn('text-sm font-medium', statusMessage.color)}>
                  {statusMessage.text}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progression globale</span>
                  <span className="font-semibold">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-3" />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">
                    {theme.correctAnswers}/{theme.completedQuestions}
                  </p>
                  <p className="text-xs text-muted-foreground">Bonnes réponses</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-600">
                    {Math.round(accuracy)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Taux de réussite</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SousThemeDetailPage;