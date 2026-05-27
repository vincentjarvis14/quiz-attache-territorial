import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '@/components/sidebar';
import MobileHeader from '@/components/mobile-header';

export default function MainLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <MobileHeader 
          isOpen={mobileSidebarOpen}
          onToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="lg:pl-64"
      >
        <Outlet />
      </motion.div>
    </div>
  );
}