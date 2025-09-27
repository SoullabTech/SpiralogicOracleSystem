'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SymbolicDashboard from '@/components/analytics/SymbolicDashboard';
import { shouldShowFeature } from '@/components/onboarding/SoulfulAppShell';
import { Sparkles, Lock, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsPage() {
  const [canAccess, setCanAccess] = useState(false);
  const [entryCount, setEntryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const hasAccess = shouldShowFeature('timeline', 'beta-user');
    const count = parseInt(localStorage.getItem('journal_entry_count') || '0');

    setCanAccess(hasAccess);
    setEntryCount(count);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-neutral-950 dark:via-indigo-950 dark:to-purple-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-12 h-12 text-indigo-500" />
        </motion.div>
      </div>
    );
  }

  if (!canAccess) {
    const remaining = 3 - entryCount;

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-neutral-950 dark:via-indigo-950 dark:to-purple-950">
        <div className="max-w-2xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            {/* Lock Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', damping: 15 }}
              className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-800 dark:to-neutral-700 mb-6"
            >
              <Lock className="w-12 h-12 text-neutral-500 dark:text-neutral-400" />
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-neutral-900 dark:text-white mb-4"
            >
              Analytics Unlocks Soon
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-neutral-700 dark:text-neutral-300 mb-6 leading-relaxed"
            >
              Your symbolic journey becomes visible after <strong>3 journal entries</strong>.
              Patterns emerge with time.
            </motion.p>

            {/* Progress */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-neutral-800 rounded-2xl p-6 mb-8 shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Progress
                </span>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  {entryCount} / 3 entries
                </span>
              </div>
              <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(entryCount / 3) * 100}%` }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                />
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-3">
                {remaining === 1 ? '1 more entry to unlock' : `${remaining} more entries to unlock`}
              </p>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Link
                href="/journal"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full font-semibold hover:shadow-lg transition-all"
              >
                <Sparkles className="w-5 h-5" />
                Start Journaling
              </Link>
            </motion.div>

            {/* Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-12"
            >
              <h2 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 mb-4 uppercase tracking-wide">
                What You'll See
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <PreviewCard
                  icon={<TrendingUp className="w-6 h-6" />}
                  title="Symbol Tracking"
                  description="See which symbols recur in your journey"
                />
                <PreviewCard
                  icon={<Sparkles className="w-6 h-6" />}
                  title="Archetype Evolution"
                  description="Watch how archetypes emerge and transform"
                />
                <PreviewCard
                  icon={<TrendingUp className="w-6 h-6" />}
                  title="Coherence Score"
                  description="Track your transformation velocity"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-neutral-950 dark:via-indigo-950 dark:to-purple-950">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                Your Symbolic Journey
              </h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Patterns, archetypes, and evolution
              </p>
            </div>
          </div>
        </motion.div>

        {/* Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <SymbolicDashboard userId="beta-user" />
        </motion.div>

        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            ← Back to Journal
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

function PreviewCard({ icon, title, description }: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 text-left">
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3">
        {icon}
      </div>
      <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">{title}</h3>
      <p className="text-xs text-neutral-600 dark:text-neutral-400">{description}</p>
    </div>
  );
}