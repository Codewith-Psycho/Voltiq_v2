'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Zap } from 'lucide-react';
import Link from 'next/link';

const Scene = dynamic(() => import('./HeroScene'), { ssr: false });

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-volt-dark">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-volt-dark/80 z-[1]" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex items-center justify-center gap-2 mb-6"
        >
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-volt-cyan" />
          <span className="text-volt-cyan text-sm font-semibold tracking-[0.2em] uppercase">
            INSTINCT 4.0
          </span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-volt-cyan" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.95] mb-6"
        >
          India&apos;s Smart
          <br />
          <span className="text-gradient">Energy Brain</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          3 crore smart meters. Zero consumer intelligence.
          <br />
          <span className="text-white font-medium">VoltIQ changes that.</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/login" className="btn-glow flex items-center gap-2 text-lg">
            <Zap className="w-5 h-5" />
            Start Saving
          </Link>
          <Link
            href="/dashboard"
            className="px-8 py-4 rounded-xl border border-white/20 text-white font-medium hover:bg-white/10 transition-all duration-300"
          >
            Overview Dashboard →
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ArrowDown className="w-6 h-6 text-volt-cyan/60" />
        </motion.div>
      </motion.div>
    </section>
  );
}
