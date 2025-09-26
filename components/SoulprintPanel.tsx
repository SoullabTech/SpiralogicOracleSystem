'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, Download } from 'lucide-react';

interface SoulprintData {
  userId: string;
  userName?: string;
  journeyDuration: number;
  currentPhase: string;
  currentArchetype?: string;
  activeSymbols: any[];
  elementalDominance?: string;
  elementalDeficiency?: string;
  milestoneCount: number;
  breakthroughCount: number;
  emotionalTrend: string;
  narrativeThreads: number;
  shadowIntegration: number;
  alerts?: string[];
  elementalBalance?: {
    fire: number;
    water: number;
    earth: number;
    air: number;
    aether: number;
  };
}

const ELEMENT_COLORS = {
  fire: '#ef4444',
  water: '#3b82f6',
  earth: '#a16207',
  air: '#D4B896',
  aether: '#9333ea'
};

const ELEMENT_ICONS = {
  fire: '🔥',
  water: '💧',
  earth: '🌍',
  air: '🌬️',
  aether: '✨'
};

export function SoulprintPanel({ userId }: { userId: string }) {
  const [soulprint, setSoulprint] = useState<SoulprintData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [selectedView, setSelectedView] = useState<'overview' | 'symbols' | 'journey' | 'elements'>('overview');

  useEffect(() => {
    fetchSoulprint();
  }, [userId]);

  const fetchSoulprint = async () => {
    try {
      const response = await fetch(`/api/maia/soulprint?userId=${userId}`);
      const data = await response.json();
      setSoulprint(data.soulprint);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch soulprint:', error);
      setLoading(false);
    }
  };

  const exportToMarkdown = async () => {
    setExporting(true);
    try {
      const response = await fetch(`/api/maia/soulprint/export?userId=${userId}&format=download`);

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get the blob and create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `soulprint-${soulprint?.userName || userId}-${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      console.log('✨ Soulprint exported to Obsidian markdown');
    } catch (error) {
      console.error('Failed to export soulprint:', error);
      alert('Failed to export soulprint. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-amber-400 animate-pulse">Loading soulprint...</div>
      </div>
    );
  }

  if (!soulprint) {
    return (
      <div className="p-8 text-center">
        <div className="text-amber-200/60">No soulprint data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h2 className="text-3xl font-light text-amber-50 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            {soulprint.userName || 'Soul'}'s Journey
          </h2>
          <p className="text-sm text-amber-200/60 mt-1">
            {soulprint.journeyDuration} days of exploration
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Export Button */}
          <button
            onClick={exportToMarkdown}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30
                     text-purple-400 rounded-lg hover:bg-purple-500/30 transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed"
            title="Export to Obsidian Markdown"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm">{exporting ? 'Exporting...' : 'Export'}</span>
          </button>

          {/* View Selector */}
          <div className="flex gap-2">
            {['overview', 'symbols', 'journey', 'elements'].map(view => (
              <button
                key={view}
                onClick={() => setSelectedView(view as any)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                  selectedView === view
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Alerts */}
      {soulprint.alerts && soulprint.alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              {soulprint.alerts.map((alert, i) => (
                <div key={i} className="text-sm text-yellow-200">{alert}</div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {selectedView === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            {/* Current Phase */}
            <SoulCard
              label="Current Phase"
              value={soulprint.currentPhase}
              icon="🌀"
            />

            {/* Current Archetype */}
            {soulprint.currentArchetype && (
              <SoulCard
                label="Active Archetype"
                value={soulprint.currentArchetype}
                icon="🎭"
              />
            )}

            {/* Milestones */}
            <SoulCard
              label="Milestones"
              value={soulprint.milestoneCount.toString()}
              icon="✨"
            />

            {/* Breakthroughs */}
            <SoulCard
              label="Breakthroughs"
              value={soulprint.breakthroughCount.toString()}
              icon="💫"
            />

            {/* Emotional Trend */}
            <SoulCard
              label="Emotional Trend"
              value={soulprint.emotionalTrend}
              icon={
                soulprint.emotionalTrend === 'rising' ? '📈' :
                soulprint.emotionalTrend === 'falling' ? '📉' :
                soulprint.emotionalTrend === 'volatile' ? '⚡' : '➡️'
              }
            />

            {/* Shadow Integration */}
            <SoulCard
              label="Shadow Work"
              value={`${(soulprint.shadowIntegration * 100).toFixed(0)}%`}
              icon="🌗"
            />
          </motion.div>
        )}

        {selectedView === 'symbols' && (
          <motion.div
            key="symbols"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            <div className="text-lg font-light text-amber-200 mb-3">Active Symbols</div>
            {soulprint.activeSymbols.length > 0 ? (
              <div className="grid gap-3">
                {soulprint.activeSymbols.map((symbol, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 bg-black/40 rounded-lg border border-amber-500/20"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-white font-medium">{symbol.symbol}</div>
                        <div className="text-xs text-white/60 mt-1">
                          Appeared {Math.floor((Date.now() - new Date(symbol.firstAppeared).getTime()) / (1000 * 60 * 60 * 24))} days ago
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-amber-400">{symbol.frequency}×</div>
                        {symbol.elementalResonance && (
                          <div className="text-xs text-white/40 mt-1">
                            {ELEMENT_ICONS[symbol.elementalResonance as keyof typeof ELEMENT_ICONS]}
                          </div>
                        )}
                      </div>
                    </div>
                    {symbol.context && symbol.context.length > 0 && (
                      <div className="text-xs text-white/60 mt-2 line-clamp-2">
                        {symbol.context[symbol.context.length - 1]}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-white/40">
                No symbols tracked yet
              </div>
            )}
          </motion.div>
        )}

        {selectedView === 'elements' && (
          <motion.div
            key="elements"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {/* Elemental Balance Visualization */}
            {soulprint.elementalBalance && (
              <div className="space-y-4">
                <div className="text-lg font-light text-amber-200 mb-3">Elemental Balance</div>
                {Object.entries(soulprint.elementalBalance).map(([element, value]) => {
                  if (element === 'dominant' || element === 'deficient') return null;
                  return (
                    <div key={element} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-white">
                          <span>{ELEMENT_ICONS[element as keyof typeof ELEMENT_ICONS]}</span>
                          <span className="capitalize">{element}</span>
                        </span>
                        <span className="text-white/60">{((value as number) * 100).toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(value as number) * 100}%` }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                          className="h-full rounded-full"
                          style={{
                            backgroundColor: ELEMENT_COLORS[element as keyof typeof ELEMENT_COLORS]
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Dominant & Deficient */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="text-xs text-green-400 mb-1">Dominant</div>
                <div className="text-lg text-white capitalize flex items-center gap-2">
                  <span>{ELEMENT_ICONS[soulprint.elementalDominance as keyof typeof ELEMENT_ICONS]}</span>
                  {soulprint.elementalDominance}
                </div>
              </div>
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="text-xs text-red-400 mb-1">Deficient</div>
                <div className="text-lg text-white capitalize flex items-center gap-2">
                  <span>{ELEMENT_ICONS[soulprint.elementalDeficiency as keyof typeof ELEMENT_ICONS]}</span>
                  {soulprint.elementalDeficiency}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {selectedView === 'journey' && (
          <motion.div
            key="journey"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            <div className="text-lg font-light text-amber-200 mb-3">Journey Overview</div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <div className="text-xs text-purple-400 mb-1">Active Narrative Threads</div>
                <div className="text-2xl text-white">{soulprint.narrativeThreads}</div>
              </div>
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="text-xs text-blue-400 mb-1">Shadow Integration</div>
                <div className="text-2xl text-white">{(soulprint.shadowIntegration * 100).toFixed(0)}%</div>
              </div>
            </div>

            {/* Journey Timeline Placeholder */}
            <div className="p-8 bg-black/40 rounded-lg border border-white/10 text-center">
              <div className="text-white/40 text-sm">
                Journey timeline visualization coming soon
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SoulCard({
  label,
  value,
  icon,
  trend
}: {
  label: string;
  value: string;
  icon: string;
  trend?: 'up' | 'down';
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-4 bg-black/40 backdrop-blur-sm rounded-lg border border-amber-500/20
                 hover:border-amber-500/40 transition-all"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="text-xs text-amber-200/60">{label}</div>
        <span className="text-xl">{icon}</span>
      </div>
      <div className="flex items-end gap-2">
        <div className="text-2xl font-light text-white capitalize">{value}</div>
        {trend && (
          trend === 'up' ? <TrendingUp className="w-4 h-4 text-green-400 mb-1" /> :
          <TrendingDown className="w-4 h-4 text-red-400 mb-1" />
        )}
      </div>
    </motion.div>
  );
}