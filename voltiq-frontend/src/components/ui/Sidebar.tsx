'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, BarChart3, Cpu, Receipt, Leaf,
  ChevronLeft, ChevronRight, LayoutDashboard,
  Sparkles, Bell, TrendingUp, MessageSquare, Headset
} from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Home', icon: Zap },
  { href: '/dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
  { href: '/energy-usage', label: 'Energy Usage & Schedules', icon: BarChart3 },
  { href: '/appliances', label: 'Appliances', icon: Cpu },
  { href: '/optimization', label: 'Optimization', icon: Sparkles },
  { href: '/insights', label: 'Insights', icon: TrendingUp },
  { href: '/alerts', label: 'Alerts', icon: Bell },
  { href: '/chat', label: 'AI Assistant', icon: MessageSquare },
  { href: '/billing', label: 'Billing & Saving', icon: Receipt },
  { href: '/carbon', label: 'Carbon Footprints', icon: Leaf },
  { href: '/support', label: 'Customer Support', icon: Headset },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Don't show sidebar on landing, login, and onboarding pages
  if (pathname === '/' || pathname === '/login' || pathname === '/onboarding') return null;

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 bottom-0 z-40 bg-volt-dark border-r border-white/5 flex flex-col"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/5">
        <div className="w-9 h-9 bg-gradient-to-br from-volt-cyan to-volt-blue rounded-lg flex items-center justify-center shadow-lg shrink-0">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="text-xl font-bold text-white overflow-hidden whitespace-nowrap"
            >
              Volt<span className="text-volt-cyan">IQ</span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto scrollbar-hide" aria-label="Main navigation">
        {navLinks.map(({ href, label, icon: Icon }) => {
          // Exact match or starts with href followed by /
          const isActive = pathname === href || 
            (href !== '/' && pathname.startsWith(href + '/'));
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                isActive
                  ? 'bg-volt-blue text-white shadow-lg shadow-volt-blue/20'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-volt-cyan'}`} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-volt-cyan rounded-r-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all text-xs"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
