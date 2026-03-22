'use client';

import { motion } from 'framer-motion';

interface LoadingPipelineProps {
  currentStep: number;
}

const steps = [
  {
    id: 1,
    label: 'Loading ML Models',
    icon: '🧠',
    description: 'LSTM for demand forecasting',
  },
  {
    id: 2,
    label: 'Running XGBoost',
    icon: '📊',
    description: 'Tariff prediction analysis',
  },
  {
    id: 3,
    label: 'Solving MILP',
    icon: '⚡',
    description: 'Mixed Integer Linear Programming',
  },
  {
    id: 4,
    label: 'Generating Schedule',
    icon: '✅',
    description: 'Optimized appliance schedule',
  },
];

export default function LoadingPipeline({ currentStep }: LoadingPipelineProps) {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;

        return (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative flex items-center gap-4 p-4 rounded-xl border transition-all ${
              isActive
                ? 'bg-volt-cyan/10 border-volt-cyan/30'
                : isCompleted
                ? 'bg-volt-green/10 border-volt-green/30'
                : 'bg-white/5 border-white/10'
            }`}
          >
            {/* Step icon */}
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl relative ${
                isActive
                  ? 'bg-volt-cyan/20'
                  : isCompleted
                  ? 'bg-volt-green/20'
                  : 'bg-white/10'
              }`}
            >
              {isCompleted ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-2xl"
                >
                  ✅
                </motion.div>
              ) : (
                step.icon
              )}
              
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-xl border-2 border-volt-cyan"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [1, 0.5, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}
            </div>

            {/* Step content */}
            <div className="flex-1">
              <h4
                className={`font-semibold ${
                  isActive
                    ? 'text-volt-cyan'
                    : isCompleted
                    ? 'text-volt-green'
                    : 'text-gray-400'
                }`}
              >
                {step.label}
              </h4>
              <p className="text-sm text-gray-500">{step.description}</p>
            </div>

            {/* Loading indicator */}
            {isActive && (
              <div className="flex items-center gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-volt-cyan"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Completion check */}
            {isCompleted && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                className="w-6 h-6 rounded-full bg-volt-green flex items-center justify-center"
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            )}
          </motion.div>
        );
      })}

      {/* Progress bar */}
      <div className="mt-6">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Progress</span>
          <span>{steps.length > 0 ? Math.round((currentStep / steps.length) * 100) : 0}%</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-volt-cyan to-volt-green"
            initial={{ width: 0 }}
            animate={{ width: `${steps.length > 0 ? (currentStep / steps.length) * 100 : 0}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
}
