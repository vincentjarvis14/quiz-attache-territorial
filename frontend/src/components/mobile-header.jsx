import React from 'react';
import { motion } from 'framer-motion';
import { Menu, X, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BookOpen, Users, LogOut } from 'lucide-react';

const MobileHeader = () => {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  const user = {
    name: 'Jean Dupont',
    points: 1250,
    streak: 7,
    hearts: 5,
  };

  const navItems = [
    { id: 'learn', label: 'Apprendre', icon: BookOpen, route: '/main/learn' },
    { id: 'courses', label: 'Thèmes', icon: Users, route: '/main/courses' },
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 glass-strong border-b border-border"
    >
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-purple rounded-xl flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold font-heading">Quiz Attaché</span>
        </div>

        {/* User Stats */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <span>🔥 {user.streak}</span>
            <span>❤️ {user.hearts}</span>
          </div>

          {/* Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-6 border-b">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-gradient-purple text-white font-semibold">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.points} points</p>
                    </div>
                  </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-4 space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          navigate(item.route);
                          setOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-colors"
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t">
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/')}
                    className="w-full justify-start text-destructive"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Déconnexion
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
};

export default MobileHeader;