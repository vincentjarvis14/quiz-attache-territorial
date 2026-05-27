import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Landmark, Building2, BookOpen, Users } from 'lucide-react';

const CoursesPage = () => {
  const navigate = useNavigate();

  const themes = [
    {
      id: 1,
      title: 'Environnement institutionnel',
      description: 'Organisation territoriale, institutions et acteurs publics de la fonction publique territoriale',
      sousThemes: 8,
      totalQuestions: 185,
      icon: Landmark,
      gradient: 'from-violet-500 to-purple-600',
      image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80',
    },
    {
      id: 2,
      title: 'Gestion des politiques publiques',
      description: 'Finances publiques, ressources humaines et action publique locale',
      sousThemes: 6,
      totalQuestions: 145,
      icon: Building2,
      gradient: 'from-emerald-500 to-teal-600',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50/50 via-white to-purple-50/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold font-heading mb-2">
            Tous les thèmes
          </h1>
          <p className="text-muted-foreground">
            Explore les différents domaines du concours d'Attaché Territorial
          </p>
        </motion.div>

        {/* Themes */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {themes.map((theme, index) => {
            const Icon = theme.icon;
            return (
              <motion.div
                key={theme.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/main/learn')}
                className="bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-large transition-all duration-300 cursor-pointer group"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Image */}
                  <div className="relative w-full sm:w-64 h-48 sm:h-auto overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-purple-600/20 z-10" />
                    <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-80 z-10`} />
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                      <Icon className="w-16 h-16 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6">
                    <h2 className="text-2xl font-bold font-heading mb-2 group-hover:text-primary transition-colors">
                      {theme.title}
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      {theme.description}
                    </p>

                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
                        <BookOpen className="w-4 h-4" />
                        {theme.sousThemes} sous-thèmes
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/10 text-secondary rounded-full text-sm font-medium">
                        <Users className="w-4 h-4" />
                        {theme.totalQuestions} questions
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default CoursesPage;