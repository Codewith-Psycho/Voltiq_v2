'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, TrendingDown, AlertTriangle, Clock, Check, Trash2, Filter } from 'lucide-react';
import { useVoltStore } from '@/lib/store';
import { GlassCard } from '@/components/ui/GlassCard';
import { useState } from 'react';

const alertIcons = {
  tariff: AlertCircle,
  savings: TrendingDown,
  anomaly: AlertTriangle,
};

const alertColors = {
  tariff: {
    bg: 'bg-volt-red/10',
    border: 'border-volt-red/30',
    text: 'text-volt-red',
    icon: 'bg-volt-red/20',
  },
  savings: {
    bg: 'bg-volt-green/10',
    border: 'border-volt-green/30',
    text: 'text-volt-green',
    icon: 'bg-volt-green/20',
  },
  anomaly: {
    bg: 'bg-volt-amber/10',
    border: 'border-volt-amber/30',
    text: 'text-volt-amber',
    icon: 'bg-volt-amber/20',
  },
};

export default function AlertsPage() {
  const { alerts, markAlertRead, clearAlerts } = useVoltStore();
  const [filter, setFilter] = useState<'all' | 'tariff' | 'savings' | 'anomaly'>('all');

  const filteredAlerts = filter === 'all' 
    ? alerts 
    : alerts.filter(a => a.type === filter);

  const unreadCount = alerts.filter(a => !a.read).length;

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="ml-0 lg:ml-[260px] pt-16 min-h-screen bg-[#0a0f1c] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-black text-white">Alerts</h1>
            {alerts.length > 0 && (
              <button
                onClick={() => clearAlerts()}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all flex items-center gap-2 text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <p className="text-gray-400">Stay updated with your energy notifications</p>
            {unreadCount > 0 && (
              <span className="px-3 py-1 rounded-full bg-volt-red/20 text-volt-red text-xs font-semibold">
                {unreadCount} unread
              </span>
            )}
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 mb-6 overflow-x-auto pb-2"
        >
          <div className="flex items-center gap-2 text-gray-400">
            <Filter className="w-4 h-4" />
            <span className="text-sm">Filter:</span>
          </div>
          {(['all', 'tariff', 'savings', 'anomaly'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                filter === type
                  ? 'bg-volt-cyan text-gray-900'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          <GlassCard className="p-4 bg-volt-red/10 border-volt-red/30">
            <p className="text-xs text-gray-400 mb-1">Tariff Alerts</p>
            <p className="text-2xl font-black text-volt-red">
              {alerts.filter(a => a.type === 'tariff').length}
            </p>
          </GlassCard>

          <GlassCard className="p-4 bg-volt-green/10 border-volt-green/30">
            <p className="text-xs text-gray-400 mb-1">Savings</p>
            <p className="text-2xl font-black text-volt-green">
              {alerts.filter(a => a.type === 'savings').length}
            </p>
          </GlassCard>

          <GlassCard className="p-4 bg-volt-amber/10 border-volt-amber/30">
            <p className="text-xs text-gray-400 mb-1">Anomalies</p>
            <p className="text-2xl font-black text-volt-amber">
              {alerts.filter(a => a.type === 'anomaly').length}
            </p>
          </GlassCard>
        </motion.div>

        {/* Alerts list */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredAlerts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <GlassCard className="p-12 text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-gray-600" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">All caught up!</h3>
                  <p className="text-gray-400">No {filter !== 'all' && filter} alerts at the moment.</p>
                </GlassCard>
              </motion.div>
            ) : (
              filteredAlerts.map((alert, index) => {
                const Icon = alertIcons[alert.type];
                const colors = alertColors[alert.type];

                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                    onClick={() => !alert.read && markAlertRead(alert.id)}
                    className="cursor-pointer"
                  >
                    <GlassCard
                      className={`p-6 ${colors.bg} ${colors.border} ${
                        alert.read ? 'opacity-60' : ''
                      } hover:scale-[1.01] transition-all`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`w-12 h-12 rounded-xl ${colors.icon} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-6 h-6 ${colors.text}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <h3 className={`font-bold ${colors.text}`}>{alert.title}</h3>
                            <div className="flex items-center gap-2 text-xs text-gray-500 flex-shrink-0">
                              <Clock className="w-3 h-3" />
                              <span>{formatTime(alert.timestamp)}</span>
                            </div>
                          </div>

                          <p className="text-sm text-gray-300 mb-3">{alert.message}</p>

                          <div className="flex items-center gap-3">
                            {alert.actionLabel && (
                              <button className={`px-4 py-2 rounded-lg ${colors.bg} border ${colors.border} ${colors.text} text-xs font-semibold hover:scale-105 transition-all`}>
                                {alert.actionLabel}
                              </button>
                            )}

                            {!alert.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAlertRead(alert.id);
                                }}
                                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-xs hover:text-white hover:border-white/20 transition-all"
                              >
                                Mark as read
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Unread indicator */}
                        {!alert.read && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`w-3 h-3 rounded-full ${colors.text.replace('text-', 'bg-')} flex-shrink-0`}
                          />
                        )}
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        {/* Info footer */}
        {filteredAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <GlassCard className="p-4 text-center">
              <p className="text-xs text-gray-500">
                💡 VoltIQ monitors your energy usage 24/7 and sends smart alerts to help you save more
              </p>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </div>
  );
}
