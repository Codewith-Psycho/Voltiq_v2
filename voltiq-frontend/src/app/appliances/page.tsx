'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AirVent, Droplets, WashingMachine, Tv, Lightbulb, Plug, Refrigerator,
  Fan, Smartphone, Power, Clock, Zap, TrendingDown, AlertTriangle, Plus, X, Trash2,
} from 'lucide-react';

import { useVoltStore, defaultAppliances } from '@/lib/store';
import type { Appliance } from '@/lib/store';

const iconMap: Record<string, React.ElementType> = {
  AirVent, Droplets, WashingMachine, Tv, Lightbulb, Plug, Refrigerator, Fan, Smartphone
};

export default function AppliancesPage() {
  const appliances = useVoltStore(state => state.appliances);
  const toggleAppliance = useVoltStore(state => state.toggleAppliance);
  const addAppliance = useVoltStore(state => state.addAppliance);
  const removeAppliance = useVoltStore(state => state.removeAppliance);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAppliance, setSelectedAppliance] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const categories = appliances.length > 0
    ? ['All', ...Array.from(new Set(appliances.map(a => a.category)))]
    : ['All'];

  const filtered = selectedCategory === 'All'
    ? appliances
    : appliances.filter(a => a.category === selectedCategory);

  const totalKW = appliances.filter(a => a.isOn).reduce((s, a) => s + a.kw, 0);
  const totalMonthlyCost = appliances.reduce((s, a) => s + a.monthlyCost, 0);
  const smartCount = appliances.filter(a => a.smartEnabled).length;
  const onCount = appliances.filter(a => a.isOn).length;

  // Appliances available to add (not already added)
  const availableToAdd = defaultAppliances.filter(
    d => !appliances.some(a => a.id === d.id)
  );

  const handleAddAppliance = (app: Appliance) => {
    addAppliance({ ...app, isOn: false });
  };

  return (
    <div className="ml-0 lg:ml-[260px] pt-16 min-h-screen bg-[#0a0f1c]">
      <div className="p-6 lg:p-8 max-w-[1400px]">
        {/* Header with Add button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Appliances</h1>
            <p className="text-gray-500 text-sm mt-1">Manage and monitor your home appliances</p>
          </div>
          {availableToAdd.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setAddModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-volt-cyan text-gray-900 rounded-xl font-semibold text-sm hover:bg-volt-cyan/90 transition-all shadow-lg shadow-volt-cyan/20"
            >
              <Plus className="w-4 h-4" />
              Add Appliance
            </motion.button>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Power, label: 'Active Now', value: `${onCount} / ${appliances.length}`, color: 'text-volt-green', bg: 'bg-green-500/10' },
            { icon: Zap, label: 'Current Load', value: `${totalKW.toFixed(2)} kW`, color: 'text-volt-cyan', bg: 'bg-cyan-500/10' },
            { icon: TrendingDown, label: 'Monthly Cost', value: `₹${totalMonthlyCost}`, color: 'text-volt-blue', bg: 'bg-blue-500/10' },
            { icon: Clock, label: 'Smart Enabled', value: `${smartCount} appliances`, color: 'text-volt-amber', bg: 'bg-amber-500/10' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-light rounded-2xl p-5"
            >
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Empty state */}
        {appliances.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
              <Zap className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Appliances Added</h3>
            <p className="text-gray-500 text-sm mb-6 text-center max-w-md">
              Start by adding your home appliances to monitor energy usage and get smart optimization recommendations.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setAddModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-volt-cyan text-gray-900 rounded-xl font-semibold hover:bg-volt-cyan/90 transition-all shadow-lg shadow-volt-cyan/20"
            >
              <Plus className="w-5 h-5" />
              Add Your First Appliance
            </motion.button>
          </motion.div>
        ) : (
          <>
            {/* Category filter */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-volt-blue text-white shadow-md'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Appliance Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((app, i) => {
                const IconComponent = iconMap[app.iconName] || Zap;
                return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`rounded-2xl p-5 border-2 transition-all duration-300 cursor-pointer ${
                    app.isOn
                      ? 'bg-white/5 border-volt-cyan/20 shadow-lg shadow-volt-cyan/5'
                      : 'bg-white/[0.03] border-white/5'
                  }`}
                  onClick={() => setSelectedAppliance(selectedAppliance === app.id ? null : app.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                        app.isOn ? 'bg-volt-cyan/10' : 'bg-white/10'
                      }`}>
                        <IconComponent className={`w-6 h-6 ${app.isOn ? 'text-volt-cyan' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <div className={`text-sm font-bold ${app.isOn ? 'text-white' : 'text-gray-500'}`}>
                          {app.name}
                        </div>
                        <div className="text-xs text-gray-400">{app.category}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Remove button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); removeAppliance(app.id); }}
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/20 flex items-center justify-center transition-colors group"
                        title="Remove appliance"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-gray-500 group-hover:text-red-400 transition-colors" />
                      </button>

                      {/* Toggle */}
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleAppliance(app.id); }}
                        className={`w-12 h-7 rounded-full transition-all duration-300 relative ${
                          app.isOn ? 'bg-volt-cyan' : 'bg-gray-300'
                        }`}
                      >
                        <motion.div
                          animate={{ x: app.isOn ? 22 : 2 }}
                          className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
                        />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className={`font-bold ${app.isOn ? 'text-volt-cyan' : 'text-gray-400'}`}>
                        {app.kw} kW
                      </span>
                      <span>{app.dailyHours} hrs/day</span>
                    </div>
                    <span className="text-sm font-bold text-volt-blue">₹{app.monthlyCost}/mo</span>
                  </div>

                  {/* Smart badge and schedule */}
                  {app.smartEnabled && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-volt-cyan/10 text-volt-cyan rounded-full">
                          ⚡ VoltIQ Smart
                        </span>
                        {app.schedule && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-volt-green" />
                            <span className="text-[10px] text-volt-green font-semibold">Scheduled</span>
                          </div>
                        )}
                      </div>
                      {app.schedule && (
                        <div className="p-2 bg-volt-green/10 border border-volt-green/30 rounded-lg">
                          <p className="text-[10px] text-gray-300">
                            <span className="font-semibold">Next run:</span> {app.schedule}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Expanded details */}
                  <AnimatePresence>
                    {selectedAppliance === app.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Daily energy</span>
                            <span className="font-semibold">{(app.kw * app.dailyHours).toFixed(2)} kWh</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Monthly energy</span>
                            <span className="font-semibold">{(app.kw * app.dailyHours * 30).toFixed(1)} kWh</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">% of total bill</span>
                            <span className="font-semibold">{totalMonthlyCost > 0 ? ((app.monthlyCost / totalMonthlyCost) * 100).toFixed(1) : '0.0'}%</span>
                          </div>
                          {!app.smartEnabled && (
                            <div className="flex items-center gap-1 text-xs text-volt-amber mt-2">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Enable smart scheduling to save more</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Add Appliance Modal */}
      <AnimatePresence>
        {addModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setAddModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-[10%] mx-auto max-w-lg bg-[#111827] rounded-2xl shadow-2xl border border-white/10 z-50 overflow-hidden"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                <div>
                  <h3 className="text-lg font-bold text-white">Add Appliance</h3>
                  <p className="text-xs text-gray-500 mt-1">Select appliances to add to your dashboard</p>
                </div>
                <button
                  onClick={() => setAddModalOpen(false)}
                  className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Appliance list */}
              <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
                {availableToAdd.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500 text-sm">All appliances have been added!</p>
                  </div>
                ) : (
                  availableToAdd.map((app) => {
                    const IconComponent = iconMap[app.iconName] || Zap;
                    return (
                      <motion.button
                        key={app.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => {
                          handleAddAppliance(app);
                          if (availableToAdd.length <= 1) setAddModalOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-volt-cyan/30 hover:bg-volt-cyan/5 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                            <IconComponent className="w-5 h-5 text-gray-400" />
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-semibold text-white">{app.name}</div>
                            <div className="text-xs text-gray-500">{app.kw} kW • {app.category}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-volt-cyan">
                          <Plus className="w-4 h-4" />
                          <span className="text-xs font-semibold">Add</span>
                        </div>
                      </motion.button>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
