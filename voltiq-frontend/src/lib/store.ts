import { create } from 'zustand';

export type TariffMode = 'peak' | 'mid' | 'sasta';

export interface Appliance {
  id: string;
  name: string;
  iconName: string; // Storing string name since we can't easily store React components in Zustand without issues
  kw: number;
  isOn: boolean;
  dailyHours: number;
  monthlyCost: number;
  category: string;
  smartEnabled: boolean;
  schedule?: string;
}

export const defaultAppliances: Appliance[] = [
  { id: 'ac', name: 'Air Conditioner', iconName: 'AirVent', kw: 1.5, isOn: true, dailyHours: 8, monthlyCost: 540, category: 'Cooling', smartEnabled: true, schedule: '9AM–12PM, 2PM–6PM' },
  { id: 'geyser', name: 'Geyser', iconName: 'Droplets', kw: 2.0, isOn: false, dailyHours: 0.5, monthlyCost: 93, category: 'Heating', smartEnabled: true, schedule: '5:30AM – Sasta tariff' },
  { id: 'fridge', name: 'Refrigerator', iconName: 'Refrigerator', kw: 0.15, isOn: true, dailyHours: 24, monthlyCost: 108, category: 'Kitchen', smartEnabled: false },
  { id: 'wm', name: 'Washing Machine', iconName: 'WashingMachine', kw: 0.5, isOn: false, dailyHours: 0.75, monthlyCost: 35, category: 'Cleaning', smartEnabled: true, schedule: '6AM – Sasta tariff' },
  { id: 'tv', name: 'Television', iconName: 'Tv', kw: 0.1, isOn: true, dailyHours: 5, monthlyCost: 15, category: 'Entertainment', smartEnabled: false },
  { id: 'lights', name: 'LED Lights (8)', iconName: 'Lightbulb', kw: 0.08, isOn: true, dailyHours: 6, monthlyCost: 14, category: 'Lighting', smartEnabled: true },
  { id: 'fan', name: 'Ceiling Fan (3)', iconName: 'Fan', kw: 0.075, isOn: true, dailyHours: 10, monthlyCost: 68, category: 'Cooling', smartEnabled: false },
  { id: 'router', name: 'Wi-Fi Router', iconName: 'Smartphone', kw: 0.012, isOn: true, dailyHours: 24, monthlyCost: 9, category: 'Electronics', smartEnabled: false },
  { id: 'iron', name: 'Iron', iconName: 'Plug', kw: 1.0, isOn: false, dailyHours: 0.3, monthlyCost: 23, category: 'Utilities', smartEnabled: false },
];

// Auth types
export interface User {
  id: string;
  name: string;
  phone: string;
  discom: string;
  accountType: 'prepaid' | 'postpaid';
  meterNumber?: string;
  customerId?: string;
  address?: string;
  location?: string;
}

// Onboarding types
export interface OnboardingState {
  currentStep: number;
  userInfo: {
    name: string;
    discom: string;
    accountType: 'prepaid' | 'postpaid';
  } | null;
  meterInfo: {
    meterNumber: string;
    connected: boolean;
  } | null;
  appliancePreferences: {
    [key: string]: {
      hours: number;
      temperature?: number;
      timePreference?: string;
      frequency?: number;
    };
  };
}

// Chat types
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'data' | 'suggestion';
}

// Optimization types
export interface OptimizationResult {
  originalCost: number;
  optimizedCost: number;
  savings: number;
  savingsPercent: number;
  schedule: ApplianceSchedule[];
  solveTimeMs: number;
  pipeline: string;
}

export interface ApplianceSchedule {
  applianceId: string;
  applianceName: string;
  scheduledTime: string;
  status: 'scheduled' | 'active' | 'completed';
  tariffZone: 'peak' | 'mid' | 'sasta';
}

// Alert types
export interface Alert {
  id: string;
  type: 'tariff' | 'savings' | 'anomaly';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionLabel?: string;
}

interface VoltStore {
  // Tariff
  tariffMode: TariffMode;
  setTariffMode: (mode: TariffMode) => void;

  // Live data
  liveKW: number;
  setLiveKW: (kw: number) => void;

  // WebSocket
  wsConnected: boolean;
  setWsConnected: (connected: boolean) => void;

  // Grid Impact
  homesSliderValue: number;
  setHomesSliderValue: (value: number) => void;

  // Colony data
  colonyData: ColonyData;
  setColonyData: (data: ColonyData) => void;

  // Appliances
  appliances: Appliance[];
  toggleAppliance: (id: string) => void;
  addAppliance: (appliance: Appliance) => void;
  removeAppliance: (id: string) => void;

  // Auth
  isAuthenticated: boolean;
  user: User | null;
  setUser: (user: User | null) => void;
  login: (phone: string, otp: string, discom?: string, customerId?: string) => Promise<boolean>;
  logout: () => void;

  // Onboarding
  onboarding: OnboardingState;
  setOnboardingStep: (step: number) => void;
  setUserInfo: (info: OnboardingState['userInfo']) => void;
  setMeterInfo: (info: OnboardingState['meterInfo']) => void;
  setAppliancePreferences: (prefs: OnboardingState['appliancePreferences']) => void;
  completeOnboarding: () => void;

  // Chat
  chatMessages: ChatMessage[];
  isTyping: boolean;
  sendMessage: (text: string) => void;
  addBotMessage: (text: string, type?: ChatMessage['type']) => void;
  setIsTyping: (typing: boolean) => void;

  // Optimization
  optimizationResult: OptimizationResult | null;
  isOptimizing: boolean;
  runOptimization: () => Promise<void>;
  applySchedule: () => void;

  // Alerts
  alerts: Alert[];
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp' | 'read'>) => void;
  markAlertRead: (id: string) => void;
  clearAlerts: () => void;
}

export interface FlatData {
  rank: number;
  flat: string;
  savings: number;
  energyScore: number;
  kw: number;
}

export interface ColonyData {
  totalKW: number;
  totalHomes: number;
  totalSaving: number;
  tariff: TariffMode;
  flats: FlatData[];
}

const defaultColonyData: ColonyData = {
  totalKW: 142.7,
  totalHomes: 200,
  totalSaving: 41200,
  tariff: 'mid',
  flats: [
    { rank: 1, flat: 'A-301', savings: 1240, energyScore: 94, kw: 0.52 },
    { rank: 2, flat: 'B-108', savings: 1180, energyScore: 91, kw: 0.61 },
    { rank: 3, flat: 'C-205', savings: 1090, energyScore: 88, kw: 0.68 },
    { rank: 4, flat: 'D-412', savings: 980, energyScore: 85, kw: 0.73 },
    { rank: 5, flat: 'A-104', savings: 920, energyScore: 82, kw: 0.79 },
    { rank: 6, flat: 'B-310', savings: 870, energyScore: 79, kw: 0.84 },
    { rank: 7, flat: 'C-407', savings: 810, energyScore: 76, kw: 0.91 },
    { rank: 8, flat: 'D-202', savings: 760, energyScore: 73, kw: 0.95 },
    { rank: 9, flat: 'A-506', savings: 710, energyScore: 71, kw: 1.02 },
    { rank: 10, flat: 'B-201', savings: 650, energyScore: 68, kw: 1.08 },
  ],
};

const defaultAlerts: Alert[] = [
  {
    id: '1',
    type: 'tariff',
    title: 'Peak Time Starting!',
    message: 'Peak tariff starts in 10 minutes. Consider postponing heavy appliance usage.',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
    actionLabel: 'View Schedule',
  },
  {
    id: '2',
    type: 'savings',
    title: '₹18 Saved Today',
    message: 'You saved ₹18 today by shifting geyser to sasta hours!',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
  },
  {
    id: '3',
    type: 'anomaly',
    title: 'AC Usage Alert',
    message: 'AC running 40% longer than usual. Check if temperature settings are optimal.',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    read: false,
  },
];

export const useVoltStore = create<VoltStore>((set, get) => ({
  tariffMode: 'mid',
  setTariffMode: (mode) => set({ tariffMode: mode }),

  liveKW: 142.7,
  setLiveKW: (kw) => set({ liveKW: kw }),

  wsConnected: false,
  setWsConnected: (connected) => set({ wsConnected: connected }),

  homesSliderValue: 100,
  setHomesSliderValue: (value) => set({ homesSliderValue: value }),

  colonyData: defaultColonyData,
  setColonyData: (data) => set({ colonyData: data }),

  appliances: [],
  toggleAppliance: (id) => set((state) => ({
    appliances: state.appliances.map(a => a.id === id ? { ...a, isOn: !a.isOn } : a)
  })),
  addAppliance: (appliance) => set((state) => ({
    appliances: [...state.appliances, appliance]
  })),
  removeAppliance: (id) => set((state) => ({
    appliances: state.appliances.filter(a => a.id !== id)
  })),

  // Auth
  isAuthenticated: false,
  user: null,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  login: async (phone: string, otp: string, discom?: string, customerId?: string) => {
    // Mock login - in production, call API
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (otp === '123456' || otp === '654321') {
      set({
        isAuthenticated: true,
        user: {
          id: '1',
          name: 'User',
          phone,
          discom: discom || 'UPPCL',
          accountType: 'postpaid',
          customerId: customerId || '',
          address: 'Flat A-301, Green Valley Apartments, Sec-12, Dwarka, New Delhi - 110078',
          location: 'Dwarka, Delhi',
        },
      });
      return true;
    }
    return false;
  },
  logout: () => set({ isAuthenticated: false, user: null }),

  // Onboarding
  onboarding: {
    currentStep: 1,
    userInfo: null,
    meterInfo: null,
    appliancePreferences: {},
  },
  setOnboardingStep: (step) => set((state) => ({
    onboarding: { ...state.onboarding, currentStep: step }
  })),
  setUserInfo: (info) => set((state) => ({
    onboarding: { ...state.onboarding, userInfo: info }
  })),
  setMeterInfo: (info) => set((state) => ({
    onboarding: { ...state.onboarding, meterInfo: info }
  })),
  setAppliancePreferences: (prefs) => set((state) => ({
    onboarding: { ...state.onboarding, appliancePreferences: prefs }
  })),
  completeOnboarding: () => {
    const { onboarding, user } = get();
    if (onboarding.userInfo && user) {
      set({
        user: {
          ...user,
          name: onboarding.userInfo.name,
          discom: onboarding.userInfo.discom,
          accountType: onboarding.userInfo.accountType,
          meterNumber: onboarding.meterInfo?.meterNumber,
        },
      });
    }
  },

  // Chat
  chatMessages: [],
  isTyping: false,
  sendMessage: async (text) => {
    const newMessage: ChatMessage = {
      id: generateMessageId(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };
    set((state) => ({
      chatMessages: [...state.chatMessages, newMessage],
      isTyping: true,
    }));

    try {
      // Call real backend chat API
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, user_id: 'demo' }),
      });
      
      if (!response.ok) throw new Error('Chat failed');
      
      const data = await response.json();
      get().addBotMessage(data.response, 'text');
      set({ isTyping: false });
    } catch (error) {
      console.error('Chat error:', error);
      // Fallback to local bot response
      get().addBotMessage(getBotResponse(text), 'text');
      set({ isTyping: false });
    }
  },
  addBotMessage: (text, type = 'text') => {
    const newMessage: ChatMessage = {
      id: generateMessageId(),
      text,
      sender: 'bot',
      timestamp: new Date(),
      type,
    };
    set((state) => ({
      chatMessages: [...state.chatMessages, newMessage],
    }));
  },
  setIsTyping: (typing) => set({ isTyping: typing }),

  // Optimization
  optimizationResult: null,
  isOptimizing: false,
  runOptimization: async () => {
    set({ isOptimizing: true });
    
    try {
      // Call real backend ML→MILP pipeline
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${BASE_URL}/api/optimize?user_id=demo&balance=300`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) throw new Error('Optimization failed');
      
      const data = await response.json();
      
      // Transform backend response to frontend format if needed
      const result: OptimizationResult = {
        originalCost: data.originalCost || data.baseline_cost || 81.9,
        optimizedCost: data.optimizedCost || data.total_cost || 31.5,
        savings: data.savings || data.savings_rs || 50.4,
        savingsPercent: data.savingsPercent || data.savings_pct || 61.5,
        schedule: (data.schedule || []).map((item: any) => ({
          applianceId: item.applianceId || item.appliance,
          applianceName: item.applianceName || item.appliance,
          scheduledTime: item.scheduledTime || item.time_label || `${item.hour}:00`,
          status: item.status || 'scheduled',
          tariffZone: item.tariffZone || (item.slot_color === 'GREEN' ? 'sasta' : item.slot_color === 'RED' ? 'peak' : 'mid'),
        })),
        solveTimeMs: data.solveTimeMs || data.solve_time_ms || 50,
        pipeline: data.pipeline || 'LFE → BHV → OPC → MILP',
      };
      
      set({ optimizationResult: result, isOptimizing: false });
    } catch (error) {
      console.error('Optimization error:', error);
      // Fallback to mock data if backend fails
      const result: OptimizationResult = {
        originalCost: 61.40,
        optimizedCost: 47.20,
        savings: 14.20,
        savingsPercent: 23,
        schedule: [
          { applianceId: 'geyser', applianceName: 'Geyser', scheduledTime: '5:00 AM', status: 'scheduled', tariffZone: 'sasta' },
          { applianceId: 'wm', applianceName: 'Washing Machine', scheduledTime: '10:00 PM', status: 'scheduled', tariffZone: 'sasta' },
          { applianceId: 'ac', applianceName: 'Air Conditioner', scheduledTime: '1:00 PM', status: 'scheduled', tariffZone: 'mid' },
        ],
        solveTimeMs: 187,
        pipeline: 'LSTM → XGBoost → MILP',
      };
      set({ optimizationResult: result, isOptimizing: false });
    }
  },
  applySchedule: () => {
    const { optimizationResult, appliances } = get();
    if (optimizationResult) {
      const updatedAppliances = appliances.map(a => {
        const schedule = optimizationResult.schedule.find(s => s.applianceId === a.id);
        return schedule ? { ...a, schedule: schedule.scheduledTime } : a;
      });
      set({ appliances: updatedAppliances });
    }
  },

  // Alerts
  alerts: defaultAlerts,
  addAlert: (alert) => {
    const newAlert: Alert = {
      ...alert,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };
    set((state) => ({
      alerts: [newAlert, ...state.alerts],
    }));
  },
  markAlertRead: (id) => set((state) => ({
    alerts: state.alerts.map(a => a.id === id ? { ...a, read: true } : a)
  })),
  clearAlerts: () => set({ alerts: [] }),
}));

// Unique ID generator for chat messages (prevents collision)
let messageIdCounter = 0;
const generateMessageId = () => `msg-${Date.now()}-${++messageIdCounter}`;

// Helper function for bot responses
function getBotResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase();
  
  if (msg.includes('bill') || msg.includes('aaj')) {
    return '💡 Today\'s estimated bill: ₹18.40\n\nBreakdown:\n• AC: ₹8.20\n• Geyser: ₹4.10\n• Other: ₹6.10\n\nYou\'re 12% below average! 🎉';
  }
  
  if (msg.includes('geyser') || msg.includes('chalu')) {
    return '🔥 Geyser scheduled for 5:00 AM (Sasta tariff)\n\nWant to turn it on now? It will cost ₹2.80 extra at current mid tariff.';
  }
  
  if (msg.includes('ac') || msg.includes('band')) {
    return '❄️ AC is currently ON running at 1.5 kW.\n\nRunning during peak hours costs 65% more. Consider scheduling it for mid or sasta tariff times.';
  }
  
  if (msg.includes('tips') || msg.includes('save')) {
    return '💰 Top 3 Savings Tips:\n\n1. Run geyser during 5-6 AM (sasta hours)\n2. Use washing machine after 10 PM\n3. Set AC to 24°C instead of 22°C\n\nPotential monthly savings: ₹420';
  }
  
  return '👋 I can help you with:\n• Check today\'s bill\n• Control appliances\n• Get savings tips\n• View peak hours\n\nWhat would you like to know?';
}
