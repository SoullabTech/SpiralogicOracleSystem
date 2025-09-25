'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, TrendingUp, Eye, Filter } from 'lucide-react';
import { HoloflowerSnapshot } from '@/components/holoflower/HoloflowerSnapshot';

interface JournalEntry {
  content: string;
  checkInData?: any;
  timestamp: string;
  type: string;
}

interface HoloflowerJournalViewerProps {
  entries: JournalEntry[];
}

export function HoloflowerJournalViewer({ entries }: HoloflowerJournalViewerProps) {
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'grid' | 'trends'>('timeline');

  // Filter entries that have holoflower data
  const holoflowerEntries = entries.filter(entry =>
    entry.type === 'holoflower_reflection' && entry.checkInData
  );

  // Parse snapshot from content
  const parseSnapshot = (content: string) => {
    const match = content.match(/\[HOLOFLOWER_SNAPSHOT:(.*?)\]/);
    return match ? match[1] : null;
  };

  // Extract text content (remove snapshot URLs)
  const getTextContent = (content: string) => {
    return content.replace(/\[HOLOFLOWER_SNAPSHOT:.*?\]\n\n/, '');
  };

  // Calculate trends over time
  const calculateTrends = () => {
    if (holoflowerEntries.length < 2) return null;

    const recent = holoflowerEntries.slice(-7); // Last 7 entries
    const elements = ['air', 'fire', 'water', 'earth'];

    return elements.map(element => {
      const elementData = recent.map(entry => {
        const elementFacets = entry.checkInData.facets.filter((f: any) => f.element === element);
        const avgValue = elementFacets.reduce((sum: number, f: any) => sum + f.value, 0) / elementFacets.length;
        return avgValue;
      });

      const trend = elementData.length > 1 ?
        (elementData[elementData.length - 1] - elementData[0]) / elementData.length : 0;

      return {
        element,
        current: elementData[elementData.length - 1],
        trend,
        data: elementData
      };
    });
  };

  const trends = calculateTrends();

  return (
    <div className="holoflower-journal-viewer">
      {/* View Mode Selector */}
      <div className="flex gap-2 mb-6">
        {[
          { mode: 'timeline', icon: Calendar, label: 'Timeline' },
          { mode: 'grid', icon: Eye, label: 'Visual Grid' },
          { mode: 'trends', icon: TrendingUp, label: 'Trends' }
        ].map(({ mode, icon: Icon, label }) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              viewMode === mode
                ? 'bg-amber-600 text-white'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <div className="space-y-6">
          {holoflowerEntries.map((entry, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 rounded-xl p-6 border border-white/10"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-white font-medium mb-1">
                    {new Date(entry.timestamp).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </h3>
                  <p className="text-white/60 text-sm">
                    Coherence: {Math.round(entry.checkInData.coherence * 100)}%
                  </p>
                </div>
                <button
                  onClick={() => setSelectedEntry(entry)}
                  className="text-amber-400 hover:text-amber-300 text-sm"
                >
                  View Details
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Snapshot */}
                <div>
                  <HoloflowerSnapshot
                    facets={entry.checkInData.facets}
                    coherence={entry.checkInData.coherence}
                    timestamp={entry.timestamp}
                    size="small"
                  />
                </div>

                {/* Text Preview */}
                <div>
                  <div className="text-white/80 text-sm line-clamp-4">
                    {getTextContent(entry.content).substring(0, 200)}...
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {holoflowerEntries.map((entry, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/5 rounded-xl p-4 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
              onClick={() => setSelectedEntry(entry)}
            >
              <div className="text-center mb-3">
                <p className="text-white/60 text-xs">
                  {new Date(entry.timestamp).toLocaleDateString()}
                </p>
                <p className="text-amber-400 text-xs">
                  {Math.round(entry.checkInData.coherence * 100)}%
                </p>
              </div>

              <HoloflowerSnapshot
                facets={entry.checkInData.facets}
                coherence={entry.checkInData.coherence}
                timestamp={entry.timestamp}
                size="small"
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Trends View */}
      {viewMode === 'trends' && trends && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trends.map(({ element, current, trend }) => (
              <div key={element} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white capitalize">{element}</h4>
                  <TrendingUp
                    className={`w-4 h-4 ${
                      trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-gray-400'
                    }`}
                  />
                </div>
                <p className="text-2xl font-light text-white mb-1">
                  {current?.toFixed(1)}/10
                </p>
                <p className={`text-xs ${
                  trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {trend > 0 ? '↗' : trend < 0 ? '↘' : '→'} {Math.abs(trend).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          {/* Recent Entries Chart */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-white font-medium mb-4">Recent Pattern</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {holoflowerEntries.slice(-6).map((entry, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="text-white/60 text-sm min-w-[80px]">
                    {new Date(entry.timestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                  <HoloflowerSnapshot
                    facets={entry.checkInData.facets}
                    coherence={entry.checkInData.coherence}
                    timestamp={entry.timestamp}
                    size="small"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Entry Detail Modal */}
      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedEntry(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gradient-to-br from-black via-indigo-950 to-black rounded-3xl max-w-4xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-white/10">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-light text-white mb-1">
                      {new Date(selectedEntry.timestamp).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </h2>
                    <p className="text-amber-300">
                      Coherence: {Math.round(selectedEntry.checkInData.coherence * 100)}%
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedEntry(null)}
                    className="text-white/60 hover:text-white text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Snapshot */}
                  <div className="flex justify-center">
                    <HoloflowerSnapshot
                      facets={selectedEntry.checkInData.facets}
                      coherence={selectedEntry.checkInData.coherence}
                      timestamp={selectedEntry.timestamp}
                      size="large"
                      showLabels={true}
                    />
                  </div>

                  {/* Journal Content */}
                  <div>
                    <h3 className="text-white font-medium mb-4">Journal Entry</h3>
                    <div className="text-white/80 whitespace-pre-line">
                      {getTextContent(selectedEntry.content)}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}