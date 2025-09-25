"use client";

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FirstBloom, PatternKeeper, DepthSeeker, SacredGardener, WisdomKeeper } from '@/components/MaiaCore/MilestoneStates';
import SoulprintTimeline from '@/components/MaiaCore/SoulprintTimeline';
import { useSoulprint, type SoulprintData } from '@/hooks/useSoulprint';
import { cn } from '@/lib/utils';

interface SoulprintMilestoneFlowProps {
  initialMilestone?: string;
  onComplete?: (soulprintId: string) => void;
  className?: string;
}

type ViewMode = 'milestone' | 'timeline';

const MILESTONE_COMPONENTS = {
  'first-bloom': FirstBloom,
  'pattern-keeper': PatternKeeper,
  'depth-seeker': DepthSeeker,
  'sacred-gardener': SacredGardener,
  'wisdom-keeper': WisdomKeeper
} as const;

export default function SoulprintMilestoneFlow({
  initialMilestone = 'first-bloom',
  onComplete,
  className
}: SoulprintMilestoneFlowProps) {
  const [currentMilestone, setCurrentMilestone] = useState(initialMilestone);
  const [viewMode, setViewMode] = useState<ViewMode>('milestone');
  const [sessionStartTime] = useState(Date.now());
  const [interactionCount, setInteractionCount] = useState(0);
  
  const { 
    saveSoulprint, 
    calculateCoherence, 
    getDeviceInfo,
    loading, 
    error 
  } = useSoulprint();

  // Handle completion of petal interaction
  const handleMilestoneComplete = useCallback(async (scores: any) => {
    setInteractionCount(prev => prev + 1);
    
    try {
      // Extract data from the enhanced petal scaffold response
      const {
        _elementalBalance: elementalBalance,
        _totalActivation: totalActivation,
        _timestamp,
        ...petalScores
      } = scores;

      // Calculate coherence using the sacred algorithm
      const coherence = calculateCoherence(petalScores, elementalBalance || {});
      
      // Calculate session duration
      const sessionDuration = Date.now() - sessionStartTime;
      
      // Determine session quality based on interaction and coherence
      const sessionQuality = coherence >= 0.8 ? 'high' : 
                           coherence >= 0.5 ? 'medium' : 'low';

      // Detect breakthrough moments (high coherence + high activation)
      const breakthroughMoments: string[] = [];
      if (coherence >= 0.85 && totalActivation >= 8) {
        breakthroughMoments.push('Sacred geometry alignment achieved');
      }
      if (coherence >= 0.9) {
        breakthroughMoments.push('Transcendent coherence reached');
      }

      // Detect shadow elements (low activation in specific areas)
      const shadowElements: string[] = [];
      Object.entries(elementalBalance || {}).forEach(([element, value]) => {
        if ((value as number) < 0.3) {
          shadowElements.push(`${element} element needs integration`);
        }
      });

      // Prepare soulprint data
      const soulprintData: SoulprintData = {
        scores: petalScores,
        milestone: currentMilestone,
        coherence,
        elementalBalance: elementalBalance || {},
        sessionDuration,
        interactionCount,
        totalActivation: totalActivation || Object.values(petalScores).reduce((sum, score) => sum + score, 0),
        breakthroughMoments,
        shadowElements,
        deviceInfo: getDeviceInfo(),
        sessionQuality: sessionQuality as 'low' | 'medium' | 'high'
      };

      // Save to backend
      const response = await saveSoulprint(soulprintData);
      
      if (response && response.success) {
        // Celebration and feedback
        console.log('🌸 Soulprint saved successfully!', {
          milestone: currentMilestone,
          coherence: Math.round(coherence * 100) + '%',
          breakthroughs: breakthroughMoments.length
        });

        // Switch to timeline view to show the new entry
        setViewMode('timeline');
        
        // Callback for parent component
        if (onComplete) {
          onComplete(response.soulprint.id);
        }
      }
    } catch (err) {
      console.error('Error saving soulprint:', err);
    }
  }, [
    currentMilestone, 
    sessionStartTime, 
    interactionCount, 
    saveSoulprint, 
    calculateCoherence, 
    getDeviceInfo, 
    onComplete
  ]);

  // Get the current milestone component
  const MilestoneComponent = MILESTONE_COMPONENTS[currentMilestone as keyof typeof MILESTONE_COMPONENTS] || FirstBloom;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Navigation Header */}
      <div className="flex items-center justify-between p-4 bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10">
        <div className="flex space-x-4">
          <button
            onClick={() => setViewMode('milestone')}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300",
              viewMode === 'milestone'
                ? "bg-white/20 text-white border border-white/30"
                : "text-white/60 hover:text-white/80 hover:bg-white/10"
            )}
          >
            Current Practice
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300",
              viewMode === 'timeline'
                ? "bg-white/20 text-white border border-white/30"
                : "text-white/60 hover:text-white/80 hover:bg-white/10"
            )}
          >
            Sacred Timeline
          </button>
        </div>

        {/* Milestone Selector */}
        {viewMode === 'milestone' && (
          <select
            value={currentMilestone}
            onChange={(e) => setCurrentMilestone(e.target.value)}
            className="bg-black/40 border border-white/20 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-white/40"
          >
            <option value="first-bloom">First Bloom</option>
            <option value="pattern-keeper">Pattern Keeper</option>
            <option value="depth-seeker">Depth Seeker</option>
            <option value="sacred-gardener">Sacred Gardener</option>
            <option value="wisdom-keeper">Wisdom Keeper</option>
          </select>
        )}
      </div>

      {/* Content Area */}
      <div className="relative min-h-[600px]">
        <AnimatePresence mode="wait">
          {viewMode === 'milestone' ? (
            <motion.div
              key="milestone"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              {/* Session Info */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center space-x-4 px-6 py-3 bg-black/30 backdrop-blur-lg rounded-2xl border border-white/10">
                  <span className="text-white/60 text-sm">Session:</span>
                  <span className="text-white text-sm font-medium">
                    {Math.floor((Date.now() - sessionStartTime) / 60000)}min
                  </span>
                  <span className="text-white/60 text-sm">•</span>
                  <span className="text-white/60 text-sm">Interactions:</span>
                  <span className="text-white text-sm font-medium">{interactionCount}</span>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center rounded-3xl">
                  <motion.div
                    className="space-y-4 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div
                      className="w-12 h-12 border-2 border-amber-400 border-t-transparent rounded-full mx-auto"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <p className="text-white/80 text-sm">Preserving your soulprint...</p>
                  </motion.div>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-center">
                  <p className="text-red-400 text-sm mb-2">Unable to save soulprint</p>
                  <p className="text-white/60 text-xs">{error}</p>
                </div>
              )}

              {/* Milestone Component */}
              <MilestoneComponent
                onComplete={handleMilestoneComplete}
                size={500}
              />
            </motion.div>
          ) : (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
            >
              <SoulprintTimeline className="max-h-[800px] overflow-y-auto" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sacred Instructions */}
      <motion.div
        className="text-center space-y-2 p-6 bg-black/10 backdrop-blur-lg rounded-2xl border border-white/5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        {viewMode === 'milestone' ? (
          <>
            <p className="text-white/60 text-sm">
              Engage with the petals to capture your current soul resonance
            </p>
            <p className="text-white/40 text-xs">
              Each interaction deepens your sacred practice • Trust your intuition
            </p>
          </>
        ) : (
          <>
            <p className="text-white/60 text-sm">
              Your sacred journey through the five milestones of awakening
            </p>
            <p className="text-white/40 text-xs">
              Each soulprint is a moment of divine recognition • Honor your evolution
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}