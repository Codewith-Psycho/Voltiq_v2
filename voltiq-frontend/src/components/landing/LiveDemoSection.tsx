'use client';

import { motion } from 'framer-motion';
import { Monitor, Wifi } from 'lucide-react';
import Link from 'next/link';

export function LiveDemoSection() {
  return (
    <section className="section-padding bg-volt-dark relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(rgba(0,188,212,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,188,212,0.3) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="max-w-6xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-volt-cyan font-semibold text-sm tracking-widest uppercase flex items-center justify-center gap-2">
            <Wifi className="w-4 h-4" />
            Live Demo
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-3">
            See it in <span className="text-volt-cyan">action</span>
          </h2>
          <p className="text-gray-400 mt-4 max-w-xl mx-auto text-lg">
            Real-time colony dashboard with live tariff monitoring and smart savings tracking.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          {/* Browser mockup */}
          <div className="glass rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            {/* Browser bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/10">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-amber-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 rounded-md bg-white/5 text-gray-400 text-xs font-mono">
                  voltiq.app/dashboard
                </div>
              </div>
            </div>

            {/* Dashboard preview */}
            <div className="p-6 md:p-8">
              {/* Tariff banner preview */}
              <div className="bg-gradient-to-r from-volt-amber/20 via-volt-amber/30 to-volt-amber/20 rounded-xl p-4 mb-6 border border-volt-amber/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-volt-amber animate-pulse" />
                    <span className="text-volt-amber font-bold text-lg">MID TARIFF</span>
                  </div>
                  <span className="text-gray-400 text-sm">₹5.2 / kWh</span>
                </div>
              </div>

              {/* Stats preview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Colony Load', value: '142.7 kW', color: 'text-volt-cyan' },
                  { label: 'Homes Active', value: '200', color: 'text-white' },
                  { label: 'Savings Today', value: '₹1,380', color: 'text-volt-green' },
                  { label: 'CO₂ Saved', value: '12.4 kg', color: 'text-volt-green' },
                ].map((stat, i) => (
                  <div key={i} className="glass rounded-xl p-4 text-center">
                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-gray-400 text-xs mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Mini leaderboard preview */}
              <div className="glass rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Monitor className="w-4 h-4 text-volt-cyan" />
                  <span className="text-white font-semibold text-sm">Top Savers</span>
                </div>
                {['A-301  ⚡94  ₹1,240', 'B-108  ⚡91  ₹1,180', 'C-205  ⚡88  ₹1,090'].map((row, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0"
                  >
                    <span className={`text-xs font-bold w-5 ${i === 0 ? 'text-volt-amber' : 'text-gray-500'}`}>
                      #{i + 1}
                    </span>
                    <span className="text-gray-300 text-sm font-mono flex-1">{row}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Glow effect */}
          <div className="absolute -inset-4 bg-volt-cyan/5 rounded-3xl blur-3xl -z-10" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-10"
        >
          <Link href="/dashboard" className="btn-glow inline-flex items-center gap-2">
            Open Full Dashboard →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
