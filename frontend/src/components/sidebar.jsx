import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, BookOpen, Users, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const navigate = useNavigate();
  const [activeRoute, setActiveRoute] = React.useState('learn');

  // Mock user data
  const user = {
    name: 'Jean Dupont',
    email: 'jean@example.fr',
    avatar: '',
    points: 1250,
    streak: 7,
    hearts: 5,
  };

  const navItems = [
    { id: 'learn', label: 'Apprendre', icon: BookOpen, route: '/main/learn' },
    { id: 'courses', label: 'Thèmes', icon: Users, route: '/main/courses' },
  ];

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed left-0 top-0 h-screen w-64 glass-strong border-r border-border flex flex-col z-50"
    >
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-purple rounded-xl blur-md opacity-70" />
            <div className="relative w-12 h-12 bg-gradient-purple rounded-xl flex items-center justify-center shadow-medium">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold font-heading">Quiz Attaché</h1>
            <p className="text-xs text-muted-foreground">Territorial</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeRoute === item.id;
          return (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.02, x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setActiveRoute(item.id);
                navigate(item.route);
              }}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-foreground hover:bg-muted'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      <Separator />

      {/* User Profile */}
      <div className="p-4">
        <div className="glass rounded-xl p-4 mb-3">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="bg-gradient-purple text-white font-semibold">
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <span className="font-medium text-primary">{user.points}</span>
              <span className="text-muted-foreground">pts</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span>🔥</span>
                <span className="font-medium">{user.streak}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>❤️</span>
                <span className="font-medium">{user.hearts}</span>
              </div>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start text-muted-foreground hover:text-destructive"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Déconnexion
        </Button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;