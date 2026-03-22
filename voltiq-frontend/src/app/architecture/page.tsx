'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Calculator, BellRing, MessageSquare, ChevronDown, Cpu, ArrowRight } from 'lucide-react';

const brains = [
  {
    id: 'ml',
    icon: Brain,
    title: 'ML Engine',
    subtitle: 'Predict & Classify',
    shortDesc: 'XGBoost-based demand forecasting and appliance classification',
    fullDesc: `The ML Engine is the eyes and ears of VoltIQ. It uses XGBoost ensemble models trained on historical smart meter data to:

• **Forecast next-hour demand** with 94% accuracy using 15-minute interval data
• **Classify appliance signatures** from aggregate load curves (AC, geyser, washing machine)
• **Detect anomalies** — unusual consumption spikes that could indicate faults or theft
• **Predict tariff windows** — learns DISCOM billing patterns to predict upcoming rate changes

Input: Raw smart meter data (kWh, voltage, power factor)
Output: Demand forecast, appliance breakdown, tariff prediction`,
    color: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-500',
    bgLight: 'bg-violet-50',
    textColor: 'text-violet-600',
    borderColor: 'border-violet-200',
  },
  {
    id: 'milp',
    icon: Calculator,
    title: 'MILP Optimizer',
    subtitle: 'Schedule & Save',
    shortDesc: 'Mixed-Integer Linear Programming for optimal appliance scheduling',
    fullDesc: `The MILP Optimizer is VoltIQ's brain for cost minimization. It formulates the scheduling problem as a mathematical optimization:

• **Objective**: Minimize total electricity cost over 24-hour horizon
• **Decision variables**: ON/OFF state for each controllable appliance per time slot
• **Constraints**: User comfort bounds, appliance duty cycles, maximum demand limits
• **Tariff awareness**: Shifts flexible loads (washing machine, geyser, EV charging) to Sasta tariff periods

Uses Google OR-Tools CP-SAT solver for real-time optimization under 200ms.

Input: Demand forecast, tariff schedule, user preferences
Output: Optimal appliance schedule, estimated savings`,
    color: 'from-volt-blue to-blue-600',
    bg: 'bg-volt-blue',
    bgLight: 'bg-blue-50',
    textColor: 'text-volt-blue',
    borderColor: 'border-blue-200',
  },
  {
    id: 'action',
    icon: BellRing,
    title: 'Action Engine',
    subtitle: 'Alert & Automate',
    shortDesc: 'Real-time tariff change detection and automated appliance control',
    fullDesc: `The Action Engine bridges intelligence and execution. When the tariff changes or the optimizer generates a new schedule:

• **Instant notifications** — Push alerts within 2 seconds of tariff change detection
• **Automated scheduling** — Sends ON/OFF commands to smart plugs and IoT devices
• **Override protection** — Users can always override automated decisions
• **Learning from overrides** — Adjusts future recommendations based on user behavior

Handles edge cases: power outages, meter communication failures, conflicting schedules.

Input: MILP schedule, tariff updates, WebSocket events
Output: Push notifications, device commands, override logging`,
    color: 'from-volt-amber to-orange-500',
    bg: 'bg-volt-amber',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-200',
  },
  {
    id: 'chat',
    icon: MessageSquare,
    title: 'Chat Agent',
    subtitle: 'Ask & Understand',
    shortDesc: 'Hindi/English AI chatbot for billing queries and energy tips',
    fullDesc: `The Chat Agent is VoltIQ's human interface. Built on RAG (Retrieval-Augmented Generation) with energy domain knowledge:

• **Bilingual** — Responds in Hindi and English, understands code-switching
• **Bill explainer** — "Why is my bill ₹847 this month?" with itemized breakdown
• **Tip generator** — Personalized energy-saving recommendations based on usage patterns
• **Complaint helper** — Drafts DISCOM complaint letters with relevant meter data attached

Uses Gemini Pro with custom energy domain fine-tuning and meter data RAG pipeline.

Input: User query (text/voice), historical meter data, billing records
Output: Natural language response, actionable suggestions`,
    color: 'from-volt-green to-emerald-600',
    bg: 'bg-volt-green',
    bgLight: 'bg-green-50',
    textColor: 'text-green-600',
    borderColor: 'border-green-200',
  },
];

export default function ArchitecturePage() {
  const [expandedBrain, setExpandedBrain] = useState<string | null>(null);

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Cpu className="w-5 h-5 text-volt-blue" />
            <span className="text-volt-blue font-semibold text-sm tracking-widest uppercase">
              System Architecture
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            The <span className="text-gradient">4-Brain</span> Engine
          </h1>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            Click each brain to explore how VoltIQ transforms raw meter data into real savings.
          </p>
        </motion.div>

        {/* Flow diagram */}
        <div className="relative mb-16">
          {/* Connection line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-300 via-blue-300 via-amber-300 to-green-300 hidden md:block" />

          <div className="space-y-6">
            {brains.map((brain, i) => {
              const isExpanded = expandedBrain === brain.id;
              const isLast = i === brains.length - 1;

              return (
                <motion.div
                  key={brain.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className="relative"
                >
                  {/* Flow node dot */}
                  <div className={`absolute left-1/2 -translate-x-1/2 -top-3 w-6 h-6 rounded-full ${brain.bg} hidden md:flex items-center justify-center z-10`}>
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>

                  {/* Card */}
                  <button
                    onClick={() => setExpandedBrain(isExpanded ? null : brain.id)}
                    className="w-full text-left"
                  >
                    <div className={`glass-light rounded-2xl p-6 md:p-8 border-2 transition-all duration-300 ${
                      isExpanded
                        ? `${brain.borderColor} shadow-xl`
                        : 'border-transparent hover:border-gray-200 hover:shadow-lg'
                    }`}>
                      <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 ${brain.bgLight} rounded-xl flex items-center justify-center shrink-0`}>
                          <brain.icon className={`w-7 h-7 ${brain.textColor}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${brain.textColor} bg-white px-2 py-0.5 rounded-full border ${brain.borderColor}`}>
                              BRAIN {i + 1}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-white mt-1">{brain.title}</h3>
                          <p className="text-sm text-gray-500">{brain.shortDesc}</p>
                        </div>
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ChevronDown className={`w-6 h-6 ${brain.textColor}`} />
                        </motion.div>
                      </div>

                      {/* Expanded content */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-6 pt-6 border-t border-gray-100">
                              <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                                {brain.fullDesc}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </button>

                  {/* Arrow between cards */}
                  {!isLast && (
                    <div className="flex justify-center py-2 md:hidden">
                      <ArrowRight className="w-5 h-5 text-gray-300 rotate-90" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Data flow summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-light rounded-2xl p-8 text-center"
        >
          <h3 className="text-lg font-bold text-white mb-4">End-to-End Data Flow</h3>
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
            {[
              { label: 'Smart Meter', color: 'bg-gray-100 text-gray-600' },
              { label: '→', color: 'text-gray-400' },
              { label: 'ML Engine', color: 'bg-violet-100 text-violet-600' },
              { label: '→', color: 'text-gray-400' },
              { label: 'MILP Optimizer', color: 'bg-blue-100 text-volt-blue' },
              { label: '→', color: 'text-gray-400' },
              { label: 'Action Engine', color: 'bg-amber-100 text-amber-600' },
              { label: '→', color: 'text-gray-400' },
              { label: 'Chat Agent', color: 'bg-green-100 text-green-600' },
              { label: '→', color: 'text-gray-400' },
              { label: '₹ Savings', color: 'bg-volt-green text-white font-bold' },
            ].map((item, i) => (
              <span
                key={i}
                className={`px-3 py-1.5 rounded-lg font-medium ${item.color}`}
              >
                {item.label}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
