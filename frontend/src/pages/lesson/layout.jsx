import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function LessonLayout() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-br from-violet-50/30 via-white to-purple-50/30"
    >
      <Outlet />
    </motion.div>
  );
}