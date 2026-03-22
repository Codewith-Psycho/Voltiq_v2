'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Building2, 
  CreditCard, 
  Hash, 
  Camera, 
  Check,
  ChevronRight,
  ChevronLeft,
  Zap,
  Thermometer,
  Clock,
  Calendar
} from 'lucide-react';
import { useVoltStore } from '@/lib/store';
import { GlassCard } from '@/components/ui/GlassCard';

export default function OnboardingPage() {
  const router = useRouter();
  const {
    onboarding,
    setOnboardingStep,
    setUserInfo,
    setMeterInfo,
    setAppliancePreferences,
    completeOnboarding,
  } = useVoltStore();

  const [formData, setFormData] = useState<{
    name: string;
    discom: string;
    accountType: 'prepaid' | 'postpaid';
    meterNumber: string;
    selectedAppliances: string[];
    preferences: Record<string, {
      hours?: number;
      temperature?: number;
      timePreference?: string;
      frequency?: number;
    }>;
  }>({
    name: '',
    discom: 'UPPCL',
    accountType: 'postpaid' as 'prepaid' | 'postpaid',
    meterNumber: '',
    selectedAppliances: [] as string[],
    preferences: {} as Record<string, {
      hours?: number;
      temperature?: number;
      timePreference?: string;
      frequency?: number;
    }>,
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const [meterConnected, setMeterConnected] = useState(false);

  const discoms = ['UPPCL', 'BSES', 'MSEDCL', 'TPPDL'];
  
  // Fixed 7 appliances for onboarding
  const applianceOptions = [
    { id: 'ac', name: 'Air Conditioner', kw: 1.5, icon: '❄️', dailyHours: 8 },
    { id: 'geyser', name: 'Geyser', kw: 2.0, icon: '🔥', dailyHours: 1 },
    { id: 'wm', name: 'Washing Machine', kw: 0.5, icon: '🧺', dailyHours: 1 },
    { id: 'fridge', name: 'Refrigerator', kw: 0.15, icon: '🧊', dailyHours: 24 },
    { id: 'tv', name: 'Television', kw: 0.1, icon: '📺', dailyHours: 4 },
    { id: 'pump', name: 'Water Pump', kw: 0.75, icon: '💧', dailyHours: 2 },
    { id: 'lights', name: 'LED Lights', kw: 0.08, icon: '💡', dailyHours: 6 },
  ];

  const handleNext = async () => {
    if (onboarding.currentStep === 1) {
      setUserInfo({
        name: formData.name,
        discom: formData.discom,
        accountType: formData.accountType,
      });
      setOnboardingStep(2);
    } else if (onboarding.currentStep === 2) {
      // Simulate meter connection
      setIsConnecting(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setMeterConnected(true);
      setMeterInfo({
        meterNumber: formData.meterNumber,
        connected: true,
      });
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsConnecting(false);
      setOnboardingStep(3);
    } else if (onboarding.currentStep === 3) {
      setAppliancePreferences(formData.preferences as Record<string, {
        hours: number;
        temperature?: number;
        timePreference?: string;
        frequency?: number;
      }>);
      completeOnboarding();
      router.push('/dashboard');
    }
  };

  const handleBack = () => {
    if (onboarding.currentStep > 1) {
      setOnboardingStep(onboarding.currentStep - 1);
    }
  };

  const toggleAppliance = (id: string) => {
    setFormData(prev => ({
      ...prev,
      selectedAppliances: prev.selectedAppliances.includes(id)
        ? prev.selectedAppliances.filter(a => a !== id)
        : [...prev.selectedAppliances, id],
    }));
  };

  const updatePreference = (applianceId: string, key: string, value: number | string) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [applianceId]: {
          ...prev.preferences[applianceId],
          [key]: value,
        },
      },
    }));
  };

  const canProceed = () => {
    if (onboarding.currentStep === 1) {
      return formData.name.length > 0;
    }
    if (onboarding.currentStep === 2) {
      return formData.meterNumber.length > 0;
    }
    if (onboarding.currentStep === 3) {
      return formData.selectedAppliances.length > 0;
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-volt-cyan/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-volt-green/10 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10 min-h-screen p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Zap className="w-8 h-8 text-volt-cyan" fill="currentColor" />
              <h1 className="text-3xl font-black text-white">
                Volt<span className="text-volt-cyan">IQ</span>
              </h1>
            </div>
            <p className="text-gray-400">Let&apos;s set up your account</p>
          </motion.div>

          {/* Progress steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8 max-w-md mx-auto"
          >
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className="relative">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                      onboarding.currentStep >= step
                        ? 'bg-volt-cyan text-gray-900'
                        : 'bg-white/10 text-gray-500'
                    }`}
                  >
                    {onboarding.currentStep > step ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      step
                    )}
                  </div>
                  {onboarding.currentStep === step && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-volt-cyan"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [1, 0, 1],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </div>
                {step < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-all ${
                      onboarding.currentStep > step
                        ? 'bg-volt-cyan'
                        : 'bg-white/10'
                    }`}
                  />
                )}
              </div>
            ))}
          </motion.div>

          {/* Step content */}
          <AnimatePresence mode="wait">
            {onboarding.currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <GlassCard className="p-6 md:p-8">
                  <h2 className="text-2xl font-bold text-white mb-6">Basic Information</h2>

                  <div className="space-y-6">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Enter your name"
                          className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-volt-cyan/50 focus:ring-2 focus:ring-volt-cyan/20 transition-all"
                        />
                      </div>
                    </div>

                    {/* DISCOM */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Distribution Company (DISCOM)
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {discoms.map((discom) => (
                          <button
                            key={discom}
                            onClick={() => setFormData({ ...formData, discom })}
                            className={`p-4 rounded-xl border transition-all ${
                              formData.discom === discom
                                ? 'bg-volt-blue/20 border-volt-blue text-white'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                            }`}
                          >
                            <Building2 className="w-5 h-5 mx-auto mb-2" />
                            <span className="text-sm font-semibold">{discom}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Account Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Account Type
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {(['prepaid', 'postpaid'] as const).map((type) => (
                          <button
                            key={type}
                            onClick={() => setFormData({ ...formData, accountType: type })}
                            className={`p-4 rounded-xl border transition-all ${
                              formData.accountType === type
                                ? 'bg-volt-green/20 border-volt-green text-white'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                            }`}
                          >
                            <CreditCard className="w-5 h-5 mx-auto mb-2" />
                            <span className="text-sm font-semibold capitalize">{type}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {onboarding.currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <GlassCard className="p-6 md:p-8">
                  <h2 className="text-2xl font-bold text-white mb-6">Connect Your Meter</h2>

                  <AnimatePresence mode="wait">
                    {!meterConnected ? (
                      <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-6"
                      >
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">
                            Meter Number
                          </label>
                          <div className="relative">
                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                              type="text"
                              value={formData.meterNumber}
                              onChange={(e) => setFormData({ ...formData, meterNumber: e.target.value })}
                              placeholder="Enter 12-digit meter number"
                              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-volt-cyan/50 focus:ring-2 focus:ring-volt-cyan/20 transition-all font-mono"
                              maxLength={12}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            {formData.meterNumber.length}/12 digits
                          </p>
                        </div>

                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10" />
                          </div>
                          <div className="relative flex justify-center">
                            <span className="px-4 bg-[#0a0f1c] text-sm text-gray-500">or</span>
                          </div>
                        </div>

                        <button className="w-full p-4 rounded-xl border border-dashed border-white/20 hover:border-volt-cyan/50 hover:bg-volt-cyan/5 transition-all">
                          <Camera className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-400">Scan Electricity Bill</p>
                        </button>

                        {isConnecting && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-4 bg-volt-cyan/10 border border-volt-cyan/30 rounded-xl"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-5 h-5 border-2 border-volt-cyan border-t-transparent rounded-full animate-spin" />
                              <span className="text-sm text-volt-cyan">Connecting to meter...</span>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-8"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2, type: 'spring' }}
                          className="w-20 h-20 bg-volt-green/20 rounded-full flex items-center justify-center mx-auto mb-4"
                        >
                          <Check className="w-10 h-10 text-volt-green" />
                        </motion.div>
                        <h3 className="text-xl font-bold text-white mb-2">Meter Connected!</h3>
                        <p className="text-gray-400">Successfully connected to meter {formData.meterNumber}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </motion.div>
            )}

            {onboarding.currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <GlassCard className="p-6 md:p-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Appliance Setup</h2>
                  <p className="text-gray-400 mb-6">Select appliances you want to optimize</p>

                  <div className="space-y-4 mb-6">
                    {applianceOptions.map((appliance) => {
                      const isSelected = formData.selectedAppliances.includes(appliance.id);
                      
                      return (
                        <motion.div
                          key={appliance.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-4 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-volt-cyan/10 border-volt-cyan/30'
                              : 'bg-white/5 border-white/10 hover:border-white/20'
                          }`}
                          onClick={() => toggleAppliance(appliance.id)}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                isSelected ? 'bg-volt-cyan/20' : 'bg-white/10'
                              }`}>
                                <span className="text-xl">{appliance.icon}</span>
                              </div>
                              <div>
                                <h4 className="font-semibold text-white">{appliance.name}</h4>
                                <p className="text-xs text-gray-500">{appliance.kw} kW</p>
                              </div>
                            </div>
                            <div
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                isSelected
                                  ? 'bg-volt-cyan border-volt-cyan'
                                  : 'border-gray-600'
                              }`}
                            >
                              {isSelected && <Check className="w-4 h-4 text-gray-900" />}
                            </div>
                          </div>

                          <AnimatePresence>
                            {isSelected && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="space-y-3 pt-3 border-t border-white/10"
                              >
                                {appliance.id === 'ac' && (
                                  <div>
                                    <label className="text-xs text-gray-400 flex items-center gap-2 mb-2">
                                      <Thermometer className="w-3 h-3" />
                                      Preferred Temperature: {formData.preferences[appliance.id]?.temperature || 24}°C
                                    </label>
                                    <input
                                      type="range"
                                      min="18"
                                      max="28"
                                      value={formData.preferences[appliance.id]?.temperature || 24}
                                      onChange={(e) => updatePreference(appliance.id, 'temperature', parseInt(e.target.value))}
                                      onClick={(e) => e.stopPropagation()}
                                      className="w-full accent-volt-cyan"
                                    />
                                  </div>
                                )}
                                
                                <div>
                                  <label className="text-xs text-gray-400 flex items-center gap-2 mb-2">
                                    <Clock className="w-3 h-3" />
                                    Daily Usage: {formData.preferences[appliance.id]?.hours || appliance.dailyHours}h
                                  </label>
                                  <input
                                    type="range"
                                    min="0"
                                    max="24"
                                    value={formData.preferences[appliance.id]?.hours || appliance.dailyHours}
                                    onChange={(e) => updatePreference(appliance.id, 'hours', parseInt(e.target.value))}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-full accent-volt-cyan"
                                  />
                                </div>

                                {appliance.id === 'geyser' && (
                                  <div>
                                    <label className="text-xs text-gray-400 mb-2 block">Time Preference</label>
                                    <select
                                      value={formData.preferences[appliance.id]?.timePreference || 'morning'}
                                      onChange={(e) => updatePreference(appliance.id, 'timePreference', e.target.value)}
                                      onClick={(e) => e.stopPropagation()}
                                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-volt-cyan/50"
                                    >
                                      <option value="morning">Morning (5-7 AM)</option>
                                      <option value="evening">Evening (6-8 PM)</option>
                                      <option value="night">Night (10-11 PM)</option>
                                    </select>
                                  </div>
                                )}

                                {appliance.id === 'wm' && (
                                  <div>
                                    <label className="text-xs text-gray-400 flex items-center gap-2 mb-2">
                                      <Calendar className="w-3 h-3" />
                                      Weekly Frequency: {formData.preferences[appliance.id]?.frequency || 3} times
                                    </label>
                                    <input
                                      type="range"
                                      min="1"
                                      max="7"
                                      value={formData.preferences[appliance.id]?.frequency || 3}
                                      onChange={(e) => updatePreference(appliance.id, 'frequency', parseInt(e.target.value))}
                                      onClick={(e) => e.stopPropagation()}
                                      className="w-full accent-volt-cyan"
                                    />
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>

                  {formData.selectedAppliances.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 bg-volt-green/10 border border-volt-green/30 rounded-xl"
                    >
                      <p className="text-sm text-volt-green text-center">
                        ✨ {formData.selectedAppliances.length} appliances selected for optimization
                      </p>
                    </motion.div>
                  )}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4 mt-8"
          >
            {onboarding.currentStep > 1 && (
              <button
                onClick={handleBack}
                className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
            
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                canProceed()
                  ? 'bg-volt-cyan text-gray-900 hover:bg-volt-cyan/90 hover:scale-[1.02]'
                  : 'bg-white/5 text-gray-600 cursor-not-allowed'
              }`}
            >
              {onboarding.currentStep === 3 ? 'Complete Setup' : 'Next'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
