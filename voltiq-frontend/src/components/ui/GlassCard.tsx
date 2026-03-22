'use client';

import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
  hover?: boolean;
  glow?: 'cyan' | 'blue' | 'green' | 'none';
  delay?: number;
}

export function GlassCard({
  children,
  className = '',
  dark = false,
  hover = true,
  glow = 'none',
  delay = 0,
}: GlassCardProps) {
  const glowStyles = {
    cyan: 'hover:shadow-[0_0_30px_rgba(0,188,212,0.2)]',
    blue: 'hover:shadow-[0_0_30px_rgba(27,79,138,0.2)]',
    green: 'hover:shadow-[0_0_30px_rgba(46,125,50,0.2)]',
    none: '',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay }}
      className={`
        rounded-2xl p-6
        ${dark ? 'glass' : 'glass-light'}
        ${hover ? 'card-hover' : ''}
        ${glowStyles[glow]}
        transition-all duration-300
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
