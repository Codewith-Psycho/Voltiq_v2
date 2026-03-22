'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  MessageSquare, Phone, Mail, ChevronRight, Headset,
  FileText, Clock, CheckCircle2, AlertCircle,
} from 'lucide-react';

export default function SupportPage() {
  const [complaintText, setComplaintText] = useState('');
  const [complaintSubmitted, setComplaintSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<'submit' | 'history'>('submit');

  const handleComplaintSubmit = () => {
    if (complaintText.trim()) {
      setComplaintSubmitted(true);
      setComplaintText('');
      setTimeout(() => setComplaintSubmitted(false), 3000);
    }
  };

  const mockTickets = [
    { id: 'TKT-2024-001', subject: 'Billing discrepancy for March', status: 'resolved', date: '18 Mar 2026', priority: 'medium' },
    { id: 'TKT-2024-002', subject: 'Smart meter not syncing data', status: 'in-progress', date: '20 Mar 2026', priority: 'high' },
    { id: 'TKT-2024-003', subject: 'Request for tariff plan change', status: 'open', date: '21 Mar 2026', priority: 'low' },
  ];

  const statusConfig = {
    'resolved': { color: 'text-volt-green', bg: 'bg-green-500/10', icon: CheckCircle2, label: 'Resolved' },
    'in-progress': { color: 'text-volt-amber', bg: 'bg-amber-500/10', icon: Clock, label: 'In Progress' },
    'open': { color: 'text-volt-blue', bg: 'bg-blue-500/10', icon: AlertCircle, label: 'Open' },
  };

  return (
    <div className="ml-0 lg:ml-[260px] pt-16 min-h-screen bg-[#0a0f1c]">
      <div className="p-6 lg:p-10 max-w-[1200px]">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-volt-blue/20 rounded-xl flex items-center justify-center">
              <Headset className="w-5 h-5 text-volt-blue" />
            </div>
            <h1 className="text-2xl font-bold text-white">Customer Support</h1>
          </div>
          <p className="text-gray-500">Get help, submit complaints, and track your support tickets.</p>
        </div>

        {/* Contact Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <a 
            href="tel:1800-XXX-XXXX"
            className="flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/10 hover:border-volt-cyan/30 hover:bg-volt-cyan/5 transition-all group"
          >
            <div className="w-12 h-12 bg-volt-cyan/10 rounded-xl flex items-center justify-center shrink-0">
              <Phone className="w-6 h-6 text-volt-cyan" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Toll Free</p>
              <p className="text-xs text-gray-500">1800-XXX-XXXX</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-volt-cyan transition-colors" />
          </a>

          <a 
            href="mailto:support@voltiq.in"
            className="flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/10 hover:border-volt-cyan/30 hover:bg-volt-cyan/5 transition-all group"
          >
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6 text-volt-green" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Email Support</p>
              <p className="text-xs text-gray-500">support@voltiq.in</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-volt-cyan transition-colors" />
          </a>

          <Link 
            href="/chat"
            className="flex items-center gap-4 p-5 bg-gradient-to-r from-volt-cyan/10 to-volt-blue/10 rounded-2xl border border-volt-cyan/20 hover:border-volt-cyan/40 transition-all group"
          >
            <div className="w-12 h-12 bg-volt-amber/10 rounded-xl flex items-center justify-center shrink-0">
              <MessageSquare className="w-6 h-6 text-volt-amber" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">AI Chat Assistant</p>
              <p className="text-xs text-gray-500">Get instant help 24/7</p>
            </div>
            <ChevronRight className="w-5 h-5 text-volt-cyan group-hover:translate-x-1 transition-all" />
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'submit' as const, label: 'Submit Complaint', icon: MessageSquare },
            { id: 'history' as const, label: 'Ticket History', icon: FileText },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-volt-blue text-white shadow-md'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Submit Complaint */}
        {activeTab === 'submit' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 rounded-2xl border border-white/10 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-volt-red/20 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-volt-red" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Submit a Complaint</h2>
                <p className="text-sm text-gray-500">Report issues or share feedback about our services</p>
              </div>
            </div>

            {complaintSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 bg-volt-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✅</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Complaint Submitted!</h3>
                <p className="text-gray-400 text-sm">We&apos;ll get back to you within 24 hours.</p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    placeholder="Brief description of your issue"
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-volt-cyan/50 focus:ring-2 focus:ring-volt-cyan/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Describe your issue
                  </label>
                  <textarea
                    value={complaintText}
                    onChange={(e) => setComplaintText(e.target.value)}
                    placeholder="Provide details about your complaint or feedback..."
                    className="w-full h-40 p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-volt-cyan/50 focus:ring-2 focus:ring-volt-cyan/20 transition-all resize-none"
                  />
                </div>
                <button
                  onClick={handleComplaintSubmit}
                  disabled={!complaintText.trim()}
                  className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    complaintText.trim()
                      ? 'bg-gradient-to-r from-volt-cyan to-volt-blue text-white hover:shadow-lg hover:shadow-volt-cyan/20'
                      : 'bg-white/10 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Submit Complaint
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Ticket History */}
        {activeTab === 'history' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden"
          >
            <div className="p-5 border-b border-white/5">
              <h2 className="text-lg font-bold text-white">Your Tickets</h2>
              <p className="text-sm text-gray-500 mt-1">Track the status of your support requests</p>
            </div>

            <div className="divide-y divide-white/5">
              {mockTickets.map((ticket, i) => {
                const config = statusConfig[ticket.status as keyof typeof statusConfig];
                return (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-5 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-xs text-gray-500 font-mono">{ticket.id}</span>
                          <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                            <config.icon className="w-3 h-3" />
                            {config.label}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-white">{ticket.subject}</p>
                        <p className="text-xs text-gray-500 mt-1">{ticket.date}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-600 shrink-0 mt-1" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        <div className="pb-20 lg:pb-0" />
      </div>
    </div>
  );
}
