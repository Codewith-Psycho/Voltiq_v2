'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useVoltStore } from '@/lib/store';
import { connectWebSocket, disconnectWebSocket, startMockUpdates } from '@/lib/websocket';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

const publicRoutes = ['/', '/login', '/onboarding'];

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useVoltStore((s) => s.isAuthenticated);
  const user = useVoltStore((s) => s.user);
  const hasCompletedOnboarding = !!(user?.meterNumber || user?.customerId);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize WebSocket/mock data on authentication
  useEffect(() => {
    if (isAuthenticated && hasCompletedOnboarding) {
      connectWebSocket();
      return () => disconnectWebSocket();
    } else if (isAuthenticated && !hasCompletedOnboarding) {
      startMockUpdates();
    }
  }, [isAuthenticated, hasCompletedOnboarding]);

  useEffect(() => {
    const isPublicRoute = publicRoutes.includes(pathname);

    // If not authenticated and trying to access protected route, redirect to login
    if (!isAuthenticated && !isPublicRoute) {
      router.push('/login');
      return;
    }

    // If authenticated but trying to access login, redirect to appropriate page
    if (isAuthenticated && pathname === '/login') {
      router.push(hasCompletedOnboarding ? '/dashboard' : '/onboarding');
      return;
    }

    // If authenticated without completing onboarding and trying to access protected route
    if (isAuthenticated && !hasCompletedOnboarding && !isPublicRoute) {
      router.push('/onboarding');
      return;
    }

    // Auth check complete, show content
    setIsLoading(false);
  }, [isAuthenticated, pathname, router, hasCompletedOnboarding]);

  // Show loading state for protected routes while checking auth
  const isPublicRoute = publicRoutes.includes(pathname);
  if (isLoading && !isPublicRoute) {
    return (
      <div className="fixed inset-0 bg-volt-dark flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-volt-cyan to-volt-blue flex items-center justify-center"
          >
            <Zap className="w-8 h-8 text-white" />
          </motion.div>
          <p className="text-gray-400 text-sm">Loading VoltIQ...</p>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
