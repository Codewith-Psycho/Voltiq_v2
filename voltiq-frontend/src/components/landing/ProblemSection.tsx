'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Gauge, IndianRupee } from 'lucide-react';

const problems = [
  {
    icon: Gauge,
    stat: '3 Crore',
    label: 'Smart Meters Installed',
    description: 'India has deployed millions of smart meters, but the data flows only to utilities.',
  },
  {
    icon: AlertTriangle,
    stat: 'Zero',
    label: 'Consumer Intelligence',
    description: 'Homeowners get no insights, no optimization, no savings from their own meter data.',
  },
  {
    icon: IndianRupee,
    stat: '₹2,400 Cr',
    label: 'Wasted Annually',
    description: 'Indian households overpay due to peak-hour usage and zero tariff awareness.',
  },
];

export function ProblemSection() {
  return (
    <section className="section-padding bg-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #1B4F8A 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="max-w-6xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-volt-red font-semibold text-sm tracking-widest uppercase">
            The Problem
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-volt-dark mt-3">
            Smart meters, <span className="text-volt-red">dumb experience</span>
          </h2>
          <p className="text-gray-500 mt-4 max-w-2xl mx-auto text-lg">
            India invested ₹22,000 crore in smart metering. Consumers got nothing in return.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative group"
            >
              <div className="glass-light rounded-2xl p-8 h-full border border-red-100/50 group-hover:border-volt-red/20 transition-all duration-300 group-hover:shadow-xl">
                <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-red-100 transition-colors">
                  <item.icon className="w-7 h-7 text-volt-red" />
                </div>
                <div className="text-3xl font-black text-volt-dark mb-1">{item.stat}</div>
                <div className="text-sm font-semibold text-volt-red mb-3">{item.label}</div>
                <p className="text-gray-500 leading-relaxed">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
