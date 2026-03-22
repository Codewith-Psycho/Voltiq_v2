'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Legend,
} from 'recharts';
import { Zap, Clock, Sun, Moon, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react';

// Hourly usage data for today
const hourlyData = Array.from({ length: 24 }, (_, i) => {
  const hour = i;
  const isPeak = hour >= 10 && hour <= 14 || hour >= 18 && hour <= 22;
  const isMid = hour >= 6 && hour <= 10 || hour >= 14 && hour <= 18;
  const base = isPeak ? 1.8 + Math.random() * 0.8 : isMid ? 1.0 + Math.random() * 0.5 : 0.3 + Math.random() * 0.3;
  return {
    hour: `${hour}:00`,
    usage: Math.round(base * 100) / 100,
    tariff: isPeak ? 'Peak' : isMid ? 'Mid' : 'Sasta',
    rate: isPeak ? 8.5 : isMid ? 5.2 : 3.1,
  };
});

// Weekly data
const weeklyData = [
  { day: 'Mon', usage: 12.4, target: 10, cost: 86 },
  { day: 'Tue', usage: 10.8, target: 10, cost: 72 },
  { day: 'Wed', usage: 14.2, target: 10, cost: 105 },
  { day: 'Thu', usage: 9.6, target: 10, cost: 64 },
  { day: 'Fri', usage: 11.1, target: 10, cost: 78 },
  { day: 'Sat', usage: 15.8, target: 10, cost: 118 },
  { day: 'Sun', usage: 13.5, target: 10, cost: 96 },
];

// Schedule data
const scheduleItems = [
  { time: '05:30 AM', appliance: 'Geyser', duration: '30 min', status: 'completed', tariff: 'sasta', saved: 14 },
  { time: '06:00 AM', appliance: 'Washing Machine', duration: '45 min', status: 'completed', tariff: 'sasta', saved: 8 },
  { time: '07:00 AM', appliance: 'Iron', duration: '20 min', status: 'completed', tariff: 'mid', saved: 0 },
  { time: '09:00 AM', appliance: 'AC', duration: '3 hrs', status: 'active', tariff: 'mid', saved: 0 },
  { time: '02:00 PM', appliance: 'AC', duration: '4 hrs', status: 'scheduled', tariff: 'peak', saved: 0 },
  { time: '05:00 PM', appliance: 'Geyser', duration: '20 min', status: 'scheduled', tariff: 'mid', saved: 6 },
  { time: '09:00 PM', appliance: 'Dishwasher', duration: '1 hr', status: 'optimized', tariff: 'sasta', saved: 12 },
  { time: '10:00 PM', appliance: 'EV Charging', duration: '4 hrs', status: 'optimized', tariff: 'sasta', saved: 32 },
];

const statusConfig = {
  completed: { label: 'Done', color: 'text-gray-400', bg: 'bg-white/10' },
  active: { label: 'Running', color: 'text-volt-green', bg: 'bg-green-500/10' },
  scheduled: { label: 'Scheduled', color: 'text-volt-blue', bg: 'bg-blue-500/10' },
  optimized: { label: 'VoltIQ Optimized', color: 'text-volt-cyan', bg: 'bg-cyan-500/10' },
};

const tariffColors = {
  sasta: 'text-volt-green',
  mid: 'text-volt-amber',
  peak: 'text-volt-red',
};

export default function EnergyUsagePage() {
  const [view, setView] = useState<'today' | 'week'>('today');
  const totalToday = hourlyData.reduce((sum, h) => sum + h.usage, 0);
  const peakUsage = hourlyData.filter(h => h.tariff === 'Peak').reduce((s, h) => s + h.usage, 0);
  const sastaUsage = hourlyData.filter(h => h.tariff === 'Sasta').reduce((s, h) => s + h.usage, 0);

  return (
    <div className="ml-[260px] pt-16 min-h-screen">
      <div className="p-6 lg:p-8 max-w-[1400px]">
        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Zap, label: 'Today\'s Usage', value: `${totalToday.toFixed(1)} kWh`, color: 'text-volt-cyan', bg: 'bg-cyan-500/10' },
            { icon: TrendingDown, label: 'Saved Today', value: '₹47', color: 'text-volt-green', bg: 'bg-green-500/10' },
            { icon: Sun, label: 'Peak Hours Used', value: `${peakUsage.toFixed(1)} kWh`, color: 'text-volt-red', bg: 'bg-red-500/10' },
            { icon: Moon, label: 'Sasta Hours Used', value: `${sastaUsage.toFixed(1)} kWh`, color: 'text-volt-green', bg: 'bg-green-500/10' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-light rounded-2xl p-5 group hover:shadow-lg transition-all"
            >
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Usage Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-light rounded-2xl p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Energy Consumption</h2>
              <p className="text-sm text-gray-500">Hourly breakdown with tariff zones</p>
            </div>
            <div className="flex bg-white/10 rounded-xl p-1">
              {['today', 'week'].map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v as 'today' | 'week')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    view === v ? 'bg-white/15 shadow-sm text-white' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {v === 'today' ? 'Today' : 'This Week'}
                </button>
              ))}
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              {view === 'today' ? (
                <AreaChart data={hourlyData}>
                  <defs>
                    <linearGradient id="usageGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00BCD4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00BCD4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="hour" tick={{ fontSize: 11 }} interval={2} />
                  <YAxis tick={{ fontSize: 11 }} unit=" kWh" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                    formatter={(value) => [`${value} kWh`, 'Usage']}
                  />
                  <Area type="monotone" dataKey="usage" stroke="#00BCD4" strokeWidth={2} fill="url(#usageGrad)" />
                </AreaChart>
              ) : (
                <BarChart data={weeklyData} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} unit=" kWh" />
                  <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #e5e7eb', borderRadius: '12px' }} />
                  <Legend />
                  <Bar dataKey="usage" name="Actual" fill="#1B4F8A" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="target" name="Target" fill="#2E7D32" radius={[6, 6, 0, 0]} opacity={0.4} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Tariff zone legend */}
          {view === 'today' && (
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
              {[
                { label: 'Peak (10–14, 18–22)', color: 'bg-volt-red', rate: '₹8.5/kWh' },
                { label: 'Mid (6–10, 14–18)', color: 'bg-volt-amber', rate: '₹5.2/kWh' },
                { label: 'Sasta (22–6)', color: 'bg-volt-green', rate: '₹3.1/kWh' },
              ].map((zone) => (
                <div key={zone.label} className="flex items-center gap-2 text-xs text-gray-500">
                  <div className={`w-3 h-3 rounded-full ${zone.color}`} />
                  <span>{zone.label}</span>
                  <span className="font-semibold text-gray-700">{zone.rate}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Daily Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-light rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Today&apos;s Schedule</h2>
              <p className="text-sm text-gray-500">Smart scheduling saves you ₹72 today</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/15 flex items-center justify-center">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-semibold text-white px-3">Today</span>
              <button className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/15 flex items-center justify-center">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {scheduleItems.map((item, i) => {
              const status = statusConfig[item.status as keyof typeof statusConfig];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-md ${
                    item.status === 'active' ? 'border-volt-green/30 bg-green-50/30' :
                    item.status === 'optimized' ? 'border-volt-cyan/30 bg-cyan-50/30' :
                    'border-gray-100 bg-white'
                  }`}
                >
                  {/* Time */}
                  <div className="w-20 shrink-0">
                    <div className="flex items-center gap-1 text-sm font-bold text-white">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {item.time}
                    </div>
                  </div>

                  {/* Appliance */}
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-white">{item.appliance}</div>
                    <div className="text-xs text-gray-400">{item.duration}</div>
                  </div>

                  {/* Tariff */}
                  <span className={`text-xs font-bold ${tariffColors[item.tariff as keyof typeof tariffColors]} uppercase`}>
                    {item.tariff}
                  </span>

                  {/* Status */}
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${status.bg} ${status.color}`}>
                    {status.label}
                  </span>

                  {/* Savings */}
                  {item.saved > 0 && (
                    <span className="text-xs font-bold text-volt-green">
                      +₹{item.saved}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
