'use client';

import { useVoltStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { Zap, Home, TrendingDown, Leaf } from 'lucide-react';

export function ColonyStats() {
  const colonyData = useVoltStore((s) => s.colonyData);
  const liveKW = useVoltStore((s) => s.liveKW);

  const stats = [
    {
      icon: Zap,
      label: 'Colony Load',
      value: `${liveKW.toFixed(1)} kW`,
      color: 'text-volt-cyan',
      bg: 'bg-cyan-50',
    },
    {
      icon: Home,
      label: 'Active Homes',
      value: `${colonyData.totalHomes}`,
      color: 'text-volt-blue',
      bg: 'bg-blue-50',
    },
    {
      icon: TrendingDown,
      label: 'Savings Today',
      value: `₹${Math.round(colonyData.totalSaving / 30).toLocaleString('en-IN')}`,
      color: 'text-volt-green',
      bg: 'bg-green-50',
    },
    {
      icon: Leaf,
      label: 'CO₂ Saved',
      value: `${(liveKW * 0.082).toFixed(1)} kg`,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glass-light rounded-2xl p-5 group hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
          </div>
          <motion.div
            key={stat.value}
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 1 }}
            className={`text-2xl font-black ${stat.color}`}
          >
            {stat.value}
          </motion.div>
          <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  );
}
