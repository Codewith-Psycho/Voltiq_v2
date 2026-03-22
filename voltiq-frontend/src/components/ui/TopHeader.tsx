'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, User, X, Zap, TrendingDown, AlertTriangle, Leaf, IndianRupee, Clock, Building2, Hash, LogOut, MapPin } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useVoltStore } from '@/lib/store';

interface Notification {
  id: string;
  type: 'alert' | 'saving' | 'info';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'alert',
    title: 'Peak Tariff Alert!',
    message: 'Tariff shifted to ₹8.5/kWh. Avoid heavy appliances for the next 2 hours.',
    time: '2 min ago',
    read: false,
  },
  {
    id: '2',
    type: 'saving',
    title: 'You saved ₹47 today!',
    message: 'Smart scheduling saved you ₹47 by shifting your geyser to Sasta tariff hours.',
    time: '1 hr ago',
    read: false,
  },
  {
    id: '3',
    type: 'info',
    title: 'Weekly Report Ready',
    message: 'Your weekly energy report shows 23% savings over baseline. Keep it up!',
    time: '3 hrs ago',
    read: true,
  },
  {
    id: '4',
    type: 'saving',
    title: 'Monthly savings: ₹1,240',
    message: 'You\'re the #3 saver in your colony this month. ₹1,240 saved vs baseline.',
    time: '1 day ago',
    read: true,
  },
  {
    id: '5',
    type: 'alert',
    title: 'AC running during Peak',
    message: 'Your AC has been running for 3 hours during peak tariff. Consider reducing temperature.',
    time: '1 day ago',
    read: true,
  },
  {
    id: '6',
    type: 'info',
    title: 'CO₂ Milestone!',
    message: 'You\'ve saved 100 kg of CO₂ this quarter — equivalent to planting 5 trees! 🌳',
    time: '2 days ago',
    read: true,
  },
];

const typeConfig = {
  alert: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  saving: { icon: IndianRupee, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  info: { icon: Zap, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
};

export function TopHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const user = useVoltStore((s) => s.user);
  const logout = useVoltStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    router.push('/login');
  };

  // Don't show on landing, login, and onboarding pages
  if (pathname === '/' || pathname === '/login' || pathname === '/onboarding') return null;

  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  // Page title mapping
  const pageTitles: Record<string, string> = {
    '/energy-usage': 'Energy Usage & Daily Schedules',
    '/appliances': 'Appliances',
    '/billing': 'Billing & Saving',
    '/carbon': 'Carbon Footprints',
    '/dashboard': 'Dashboard Overview',
    '/billing-sim': 'Billing Simulator',
    '/architecture': 'Architecture',
    '/support': 'Customer Support',
  };

  const pageTitle = pageTitles[pathname] || 'Dashboard';

  return (
    <>
      <header className="fixed top-0 right-0 left-[260px] h-16 bg-[#0d1226]/80 backdrop-blur-xl border-b border-white/5 z-30 flex items-center justify-between px-6">
        {/* Page title */}
        <div>
          <h1 className="text-lg font-bold text-white">{pageTitle}</h1>
          <p className="text-xs text-gray-500">Welcome back, {user?.name || 'User'}</p>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Notification bell */}
          <button
            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
            className="relative w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-volt-red text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Profile */}
          <button
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-volt-blue to-volt-cyan flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-sm font-semibold text-white">{user?.name || 'User'}</div>
              <div className="text-[10px] text-gray-500">{user?.discom || 'DISCOM'}</div>
            </div>
          </button>
        </div>
      </header>

      {/* Notification Panel */}
      <AnimatePresence>
        {notifOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setNotifOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed top-16 right-6 w-96 max-h-[70vh] bg-[#111827] rounded-2xl shadow-2xl border border-white/10 z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-volt-blue" />
                  <span className="font-bold text-white">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-volt-red/10 text-volt-red text-xs font-bold rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setNotifOpen(false)}
                  className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Notifications list */}
              <div className="overflow-y-auto max-h-[55vh] scrollbar-hide">
                {mockNotifications.map((notif, i) => {
                  const config = typeConfig[notif.type];
                  return (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`px-5 py-4 border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${
                        !notif.read ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className={`w-9 h-9 ${config.bg} rounded-lg flex items-center justify-center shrink-0`}>
                          <config.icon className={`w-4 h-4 ${config.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <span className={`text-sm font-semibold ${!notif.read ? 'text-white' : 'text-gray-400'}`}>
                              {notif.title}
                            </span>
                            {!notif.read && (
                              <span className="w-2 h-2 rounded-full bg-volt-blue shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notif.message}</p>
                          <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-400">
                            <Clock className="w-3 h-3" />
                            {notif.time}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-white/5 bg-white/5">
                <button className="text-sm text-volt-cyan font-medium hover:underline w-full text-center">
                  Mark all as read
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Profile Dropdown */}
      <AnimatePresence>
        {profileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setProfileOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed top-16 right-6 w-72 bg-[#111827] rounded-2xl shadow-2xl border border-white/10 z-50 overflow-hidden"
            >
              {/* Profile header */}
              <div className="p-5 bg-gradient-to-br from-volt-blue/10 to-volt-cyan/10 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-volt-blue to-volt-cyan flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-white">{user?.name || 'User'}</div>
                    <div className="text-xs text-gray-500">{user?.phone ? `+91 ${user.phone}` : ''}</div>
                  </div>
                </div>
              </div>

              {/* Account details */}
              <div className="p-4 space-y-1 border-b border-white/5">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Building2 className="w-4 h-4 text-volt-blue" />
                    DISCOM
                  </div>
                  <span className="text-sm font-bold text-white">{user?.discom || '—'}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Hash className="w-4 h-4 text-volt-cyan" />
                    Customer ID
                  </div>
                  <span className="text-sm font-bold text-white font-mono">{user?.customerId || '—'}</span>
                </div>
                <div className="flex items-start justify-between py-2">
                  <div className="flex items-center gap-2 text-sm text-gray-400 shrink-0">
                    <MapPin className="w-4 h-4 text-volt-green" />
                    Address
                  </div>
                  <span className="text-xs font-medium text-gray-300 text-right ml-3 leading-relaxed">{user?.address || '—'}</span>
                </div>
              </div>

              {/* Quick stats */}
              <div className="p-4 space-y-1 border-b border-white/5">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <TrendingDown className="w-4 h-4 text-volt-green" />
                    This month savings
                  </div>
                  <span className="text-sm font-bold text-volt-green">₹1,240</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Leaf className="w-4 h-4 text-emerald-500" />
                    CO₂ saved
                  </div>
                  <span className="text-sm font-bold text-emerald-600">36.9 kg</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Zap className="w-4 h-4 text-volt-amber" />
                    Energy score
                  </div>
                  <span className="text-sm font-bold text-volt-amber">⚡94</span>
                </div>
              </div>

              {/* Logout */}
              <div className="p-3">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
