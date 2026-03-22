'use client';

import { motion } from 'framer-motion';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { Gauge, Percent, Zap } from 'lucide-react';

const stats = [
  {
    icon: Gauge,
    value: 30000000,
    displayValue: '3 Cr+',
    suffix: '',
    label: 'Smart Meters',
    description: 'Already installed across India',
    color: 'text-volt-cyan',
    bg: 'from-cyan-500/10 to-cyan-500/5',
  },
  {
    icon: Percent,
    value: 23,
    displayValue: '23',
    suffix: '%',
    label: 'Average Savings',
    description: 'On monthly electricity bills',
    color: 'text-volt-green',
    bg: 'from-green-500/10 to-green-500/5',
  },
  {
    icon: Zap,
    value: 6,
    displayValue: '6',
    suffix: ' GW',
    label: 'Peak Shaving',
    description: 'At 1 crore home scale',
    color: 'text-volt-amber',
    bg: 'from-amber-500/10 to-amber-500/5',
  },
];

export function NumbersSection() {
  return (
    <section className="section-padding bg-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-volt-blue font-semibold text-sm tracking-widest uppercase">
            By The Numbers
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-3">
            Impact at <span className="text-gradient">scale</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative group"
            >
              <div className={`bg-white rounded-3xl p-10 text-center border border-gray-200 shadow-sm group-hover:shadow-xl transition-all duration-500 group-hover:scale-[1.02]`}>
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-50 shadow-md flex items-center justify-center mb-6 group-hover:shadow-lg transition-shadow">
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <div className={`text-5xl md:text-6xl font-black ${stat.color} mb-2`}>
                  {stat.value < 100 ? (
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} duration={2} />
                  ) : (
                    stat.displayValue
                  )}
                </div>
                <div className="text-xl font-bold text-gray-900 mb-2">{stat.label}</div>
                <p className="text-gray-600">{stat.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
