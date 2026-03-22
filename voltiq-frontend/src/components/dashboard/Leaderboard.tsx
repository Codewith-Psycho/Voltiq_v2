'use client';

import { useVoltStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Zap } from 'lucide-react';

const rankIcons = [Trophy, Medal, Award];
const rankColors = ['text-amber-500', 'text-gray-400', 'text-amber-700'];
const rankBg = ['bg-amber-50', 'bg-gray-50', 'bg-amber-50/50'];

export function Leaderboard() {
  const flats = useVoltStore((s) => s.colonyData.flats);

  return (
    <div className="glass-light rounded-2xl p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-volt-dark">Flat Leaderboard</h2>
          <p className="text-sm text-gray-500">Top energy savers this month</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
          <Zap className="w-3 h-3" />
          Updates live
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-5 gap-4 px-4 py-3 bg-gray-50 rounded-xl text-xs font-semibold text-gray-500 uppercase tracking-wider">
        <span>Rank</span>
        <span>Flat</span>
        <span className="text-right">Savings</span>
        <span className="text-right">Score</span>
        <span className="text-right">kW</span>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-100">
        {flats.map((flat, i) => {
          const RankIcon = i < 3 ? rankIcons[i] : null;
          return (
            <motion.div
              key={flat.flat}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`grid grid-cols-5 gap-4 px-4 py-4 items-center hover:bg-gray-50/80 transition-colors ${
                i < 3 ? rankBg[i] : ''
              }`}
            >
              {/* Rank */}
              <div className="flex items-center gap-2">
                {RankIcon ? (
                  <RankIcon className={`w-5 h-5 ${rankColors[i]}`} />
                ) : (
                  <span className="text-sm font-bold text-gray-400 w-5 text-center">
                    {flat.rank}
                  </span>
                )}
              </div>

              {/* Flat */}
              <span className={`text-sm font-semibold ${i < 3 ? 'text-volt-dark' : 'text-gray-700'}`}>
                {flat.flat}
              </span>

              {/* Savings */}
              <span className="text-sm font-bold text-volt-green text-right">
                ₹{flat.savings.toLocaleString('en-IN')}
              </span>

              {/* Energy Score */}
              <div className="text-right">
                <span className={`inline-flex items-center gap-1 text-sm font-bold ${
                  flat.energyScore >= 90 ? 'text-volt-green' :
                  flat.energyScore >= 75 ? 'text-volt-amber' :
                  'text-volt-red'
                }`}>
                  ⚡{flat.energyScore}
                </span>
              </div>

              {/* kW */}
              <motion.span
                key={flat.kw}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                className="text-sm text-gray-500 text-right font-mono"
              >
                {flat.kw.toFixed(2)}
              </motion.span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
