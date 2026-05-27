import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Target, 
  Award, 
  Clock,
  BookOpen,
  CheckCircle2,
  XCircle,
  TrendingDown,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * V3 Professional Dashboard
 * KPIs and performance metrics for legal professionals
 */
const DashboardPage = () => {
  // Mock data (will be replaced with real queries)
  const stats = {
    totalPoints: 2450,
    pointsChange: +180,
    questionsAnswered: 142,
    questionsChange: +23,
    successRate: 78,
    rateChange: +5,
    currentStreak: 12,
    streakChange: +2,
    totalCorrect: 111,
    totalWrong: 31,
    averageTime: '2m 15s',
    lastSession: '2 heures',
  };

  const recentActivity = [
    {
      id: 1,
      matiere: 'Environnement Territorial',
      sousTheme: 'Grands principes de l\'État',
      score: 8,
      total: 10,
      date: 'Aujourd\'hui 14:30',
      duration: '8 min',
    },
    {
      id: 2,
      matiere: 'Urbanisme',
      sousTheme: 'Plan Local d\'Urbanisme (PLU)',
      score: 6,
      total: 10,
      date: 'Aujourd\'hui 10:15',
      duration: '12 min',
    },
    {
      id: 3,
      matiere: 'Environnement Territorial',
      sousTheme: 'Décentralisation',
      score: 9,
      total: 10,
      date: 'Hier 16:45',
      duration: '7 min',
    },
  ];

  const weakAreas = [
    { theme: 'Loi Littoral', correct: 45, total: 60, rate: 75 },
    { theme: 'Contentieux administratif', correct: 12, total: 18, rate: 67 },
    { theme: 'SCoT', correct: 8, total: 12, rate: 67 },
  ];

  const KPICard = ({ icon: Icon, label, value, change, trend, iconColor }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card-professional p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center',
          iconColor
        )}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {change !== undefined && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-medium',
            trend === 'up' ? 'text-[hsl(145,35%,45%)]' : 'text-[hsl(0,40%,50%)]'
          )}>
            {trend === 'up' ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{change > 0 ? '+' : ''}{change}</span>
          </div>
        )}
      </div>
      <p className="text-2xl font-semibold mb-1">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-semibold mb-2">Tableau de bord</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble de votre progression et performances
          </p>
        </motion.div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            icon={TrendingUp}
            label="Points totaux"
            value={stats.totalPoints.toLocaleString()}
            change={stats.pointsChange}
            trend="up"
            iconColor="bg-[hsl(42,90%,55%)]"
          />
          <KPICard
            icon={BookOpen}
            label="Questions répondues"
            value={stats.questionsAnswered}
            change={stats.questionsChange}
            trend="up"
            iconColor="bg-[hsl(215,25%,35%)]"
          />
          <KPICard
            icon={Target}
            label="Taux de réussite"
            value={`${stats.successRate}%`}
            change={stats.rateChange}
            trend="up"
            iconColor="bg-[hsl(145,35%,45%)]"
          />
          <KPICard
            icon={Award}
            label="Série actuelle"
            value={`${stats.currentStreak} jours`}
            change={stats.streakChange}
            trend="up"
            iconColor="bg-[hsl(350,45%,42%)]"
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity - 2/3 width */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 card-professional p-6"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              Activité récente
            </h2>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + index * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm mb-1">{activity.sousTheme}</p>
                    <p className="text-xs text-muted-foreground mb-2">{activity.matiere}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {activity.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {activity.duration}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn(
                      'text-lg font-semibold mb-1',
                      activity.score / activity.total >= 0.8 
                        ? 'text-[hsl(145,35%,45%)]' 
                        : activity.score / activity.total >= 0.6
                        ? 'text-[hsl(35,45%,50%)]'
                        : 'text-[hsl(0,40%,50%)]'
                    )}>
                      {activity.score}/{activity.total}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {Math.round((activity.score / activity.total) * 100)}%
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Performance Summary - 1/3 width */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Quick Stats */}
            <div className="card-professional p-6">
              <h2 className="text-lg font-semibold mb-4">Statistiques</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[hsl(145,35%,95%)] flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-[hsl(145,35%,45%)]" />
                    </div>
                    <span className="text-sm text-muted-foreground">Correctes</span>
                  </div>
                  <span className="text-lg font-semibold">{stats.totalCorrect}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[hsl(0,40%,96%)] flex items-center justify-center">
                      <XCircle className="w-4 h-4 text-[hsl(0,40%,50%)]" />
                    </div>
                    <span className="text-sm text-muted-foreground">Incorrectes</span>
                  </div>
                  <span className="text-lg font-semibold">{stats.totalWrong}</span>
                </div>
                <div className="pt-3 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Temps moyen</span>
                    <span className="text-sm font-semibold">{stats.averageTime}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Weak Areas */}
            <div className="card-professional p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-[hsl(350,45%,42%)]" />
                À améliorer
              </h2>
              <div className="space-y-3">
                {weakAreas.map((area, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{area.theme}</span>
                      <span className="text-xs text-muted-foreground">
                        {area.correct}/{area.total}
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[hsl(350,45%,42%)] transition-all duration-300"
                        style={{ width: `${area.rate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
