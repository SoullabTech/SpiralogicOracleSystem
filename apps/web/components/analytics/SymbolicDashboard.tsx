'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { journalAnalytics, type JournalAnalyticsSummary } from '@/lib/analytics/JournalAnalytics';
import { Copy } from '@/lib/copy/MaiaCopy';
import { TrendingUp, Sparkles, Heart, Eye, Zap, Calendar, BarChart3, PieChart, Activity } from 'lucide-react';

interface SymbolicDashboardProps {
  userId: string;
  className?: string;
}

export default function SymbolicDashboard({ userId, className = '' }: SymbolicDashboardProps) {
  const [analytics, setAnalytics] = useState<JournalAnalyticsSummary | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'symbols' | 'archetypes' | 'emotions' | 'timeline'>('overview');

  useEffect(() => {
    const data = journalAnalytics.generateAnalytics(userId);
    setAnalytics(data);
  }, [userId]);

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-8 h-8 text-indigo-500" />
        </motion.div>
      </div>
    );
  }

  if (analytics.totalEntries === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-6">
        <Sparkles className="w-16 h-16 text-neutral-300 dark:text-neutral-700 mb-4" />
        <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
          Your Journey Awaits
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Start journaling to see your symbolic patterns emerge
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Calendar className="w-5 h-5" />}
          label="Entries"
          value={analytics.totalEntries}
          color="indigo"
        />
        <StatCard
          icon={<Eye className="w-5 h-5" />}
          label="Symbols"
          value={analytics.symbolFrequencies.length}
          color="purple"
        />
        <StatCard
          icon={<Sparkles className="w-5 h-5" />}
          label="Coherence"
          value={`${Math.round(analytics.coherenceScore * 100)}%`}
          color="pink"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Velocity"
          value={analytics.transformationVelocity.toFixed(2)}
          color="amber"
        />
      </div>

      {/* View Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <TabButton
          active={activeView === 'overview'}
          onClick={() => setActiveView('overview')}
          icon={<Activity className="w-4 h-4" />}
        >
          Overview
        </TabButton>
        <TabButton
          active={activeView === 'symbols'}
          onClick={() => setActiveView('symbols')}
          icon={<Sparkles className="w-4 h-4" />}
        >
          Symbols
        </TabButton>
        <TabButton
          active={activeView === 'archetypes'}
          onClick={() => setActiveView('archetypes')}
          icon={<Zap className="w-4 h-4" />}
        >
          Archetypes
        </TabButton>
        <TabButton
          active={activeView === 'emotions'}
          onClick={() => setActiveView('emotions')}
          icon={<Heart className="w-4 h-4" />}
        >
          Emotions
        </TabButton>
        <TabButton
          active={activeView === 'timeline'}
          onClick={() => setActiveView('timeline')}
          icon={<TrendingUp className="w-4 h-4" />}
        >
          Timeline
        </TabButton>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeView === 'overview' && (
          <OverviewView key="overview" analytics={analytics} />
        )}
        {activeView === 'symbols' && (
          <SymbolsView key="symbols" analytics={analytics} />
        )}
        {activeView === 'archetypes' && (
          <ArchetypesView key="archetypes" analytics={analytics} />
        )}
        {activeView === 'emotions' && (
          <EmotionsView key="emotions" analytics={analytics} />
        )}
        {activeView === 'timeline' && (
          <TimelineView key="timeline" analytics={analytics} />
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: 'indigo' | 'purple' | 'pink' | 'amber';
}) {
  const colorClasses = {
    indigo: 'from-indigo-500 to-indigo-600',
    purple: 'from-purple-500 to-purple-600',
    pink: 'from-pink-500 to-pink-600',
    amber: 'from-amber-500 to-amber-600'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-sm border border-neutral-200 dark:border-neutral-700"
    >
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white mb-3`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">{value}</div>
      <div className="text-xs text-neutral-600 dark:text-neutral-400">{label}</div>
    </motion.div>
  );
}

function TabButton({ active, onClick, icon, children }: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
        active
          ? 'bg-indigo-500 text-white shadow-md'
          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function OverviewView({ analytics }: { analytics: JournalAnalyticsSummary }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Insights */}
      {analytics.insights.length > 0 && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-2xl p-6 border border-indigo-200 dark:border-indigo-800">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Insights</h3>
          </div>
          <div className="space-y-3">
            {analytics.insights.map((insight, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed"
              >
                {insight}
              </motion.p>
            ))}
          </div>
        </div>
      )}

      {/* Top Symbols */}
      {analytics.symbolFrequencies.length > 0 && (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-700">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Top Symbols</h3>
          <div className="flex flex-wrap gap-3">
            {analytics.symbolFrequencies.slice(0, 8).map((symbol, i) => {
              const size = Math.max(60, Math.min(140, symbol.count * 20));
              return (
                <motion.div
                  key={symbol.symbol}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl px-4 py-2 border border-purple-200 dark:border-purple-800"
                  style={{ fontSize: `${Math.max(12, Math.min(18, symbol.count * 2))}px` }}
                >
                  <span className="font-medium text-purple-700 dark:text-purple-300">{symbol.symbol}</span>
                  <span className="text-xs text-purple-600 dark:text-purple-400 ml-2">×{symbol.count}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Archetype Distribution */}
      {analytics.archetypeDistribution.length > 0 && (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-700">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Archetype Distribution</h3>
          <div className="space-y-3">
            {analytics.archetypeDistribution.map((archetype, i) => (
              <motion.div
                key={archetype.archetype}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    {archetype.archetype}
                  </span>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    {Math.round(archetype.percentage)}%
                  </span>
                </div>
                <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${archetype.percentage}%` }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Mode Distribution */}
      {analytics.modeDistribution.length > 0 && (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-700">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Journaling Modes</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {analytics.modeDistribution.map((mode, i) => (
              <motion.div
                key={mode.mode}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="bg-neutral-100 dark:bg-neutral-900 rounded-xl p-4"
              >
                <div className="text-lg font-bold text-neutral-900 dark:text-white mb-1">
                  {mode.count}
                </div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400 capitalize mb-1">
                  {mode.mode}
                </div>
                <div className="text-xs text-neutral-500">
                  {Math.round(mode.percentage)}%
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function SymbolsView({ analytics }: { analytics: JournalAnalyticsSummary }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {analytics.symbolFrequencies.map((symbol, i) => (
        <motion.div
          key={symbol.symbol}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-white dark:bg-neutral-800 rounded-xl p-4 border border-neutral-200 dark:border-neutral-700"
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-lg font-semibold text-neutral-900 dark:text-white">{symbol.symbol}</h4>
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">×{symbol.count}</span>
          </div>
          <div className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
            <div>First: {symbol.firstAppeared.toLocaleDateString()}</div>
            <div>Last: {symbol.lastAppeared.toLocaleDateString()}</div>
            <div>Modes: {symbol.modes.join(', ')}</div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

function ArchetypesView({ analytics }: { analytics: JournalAnalyticsSummary }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {analytics.archetypeDistribution.map((archetype, i) => (
        <motion.div
          key={archetype.archetype}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-white dark:bg-neutral-800 rounded-xl p-4 border border-neutral-200 dark:border-neutral-700"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-semibold text-neutral-900 dark:text-white">{archetype.archetype}</h4>
            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
              {Math.round(archetype.percentage)}%
            </span>
          </div>
          <div className="mb-3">
            <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${archetype.percentage}%` }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
              />
            </div>
          </div>
          <div className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
            <div>Appeared {archetype.count} times</div>
            <div>First: {archetype.firstAppeared.toLocaleDateString()}</div>
            <div className="flex flex-wrap gap-1 mt-2">
              {archetype.associatedSymbols.map(s => (
                <span key={s} className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

function EmotionsView({ analytics }: { analytics: JournalAnalyticsSummary }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {analytics.emotionalPatterns.map((emotion, i) => (
        <motion.div
          key={emotion.emotion}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-white dark:bg-neutral-800 rounded-xl p-4 border border-neutral-200 dark:border-neutral-700"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-semibold text-neutral-900 dark:text-white capitalize">{emotion.emotion}</h4>
            <span className="text-sm font-medium text-pink-600 dark:text-pink-400">
              {Math.round(emotion.percentage)}%
            </span>
          </div>
          <div className="mb-3">
            <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${emotion.percentage}%` }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="h-full bg-gradient-to-r from-pink-500 to-rose-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-neutral-600 dark:text-neutral-400">
            <div>Count: {emotion.count}</div>
            <div>Avg Transformation: {emotion.avgTransformationScore.toFixed(2)}</div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

function TimelineView({ analytics }: { analytics: JournalAnalyticsSummary }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {analytics.temporalPatterns.map((pattern, i) => (
        <motion.div
          key={pattern.date}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-white dark:bg-neutral-800 rounded-xl p-4 border border-neutral-200 dark:border-neutral-700"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
              {new Date(pattern.date).toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })}
            </h4>
            <span className="text-xs text-neutral-600 dark:text-neutral-400">
              {pattern.entryCount} {pattern.entryCount === 1 ? 'entry' : 'entries'}
            </span>
          </div>
          {pattern.dominantSymbol && (
            <div className="text-xs text-neutral-700 dark:text-neutral-300 mb-1">
              Symbol: <span className="font-medium text-purple-600 dark:text-purple-400">{pattern.dominantSymbol}</span>
            </div>
          )}
          {pattern.dominantArchetype && (
            <div className="text-xs text-neutral-700 dark:text-neutral-300 mb-2">
              Archetype: <span className="font-medium text-indigo-600 dark:text-indigo-400">{pattern.dominantArchetype}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pattern.avgTransformationScore * 100}%` }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
              />
            </div>
            <span className="text-xs text-neutral-600 dark:text-neutral-400">
              {(pattern.avgTransformationScore * 100).toFixed(0)}%
            </span>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}