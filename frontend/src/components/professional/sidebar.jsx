import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  History, 
  TrendingUp,
  LogOut,
  Award,
  Heart,
  Flame
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

/**
 * V3 Professional Sidebar
 * Corporate legal platform aesthetic
 * Fixed left navigation with user stats
 */
const ProfessionalSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeRoute, setActiveRoute] = React.useState('dashboard');

  // Mock user data (will be replaced with real data)
  const user = {
    name: 'Marie Laurent',
    email: 'marie.laurent@example.fr',
    avatar: '',
    role: 'Candidat Master 2',
    points: 2450,
    streak: 12,
    hearts: 5,
    successRate: 78,
  };

  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Tableau de bord', 
      icon: LayoutDashboard, 
      route: '/main/dashboard' 
    },
    { 
      id: 'matieres', 
      label: 'Matières', 
      icon: BookOpen, 
      route: '/main/courses' 
    },
    { 
      id: 'history', 
      label: 'Historique', 
      icon: History, 
      route: '/main/history' 
    },
  ];

  const handleLogout = () => {
    navigate('/');
  };

  React.useEffect(() => {
    const path = location.pathname;
    if (path.includes('dashboard')) setActiveRoute('dashboard');
    else if (path.includes('courses') || path.includes('learn')) setActiveRoute('matieres');
    else if (path.includes('history')) setActiveRoute('history');
  }, [location]);

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed left-0 top-0 h-screen w-72 bg-card border-r border-border flex flex-col z-50"
    >
      {/* Header / Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[hsl(215,25%,35%)] to-[hsl(350,45%,42%)] flex items-center justify-center shadow-md">
            <Award className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight">
              Quiz Attaché
            </h1>
            <p className="text-xs text-muted-foreground">Territorial</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeRoute === item.id;
          return (
            <motion.button
              key={item.id}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setActiveRoute(item.id);
                navigate(item.route);
              }}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-2.5 rounded-md transition-all duration-200 text-sm font-medium',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-foreground hover:bg-muted'
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      <Separator />

      {/* User Stats Card */}
      <div className="p-4">
        <div className="card-professional p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-border">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-[hsl(215,25%,35%)] to-[hsl(350,45%,42%)] text-white text-sm font-semibold">
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.role}</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="w-3 h-3 text-[hsl(42,90%,55%)]" />
                <span className="text-xs font-semibold text-foreground">{user.points}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">Points</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Flame className="w-3 h-3 text-[hsl(0,40%,50%)]" />
                <span className="text-xs font-semibold text-foreground">{user.streak}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">Série</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Heart className="w-3 h-3 text-[hsl(0,40%,50%)]" />
                <span className="text-xs font-semibold text-foreground">{user.hearts}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">Vies</p>
            </div>
          </div>

          {/* Success Rate */}
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Taux de réussite</span>
              <span className="text-xs font-semibold text-[hsl(145,35%,45%)]">
                {user.successRate}%
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-[hsl(145,35%,45%)] transition-all duration-300"
                style={{ width: `${user.successRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full mt-3 justify-start text-muted-foreground hover:text-foreground"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Déconnexion
        </Button>
      </div>
    </motion.aside>
  );
};

export default ProfessionalSidebar;
