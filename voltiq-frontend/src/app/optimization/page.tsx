'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { TrendingDown, Clock, ChevronRight, Sparkles } from 'lucide-react';
import { useVoltStore } from '@/lib/store';
import { GlassCard } from '@/components/ui/GlassCard';
import LoadingPipeline from '@/components/optimization/LoadingPipeline';

export default function OptimizationPage() {
  const router = useRouter();
  const { optimizationResult, isOptimizing, runOptimization, applySchedule } = useVoltStore();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!optimizationResult && !isOptimizing) {
      runOptimization();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isOptimizing) {
      const interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < 4) return prev + 1;
          clearInterval(interval);
          return prev;
        });
      }, 750);
      return () => clearInterval(interval);
    }
  }, [isOptimizing]);

  const handleApplySchedule = () => {
    applySchedule();
    router.push('/appliances');
  };

  return (
    <div className="ml-0 lg:ml-[260px] pt-16 min-h-screen bg-[#0a0f1c] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          {isOptimizing ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
              >
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-volt-cyan/20 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-volt-cyan animate-pulse" />
                  </div>
                  <h1 className="text-3xl font-black text-white">
                    Running Optimization...
                  </h1>
                </div>
                <p className="text-gray-400">AI is analyzing your energy patterns</p>
              </motion.div>

              <GlassCard className="p-8">
                <LoadingPipeline currentStep={currentStep} />
              </GlassCard>
            </motion.div>
          ) : optimizationResult ? (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <h1 className="text-3xl font-black text-white mb-2">Optimization Complete! 🎉</h1>
                <p className="text-gray-400">Here&apos;s your personalized energy-saving plan</p>
              </motion.div>

              {/* Savings comparison */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid md:grid-cols-3 gap-4 mb-8"
              >
                <GlassCard className="p-6 bg-volt-red/10 border-volt-red/30">
                  <p className="text-sm text-gray-400 mb-2">Without VoltIQ</p>
                  <p className="text-3xl font-black text-volt-red">
                    ₹{optimizationResult.originalCost.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Today&apos;s estimated cost</p>
                </GlassCard>

                <GlassCard className="p-6 bg-volt-green/10 border-volt-green/30 relative overflow-hidden">
                  <div className="absolute top-0 right-0 text-6xl opacity-10">✨</div>
                  <p className="text-sm text-gray-400 mb-2">With VoltIQ</p>
                  <p className="text-3xl font-black text-volt-green">
                    ₹{optimizationResult.optimizedCost.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Optimized cost</p>
                </GlassCard>

                <GlassCard className="p-6 bg-gradient-to-br from-volt-cyan/20 to-volt-green/20 border-volt-cyan/30">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-4 h-4 text-volt-green" />
                    <p className="text-sm text-gray-400">You Save</p>
                  </div>
                  <p className="text-3xl font-black text-white">
                    ₹{optimizationResult.savings.toFixed(2)}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-volt-green"
                        initial={{ width: 0 }}
                        animate={{ width: `${optimizationResult.savingsPercent}%` }}
                        transition={{ delay: 0.5, duration: 1 }}
                      />
                    </div>
                    <span className="text-xs font-bold text-volt-green">
                      {optimizationResult.savingsPercent}%
                    </span>
                  </div>
                </GlassCard>
              </motion.div>

              {/* Schedule */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <GlassCard className="p-6 md:p-8">
                  <h2 className="text-xl font-bold text-white mb-6">Optimized Schedule</h2>
                  
                  <div className="space-y-3">
                    {optimizationResult.schedule.map((item, i) => (
                      <motion.div
                        key={item.applianceId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            item.tariffZone === 'sasta' ? 'bg-volt-green/20' : 
                            item.tariffZone === 'mid' ? 'bg-volt-amber/20' : 'bg-volt-red/20'
                          }`}>
                            {item.applianceId === 'geyser' ? '🔥' : 
                             item.applianceId === 'wm' ? '🌀' : 
                             item.applianceId === 'ac' ? '❄️' : '💡'}
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{item.applianceName}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="w-3 h-3 text-gray-500" />
                              <span className="text-sm text-gray-400">{item.scheduledTime}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            item.tariffZone === 'sasta' ? 'bg-volt-green/20 text-volt-green' :
                            item.tariffZone === 'mid' ? 'bg-volt-amber/20 text-volt-amber' :
                            'bg-volt-red/20 text-volt-red'
                          }`}>
                            {item.tariffZone === 'sasta' ? '🟢 Sasta' : 
                             item.tariffZone === 'mid' ? '🟡 Mid' : '🔴 Peak'}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-6 p-4 bg-volt-blue/10 border border-volt-blue/30 rounded-xl"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Solution computed by</p>
                        <p className="font-mono text-xs text-volt-cyan mt-1">
                          {optimizationResult.pipeline}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Solved in</p>
                        <p className="text-lg font-bold text-white">{optimizationResult.solveTimeMs}ms</p>
                      </div>
                    </div>
                  </motion.div>
                </GlassCard>
              </motion.div>

              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="flex gap-4 mt-8"
              >
                <button
                  onClick={() => runOptimization()}
                  className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                >
                  Re-optimize
                </button>
                
                <button
                  onClick={handleApplySchedule}
                  className="flex-1 px-6 py-3 rounded-xl bg-volt-green text-gray-900 font-semibold hover:bg-volt-green/90 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  Apply Schedule
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
