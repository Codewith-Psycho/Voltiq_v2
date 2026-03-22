'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { simulateBilling, BillingResult } from '@/lib/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  Receipt, Zap, TreePine, TrendingDown, Loader2, Leaf,
  AirVent, Droplets, WashingMachine, Tv, Lightbulb,
} from 'lucide-react';

const appliances = [
  { id: 'ac', name: 'Air Conditioner', icon: AirVent, kw: 1.5 },
  { id: 'geyser', name: 'Geyser', icon: Droplets, kw: 2.0 },
  { id: 'wm', name: 'Washing Machine', icon: WashingMachine, kw: 0.5 },
  { id: 'tv', name: 'Television', icon: Tv, kw: 0.1 },
  { id: 'lights', name: 'Lighting', icon: Lightbulb, kw: 0.06 },
];

const discoms = ['BSES Rajdhani', 'BSES Yamuna', 'TATA Power Delhi', 'MSEDCL', 'BESCOM', 'KSEB'];

export default function BillingSimPage() {
  const [selectedAppliances, setSelectedAppliances] = useState<string[]>(['ac', 'geyser', 'lights']);
  const [hours, setHours] = useState(8);
  const [budget, setBudget] = useState(1000);
  const [comfort, setComfort] = useState(7);
  const [discom, setDiscom] = useState('BSES Rajdhani');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BillingResult | null>(null);

  const toggleAppliance = (id: string) => {
    setSelectedAppliances((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await simulateBilling({
        appliances: selectedAppliances,
        hours,
        budget,
        comfort,
        discom,
      });
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Receipt className="w-5 h-5 text-volt-blue" />
            <span className="text-volt-blue font-semibold text-sm tracking-widest uppercase">
              Billing Simulator
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Simulate your <span className="text-gradient">savings</span>
          </h1>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            Enter your home details and see how much VoltIQ could save you every month.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="glass-light rounded-2xl p-8">
              <h2 className="text-lg font-bold text-white mb-6">Your Home Profile</h2>

              {/* Appliances */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-700 mb-3 block">
                  Appliances
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {appliances.map((app) => {
                    const selected = selectedAppliances.includes(app.id);
                    return (
                      <button
                        key={app.id}
                        onClick={() => toggleAppliance(app.id)}
                        className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium ${
                          selected
                            ? 'border-volt-blue bg-volt-blue/5 text-volt-blue'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        <app.icon className="w-4 h-4" />
                        {app.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hours */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Average usage hours/day: <span className="text-volt-blue">{hours}h</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={24}
                  value={hours}
                  onChange={(e) => setHours(parseInt(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #1B4F8A 0%, #1B4F8A ${(hours / 24) * 100}%, #e5e7eb ${(hours / 24) * 100}%, #e5e7eb 100%)`,
                  }}
                />
              </div>

              {/* Budget */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Monthly budget: <span className="text-volt-blue">₹{budget}</span>
                </label>
                <input
                  type="range"
                  min={200}
                  max={5000}
                  step={50}
                  value={budget}
                  onChange={(e) => setBudget(parseInt(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #1B4F8A 0%, #1B4F8A ${((budget - 200) / 4800) * 100}%, #e5e7eb ${((budget - 200) / 4800) * 100}%, #e5e7eb 100%)`,
                  }}
                />
              </div>

              {/* Comfort */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Comfort priority: <span className="text-volt-blue">{comfort}/10</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={comfort}
                  onChange={(e) => setComfort(parseInt(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #1B4F8A 0%, #1B4F8A ${((comfort - 1) / 9) * 100}%, #e5e7eb ${((comfort - 1) / 9) * 100}%, #e5e7eb 100%)`,
                  }}
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Max savings</span>
                  <span>Max comfort</span>
                </div>
              </div>

              {/* DISCOM */}
              <div className="mb-8">
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Your DISCOM
                </label>
                <select
                  value={discom}
                  onChange={(e) => setDiscom(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-volt-blue focus:outline-none transition-colors bg-white text-sm"
                >
                  {discoms.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading || selectedAppliances.length === 0}
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Simulating...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Simulate Savings
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Results */}
          <div>
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Comparison */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass-light rounded-2xl p-6 border-2 border-gray-200">
                      <span className="text-sm text-gray-500 font-medium">Without VoltIQ</span>
                      <div className="text-3xl font-black text-gray-400 mt-2">
                        ₹{result.baseline}
                      </div>
                      <span className="text-xs text-gray-400">per month</span>
                    </div>
                    <div className="bg-gradient-to-br from-volt-green/10 to-green-50 rounded-2xl p-6 border-2 border-volt-green/30">
                      <span className="text-sm text-volt-green font-medium">With VoltIQ</span>
                      <div className="text-3xl font-black text-volt-green mt-2">
                        ₹{result.optimized}
                      </div>
                      <span className="text-xs text-volt-green">per month</span>
                    </div>
                  </div>

                  {/* Savings highlight */}
                  <div className="bg-gradient-to-r from-volt-blue/10 to-volt-cyan/10 rounded-2xl p-6 border border-volt-blue/20 flex items-center gap-4">
                    <div className="w-14 h-14 bg-volt-blue/10 rounded-xl flex items-center justify-center">
                      <TrendingDown className="w-7 h-7 text-volt-blue" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-volt-blue">
                        ₹{result.savings} saved/month
                      </div>
                      <div className="text-sm text-gray-500">
                        That&apos;s {result.savingsPercent}% lower bills
                      </div>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="glass-light rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">6-Month Projection</h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                        <BarChart data={result.monthlyData} barGap={4}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1a2332',
                              border: '1px solid #e5e7eb',
                              borderRadius: '12px',
                              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            }}
                            formatter={(value) => [`₹${value}`, '']}
                          />
                          <Legend />
                          <Bar dataKey="baseline" name="Without VoltIQ" fill="#d1d5db" radius={[6, 6, 0, 0]} />
                          <Bar dataKey="optimized" name="With VoltIQ" fill="#1B4F8A" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* CO2 Card */}
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-green-200/50">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                        <Leaf className="w-7 h-7 text-volt-green" />
                      </div>
                      <div>
                        <div className="text-2xl font-black text-volt-green">
                          {result.co2Saved} kg CO₂
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <TreePine className="w-4 h-4 text-volt-green" />
                          Equivalent to planting {result.treesEquivalent} trees
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-light rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center min-h-[400px]"
                >
                  <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                    <Receipt className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-400 mb-2">
                    Your savings report
                  </h3>
                  <p className="text-gray-400 max-w-xs">
                    Fill in your home profile and click &quot;Simulate&quot; to see your personalized savings report.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
