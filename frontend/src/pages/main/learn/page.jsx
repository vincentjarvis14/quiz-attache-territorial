import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Landmark, Building2, Scale, FileText, CheckCircle2, Clock, AlertCircle, ChevronRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Mock data for sub-themes
const sousThemes = [
  {
    id: 1,
    title: 'Organisation territoriale',
    description: 'Structure et organisation des collectivités territoriales en France',
    totalQuestions: 25,
    completedQuestions: 20,
    correctAnswers: 16,
    status: 'in-progress', // not-started, in-progress, to-review, mastered
    iconIndex: 0,
  },
  {
    id: 2,
    title: 'Institutions européennes',
    description: 'Fonctionnement et rôles des institutions de l’Union Européenne',
    totalQuestions: 30,
    completedQuestions: 30,
    correctAnswers: 27,
    status: 'mastered',
    iconIndex: 1,
  },
  {
    id: 3,
    title: 'Démocratie locale',
    description: 'Principes et pratiques de la démocratie au niveau local',
    totalQuestions: 20,
    completedQuestions: 12,
    correctAnswers: 8,
    status: 'to-review',
    iconIndex: 2,
  },
  {
    id: 4,
    title: 'Finances publiques',
    description: 'Budget, fiscalité et gestion financière des collectivités',
    totalQuestions: 35,
    completedQuestions: 0,
    correctAnswers: 0,
    status: 'not-started',
    iconIndex: 3,
  },
  {
    id: 5,
    title: 'Fonction publique territoriale',
    description: 'Statut, carrière et gestion des agents territoriaux',
    totalQuestions: 28,
    completedQuestions: 15,
    correctAnswers: 12,
    status: 'in-progress',
    iconIndex: 4,
  },
  {
    id: 6,
    title: 'Compétences territoriales',
    description: 'Répartition des compétences entre les différents niveaux',
    totalQuestions: 22,
    completedQuestions: 0,
    correctAnswers: 0,
    status: 'not-started',
    iconIndex: 0,
  },
];

const icons = [BookOpen, Landmark, Building2, Scale, FileText];

const getStatusConfig = (status) => {
  switch (status) {
    case 'not-started':
      return {
        label: 'Pas commencé',
        color: 'bg-gray-500',
        borderColor: 'border-gray-300',
        icon: Clock,
        badgeVariant: 'secondary',
      };
    case 'in-progress':
      return {
        label: 'En cours',
        color: 'bg-violet-500',
        borderColor: 'border-violet-300',
        icon: AlertCircle,
        badgeVariant: 'default',
      };
    case 'to-review':
      return {
        label: 'À réviser',
        color: 'bg-amber-500',
        borderColor: 'border-amber-300',
        icon: AlertCircle,
        badgeVariant: 'default',
      };
    case 'mastered':
      return {
        label: 'Maîtrisé',
        color: 'bg-emerald-500',
        borderColor: 'border-emerald-300',
        icon: CheckCircle2,
        badgeVariant: 'default',
      };
    default:
      return {
        label: 'Pas commencé',
        color: 'bg-gray-500',
        borderColor: 'border-gray-300',
        icon: Clock,
        badgeVariant: 'secondary',
      };
  }
};

const LearnPage = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50/50 via-white to-purple-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold font-heading mb-2">
            Choisis ton sous-thème
          </h1>
          <p className="text-muted-foreground">
            Sélectionne un sujet pour commencer ton entraînement
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {sousThemes.map((theme, index) => {
            const Icon = icons[theme.iconIndex % icons.length];
            const statusConfig = getStatusConfig(theme.status);
            const StatusIcon = statusConfig.icon;
            const progress = theme.totalQuestions > 0 
              ? (theme.completedQuestions / theme.totalQuestions) * 100 
              : 0;

            return (
              <motion.div
                key={theme.id}
                variants={cardVariants}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/main/learn/${theme.id}`)}
                className={cn(
                  'bg-card rounded-2xl p-6 cursor-pointer group',
                  'border-t-4 shadow-soft hover:shadow-large',
                  'transition-all duration-300',
                  statusConfig.borderColor
                )}
              >
                {/* Icon and Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="relative">
                    <div className={cn(
                      'w-14 h-14 rounded-xl flex items-center justify-center',
                      'bg-gradient-to-br from-violet-500 to-purple-600',
                      'shadow-md group-hover:shadow-lg transition-all'
                    )}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  
                  <Badge 
                    variant={statusConfig.badgeVariant}
                    className="flex items-center gap-1.5 px-3 py-1"
                  >
                    <StatusIcon className="w-3 h-3" />
                    <span className="text-xs">{statusConfig.label}</span>
                  </Badge>
                </div>

                {/* Title and Description */}
                <h3 className="text-lg font-semibold font-heading mb-2 text-foreground group-hover:text-primary transition-colors">
                  {theme.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {theme.description}
                </p>

                {/* Progress Bar */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {theme.completedQuestions} / {theme.totalQuestions} questions
                    </span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress 
                    value={progress} 
                    className="h-2"
                  />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  {theme.completedQuestions > 0 ? (
                    <span className="text-xs text-muted-foreground">
                      {theme.correctAnswers}/{theme.completedQuestions} bonnes réponses
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Commencer
                    </span>
                  )}
                  <ChevronRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default LearnPage;