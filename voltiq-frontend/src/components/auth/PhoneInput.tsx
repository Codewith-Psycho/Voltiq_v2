'use client';

import { motion } from 'framer-motion';
import { Phone } from 'lucide-react';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading?: boolean;
}

export default function PhoneInput({ value, onChange, onSubmit, loading }: PhoneInputProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value.length === 10) {
      onSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="glass-light rounded-2xl p-8 border border-white/10">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-volt-cyan/10 flex items-center justify-center">
            <Phone className="w-6 h-6 text-volt-cyan" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Enter Phone Number</h3>
            <p className="text-sm text-gray-400">We&apos;ll send you a verification code</p>
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium" aria-hidden="true">
            +91
          </div>
          <input
            type="tel"
            value={value}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 10);
              onChange(val);
            }}
            onKeyDown={handleKeyPress}
            placeholder="9876543210"
            aria-label="Phone number (10 digits)"
            aria-describedby="phone-hint"
            className="w-full pl-16 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-volt-cyan/50 focus:ring-2 focus:ring-volt-cyan/20 transition-all text-lg font-medium"
            disabled={loading}
          />
          {value.length === 10 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-volt-green flex items-center justify-center"
              aria-label="Valid phone number"
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
          )}
        </div>

        <div id="phone-hint" className="mt-2 text-xs text-gray-500">
          {value.length}/10 digits
        </div>

        <motion.button
          onClick={onSubmit}
          disabled={value.length !== 10 || loading}
          className={`w-full mt-6 py-4 rounded-xl font-semibold text-lg transition-all ${
            value.length === 10 && !loading
              ? 'bg-volt-cyan text-gray-900 hover:bg-volt-cyan/90 hover:scale-[1.02]'
              : 'bg-white/5 text-gray-600 cursor-not-allowed'
          }`}
          whileHover={value.length === 10 && !loading ? { scale: 1.02 } : {}}
          whileTap={value.length === 10 && !loading ? { scale: 0.98 } : {}}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
              Sending OTP...
            </div>
          ) : (
            'Continue'
          )}
        </motion.button>

        <p className="text-xs text-gray-500 text-center mt-4">
          By continuing, you agree to VoltIQ&apos;s Terms of Service and Privacy Policy
        </p>
      </div>
    </motion.div>
  );
}
