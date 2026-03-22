'use client';

import { motion } from 'framer-motion';
import { KeyRound, ArrowLeft } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  onResend: () => void;
  phoneNumber: string;
  onBack: () => void;
  loading?: boolean;
  title?: string;
  subtitle?: string;
  dummyOtp?: string;
}

export default function OTPInput({ 
  length = 6, 
  onComplete, 
  onResend, 
  phoneNumber,
  onBack,
  loading,
  title = 'Enter OTP',
  subtitle,
  dummyOtp = '123456',
}: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every(digit => digit !== '') && !loading) {
      onComplete(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, length);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('');
    setOtp([...newOtp, ...Array(length - newOtp.length).fill('')]);
    
    if (newOtp.length === length) {
      onComplete(pastedData);
    }
  };

  const handleResend = () => {
    setOtp(Array(length).fill(''));
    setResendTimer(30);
    onResend();
    inputRefs.current[0]?.focus();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="glass-light rounded-2xl p-8 border border-white/10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-volt-cyan transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Change number</span>
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-volt-cyan/10 flex items-center justify-center">
            <KeyRound className="w-6 h-6 text-volt-cyan" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className="text-sm text-gray-400">
              {subtitle || `Sent to +91 ${phoneNumber.slice(0, 5)}*****`}
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-center mb-6" role="group" aria-label="OTP input">
          {otp.map((digit, index) => (
            <motion.input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              disabled={loading}
              aria-label={`OTP digit ${index + 1} of ${length}`}
              className={`w-12 h-14 text-center text-2xl font-bold bg-white/5 border rounded-xl text-white focus:outline-none transition-all ${
                digit
                  ? 'border-volt-cyan bg-volt-cyan/10'
                  : 'border-white/10 hover:border-white/20'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
            />
          ))}
        </div>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-2 text-volt-cyan mb-4"
          >
            <div className="w-5 h-5 border-2 border-volt-cyan border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Verifying...</span>
          </motion.div>
        )}

        <div className="text-center">
          {resendTimer > 0 ? (
            <p className="text-sm text-gray-500">
              Resend OTP in{' '}
              <span className="text-volt-cyan font-semibold">{resendTimer}s</span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              className="text-sm text-volt-cyan hover:text-volt-cyan/80 font-semibold transition-colors"
            >
              Resend OTP
            </button>
          )}
        </div>

        <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/5">
          <p className="text-xs text-gray-400 text-center">
            💡 <span className="font-semibold">Test OTP:</span> Use{' '}
            <code className="text-volt-cyan font-mono">{dummyOtp}</code> to verify
          </p>
        </div>
      </div>
    </motion.div>
  );
}
