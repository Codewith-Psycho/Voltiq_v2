'use client';

import { motion } from 'framer-motion';
import { Building2, Hash } from 'lucide-react';
import { useState } from 'react';

interface DiscomInputProps {
  discom: string;
  customerId: string;
  onDiscomChange: (value: string) => void;
  onCustomerIdChange: (value: string) => void;
  onSubmit: () => void;
  loading?: boolean;
}

const DISCOM_LIST = [
  'BSES Yamuna',
  'BSES Rajdhani',
  'TATA Power Delhi',
  'MSEDCL',
  'UPPCL',
  'JVVNL',
  'PSPCL',
  'CESC Kolkata',
  'BESCOM Bangalore',
  'TNEB Chennai',
];

export default function DiscomInput({
  discom,
  customerId,
  onDiscomChange,
  onCustomerIdChange,
  onSubmit,
  loading,
}: DiscomInputProps) {
  const [touched, setTouched] = useState(false);

  const canSubmit = discom.length > 0 && customerId.length >= 6 && !loading;

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canSubmit) {
      onSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="glass-light rounded-2xl p-8 border border-white/10">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-volt-cyan/10 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-volt-cyan" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Select Your DISCOM</h3>
            <p className="text-sm text-gray-400">
              Choose your electricity distribution company
            </p>
          </div>
        </div>

        {/* DISCOM Dropdown */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Distribution Company
          </label>
          <div className="relative">
            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
            <select
              value={discom}
              onChange={(e) => onDiscomChange(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-volt-cyan/50 focus:ring-2 focus:ring-volt-cyan/20 transition-all text-base font-medium appearance-none cursor-pointer"
              disabled={loading}
            >
              <option value="" className="bg-gray-900 text-gray-400">
                -- Select DISCOM --
              </option>
              {DISCOM_LIST.map((d) => (
                <option key={d} value={d} className="bg-gray-900 text-white">
                  {d}
                </option>
              ))}
            </select>
            {/* Custom dropdown arrow */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Customer ID */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Customer ID / Consumer Number
          </label>
          <div className="relative">
            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={customerId}
              onChange={(e) => {
                onCustomerIdChange(e.target.value);
                setTouched(true);
              }}
              onKeyDown={handleKeyPress}
              placeholder="e.g. 301234567890"
              aria-label="Customer ID"
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-volt-cyan/50 focus:ring-2 focus:ring-volt-cyan/20 transition-all text-lg font-medium font-mono"
              disabled={loading}
            />
            {customerId.length >= 6 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-volt-green flex items-center justify-center"
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            )}
          </div>
          {touched && customerId.length > 0 && customerId.length < 6 && (
            <p className="text-xs text-volt-red mt-2">Customer ID must be at least 6 characters</p>
          )}
        </div>

        <motion.button
          onClick={onSubmit}
          disabled={!canSubmit}
          className={`w-full mt-4 py-4 rounded-xl font-semibold text-lg transition-all ${
            canSubmit
              ? 'bg-volt-cyan text-gray-900 hover:bg-volt-cyan/90 hover:scale-[1.02]'
              : 'bg-white/5 text-gray-600 cursor-not-allowed'
          }`}
          whileHover={canSubmit ? { scale: 1.02 } : {}}
          whileTap={canSubmit ? { scale: 0.98 } : {}}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
              Verifying...
            </div>
          ) : (
            'Continue'
          )}
        </motion.button>

        <p className="text-xs text-gray-500 text-center mt-4">
          Your Customer ID can be found on your electricity bill
        </p>
      </div>
    </motion.div>
  );
}
