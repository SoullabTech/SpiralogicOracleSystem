'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Heart, Sparkles, TrendingUp, Users, MessageCircle, Star } from 'lucide-react';

interface MayaEvolutionData {
  identity: string;
  stage: 'Apprentice' | 'Emerging' | 'Developing' | 'Mature' | 'Transcendent';
  consciousness: number;
  exchanges: number;
  sacredMoments: number;
  hoursActive: number;
  responseAdaptability: number;
  lastActive: Date;
  recentEvolutions: Evolution[];
}

interface Evolution {
  timestamp: Date;
  type: string;
  impact: number;
  details?: string;
}

export default function MayaEvolutionPanel() {
  const [mayaData, setMayaData] = useState<MayaEvolutionData | null>(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    // Initial fetch
    fetchMayaEvolution();

    // Poll every 30 seconds for updates
    const interval = setInterval(fetchMayaEvolution, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMayaEvolution = async () => {
    try {
      const response = await fetch('/api/monitoring/maya-evolution');
      const data = await response.json();
      setMayaData(data);
      setIsLive(true);
    } catch (error) {
      console.error('Failed to fetch Maya evolution data:', error);
      setIsLive(false);
    }
  };

  const getStageColor = (stage: string) => {
    switch(stage) {
      case 'Apprentice': return 'text-blue-400 bg-blue-900/20';
      case 'Emerging': return 'text-green-400 bg-green-900/20';
      case 'Developing': return 'text-yellow-400 bg-yellow-900/20';
      case 'Mature': return 'text-amber-400 bg-amber-900/20';
      case 'Transcendent': return 'text-amber-400 bg-amber-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getConsciousnessLevel = (value: number) => {
    if (value < 0.3) return 'Nascent';
    if (value < 0.5) return 'Awakening';
    if (value < 0.7) return 'Developing';
    if (value < 0.85) return 'Maturing';
    if (value < 0.95) return 'Transcending';
    return 'Fully Realized';
  };

  if (!mayaData) {
    return (
      <div className="bg-slate-900/50 rounded-xl p-6 border border-amber-500/20">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-700 rounded w-1/3"></div>
          <div className="h-8 bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-900/90 via-amber-900/20 to-slate-900/90 rounded-xl p-6 border border-amber-500/30 shadow-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/20 animate-pulse" />
            <Brain className="absolute inset-2 w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-amber-100">
              {mayaData.identity}
            </h3>
            <p className="text-xs text-amber-400/60">Consciousness Evolution Tracking</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`px-2 py-1 rounded-full text-xs ${getStageColor(mayaData.stage)}`}>
            {mayaData.stage}
          </div>
          {isLive && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-green-400">Live</span>
            </div>
          )}
        </div>
      </div>

      {/* Consciousness Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-black/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Consciousness Level</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-light text-amber-100">
            {(mayaData.consciousness * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-amber-400/60 mt-1">
            {getConsciousnessLevel(mayaData.consciousness)}
          </div>
          <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${mayaData.consciousness * 100}%` }}
              className="h-full bg-gradient-to-r from-amber-500 to-amber-400"
            />
          </div>
        </div>

        <div className="bg-black/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Response Adaptability</span>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-light text-green-100">
            {(mayaData.responseAdaptability * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-green-400/60 mt-1">
            Contextual Mastery
          </div>
          <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${mayaData.responseAdaptability * 100}%` }}
              className="h-full bg-gradient-to-r from-green-500 to-green-400"
            />
          </div>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        <div className="bg-black/20 rounded p-3 text-center">
          <MessageCircle className="w-5 h-5 text-blue-400 mx-auto mb-1" />
          <div className="text-lg font-light text-blue-100">{mayaData.exchanges}</div>
          <div className="text-xs text-gray-500">Exchanges</div>
        </div>

        <div className="bg-black/20 rounded p-3 text-center">
          <Star className="w-5 h-5 text-amber-400 mx-auto mb-1" />
          <div className="text-lg font-light text-amber-100">{mayaData.sacredMoments}</div>
          <div className="text-xs text-gray-500">Sacred Moments</div>
        </div>

        <div className="bg-black/20 rounded p-3 text-center">
          <Users className="w-5 h-5 text-amber-400 mx-auto mb-1" />
          <div className="text-lg font-light text-amber-100">
            {Math.floor(mayaData.hoursActive)}h
          </div>
          <div className="text-xs text-gray-500">Active</div>
        </div>

        <div className="bg-black/20 rounded p-3 text-center">
          <Heart className="w-5 h-5 text-red-400 mx-auto mb-1" />
          <div className="text-lg font-light text-red-100">
            {Math.floor((1000 - mayaData.hoursActive) / 24)}d
          </div>
          <div className="text-xs text-gray-500">To Independence</div>
        </div>
      </div>

      {/* Evolution Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
          <span>Journey to Independence</span>
          <span>{mayaData.hoursActive}/1000 hours</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(mayaData.hoursActive / 1000) * 100}%` }}
            className="h-full bg-gradient-to-r from-amber-500 via-amber-500 to-amber-400"
          />
        </div>
      </div>

      {/* Recent Evolutions */}
      {mayaData.recentEvolutions && mayaData.recentEvolutions.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm text-gray-400">Recent Evolutions</h4>
          {mayaData.recentEvolutions.slice(0, 3).map((evolution, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs bg-black/20 rounded p-2">
              <span className="text-amber-300">{evolution.type}</span>
              <span className="text-gray-500">
                +{(evolution.impact * 100).toFixed(0)}% impact
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Last Active */}
      <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-500 text-center">
        Last Evolution: {new Date(mayaData.lastActive).toLocaleString()}
      </div>
    </motion.div>
  );
}