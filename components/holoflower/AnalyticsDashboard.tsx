'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Heart, Moon, Sparkles, BarChart3, Activity, Target, Calendar } from 'lucide-react';
import { usePetalInteractions, useSacredCheckIn, useOracleJournal } from '@/lib/hooks/useOracleData';
import type { Element, Mood, PetalInteraction, SacredCheckIn } from '@/lib/types/oracle';

interface ElementStats {
  element: Element;
  count: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  lastInteraction?: Date;
}

interface MoodPattern {
  mood: Mood;
  count: number;
  times: Date[];
  symbols: string[];
}

interface JourneyInsight {
  type: 'growth' | 'pattern' | 'milestone' | 'suggestion';
  title: string;
  description: string;
  element?: Element;
  icon: React.ReactNode;
}

export function AnalyticsDashboard() {
  const { interactions, fetchRecentInteractions } = usePetalInteractions();
  const { checkIns, fetchTodayCheckIns } = useSacredCheckIn();
  const { entries, fetchRecentEntries } = useOracleJournal();
  
  const [elementStats, setElementStats] = useState<ElementStats[]>([]);
  const [moodPatterns, setMoodPatterns] = useState<MoodPattern[]>([]);
  const [insights, setInsights] = useState<JourneyInsight[]>([]);
  const [energyProgression, setEnergyProgression] = useState<number>(0);

  useEffect(() => {
    // Fetch all data on mount
    fetchRecentInteractions(50);
    fetchTodayCheckIns();
    fetchRecentEntries(30);
  }, []);

  useEffect(() => {
    // Calculate element statistics
    if (interactions.length > 0) {
      const elementCounts: Record<Element, number> = {
        air: 0, fire: 0, water: 0, earth: 0, aether: 0
      };
      
      interactions.forEach(interaction => {
        elementCounts[interaction.element]++;
      });

      const total = interactions.length;
      const stats: ElementStats[] = Object.entries(elementCounts).map(([element, count]) => ({
        element: element as Element,
        count,
        percentage: (count / total) * 100,
        trend: 'stable', // Would calculate based on time periods
        lastInteraction: interactions.find(i => i.element === element)?.createdAt
      }));

      setElementStats(stats.sort((a, b) => b.count - a.count));
    }
  }, [interactions]);

  useEffect(() => {
    // Calculate mood patterns
    if (checkIns.length > 0) {
      const moodMap = new Map<Mood, MoodPattern>();
      
      checkIns.forEach(checkIn => {
        const existing = moodMap.get(checkIn.mood) || {
          mood: checkIn.mood,
          count: 0,
          times: [],
          symbols: []
        };
        
        existing.count++;
        existing.times.push(checkIn.createdAt);
        if (checkIn.symbol) existing.symbols.push(checkIn.symbol);
        
        moodMap.set(checkIn.mood, existing);
      });

      setMoodPatterns(Array.from(moodMap.values()).sort((a, b) => b.count - a.count));
    }
  }, [checkIns]);

  useEffect(() => {
    // Generate insights based on patterns
    const newInsights: JourneyInsight[] = [];

    // Element dominance insight
    if (elementStats.length > 0 && elementStats[0].percentage > 40) {
      newInsights.push({
        type: 'pattern',
        title: `Strong ${elementStats[0].element.charAt(0).toUpperCase() + elementStats[0].element.slice(1)} Connection`,
        description: `You\'re deeply connected with ${elementStats[0].element} energy (${Math.round(elementStats[0].percentage)}% of interactions)`,
        element: elementStats[0].element,
        icon: <Sparkles className="w-5 h-5" />
      });
    }

    // Mood progression insight
    if (moodPatterns.length > 0) {
      const latestMood = checkIns[0]?.mood;
      if (latestMood === 'radiant' || latestMood === 'light') {
        newInsights.push({
          type: 'growth',
          title: 'Elevated Energy State',
          description: 'Your recent check-ins show you\'re in a high vibrational state',
          icon: <TrendingUp className="w-5 h-5" />
        });
      }
    }

    // Journal consistency insight
    if (entries.length >= 7) {
      newInsights.push({
        type: 'milestone',
        title: 'Consistent Reflection Practice',
        description: `You\'ve journaled ${entries.length} times - building a strong practice!`,
        icon: <Target className="w-5 h-5" />
      });
    }

    // Suggestion based on patterns
    const leastUsedElement = elementStats[elementStats.length - 1];
    if (leastUsedElement && leastUsedElement.percentage < 10) {
      newInsights.push({
        type: 'suggestion',
        title: `Explore ${leastUsedElement.element.charAt(0).toUpperCase() + leastUsedElement.element.slice(1)} Energy`,
        description: `Consider working with ${leastUsedElement.element} petals for balance`,
        element: leastUsedElement.element,
        icon: <Activity className="w-5 h-5" />
      });
    }

    setInsights(newInsights);
  }, [elementStats, moodPatterns, entries, checkIns]);

  useEffect(() => {
    // Calculate energy progression (dense=1, emerging=2, radiant=3)
    if (interactions.length > 0) {
      const values = interactions.map(i => {
        switch (i.petalState) {
          case 'dense': return 1;
          case 'emerging': return 2;
          case 'radiant': return 3;
          default: return 2;
        }
      });
      const average = values.reduce((a, b) => a + b, 0) / values.length;
      setEnergyProgression((average - 1) / 2 * 100); // Convert to 0-100%
    }
  }, [interactions]);

  const getElementColor = (element: Element) => {
    switch (element) {
      case 'air': return '#87CEEB';
      case 'fire': return '#FF6B6B';
      case 'water': return '#4A90E2';
      case 'earth': return '#8B7355';
      case 'aether': return '#9B59B6';
    }
  };

  const getMoodColor = (mood: Mood) => {
    switch (mood) {
      case 'dense': return '#4A5568';
      case 'heavy': return '#718096';
      case 'neutral': return '#A0AEC0';
      case 'emerging': return '#9F7AEA';
      case 'light': return '#B794F4';
      case 'radiant': return '#D6BCFA';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-indigo-950 to-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-white mb-2">Your Sacred Journey</h1>
          <p className="text-white/60">Insights from your Holoflower interactions</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Total Interactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between mb-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span className="text-2xl font-light text-white">{interactions.length}</span>
            </div>
            <p className="text-white/60 text-sm">Petal Interactions</p>
          </motion.div>

          {/* Check-ins */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between mb-2">
              <Heart className="w-5 h-5 text-red-400" />
              <span className="text-2xl font-light text-white">{checkIns.length}</span>
            </div>
            <p className="text-white/60 text-sm">Sacred Check-ins</p>
          </motion.div>

          {/* Journal Entries */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              <span className="text-2xl font-light text-white">{entries.length}</span>
            </div>
            <p className="text-white/60 text-sm">Journal Reflections</p>
          </motion.div>

          {/* Energy Level */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-green-400" />
              <span className="text-2xl font-light text-white">{Math.round(energyProgression)}%</span>
            </div>
            <p className="text-white/60 text-sm">Energy Elevation</p>
            <div className="mt-2 w-full bg-white/10 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${energyProgression}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Element Distribution */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10"
          >
            <h2 className="text-xl font-light text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              Elemental Resonance
            </h2>
            
            <div className="space-y-3">
              {elementStats.map((stat, idx) => (
                <motion.div
                  key={stat.element}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white capitalize">{stat.element}</span>
                    <span className="text-white/60 text-sm">{stat.count} interactions</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3">
                    <motion.div
                      className="h-3 rounded-full"
                      style={{ backgroundColor: getElementColor(stat.element) }}
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.percentage}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.1 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Mood Patterns */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10"
          >
            <h2 className="text-xl font-light text-white mb-4 flex items-center gap-2">
              <Moon className="w-5 h-5 text-purple-400" />
              Energy Patterns
            </h2>
            
            <div className="grid grid-cols-3 gap-3">
              {moodPatterns.slice(0, 6).map((pattern, idx) => (
                <motion.div
                  key={pattern.mood}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="text-center"
                >
                  <div
                    className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-2"
                    style={{ backgroundColor: getMoodColor(pattern.mood) + '33' }}
                  >
                    <span className="text-2xl font-light text-white">{pattern.count}</span>
                  </div>
                  <p className="text-white/60 text-xs capitalize">{pattern.mood}</p>
                </motion.div>
              ))}
            </div>

            {moodPatterns.length === 0 && (
              <p className="text-white/40 text-center py-8">No check-ins yet</p>
            )}
          </motion.div>
        </div>

        {/* Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10"
        >
          <h2 className="text-xl font-light text-white mb-4">Journey Insights</h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            {insights.map((insight, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-4 rounded-lg border ${
                  insight.type === 'growth' ? 'bg-green-500/10 border-green-500/20' :
                  insight.type === 'pattern' ? 'bg-purple-500/10 border-purple-500/20' :
                  insight.type === 'milestone' ? 'bg-blue-500/10 border-blue-500/20' :
                  'bg-yellow-500/10 border-yellow-500/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    insight.type === 'growth' ? 'bg-green-500/20' :
                    insight.type === 'pattern' ? 'bg-purple-500/20' :
                    insight.type === 'milestone' ? 'bg-blue-500/20' :
                    'bg-yellow-500/20'
                  }`}>
                    {insight.icon}
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">{insight.title}</h3>
                    <p className="text-white/70 text-sm">{insight.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {insights.length === 0 && (
            <p className="text-white/40 text-center py-8">
              Insights will appear as you continue your journey
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}