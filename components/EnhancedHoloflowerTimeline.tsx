"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Calendar, Sparkles, TrendingUp, FileText, Music, Video, Image as ImageIcon } from 'lucide-react';
import SacredAssetPreview from './SacredAssetPreview';
import type { Session, Timeline } from '@/lib/types';

// Import the existing MiniHoloflower component
import { MiniHoloflower } from './sacred/MiniHoloflower';

interface EnhancedTimelineProps {
  timeline: Timeline;
  onSessionSelect?: (session: Session) => void;
  onAssetUpload?: (sessionId: string) => void;
}

export default function EnhancedHoloflowerTimeline({ 
  timeline, 
  onSessionSelect,
  onAssetUpload
}: EnhancedTimelineProps) {
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [hoveredSession, setHoveredSession] = useState<string | null>(null);

  // Toggle session expansion with haptic feedback
  const toggleSession = (sessionId: string) => {
    if (expandedSession === sessionId) {
      setExpandedSession(null);
    } else {
      setExpandedSession(sessionId);
      // Trigger haptic feedback
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(10);
      }
    }
  };

  // Get element emoji for visual representation
  const getElementEmoji = (element?: string) => {
    const elementEmojis: Record<string, string> = {
      Fire: '🔥',
      Water: '🌊', 
      Earth: '🌍',
      Air: '💨',
      Aether: '✨'
    };
    return element ? elementEmojis[element] || '🌸' : '🌸';
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  // Get asset type icon
  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'doc': return <FileText className="w-3 h-3" />;
      case 'audio': return <Music className="w-3 h-3" />;
      case 'video': return <Video className="w-3 h-3" />;
      case 'image': return <ImageIcon className="w-3 h-3" />;
      default: return null;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      {/* Timeline Header */}
      <div className="mb-8 text-center">
        <motion.h2 
          className="text-3xl font-bold text-white mb-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Sacred Journey Timeline
        </motion.h2>
        
        <motion.div 
          className="flex items-center justify-center gap-6 text-sm text-white/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {timeline.totalSessions} sessions
          </span>
          <span className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            {Math.round(timeline.averageCoherence * 100)}% coherence
          </span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-amber-400" />
            {timeline.growthTrajectory}
          </span>
        </motion.div>
      </div>

      {/* Session Timeline */}
      <div className="relative">
        {/* Sacred geometry connection line */}
        <div className="absolute left-12 top-0 bottom-0 w-px bg-gradient-to-b from-amber-500/20 via-blue-500/10 to-transparent" />

        {/* Sessions */}
        <div className="space-y-6">
          {timeline.sessions.map((session, index) => {
            const isExpanded = expandedSession === session.id;
            const isHovered = hoveredSession === session.id;
            const hasAssets = session.assets && session.assets.length > 0;

            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08, type: "spring" }}
                className="relative"
              >
                {/* Session Card */}
                <motion.div
                  onClick={() => toggleSession(session.id)}
                  onMouseEnter={() => setHoveredSession(session.id)}
                  onMouseLeave={() => setHoveredSession(null)}
                  className="relative flex items-start gap-4 cursor-pointer group"
                  whileHover={{ x: 8 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {/* Timeline node with golden ring for assets */}
                  <div className="relative z-10 mt-8">
                    <motion.div
                      className={`w-6 h-6 rounded-full border-2 ${
                        hasAssets 
                          ? 'border-yellow-400 bg-gradient-to-br from-yellow-400/30 to-orange-400/30' 
                          : 'border-white/30 bg-black/60'
                      }`}
                      animate={isHovered ? {
                        scale: [1, 1.3, 1],
                        borderColor: hasAssets 
                          ? ['#facc15', '#fbbf24', '#facc15']
                          : ['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.6)', 'rgba(255,255,255,0.3)']
                      } : {}}
                      transition={{ duration: 1.5, repeat: isHovered ? Infinity : 0 }}
                    />
                    
                    {/* Ripple effect for sessions with assets */}
                    {hasAssets && isHovered && (
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-yellow-400"
                        initial={{ scale: 1, opacity: 0.8 }}
                        animate={{
                          scale: [1, 2, 2.5],
                          opacity: [0.8, 0.3, 0]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                  </div>

                  {/* Session Content Card */}
                  <div className="flex-1 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-md rounded-2xl p-5 border border-white/10 group-hover:border-white/20 transition-all">
                    <div className="flex items-start justify-between">
                      {/* Left: MiniHoloflower and session info */}
                      <div className="flex items-start gap-4">
                        {/* MiniHoloflower visualization */}
                        <div className="relative">
                          <MiniHoloflower 
                            session={{
                              sessionId: session.id,
                              timestamp: session.date,
                              oracleReading: {
                                elementalBalance: {
                                  fire: session.checkIns['Fire1'] || 0,
                                  water: session.checkIns['Water1'] || 0,
                                  earth: session.checkIns['Earth1'] || 0,
                                  air: session.checkIns['Air1'] || 0,
                                  aether: session.aetherResonance || 0
                                },
                                spiralStage: {
                                  element: session.dominantElement?.toLowerCase() || 'fire',
                                  stage: session.aetherStage || 1
                                },
                                reflection: '',
                                practice: '',
                                archetype: session.metadata?.oracleMode || 'Sage'
                              }
                            }}
                            size={80}
                            showAetherPulse={true}
                          />
                          
                          {/* Asset indicators around the flower */}
                          {hasAssets && (
                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                              {session.assets!.slice(0, 3).map((asset, i) => (
                                <div key={i} className="w-2 h-2 rounded-full bg-yellow-400/60" />
                              ))}
                              {session.assets!.length > 3 && (
                                <span className="text-xs text-yellow-400">+{session.assets!.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Session details */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-white font-semibold text-lg">
                              {formatDate(session.date)}
                            </span>
                            <span className="text-2xl">
                              {getElementEmoji(session.dominantElement)}
                            </span>
                            {session.metadata?.ritualType && (
                              <span className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/70">
                                {session.metadata.ritualType}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-3 text-sm text-white/60">
                            {session.coherence && (
                              <span className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-green-400/60" />
                                {Math.round(session.coherence * 100)}% coherence
                              </span>
                            )}
                            
                            {session.aetherStage && session.aetherStage > 0 && (
                              <span className="flex items-center gap-1 text-amber-400">
                                <Sparkles className="w-3 h-3" />
                                Aether stage {session.aetherStage}
                              </span>
                            )}
                            
                            {session.shadowIntegration && session.shadowIntegration > 0.3 && (
                              <span className="text-indigo-400">
                                Shadow {Math.round(session.shadowIntegration * 100)}%
                              </span>
                            )}
                            
                            {hasAssets && (
                              <span className="flex items-center gap-2 text-yellow-400">
                                {session.assets!.map(a => getAssetIcon(a.type))}
                                {session.assets!.length} {session.assets!.length === 1 ? 'asset' : 'assets'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expand/collapse indicator */}
                      <motion.div
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-2"
                      >
                        <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/60" />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>

                {/* Expanded Session Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="ml-20 mt-4 overflow-hidden"
                    >
                      <div className="bg-gradient-to-br from-amber-900/10 to-blue-900/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                        
                        {/* Sacred Assets Grid */}
                        {hasAssets ? (
                          <div>
                            <h4 className="text-white/80 font-medium mb-4 flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-yellow-400" />
                              Sacred Assets from this Session
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                              {session.assets!.map(asset => (
                                <SacredAssetPreview
                                  key={asset.id}
                                  {...asset}
                                  onPreview={() => {
                                    console.log('Preview:', asset.id);
                                  }}
                                  onDownload={() => {
                                    window.open(asset.fullUrl, '_blank');
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                              <FileText className="w-8 h-8 text-white/30" />
                            </div>
                            <p className="text-white/40 mb-4">
                              No sacred assets uploaded for this session
                            </p>
                            <button 
                              onClick={() => onAssetUpload?.(session.id)}
                              className="px-6 py-2 bg-gradient-to-r from-amber-600/20 to-blue-600/20 hover:from-amber-600/30 hover:to-blue-600/30 rounded-lg text-white/70 hover:text-white text-sm font-medium transition-all"
                            >
                              Upload Sacred Assets
                            </button>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="mt-6 pt-6 border-t border-white/10 flex gap-3">
                          <button
                            onClick={() => onSessionSelect?.(session)}
                            className="flex-1 py-2 bg-gradient-to-r from-amber-600/20 to-blue-600/20 hover:from-amber-600/30 hover:to-blue-600/30 rounded-lg text-white/80 hover:text-white text-sm font-medium transition-all"
                          >
                            Load Session State
                          </button>
                          <button
                            onClick={() => onAssetUpload?.(session.id)}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/70 hover:text-white text-sm transition-all"
                          >
                            Add Assets
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Element Distribution Summary */}
      <motion.div 
        className="mt-12 p-6 bg-gradient-to-br from-amber-900/20 to-blue-900/20 rounded-2xl border border-white/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-white font-semibold mb-4">Elemental Journey</h3>
        <div className="grid grid-cols-5 gap-4">
          {Object.entries(timeline.dominantElements).map(([element, count]) => (
            <div key={element} className="text-center">
              <div className="text-3xl mb-2">{getElementEmoji(element)}</div>
              <div className="text-white/60 text-sm">{element}</div>
              <div className="text-white font-bold text-lg">{count}</div>
              <div className="h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-amber-400 to-blue-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${(count / timeline.totalSessions) * 100}%` }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}