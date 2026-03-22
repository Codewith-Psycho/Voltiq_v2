'use client';

import { motion } from 'framer-motion';
import { Brain, Calculator, BellRing, MessageSquare } from 'lucide-react';

const brains = [
  {
    icon: Brain,
    title: 'ML Engine',
    subtitle: 'Predict & Classify',
    description: 'Forecasts your appliance usage patterns using XGBoost. Predicts next-hour demand so the optimizer can plan ahead.',
    color: 'from-violet-500 to-purple-600',
    bgLight: 'bg-violet-50',
    textColor: 'text-violet-600',
  },
  {
    icon: Calculator,
    title: 'MILP Optimizer',
    subtitle: 'Schedule & Save',
    description: 'Mixed-Integer Linear Programming finds the cheapest schedule for your appliances while respecting your comfort preferences.',
    color: 'from-volt-blue to-blue-600',
    bgLight: 'bg-blue-50',
    textColor: 'text-volt-blue',
  },
  {
    icon: BellRing,
    title: 'Action Engine',
    subtitle: 'Alert & Automate',
    description: 'Real-time tariff change detection triggers instant push notifications and automated appliance scheduling.',
    color: 'from-volt-amber to-orange-500',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-600',
  },
  {
    icon: MessageSquare,
    title: 'Chat Agent',
    subtitle: 'Ask & Understand',
    description: 'Hindi/English AI chatbot answers billing questions, explains usage patterns, and suggests personalized tips.',
    color: 'from-volt-green to-emerald-600',
    bgLight: 'bg-green-50',
    textColor: 'text-green-600',
  },
];

export function SolutionSection() {
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
          <span className="text-volt-cyan font-semibold text-sm tracking-widest uppercase">
            The Solution
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-3">
            Four brains. <span className="text-gradient">One mission.</span>
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto text-lg">
            VoltIQ&apos;s 4-brain architecture turns raw meter data into real savings.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {brains.map((brain, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="group relative"
            >
              <div className="bg-white rounded-2xl p-8 h-full border border-gray-200 shadow-sm group-hover:border-gray-300 transition-all duration-500 group-hover:shadow-xl">
                {/* Top bar accent */}
                <div className={`h-1 w-16 rounded-full bg-gradient-to-r ${brain.color} mb-6`} />

                <div className="flex items-start gap-5">
                  <div className={`w-14 h-14 ${brain.bgLight} rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <brain.icon className={`w-7 h-7 ${brain.textColor}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{brain.title}</h3>
                    <p className={`text-sm font-semibold ${brain.textColor} mb-2`}>
                      {brain.subtitle}
                    </p>
                    <p className="text-gray-600 leading-relaxed">{brain.description}</p>
                  </div>
                </div>

                {/* Flow arrow */}
                {i < brains.length - 1 && (
                  <div className="hidden md:block absolute -bottom-4 right-8 z-10">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md">
                      <span className="text-volt-cyan text-lg">↓</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
