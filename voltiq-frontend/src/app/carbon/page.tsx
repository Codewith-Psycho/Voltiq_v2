'use client';

import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, PieChart, Pie, Cell,
} from 'recharts';
import { Leaf, TreePine, Factory, Droplets, Wind, TrendingDown, Award } from 'lucide-react';

const monthlyCO2 = [
  { month: 'Oct', saved: 32, emitted: 58 },
  { month: 'Nov', saved: 34, emitted: 52 },
  { month: 'Dec', saved: 30, emitted: 62 },
  { month: 'Jan', saved: 38, emitted: 48 },
  { month: 'Feb', saved: 36.9, emitted: 50 },
  { month: 'Mar', saved: 35, emitted: 47 },
];

const equivalents = [
  { icon: TreePine, label: 'Trees planted (equivalent)', value: '10.5 trees', color: 'text-volt-green', bg: 'bg-green-500/10' },
  { icon: Factory, label: 'Coal not burned', value: '84 kg', color: 'text-gray-600', bg: 'bg-white/10' },
  { icon: Droplets, label: 'Water saved', value: '3,200 L', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { icon: Wind, label: 'Clean air days', value: '12 days', color: 'text-cyan-600', bg: 'bg-cyan-500/10' },
];

const energyMix = [
  { name: 'Coal', value: 55, fill: '#4a4a4a' },
  { name: 'Solar', value: 15, fill: '#F9A825' },
  { name: 'Wind', value: 12, fill: '#00BCD4' },
  { name: 'Hydro', value: 10, fill: '#1B4F8A' },
  { name: 'Nuclear', value: 5, fill: '#9333EA' },
  { name: 'Gas', value: 3, fill: '#C62828' },
];

const greenScore = [
  { name: 'Score', value: 78, fill: '#2E7D32' },
];

const badges = [
  { title: 'First 50 kg CO₂ Saved', achieved: true, icon: '🌱' },
  { title: '100 kg CO₂ Saved', achieved: true, icon: '🌿' },
  { title: '200 kg CO₂ Saved', achieved: false, icon: '🌳' },
  { title: 'Colony Top 10 Saver', achieved: true, icon: '🏆' },
  { title: 'Zero Peak Day', achieved: true, icon: '⚡' },
  { title: '10 Trees Equivalent', achieved: true, icon: '🌲' },
];

export default function CarbonPage() {
  const totalSaved = monthlyCO2.reduce((s, m) => s + m.saved, 0);

  return (
    <div className="ml-[260px] pt-16 min-h-screen">
      <div className="p-6 lg:p-8 max-w-[1400px]">
        {/* Hero Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Leaf, label: 'Total CO₂ Saved', value: `${totalSaved.toFixed(1)} kg`, color: 'text-volt-green', bg: 'bg-green-500/10' },
            { icon: TreePine, label: 'Trees Equivalent', value: '10.5 trees', color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
            { icon: TrendingDown, label: 'Carbon Reduction', value: '39%', color: 'text-volt-blue', bg: 'bg-blue-500/10' },
            { icon: Award, label: 'Green Score', value: '78 / 100', color: 'text-volt-amber', bg: 'bg-amber-500/10' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-light rounded-2xl p-5"
            >
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* CO₂ Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 glass-light rounded-2xl p-6"
          >
            <h2 className="text-lg font-bold text-white mb-1">Carbon Emissions Trend</h2>
            <p className="text-sm text-gray-500 mb-6">Monthly CO₂ saved vs emitted (in kg)</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <AreaChart data={monthlyCO2}>
                  <defs>
                    <linearGradient id="savedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="emittedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C62828" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#C62828" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} unit=" kg" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #e5e7eb', borderRadius: '12px' }}
                    formatter={(value) => [`${value} kg`, '']}
                  />
                  <Area type="monotone" dataKey="emitted" name="Emitted" stroke="#C62828" strokeWidth={2} fill="url(#emittedGrad)" />
                  <Area type="monotone" dataKey="saved" name="Saved by VoltIQ" stroke="#2E7D32" strokeWidth={2} fill="url(#savedGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Green Score Gauge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-light rounded-2xl p-6 flex flex-col items-center"
          >
            <h2 className="text-lg font-bold text-white mb-2">Green Score</h2>
            <p className="text-sm text-gray-500 mb-4">Your environmental impact rating</p>
            <div className="relative w-48 h-48">
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="70%"
                  outerRadius="100%"
                  startAngle={180}
                  endAngle={0}
                  data={greenScore}
                >
                  <RadialBar dataKey="value" cornerRadius={10} fill="#2E7D32" background={{ fill: '#f0f0f0' }} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-volt-green">78</span>
                <span className="text-xs text-gray-500">out of 100</span>
              </div>
            </div>
            <div className="mt-4 text-center">
              <span className="text-sm font-semibold text-volt-green">Good!</span>
              <p className="text-xs text-gray-400 mt-1">Top 15% in your colony</p>
            </div>
          </motion.div>
        </div>

        {/* Equivalence Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <h2 className="text-lg font-bold text-white mb-4">What your savings equal</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {equivalents.map((eq, i) => (
              <div key={i} className="glass-light rounded-2xl p-5 text-center hover:shadow-lg transition-all">
                <div className={`w-12 h-12 ${eq.bg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                  <eq.icon className={`w-6 h-6 ${eq.color}`} />
                </div>
                <div className="text-xl font-black text-white">{eq.value}</div>
                <div className="text-xs text-gray-500 mt-1">{eq.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Badges + Energy Mix */}
        <div className="grid lg:grid-cols-2 gap-8 mt-8">
          {/* Green Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-light rounded-2xl p-6"
          >
            <h2 className="text-lg font-bold text-white mb-4">Green Badges</h2>
            <div className="grid grid-cols-3 gap-3">
              {badges.map((badge, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl text-center transition-all ${
                    badge.achieved
                      ? 'bg-green-50 border border-green-200/50'
                      : 'bg-white/5 border border-white/5 opacity-40'
                  }`}
                >
                  <div className="text-2xl mb-1">{badge.icon}</div>
                  <div className={`text-[10px] font-semibold ${badge.achieved ? 'text-volt-green' : 'text-gray-400'}`}>
                    {badge.title}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Grid Energy Mix */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-light rounded-2xl p-6"
          >
            <h2 className="text-lg font-bold text-white mb-2">India&apos;s Grid Energy Mix</h2>
            <p className="text-sm text-gray-500 mb-4">Your usage draws from this mix</p>
            <div className="flex items-center gap-6">
              <div className="w-40 h-40">
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                  <PieChart>
                    <Pie
                      data={energyMix}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {energyMix.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, '']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 flex-1">
                {energyMix.map((source) => (
                  <div key={source.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: source.fill }} />
                      <span className="text-gray-600">{source.name}</span>
                    </div>
                    <span className="font-semibold text-gray-700">{source.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
