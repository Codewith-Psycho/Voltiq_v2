'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, Cpu, Sparkles, MessageSquare, User } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/appliances', label: 'Devices', icon: Cpu },
  { href: '/optimization', label: 'Optimize', icon: Sparkles },
  { href: '/chat', label: 'Chat', icon: MessageSquare },
  { href: '/insights', label: 'Profile', icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Don't show on landing, login, and onboarding pages
  if (pathname === '/' || pathname === '/login' || pathname === '/onboarding') {
    return null;
  }

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
    >
      <div className="bg-volt-dark/95 backdrop-blur-xl border-t border-white/10">
        <div className="flex items-center justify-around px-2 py-3">
          {navItems.map(({ href, label, icon: Icon }) => {
            // Exact match or starts with href followed by / or end of string
            const isActive = pathname === href || 
              (pathname.startsWith(href + '/'));
            
            return (
              <Link
                key={href}
                href={href}
                className="relative flex flex-col items-center gap-1 px-4 py-2 min-w-[64px]"
              >
                <div className="relative">
                  <Icon
                    className={`w-6 h-6 transition-colors ${
                      isActive ? 'text-volt-cyan' : 'text-gray-500'
                    }`}
                  />
                  {isActive && (
                    <motion.div
                      layoutId="bottom-nav-active"
                      className="absolute -inset-2 bg-volt-cyan/10 rounded-xl -z-10"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium transition-colors ${
                    isActive ? 'text-volt-cyan' : 'text-gray-500'
                  }`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}
