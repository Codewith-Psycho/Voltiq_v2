'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { IndianRupee, TrendingDown, Receipt, Calendar, Zap, Download, ChevronDown } from 'lucide-react';

const monthlyBills = [
  { month: 'Oct', baseline: 890, optimized: 650, savings: 240 },
  { month: 'Nov', baseline: 850, optimized: 620, savings: 230 },
  { month: 'Dec', baseline: 920, optimized: 680, savings: 240 },
  { month: 'Jan', baseline: 780, optimized: 570, savings: 210 },
  { month: 'Feb', baseline: 847, optimized: 620, savings: 227 },
  { month: 'Mar', baseline: 810, optimized: 590, savings: 220 },
];

const breakdownData = [
  { name: 'AC', value: 540, fill: '#1B4F8A' },
  { name: 'Geyser', value: 93, fill: '#00BCD4' },
  { name: 'Refrigerator', value: 108, fill: '#2E7D32' },
  { name: 'Fan', value: 68, fill: '#F9A825' },
  { name: 'Washing Machine', value: 35, fill: '#C62828' },
  { name: 'Others', value: 61, fill: '#9CA3AF' },
];

const savingsHistory = [
  { month: 'Oct \'25', saved: 240, percent: 27 },
  { month: 'Nov \'25', saved: 230, percent: 27 },
  { month: 'Dec \'25', saved: 240, percent: 26 },
  { month: 'Jan \'26', saved: 210, percent: 27 },
  { month: 'Feb \'26', saved: 227, percent: 26.8 },
  { month: 'Mar \'26', saved: 220, percent: 27.2 },
];

const tariffSlabs = [
  { slab: '0 – 100 units', rate: '₹3.10', type: 'sasta' },
  { slab: '101 – 200 units', rate: '₹5.20', type: 'mid' },
  { slab: '201 – 400 units', rate: '₹6.80', type: 'mid' },
  { slab: '400+ units', rate: '₹8.50', type: 'peak' },
];

export default function BillingPage() {
  const [showSlabs, setShowSlabs] = useState(false);
  const totalSavings = savingsHistory.reduce((s, m) => s + m.saved, 0);
  const totalBillBaseline = monthlyBills.reduce((s, m) => s + m.baseline, 0);
  const totalBillOptimized = monthlyBills.reduce((s, m) => s + m.optimized, 0);

  return (
    <div className="ml-[260px] pt-16 min-h-screen">
      <div className="p-6 lg:p-8 max-w-[1400px]">
        {/* Top Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Receipt, label: 'This Month\'s Bill', value: '₹620', sub: 'vs ₹847 baseline', color: 'text-volt-blue', bg: 'bg-blue-500/10' },
            { icon: TrendingDown, label: 'Monthly Savings', value: '₹227', sub: '26.8% reduction', color: 'text-volt-green', bg: 'bg-green-500/10' },
            { icon: IndianRupee, label: 'Total Saved (6 mo)', value: `₹${totalSavings.toLocaleString('en-IN')}`, sub: 'Since Oct 2025', color: 'text-volt-amber', bg: 'bg-amber-500/10' },
            { icon: Calendar, label: 'Avg per Day', value: '₹20.7', sub: '~6.2 kWh/day', color: 'text-volt-cyan', bg: 'bg-cyan-500/10' },
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
              <div className="text-xs text-gray-400 mt-0.5">{stat.sub}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Bill Comparison Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 glass-light rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-white">Bill Comparison</h2>
                <p className="text-sm text-gray-500">Baseline vs VoltIQ optimized</p>
              </div>
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-gray-400 transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <BarChart data={monthlyBills} barGap={6}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                    formatter={(value) => [`₹${value}`, '']}
                  />
                  <Legend />
                  <Bar dataKey="baseline" name="Without VoltIQ" fill="#d1d5db" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="optimized" name="With VoltIQ" fill="#1B4F8A" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Bill Breakdown Pie */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-light rounded-2xl p-6"
          >
            <h2 className="text-lg font-bold text-white mb-2">Bill Breakdown</h2>
            <p className="text-sm text-gray-500 mb-4">By appliance this month</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <PieChart>
                  <Pie
                    data={breakdownData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {breakdownData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`₹${value}`, '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {breakdownData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                    <span className="text-gray-600">{item.name}</span>
                  </div>
                  <span className="font-semibold text-gray-700">₹{item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Savings Timeline + Tariff Slabs */}
        <div className="grid lg:grid-cols-2 gap-8 mt-8">
          {/* Savings Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-light rounded-2xl p-6"
          >
            <h2 className="text-lg font-bold text-white mb-4">Savings History</h2>
            <div className="space-y-3">
              {savingsHistory.map((m, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-xs font-medium text-gray-500 w-16">{m.month}</span>
                  <div className="flex-1 h-8 bg-white/10 rounded-full relative overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${m.percent * 3}%` }}
                      transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
                      className="h-full bg-gradient-to-r from-volt-green to-emerald-400 rounded-full flex items-center justify-end pr-3"
                    >
                      <span className="text-[10px] font-bold text-white">₹{m.saved}</span>
                    </motion.div>
                  </div>
                  <span className="text-xs font-bold text-volt-green w-12 text-right">{m.percent}%</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm text-gray-500">Total saved</span>
              <span className="text-lg font-black text-volt-green">₹{totalSavings.toLocaleString('en-IN')}</span>
            </div>
          </motion.div>

          {/* Tariff Slabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-light rounded-2xl p-6"
          >
            <button
              onClick={() => setShowSlabs(!showSlabs)}
              className="flex items-center justify-between w-full mb-4"
            >
              <div>
                <h2 className="text-lg font-bold text-white">Tariff Slab Rates</h2>
                <p className="text-sm text-gray-500">BSES Rajdhani — Current rates</p>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showSlabs ? 'rotate-180' : ''}`} />
            </button>

            {showSlabs && (
              <div className="space-y-2">
                {tariffSlabs.map((slab, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${
                    slab.type === 'peak' ? 'border-red-200 bg-red-50/50' :
                    slab.type === 'mid' ? 'border-amber-200 bg-amber-50/50' :
                    'border-green-200 bg-green-50/50'
                  }`}>
                    <span className="text-sm text-gray-700">{slab.slab}</span>
                    <span className={`text-sm font-bold ${
                      slab.type === 'peak' ? 'text-volt-red' :
                      slab.type === 'mid' ? 'text-volt-amber' :
                      'text-volt-green'
                    }`}>{slab.rate}/kWh</span>
                  </div>
                ))}
              </div>
            )}

            {/* Bill summary card */}
            <div className="mt-6 p-4 bg-gradient-to-br from-volt-blue/5 to-volt-cyan/5 rounded-xl border border-volt-blue/10">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-volt-blue" />
                <span className="text-sm font-bold text-white">VoltIQ Impact Summary</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-xs text-gray-500">6-mo baseline total</div>
                  <div className="text-lg font-black text-gray-400 line-through">₹{totalBillBaseline.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">6-mo VoltIQ total</div>
                  <div className="text-lg font-black text-volt-green">₹{totalBillOptimized.toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
