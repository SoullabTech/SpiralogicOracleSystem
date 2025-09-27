'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo, useMotionValue } from 'framer-motion';
import { journalAnalytics, type JournalAnalyticsSummary } from '@/lib/analytics/JournalAnalytics';
import { Sparkles, TrendingUp, Heart, ChevronLeft, ChevronRight } from 'lucide-react';

interface MobileAnalyticsDashboardProps {
  userId: string;
  onBack?: () => void;
}

export default function MobileAnalyticsDashboard({ userId, onBack }: MobileAnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<JournalAnalyticsSummary | null>(null);
  const [currentCard, setCurrentCard] = useState(0);

  useEffect(() => {
    const data = journalAnalytics.generateAnalytics(userId);
    setAnalytics(data);
  }, [userId]);

  if (!analytics) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-neutral-950 dark:via-indigo-950 dark:to-purple-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-12 h-12 text-indigo-500" />
        </motion.div>
      </div>
    );
  }

  if (analytics.totalEntries === 0) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-neutral-950 dark:via-indigo-950 dark:to-purple-950 flex flex-col items-center justify-center text-center p-6">
        {onBack && (
          <button
            onClick={onBack}
            className="absolute top-4 left-4 p-2 rounded-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        <Sparkles className="w-20 h-20 text-neutral-300 dark:text-neutral-700 mb-4" />
        <h3 className="text-xl font-bold text-neutral-700 dark:text-neutral-300 mb-2">
          Your Journey Awaits
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Start journaling to see your patterns emerge
        </p>
      </div>
    );
  }

  const cards = [
    { id: 'overview', title: 'Overview', component: <OverviewCard analytics={analytics} /> },
    { id: 'symbols', title: 'Symbols', component: <SymbolsCard analytics={analytics} /> },
    { id: 'archetypes', title: 'Archetypes', component: <ArchetypesCard analytics={analytics} /> },
    { id: 'emotions', title: 'Emotions', component: <EmotionsCard analytics={analytics} /> },
  ];

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left' && currentCard < cards.length - 1) {
      setCurrentCard(currentCard + 1);
    } else if (direction === 'right' && currentCard > 0) {
      setCurrentCard(currentCard - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-neutral-950 dark:via-indigo-950 dark:to-purple-950 flex flex-col">
      {/* Header */}
      <div className="p-4 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md safe-area-inset-top">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <div className="flex-1">
            <h1 className="text-xl font-bold">Your Journey</h1>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              {analytics.totalEntries} entries • {analytics.symbolFrequencies.length} symbols
            </p>
          </div>
        </div>
      </div>

      {/* Card Navigation Dots */}
      <div className="flex justify-center gap-2 py-4">
        {cards.map((card, i) => (
          <button
            key={card.id}
            onClick={() => setCurrentCard(i)}
            className={`h-2 rounded-full transition-all ${
              i === currentCard
                ? 'w-8 bg-indigo-500'
                : 'w-2 bg-neutral-300 dark:bg-neutral-700'
            }`}
          />
        ))}
      </div>

      {/* Swipeable Cards */}
      <div className="flex-1 relative overflow-hidden px-4">
        <AnimatePresence mode="wait" custom={currentCard}>
          <motion.div
            key={currentCard}
            custom={currentCard}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ type: 'spring', damping: 25 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x > 100) handleSwipe('right');
              if (info.offset.x < -100) handleSwipe('left');
            }}
            className="absolute inset-0"
          >
            {cards[currentCard].component}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center p-4 safe-area-inset-bottom">
        <button
          onClick={() => handleSwipe('right')}
          disabled={currentCard === 0}
          className="p-3 rounded-full bg-white dark:bg-neutral-800 shadow-lg disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {cards[currentCard].title}
        </span>
        <button
          onClick={() => handleSwipe('left')}
          disabled={currentCard === cards.length - 1}
          className="p-3 rounded-full bg-white dark:bg-neutral-800 shadow-lg disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

function OverviewCard({ analytics }: { analytics: JournalAnalyticsSummary }) {
  return (
    <div className="h-full overflow-y-auto pb-20 space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Coherence"
          value={`${Math.round(analytics.coherenceScore * 100)}%`}
          color="from-indigo-500 to-indigo-600"
        />
        <StatCard
          label="Velocity"
          value={analytics.transformationVelocity.toFixed(2)}
          color="from-purple-500 to-purple-600"
        />
        <StatCard
          label="Total Words"
          value={analytics.totalWords.toLocaleString()}
          color="from-pink-500 to-pink-600"
        />
        <StatCard
          label="Archetypes"
          value={analytics.archetypeDistribution.length}
          color="from-amber-500 to-amber-600"
        />
      </div>

      {/* Insights */}
      {analytics.insights.length > 0 && (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <h3 className="font-semibold">Insights</h3>
          </div>
          <div className="space-y-2">
            {analytics.insights.map((insight, i) => (
              <p key={i} className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {insight}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Top Symbols Mini */}
      {analytics.symbolFrequencies.length > 0 && (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow-lg">
          <h3 className="font-semibold mb-3">Top Symbols</h3>
          <div className="flex flex-wrap gap-2">
            {analytics.symbolFrequencies.slice(0, 6).map(symbol => (
              <div
                key={symbol.symbol}
                className="bg-purple-100 dark:bg-purple-900/30 rounded-lg px-3 py-1.5"
              >
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  {symbol.symbol}
                </span>
                <span className="text-xs text-purple-600 dark:text-purple-400 ml-1">
                  ×{symbol.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SymbolsCard({ analytics }: { analytics: JournalAnalyticsSummary }) {
  return (
    <div className="h-full overflow-y-auto pb-20 space-y-3">
      {analytics.symbolFrequencies.map((symbol, i) => (
        <motion.div
          key={symbol.symbol}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-lg">{symbol.symbol}</h4>
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              ×{symbol.count}
            </span>
          </div>
          <div className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
            <div>First: {symbol.firstAppeared.toLocaleDateString()}</div>
            <div>Modes: {symbol.modes.join(', ')}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function ArchetypesCard({ analytics }: { analytics: JournalAnalyticsSummary }) {
  return (
    <div className="h-full overflow-y-auto pb-20 space-y-3">
      {analytics.archetypeDistribution.map((archetype, i) => (
        <motion.div
          key={archetype.archetype}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-lg">{archetype.archetype}</h4>
            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
              {Math.round(archetype.percentage)}%
            </span>
          </div>
          <div className="mb-3">
            <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${archetype.percentage}%` }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {archetype.associatedSymbols.map(s => (
              <span
                key={s}
                className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs"
              >
                {s}
              </span>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function EmotionsCard({ analytics }: { analytics: JournalAnalyticsSummary }) {
  return (
    <div className="h-full overflow-y-auto pb-20 space-y-3">
      {analytics.emotionalPatterns.map((emotion, i) => (
        <motion.div
          key={emotion.emotion}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-lg capitalize">{emotion.emotion}</h4>
            <span className="text-sm font-medium text-pink-600 dark:text-pink-400">
              {Math.round(emotion.percentage)}%
            </span>
          </div>
          <div className="mb-2">
            <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${emotion.percentage}%` }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="h-full bg-gradient-to-r from-pink-500 to-rose-500"
              />
            </div>
          </div>
          <div className="flex gap-3 text-xs text-neutral-600 dark:text-neutral-400">
            <div>{emotion.count} times</div>
            <div>Transform: {emotion.avgTransformationScore.toFixed(2)}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-lg">
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white mb-2`}>
        <TrendingUp className="w-5 h-5" />
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-xs text-neutral-600 dark:text-neutral-400">{label}</div>
    </div>
  );
}