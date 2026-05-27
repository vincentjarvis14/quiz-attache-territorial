import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GraduationCap, BookOpen, TrendingUp, Shield, ArrowRight, Landmark, Building2 } from 'lucide-react';

const MarketingPage = () => {
  const navigate = useNavigate();

  const themes = [
    {
      id: 1,
      icon: Landmark,
      title: 'Environnement institutionnel',
      description: 'Organisation territoriale, institutions et acteurs publics',
      sousThemes: 8,
      gradient: 'from-violet-500 to-purple-600',
    },
    {
      id: 2,
      icon: Building2,
      title: 'Gestion des politiques publiques',
      description: 'Finances, ressources humaines et action publique',
      sousThemes: 6,
      gradient: 'from-emerald-500 to-teal-600',
    },
  ];

  const features = [
    {
      icon: BookOpen,
      title: '400+ Questions',
      description: 'Bibliothèque complète de QCM actualisés',
      color: 'text-violet-600',
      bgColor: 'bg-violet-100',
    },
    {
      icon: TrendingUp,
      title: 'Suivi intelligent',
      description: 'Analysez votre progression en temps réel',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      icon: Shield,
      title: 'Sources officielles',
      description: 'Contenus validés par des experts',
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
  ];

  // Floating shapes for background
  const floatingShapes = [
    { size: 300, delay: 0, duration: 6 },
    { size: 200, delay: 1, duration: 8 },
    { size: 250, delay: 2, duration: 7 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 overflow-hidden relative">
      {/* Floating Background Shapes */}
      {floatingShapes.map((shape, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full opacity-10"
          style={{
            width: shape.size,
            height: shape.size,
            left: `${20 + i * 30}%`,
            top: `${10 + i * 20}%`,
            background: i % 2 === 0 ? 'linear-gradient(135deg, #7C3AED, #A78BFA)' : 'linear-gradient(135deg, #10B981, #34D399)',
          }}
          animate={{
            y: [0, -30, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: shape.duration,
            delay: shape.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="px-4 sm:px-6 py-16 sm:py-24"
        >
          <div className="max-w-[1056px] mx-auto">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="flex justify-center mb-8"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-purple rounded-3xl blur-xl opacity-50" />
                <div className="relative bg-gradient-purple rounded-3xl p-6 shadow-large">
                  <GraduationCap className="w-16 h-16 text-white" />
                </div>
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center mb-6 font-heading"
            >
              <span className="gradient-text">Quiz Attaché Territorial</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-base sm:text-lg text-foreground/80 text-center max-w-2xl mx-auto mb-12"
            >
              Préparez efficacement le concours d'Attaché Territorial avec des QCM experts
            </motion.p>

            {/* Theme Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid sm:grid-cols-2 gap-6 mb-12 max-w-4xl mx-auto"
            >
              {themes.map((theme, index) => {
                const Icon = theme.icon;
                return (
                  <motion.div
                    key={theme.id}
                    initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    whileHover={{ scale: 1.03, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    className="glass rounded-2xl p-6 cursor-pointer group hover:shadow-large transition-all duration-300"
                    onClick={() => navigate('/main/learn')}
                  >
                    <div className="flex flex-col h-full">
                      {/* Icon */}
                      <div className="mb-4">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-medium group-hover:shadow-large transition-all`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                      </div>

                      {/* Content */}
                      <h3 className="text-xl font-semibold mb-2 font-heading text-foreground group-hover:text-primary transition-colors">
                        {theme.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 flex-grow">
                        {theme.description}
                      </p>

                      {/* Badge */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium px-3 py-1 bg-primary/10 text-primary rounded-full border border-primary/20">
                          {theme.sousThemes} sous-thèmes
                        </span>
                        <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button
                size="xl"
                variant="premium"
                onClick={() => navigate('/auth/sign-up')}
                className="group min-w-[240px]"
              >
                Commencer gratuitement
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="xl"
                variant="outline"
                onClick={() => navigate('/auth/sign-in')}
                className="min-w-[240px]"
              >
                J'ai déjà un compte
              </Button>
            </motion.div>
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="px-4 sm:px-6 py-12 pb-24"
        >
          <div className="max-w-[1056px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="grid sm:grid-cols-3 gap-6"
            >
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 + index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="bg-card rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300"
                  >
                    <div className={`w-14 h-14 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4`}>
                      <Icon className={`w-7 h-7 ${feature.color}`} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 font-heading">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default MarketingPage;