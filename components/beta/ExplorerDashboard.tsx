'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Calendar, Clock, TrendingUp, Shield, Heart,
  AlertCircle, ChevronDown, ChevronRight, Edit, Pause,
  MessageSquare, Award, Zap
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface SessionHistory {
  sessionNumber: number;
  date: Date;
  duration: number;
  messageCount: number;
  patterns: string[];
  breakthrough: boolean;
}

interface Reflection {
  week: number;
  responses: Record<string, string>;
  selfMarker: string;
  createdAt: Date;
}

interface ExplorerMetrics {
  totalSessions: number;
  avgDepthScore: number;
  patternsEvolved: number;
  breakthroughCount: number;
}

export default function ExplorerDashboard() {
  const [explorerName, setExplorerName] = useState('');
  const [currentWeek, setCurrentWeek] = useState(1);
  const [arcLevel, setArcLevel] = useState(1.0);
  const [sessions, setSessions] = useState<SessionHistory[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [metrics, setMetrics] = useState<ExplorerMetrics>({
    totalSessions: 0,
    avgDepthScore: 0,
    patternsEvolved: 0,
    breakthroughCount: 0
  });
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);

    // Get explorer info from session
    const name = sessionStorage.getItem('explorerName') || 'Explorer';
    const explorerId = sessionStorage.getItem('betaUserId');
    setExplorerName(name);

    // Calculate current week
    const signupDate = sessionStorage.getItem('signupDate');
    if (signupDate) {
      const daysSinceSignup = Math.floor(
        (Date.now() - new Date(signupDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      const week = Math.min(4, Math.floor(daysSinceSignup / 7) + 1);
      setCurrentWeek(week);
    }

    if (explorerId) {
      // Load session history
      const { data: sessionData } = await supabase
        .from('maya_sessions')
        .select('*')
        .eq('explorer_id', explorerId)
        .order('created_at', { ascending: false });

      if (sessionData) {
        setSessions(sessionData.map((s, idx) => ({
          sessionNumber: sessionData.length - idx,
          date: new Date(s.created_at),
          duration: s.duration_minutes || 0,
          messageCount: s.message_count || 0,
          patterns: s.patterns_detected || [],
          breakthrough: s.breakthrough_detected || false
        })));

        // Calculate metrics
        setMetrics({
          totalSessions: sessionData.length,
          avgDepthScore: sessionData.reduce((acc, s) => acc + (s.depth_score || 0), 0) / sessionData.length,
          patternsEvolved: new Set(sessionData.flatMap(s => s.patterns_detected || [])).size,
          breakthroughCount: sessionData.filter(s => s.breakthrough_detected).length
        });
      }

      // Load reflections
      const { data: reflectionData } = await supabase
        .from('weekly_reflection_summary')
        .select('*')
        .eq('explorer_id', explorerId)
        .order('week');

      if (reflectionData) {
        setReflections(reflectionData.map(r => ({
          week: r.week,
          responses: r.prompt_responses || {},
          selfMarker: r.self_marker || '',
          createdAt: new Date(r.created_at)
        })));
      }

      // Calculate arc level based on progression
      const arcProgress = calculateArcLevel(currentWeek, metrics.breakthroughCount);
      setArcLevel(arcProgress);
    }

    setLoading(false);
  };

  const calculateArcLevel = (week: number, breakthroughs: number): number => {
    const baseLevel = week * 0.75; // Week progression
    const breakthroughBonus = breakthroughs * 0.5; // Breakthrough bonus
    return Math.min(5.0, baseLevel + breakthroughBonus);
  };

  const getArcPhase = (level: number): string => {
    if (level < 1.5) return 'Safety Building';
    if (level < 2.5) return 'Pattern Awareness';
    if (level < 3.5) return 'Deep Exploration';
    if (level < 4.5) return 'Breakthrough Territory';
    return 'Integration Phase';
  };

  const getPatternIcon = (pattern: string) => {
    const icons: Record<string, any> = {
      'Withdrawing': Shield,
      'Defending': Shield,
      'Opening': Heart,
      'Curious': Sparkles,
      'Vulnerable': Heart,
      'Guarded': Shield
    };
    const Icon = icons[pattern] || AlertCircle;
    return <Icon className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-purple-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading your journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Welcome Panel */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {explorerName} 🌈
              </h1>
              <p className="text-purple-100">
                Week {currentWeek} • Integration Cohort • {getArcPhase(arcLevel)}
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{arcLevel.toFixed(1)}</div>
              <div className="text-sm text-purple-200">Arc Level</div>
            </div>
          </div>
        </motion.div>

        {/* Progress Tracker */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
            Universal Arc™ Progress
          </h2>

          <div className="relative h-16">
            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(arcLevel / 5) * 100}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
              />
            </div>

            {/* Phase Markers */}
            <div className="absolute inset-0 flex items-center justify-between px-4">
              {['Safety', 'Awareness', 'Exploration', 'Breakthrough', 'Integration'].map((phase, idx) => (
                <div
                  key={phase}
                  className={`text-xs font-medium ${
                    arcLevel >= idx + 1
                      ? 'text-white'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {phase}
                </div>
              ))}
            </div>

            {/* Current Position Marker */}
            <motion.div
              initial={{ left: 0 }}
              animate={{ left: `${(arcLevel / 5) * 100}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
            >
              <div className="w-6 h-6 bg-white border-4 border-purple-600 rounded-full shadow-lg" />
            </motion.div>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
            {arcLevel < 3
              ? "You're building foundation. Each session deepens trust."
              : arcLevel < 4
              ? "You're approaching breakthrough territory. Stay curious."
              : "You're integrating profound insights. Honor this phase."}
          </p>
        </motion.div>

        {/* Session History */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-purple-600" />
            Session History
          </h2>

          <div className="space-y-3">
            {sessions.slice(0, 5).map((session) => (
              <motion.div
                key={session.sessionNumber}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-lg font-bold text-purple-600">
                    #{session.sessionNumber}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {session.date.toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {session.duration} min • {session.messageCount} messages
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    {session.patterns.map((pattern, idx) => (
                      <div
                        key={idx}
                        className="flex items-center space-x-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 rounded text-xs"
                      >
                        {getPatternIcon(pattern)}
                        <span className="text-purple-700 dark:text-purple-300">{pattern}</span>
                      </div>
                    ))}
                  </div>
                  {session.breakthrough && (
                    <Zap className="w-5 h-5 text-yellow-500" title="Breakthrough moment" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {sessions.length > 5 && (
            <button className="mt-4 text-sm text-purple-600 hover:underline">
              View all {sessions.length} sessions →
            </button>
          )}
        </motion.div>

        {/* Reflections Journal */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-purple-600" />
            Reflections Journal
          </h2>

          <div className="space-y-3">
            {[1, 2, 3, 4].map((week) => {
              const reflection = reflections.find(r => r.week === week);
              const isExpanded = expandedWeek === week;

              return (
                <div
                  key={week}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedWeek(isExpanded ? null : week)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-lg font-bold text-purple-600">
                        Week {week}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {week === 1 && 'First Contact'}
                        {week === 2 && 'Pattern Recognition'}
                        {week === 3 && 'Deeper Exploration'}
                        {week === 4 && 'Integration'}
                      </div>
                      {reflection && (
                        <div className="px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded text-xs text-green-700 dark:text-green-300">
                          {reflection.selfMarker}
                        </div>
                      )}
                    </div>
                    {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30"
                      >
                        {reflection ? (
                          <div className="p-4 space-y-3">
                            {Object.entries(reflection.responses).map(([question, answer]) => (
                              <div key={question}>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {question}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {answer}
                                </p>
                              </div>
                            ))}
                            <Link
                              href={`/explorer/reflection?week=${week}`}
                              className="inline-flex items-center text-sm text-purple-600 hover:underline"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit reflection
                            </Link>
                          </div>
                        ) : (
                          <div className="p-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              No reflection yet for this week.
                            </p>
                            <Link
                              href={`/explorer/reflection?week=${week}`}
                              className="inline-flex items-center mt-2 text-sm text-purple-600 hover:underline"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Add reflection
                            </Link>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Explorer Metrics */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2 text-purple-600" />
            Your Journey Metrics
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {metrics.totalSessions}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Total Sessions
              </div>
            </div>

            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {metrics.avgDepthScore.toFixed(1)}/10
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Avg Depth Score
              </div>
            </div>

            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {metrics.patternsEvolved}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Patterns Evolved
              </div>
            </div>

            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {metrics.breakthroughCount}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Breakthroughs
              </div>
            </div>
          </div>
        </motion.div>

        {/* Support & Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap gap-3 justify-center"
        >
          <Link
            href="/explorer/reflection"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Update Reflection
          </Link>

          <button className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center">
            <Pause className="w-4 h-4 mr-2" />
            Take a Break
          </button>

          <Link
            href="/support"
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
          >
            Report Issue
          </Link>

          <Link
            href="/guidelines"
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
          >
            Community Guidelines
          </Link>
        </motion.div>
      </div>
    </div>
  );
}