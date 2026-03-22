'use client';

import { useVoltStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { IndianRupee, TrendingUp, Calendar, Target } from 'lucide-react';

export function SavingsCard() {
  const colonyData = useVoltStore((s) => s.colonyData);

  return (
    <div className="space-y-6">
      {/* Total Savings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-volt-green/10 to-emerald-50 rounded-2xl p-6 border border-green-200/50"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <IndianRupee className="w-5 h-5 text-volt-green" />
          </div>
          <span className="text-sm font-semibold text-gray-600">Colony Savings</span>
        </div>
        <div className="text-4xl font-black text-volt-green mb-1">
          ₹{colonyData.totalSaving.toLocaleString('en-IN')}
        </div>
        <div className="text-sm text-gray-500">This month</div>

        <div className="mt-4 flex items-center gap-2 text-sm text-volt-green font-medium">
          <TrendingUp className="w-4 h-4" />
          <span>+12.3% vs last month</span>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-light rounded-2xl p-6"
      >
        <h3 className="font-bold text-volt-dark mb-4">Quick Stats</h3>
        <div className="space-y-4">
          {[
            {
              icon: Calendar,
              label: 'Avg per flat',
              value: `₹${Math.round(colonyData.totalSaving / colonyData.totalHomes).toLocaleString('en-IN')}`,
              color: 'text-volt-blue',
              bg: 'bg-blue-50',
            },
            {
              icon: Target,
              label: 'Best scorer',
              value: `⚡${colonyData.flats[0]?.energyScore || 94}`,
              color: 'text-volt-amber',
              bg: 'bg-amber-50',
            },
            {
              icon: TrendingUp,
              label: 'Peak reduced by',
              value: '18.4%',
              color: 'text-volt-green',
              bg: 'bg-green-50',
            },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-9 h-9 ${item.bg} rounded-lg flex items-center justify-center`}>
                <item.icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-500">{item.label}</div>
                <div className={`text-sm font-bold ${item.color}`}>{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
