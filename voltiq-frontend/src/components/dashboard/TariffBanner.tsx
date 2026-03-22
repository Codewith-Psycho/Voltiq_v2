'use client';

import { useVoltStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, TrendingDown, Sun } from 'lucide-react';

const tariffConfig = {
  peak: {
    label: 'PEAK TARIFF',
    rate: '₹8.5 / kWh',
    advice: 'High rates! Avoid heavy appliances.',
    icon: Zap,
    bg: 'from-volt-red/20 via-volt-red/10 to-volt-red/5',
    border: 'border-volt-red/30',
    dotColor: 'bg-volt-red',
    textColor: 'text-volt-red',
    barBg: 'bg-volt-red',
  },
  mid: {
    label: 'MID TARIFF',
    rate: '₹5.2 / kWh',
    advice: 'Moderate rates. Use wisely.',
    icon: Sun,
    bg: 'from-volt-amber/20 via-volt-amber/10 to-volt-amber/5',
    border: 'border-volt-amber/30',
    dotColor: 'bg-volt-amber',
    textColor: 'text-volt-amber',
    barBg: 'bg-volt-amber',
  },
  sasta: {
    label: 'SASTA TARIFF',
    rate: '₹3.1 / kWh',
    advice: 'Best time! Run heavy appliances now.',
    icon: TrendingDown,
    bg: 'from-volt-green/20 via-volt-green/10 to-volt-green/5',
    border: 'border-volt-green/30',
    dotColor: 'bg-volt-green',
    textColor: 'text-volt-green',
    barBg: 'bg-volt-green',
  },
};

export function TariffBanner() {
  const tariffMode = useVoltStore((s) => s.tariffMode);
  const config = tariffConfig[tariffMode];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={tariffMode}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.4 }}
        className={`w-full bg-gradient-to-r ${config.bg} rounded-2xl p-5 md:p-6 border ${config.border} relative overflow-hidden`}
      >
        {/* Animated bar at top */}
        <div className="absolute top-0 left-0 right-0 h-1">
          <motion.div
            className={`h-full ${config.barBg}`}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${config.dotColor} animate-pulse`} />
            <div>
              <div className={`text-xl font-bold ${config.textColor}`}>
                {config.label}
              </div>
              <div className="text-sm text-gray-500">{config.advice}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <config.icon className={`w-6 h-6 ${config.textColor}`} />
            <span className={`text-2xl font-black ${config.textColor}`}>
              {config.rate}
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
