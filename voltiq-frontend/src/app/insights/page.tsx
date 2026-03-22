'use client';

import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';
import { TrendingDown, Leaf, Award, Zap, Target, Trophy, ArrowUp } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

const savingsTrend = [
  { month: 'Oct', withoutVoltIQ: 890, withVoltIQ: 650, savings: 240 },
  { month: 'Nov', withoutVoltIQ: 850, withVoltIQ: 620, savings: 230 },
  { month: 'Dec', withoutVoltIQ: 920, withVoltIQ: 680, savings: 240 },
  { month: 'Jan', withoutVoltIQ: 780, withVoltIQ: 570, savings: 210 },
  { month: 'Feb', withoutVoltIQ: 847, withVoltIQ: 620, savings: 227 },
  { month: 'Mar', withoutVoltIQ: 810, withVoltIQ: 590, savings: 220 },
];

export default function InsightsPage() {
  const totalSavings = savingsTrend.reduce((sum, m) => sum + m.savings, 0);
  const avgSavingsPercent = 23;
  const carbonSaved = 142; // kg CO2
  const treesEquivalent = Math.floor(carbonSaved / 21); // ~21kg CO2 per tree per year

  return (
    <div className="ml-0 lg:ml-[260px] pt-16 min-h-screen bg-[#0a0f1c] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-black text-white mb-2">Energy Insights</h1>
          <p className="text-gray-400">Your complete energy analytics dashboard</p>
        </motion.div>

        {/* Top stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <GlassCard className="p-6 bg-volt-green/10 border-volt-green/30">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-volt-green/20 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-volt-green" />
              </div>
              <ArrowUp className="w-4 h-4 text-volt-green rotate-180" />
            </div>
            <p className="text-sm text-gray-400 mb-1">Total Savings</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-gray-500">₹</span>
              <AnimatedCounter end={totalSavings} className="text-2xl font-black text-white" />
            </div>
            <p className="text-xs text-volt-green mt-1">Last 6 months</p>
          </GlassCard>

          <GlassCard className="p-6 bg-volt-cyan/10 border-volt-cyan/30">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-volt-cyan/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-volt-cyan" />
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-1">Avg Savings</p>
            <div className="flex items-baseline gap-1">
              <AnimatedCounter end={avgSavingsPercent} className="text-2xl font-black text-white" />
              <span className="text-xl font-bold text-gray-500">%</span>
            </div>
            <p className="text-xs text-volt-cyan mt-1">Per month</p>
          </GlassCard>

          <GlassCard className="p-6 bg-emerald-500/10 border-emerald-500/30">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-1">CO₂ Saved</p>
            <div className="flex items-baseline gap-1">
              <AnimatedCounter end={carbonSaved} className="text-2xl font-black text-white" />
              <span className="text-sm text-gray-500">kg</span>
            </div>
            <p className="text-xs text-emerald-500 mt-1">≈ {treesEquivalent} trees</p>
          </GlassCard>

          <GlassCard className="p-6 bg-volt-amber/10 border-volt-amber/30">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-volt-amber/20 flex items-center justify-center">
                <Award className="w-5 h-5 text-volt-amber" />
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-1">Energy Score</p>
            <div className="flex items-baseline gap-1">
              <AnimatedCounter end={94} className="text-2xl font-black text-white" />
              <span className="text-sm text-gray-500">/100</span>
            </div>
            <p className="text-xs text-volt-amber mt-1">Rank #1 in colony</p>
          </GlassCard>
        </motion.div>

        {/* Billing comparison chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <GlassCard className="p-6 md:p-8">
            <h2 className="text-xl font-bold text-white mb-6">Billing Comparison</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="p-4 bg-volt-red/10 border border-volt-red/30 rounded-xl">
                <p className="text-sm text-gray-400 mb-2">Without VoltIQ</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm text-gray-500">₹</span>
                  <AnimatedCounter 
                    end={savingsTrend.reduce((s, m) => s + m.withoutVoltIQ, 0)} 
                    className="text-3xl font-black text-volt-red" 
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Total cost (6 months)</p>
              </div>

              <div className="p-4 bg-volt-green/10 border border-volt-green/30 rounded-xl">
                <p className="text-sm text-gray-400 mb-2">With VoltIQ</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm text-gray-500">₹</span>
                  <AnimatedCounter 
                    end={savingsTrend.reduce((s, m) => s + m.withVoltIQ, 0)} 
                    className="text-3xl font-black text-volt-green" 
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Optimized cost (6 months)</p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={savingsTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(10, 15, 28, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="withoutVoltIQ" fill="#C62828" name="Without VoltIQ" radius={[8, 8, 0, 0]} />
                <Bar dataKey="withVoltIQ" fill="#2E7D32" name="With VoltIQ" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        {/* Savings trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <GlassCard className="p-6 md:p-8">
            <h2 className="text-xl font-bold text-white mb-6">Monthly Savings Trend</h2>
            
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={savingsTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(10, 15, 28, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="savings" 
                  stroke="#00BCD4" 
                  strokeWidth={3}
                  dot={{ fill: '#00BCD4', r: 5 }}
                  activeDot={{ r: 7 }}
                  name="Savings"
                />
              </LineChart>
            </ResponsiveContainer>

            <div className="mt-6 p-4 bg-volt-cyan/10 border border-volt-cyan/30 rounded-xl">
              <p className="text-sm text-volt-cyan text-center">
                📊 You&apos;re consistently saving ~₹{Math.round(totalSavings / savingsTrend.length)} per month!
              </p>
            </div>
          </GlassCard>
        </motion.div>

        {/* Carbon footprint & Energy score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-2 gap-6"
        >
          {/* Carbon Impact */}
          <GlassCard className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Leaf className="w-6 h-6 text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-white">Carbon Impact</h2>
            </div>

            <div className="space-y-4">
              <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center">
                <p className="text-sm text-gray-400 mb-2">CO₂ Emissions Saved</p>
                <div className="flex items-baseline justify-center gap-1">
                  <AnimatedCounter end={carbonSaved} className="text-4xl font-black text-white" />
                  <span className="text-lg text-gray-400">kg</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-white/5 rounded-xl text-center">
                  <p className="text-3xl mb-1">🌳</p>
                  <p className="text-2xl font-bold text-white">{treesEquivalent}</p>
                  <p className="text-xs text-gray-500 mt-1">Trees equivalent</p>
                </div>

                <div className="p-4 bg-white/5 rounded-xl text-center">
                  <p className="text-3xl mb-1">🚗</p>
                  <p className="text-2xl font-bold text-white">{Math.round(carbonSaved * 0.4)}</p>
                  <p className="text-xs text-gray-500 mt-1">km not driven</p>
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded-xl">
                <p className="text-xs text-gray-400 text-center">
                  Your energy optimization is making a real environmental impact! 🌍
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Energy Score */}
          <GlassCard className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-volt-amber/20 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-volt-amber" />
              </div>
              <h2 className="text-xl font-bold text-white">Energy Score</h2>
            </div>

            <div className="text-center mb-6">
              <div className="relative inline-block">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="12"
                    fill="none"
                  />
                  <motion.circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="#F9A825"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: '0 440' }}
                    animate={{ strokeDasharray: '415 440' }}
                    transition={{ duration: 2, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <AnimatedCounter end={94} className="text-4xl font-black text-white" duration={2} />
                    <p className="text-sm text-gray-400">/100</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-volt-green" />
                  <span className="text-sm text-gray-400">Colony Rank</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-volt-amber" />
                  <span className="font-bold text-white">#1</span>
                  <span className="text-xs text-gray-500">of 200</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-volt-cyan" />
                  <span className="text-sm text-gray-400">Optimization Rate</span>
                </div>
                <span className="font-bold text-volt-cyan">98%</span>
              </div>

              <div className="p-3 bg-volt-amber/10 border border-volt-amber/30 rounded-xl">
                <p className="text-xs text-volt-amber text-center">
                  🏆 You&apos;re a VoltIQ Champion! Keep up the excellent work.
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
