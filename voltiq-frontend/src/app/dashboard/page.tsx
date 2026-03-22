'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BarChart3, Cpu, Receipt, Leaf, ArrowRight, Zap, Sparkles, Trophy, ChevronRight, Gauge, Activity, Clock } from 'lucide-react';
import { EnergyFlowScene } from '@/components/three/EnergyFlowScene';
import { useVoltStore } from '@/lib/store';
import { useState, useEffect } from 'react';

export default function DashboardOverview() {
  const { colonyData } = useVoltStore();


  // Tariff schedule
  const tariffSlots = [
    { start: 5, end: 11, rate: 7, label: '05:00 – 11:00', tag: 'Morning' },
    { start: 11, end: 17, rate: 6, label: '11:00 – 17:00', tag: 'Afternoon' },
    { start: 17, end: 23, rate: 9, label: '17:00 – 23:00', tag: 'Evening Peak' },
    { start: 23, end: 5, rate: 5, label: '23:00 – 05:00', tag: 'Night Off-Peak' },
  ];

  const getCurrentTariffIndex = () => {
    const h = new Date().getHours();
    if (h >= 5 && h < 11) return 0;
    if (h >= 11 && h < 17) return 1;
    if (h >= 17 && h < 23) return 2;
    return 3; // 23-5
  };

  const [activeTariffIdx, setActiveTariffIdx] = useState(getCurrentTariffIndex);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Simulated meter readings (randomize slightly every 3s)
  const [meterReadings, setMeterReadings] = useState({
    voltage: 231.4,
    current: 8.32,
    powerFactor: 0.96,
    frequency: 50.02,
    mdKwh: 4.8,
    unitsToday: 12.7,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setActiveTariffIdx(getCurrentTariffIndex());
      // Simulate fluctuating readings
      setMeterReadings(prev => ({
        voltage: +(228 + Math.random() * 6).toFixed(1),
        current: +(7.5 + Math.random() * 2).toFixed(2),
        powerFactor: +(0.92 + Math.random() * 0.07).toFixed(2),
        frequency: +(49.95 + Math.random() * 0.1).toFixed(2),
        mdKwh: +(prev.mdKwh + Math.random() * 0.01).toFixed(2),
        unitsToday: +(prev.unitsToday + Math.random() * 0.03).toFixed(2),
      }));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const overviewCards = [
    {
      title: 'Energy Usage & Schedules',
      href: '/energy-usage',
      icon: BarChart3,
      color: 'text-volt-cyan',
      bgLight: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      stats: [
        { label: "Today's Usage", value: '35.4 kWh' },
        { label: 'Peak Usage', value: '23.2 kWh', highlight: true },
        { label: 'Saved Today', value: '₹47' },
      ],
    },
    {
      title: 'Appliances',
      href: '/appliances',
      icon: Cpu,
      color: 'text-volt-blue',
      bgLight: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      stats: [
        { label: 'Active Now', value: '6 / 9' },
        { label: 'Current Load', value: '1.92 kW' },
        { label: 'Smart Enabled', value: '4' },
      ],
    },
    {
      title: 'Billing & Saving',
      href: '/billing',
      icon: Receipt,
      color: 'text-volt-amber',
      bgLight: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      stats: [
        { label: "This Month's Bill", value: '₹620' },
        { label: 'Monthly Savings', value: '₹227', highlight: true },
        { label: 'Total Saved', value: '₹1,367' },
      ],
    },
    {
      title: 'Carbon Footprints',
      href: '/carbon',
      icon: Leaf,
      color: 'text-volt-green',
      bgLight: 'bg-green-500/10',
      border: 'border-green-500/20',
      stats: [
        { label: 'Total CO₂ Saved', value: '205.9 kg' },
        { label: 'Trees Equivalent', value: '10.5 trees' },
        { label: 'Green Score', value: '78/100', highlight: true },
      ],
    },
  ];

  return (
    <div className="ml-0 lg:ml-[260px] pt-16 min-h-screen bg-[#0a0f1c]">
      <div className="p-6 lg:p-10 max-w-[1200px]">
        
        <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Welcome to your Dashboard Overview</h1>
            <p className="text-gray-500">A concise snapshot of your home&apos;s energy intelligence.</p>
          </div>

          {/* Compact Optimize card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-volt-blue to-volt-cyan rounded-xl px-4 py-3 flex items-center gap-3 text-white shadow-lg shadow-volt-blue/20 shrink-0"
          >
            <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold leading-tight">₹227 saved</p>
              <p className="text-[10px] text-white/70">this month</p>
            </div>
            <Link href="/optimization">
              <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 hover:scale-105">
                <Sparkles className="w-4 h-4" />
                Optimize
              </button>
            </Link>
          </motion.div>
        </div>

        {/* 3D Energy Flow Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <EnergyFlowScene />
        </motion.div>
        {/* Real-Time Meter Readings */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-volt-cyan/20 rounded-xl flex items-center justify-center">
                  <Gauge className="w-5 h-5 text-volt-cyan" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Live Meter Readings</h2>
                  <p className="text-xs text-gray-500">Real-time smart meter data</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-volt-green animate-pulse" />
                <span className="text-xs text-gray-400">
                  {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Voltage (V)', value: `${meterReadings.voltage}`, unit: 'V', color: 'text-volt-cyan', bg: 'bg-cyan-500/10' },
                { label: 'Current (Iph)', value: `${meterReadings.current}`, unit: 'A', color: 'text-volt-blue', bg: 'bg-blue-500/10' },
                { label: 'Power Factor', value: `${meterReadings.powerFactor}`, unit: '', color: 'text-volt-green', bg: 'bg-green-500/10' },
                { label: 'Frequency', value: `${meterReadings.frequency}`, unit: 'Hz', color: 'text-violet-400', bg: 'bg-violet-500/10' },
                { label: 'MD (KWH)', value: `${meterReadings.mdKwh}`, unit: 'kW', color: 'text-volt-amber', bg: 'bg-amber-500/10' },
                { label: 'Units Today', value: `${meterReadings.unitsToday}`, unit: 'kWh', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              ].map((reading, i) => (
                <motion.div
                  key={reading.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  className={`p-4 rounded-xl ${reading.bg} border border-white/5 text-center`}
                >
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 font-semibold">{reading.label}</p>
                  <p className={`text-2xl font-black ${reading.color} tabular-nums`}>{reading.value}</p>
                  {reading.unit && <p className="text-xs text-gray-500 mt-1">{reading.unit}</p>}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tariff Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-volt-amber/20 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-volt-amber" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Tariff of the Day</h2>
                  <p className="text-xs text-gray-500">Time-of-day electricity pricing</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                <span className="text-xs text-gray-400">Current Rate:</span>
                <span className="text-sm font-black text-volt-cyan">₹{tariffSlots[activeTariffIdx].rate}/kWh</span>
              </div>
            </div>

            {/* Timeline bar */}
            <div className="flex rounded-xl overflow-hidden mb-4 h-3">
              {tariffSlots.map((slot, i) => {
                const widths = [25, 25, 25, 25]; // each slot is 6hrs out of 24hrs = 25%
                const colors = [
                  'bg-amber-400',   // morning
                  'bg-sky-400',     // afternoon
                  'bg-rose-400',    // evening peak
                  'bg-indigo-400',  // night
                ];
                return (
                  <div
                    key={i}
                    className={`${colors[i]} relative transition-all ${i === activeTariffIdx ? 'opacity-100 ring-2 ring-white/40' : 'opacity-40'}`}
                    style={{ width: `${widths[i]}%` }}
                  >
                    {i === activeTariffIdx && (
                      <motion.div
                        className="absolute inset-0 bg-white/30"
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Slot cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {tariffSlots.map((slot, i) => {
                const isActive = i === activeTariffIdx;
                const bgColors = [
                  'border-amber-500/30 bg-amber-500/5',
                  'border-sky-500/30 bg-sky-500/5',
                  'border-rose-500/30 bg-rose-500/5',
                  'border-indigo-500/30 bg-indigo-500/5',
                ];
                const textColors = ['text-amber-400', 'text-sky-400', 'text-rose-400', 'text-indigo-400'];
                return (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border transition-all ${
                      isActive
                        ? `${bgColors[i]} ring-2 ring-white/20 shadow-lg`
                        : 'border-white/5 bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? textColors[i] : 'text-gray-500'}`}>
                        {slot.tag}
                      </span>
                      {isActive && (
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-volt-green animate-pulse" />
                          <span className="text-[10px] text-volt-green font-semibold">NOW</span>
                        </span>
                      )}
                    </div>
                    <p className={`text-xs ${isActive ? 'text-gray-300' : 'text-gray-500'}`}>{slot.label}</p>
                    <p className={`text-xl font-black mt-1 ${isActive ? textColors[i] : 'text-gray-600'}`}>₹{slot.rate}<span className="text-xs font-medium">/kWh</span></p>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* 2x2 Grid for Overview Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {overviewCards.map((card, i) => (
            <Link key={card.title} href={card.href}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`group h-full p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/[0.07] hover:shadow-xl hover:shadow-black/20 transition-all duration-300 relative overflow-hidden`}
              >
                {/* Background faint glow */}
                <div className={`absolute top-0 right-0 w-32 h-32 ${card.bgLight} rounded-bl-full -z-10 transition-transform group-hover:scale-110`} />

                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${card.bgLight} flex items-center justify-center`}>
                      <card.icon className={`w-6 h-6 ${card.color}`} />
                    </div>
                    <h2 className="text-lg font-bold text-white group-hover:text-volt-cyan transition-colors">
                      {card.title}
                    </h2>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-volt-cyan transition-colors transform group-hover:translate-x-1" />
                </div>

                <div className="space-y-4">
                  {card.stats.map((stat, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b border-white/5 pb-3 last:border-0 last:pb-0">
                      <span className="text-sm text-gray-500">{stat.label}</span>
                      <span className={`text-sm font-semibold ${stat.highlight ? card.color : 'text-gray-200'}`}>
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Society Ranking Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-10"
        >
          <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-volt-amber/20 rounded-xl flex items-center justify-center">
                <Trophy className="w-5 h-5 text-volt-amber" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Society Leaderboard</h2>
                <p className="text-sm text-gray-500">Your ranking among {colonyData.totalHomes} homes</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Flat</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Energy Score</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Usage (kW)</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Savings</th>
                  </tr>
                </thead>
                <tbody>
                  {colonyData.flats.map((flat, i) => {
                    const isYou = flat.flat === 'A-301'; // Assuming user is A-301
                    return (
                      <motion.tr
                        key={flat.flat}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`border-b border-white/5 transition-colors ${
                          isYou 
                            ? 'bg-volt-cyan/10 border-volt-cyan/20' 
                            : 'hover:bg-white/5'
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {flat.rank <= 3 ? (
                              <span className={`text-lg ${
                                flat.rank === 1 ? 'text-yellow-400' :
                                flat.rank === 2 ? 'text-gray-400' :
                                'text-amber-600'
                              }`}>
                                {flat.rank === 1 ? '🥇' : flat.rank === 2 ? '🥈' : '🥉'}
                              </span>
                            ) : (
                              <span className="text-gray-500 font-mono w-6 text-center">#{flat.rank}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-semibold ${isYou ? 'text-volt-cyan' : 'text-white'}`}>
                            {flat.flat}
                            {isYou && <span className="ml-2 text-xs bg-volt-cyan/20 px-2 py-0.5 rounded-full">You</span>}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-volt-green to-volt-cyan rounded-full"
                                style={{ width: `${flat.energyScore}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-white">{flat.energyScore}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm text-gray-400">{flat.kw.toFixed(2)} kW</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm font-semibold text-volt-green">₹{flat.savings}</span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>


        
      </div>
    </div>
  );
}
