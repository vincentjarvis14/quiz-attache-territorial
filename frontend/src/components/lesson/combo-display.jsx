import React from 'react';
import { motion } from 'framer-motion';

const ComboDisplay = ({ combo }) => {
  const getComboConfig = () => {
    if (combo >= 10) {
      return {
        text: 'ON FIRE!',
        emoji: '🔥',
        scale: 1.5,
        particles: true,
      };
    }
    if (combo >= 5) {
      return {
        text: 'AMAZING!',
        emoji: '⭐',
        scale: 1.3,
        particles: true,
      };
    }
    return {
      text: 'GOOD STREAK!',
      emoji: '🔥',
      scale: 1.2,
      particles: false,
    };
  };

  const config = getComboConfig();

  return (
    <motion.div
      initial={{ scale: 0, y: 50 }}
      animate={{ scale: config.scale, y: 0 }}
      exit={{ scale: 0, y: -50, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 200 }}
      className="fixed top-24 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="glass-strong rounded-2xl px-8 py-4 shadow-2xl border-2 border-primary/30">
        <div className="flex items-center gap-3">
          <motion.span
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="text-4xl"
          >
            {config.emoji}
          </motion.span>
          <div>
            <p className="text-2xl font-bold font-heading gradient-text">
              {combo}x COMBO
            </p>
            <p className="text-sm text-muted-foreground font-medium">
              {config.text}
            </p>
          </div>
        </div>
      </div>

      {/* Particles */}
      {config.particles && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{
                scale: [0, 1, 0],
                x: Math.cos((i * Math.PI * 2) / 8) * 100,
                y: Math.sin((i * Math.PI * 2) / 8) * 100,
              }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="absolute top-1/2 left-1/2 w-2 h-2 bg-primary rounded-full"
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default ComboDisplay;