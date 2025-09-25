'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PetalInteractionSystem } from './PetalInteractionSystem';
import { OfferingTimeline } from './OfferingTimeline';
import { getOfferingService } from '@/lib/services/offering-session-service';

interface SacredMirrorProps {
  userId: string;
  userLevel?: 'first_bloom' | 'early_blooms' | 'deep_roots' | 'wisdom_keeper';
}

export function SacredMirrorInterface({ userId, userLevel = 'first_bloom' }: SacredMirrorProps) {
  const [currentInsight, setCurrentInsight] = useState<string | null>(null);
  const [showMirrorMoment, setShowMirrorMoment] = useState(false);
  const [personalPatterns, setPersonalPatterns] = useState<any>(null);
  const [isReflecting, setIsReflecting] = useState(false);

  useEffect(() => {
    loadPersonalPatterns();
  }, [userId]);

  const loadPersonalPatterns = async () => {
    try {
      const [timeline, stats] = await Promise.all([
        getOfferingService().getUserTimeline(userId, 30),
        getOfferingService().getUserStats(userId)
      ]);
      
      setPersonalPatterns({ timeline, stats });
      generatePersonalInsight(timeline);
    } catch (error) {
      console.error('Error loading patterns:', error);
    }
  };

  const generatePersonalInsight = (timeline: any[]) => {
    if (!timeline.length) return;

    // Analyze their unique patterns
    const dayOfWeekPatterns = timeline.reduce((acc, session) => {
      const day = new Date(session.session_date).getDay();
      acc[day] = acc[day] || [];
      acc[day].push(session);
      return acc;
    }, {} as Record<number, any[]>);

    // Find their most consistent patterns
    const insights = [
      "I notice you often choose grounding when preparing for something important.",
      "Your Monday energy differs entirely from your Thursday rhythm.",
      "When you select Air + Light together, collaboration themes emerge.",
      "Your need for solitude seems to prepare wisdom for sharing.",
      "What if your restlessness isn't a problem but information to receive?"
    ];

    setCurrentInsight(insights[Math.floor(Math.random() * insights.length)]);
  };

  const handleOfferingComplete = (session: any) => {
    // Show mirror moment based on their selection
    setShowMirrorMoment(true);
    
    // Generate contextual reflection
    const mirrorQuestions = [
      "What wants to be felt that I've been thinking my way around?",
      "How does this energy want to serve my day?",
      "What would change if I trusted this natural rhythm?",
      "What is this pattern teaching me about my way of being?"
    ];

    setTimeout(() => {
      setCurrentInsight(mirrorQuestions[Math.floor(Math.random() * mirrorQuestions.length)]);
    }, 2000);
  };

  const renderByLevel = () => {
    switch (userLevel) {
      case 'first_bloom':
        return <FirstBloomInterface />;
      case 'early_blooms':
        return <EarlyBloomsInterface patterns={personalPatterns} />;
      case 'deep_roots':
        return <DeepRootsInterface patterns={personalPatterns} insight={currentInsight} />;
      case 'wisdom_keeper':
        return <WisdomKeeperInterface patterns={personalPatterns} />;
      default:
        return <FirstBloomInterface />;
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-amber-900/20 to-slate-800">
      {/* Contextual Appearance - only when user is naturally reflective */}
      <AnimatePresence>
        {showMirrorMoment && currentInsight && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-8 left-1/2 transform -translate-x-1/2 z-50
                       max-w-md mx-4 p-6 rounded-2xl bg-black/60 backdrop-blur-lg
                       border border-white/10 text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-white/90 text-sm italic mb-4"
            >
              "{currentInsight}"
            </motion.div>
            
            <motion.button
              onClick={() => setShowMirrorMoment(false)}
              className="px-4 py-2 rounded-full bg-white/10 border border-white/20 
                         text-white/70 text-xs hover:bg-white/20 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Reflect on this
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Interface */}
      <div className="container mx-auto px-4 py-8">
        <PetalInteractionSystem
          userId={userId}
          onOfferingComplete={handleOfferingComplete}
          onRestChosen={() => setIsReflecting(true)}
        />

        {/* Level-specific content */}
        <div className="mt-12">
          {renderByLevel()}
        </div>
      </div>
    </div>
  );
}

// Level-specific interface components
function FirstBloomInterface() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center space-y-6"
    >
      <h2 className="text-white/90 text-lg font-light">
        Discovering the Sacred in Ordinary
      </h2>
      <p className="text-white/60 text-sm max-w-md mx-auto">
        Each petal holds a facet of you. Touch whichever calls to you.
        No right or wrong. Just noticing.
      </p>
    </motion.div>
  );
}

function EarlyBloomsInterface({ patterns }: { patterns: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="text-center">
        <h2 className="text-white/90 text-lg font-light mb-4">
          Patterns Emerging
        </h2>
        
        {patterns?.timeline && (
          <div className="flex justify-center space-x-2">
            {patterns.timeline.slice(0, 7).map((session: any, i: number) => (
              <span key={i} className="text-2xl">
                {session.icon}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-md mx-auto p-4 rounded-xl bg-black/20 border border-white/10">
        <p className="text-white/70 text-sm italic text-center">
          "I notice you often choose Earth when you're seeking grounding.
          Your Monday Fire always comes with clarity."
        </p>
      </div>
    </motion.div>
  );
}

function DeepRootsInterface({ patterns, insight }: { patterns: any; insight: string | null }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="text-center">
        <h2 className="text-white/90 text-lg font-light mb-6">
          Integration Phase
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Life Integration */}
        <div className="p-6 rounded-xl bg-black/20 border border-white/10">
          <h3 className="text-white/80 text-sm font-medium mb-3">
            Your Natural Cycle
          </h3>
          <div className="space-y-2 text-xs text-white/60">
            <div>Monday: High vision → Self-doubt</div>
            <div>Tuesday: Grounding ritual emerges</div>
            <div>Wednesday: Creative flow follows</div>
          </div>
          <p className="text-white/70 text-sm italic mt-4">
            "What would change if you trusted this rhythm?"
          </p>
        </div>

        {/* Tomorrow's Guidance */}
        <div className="p-6 rounded-xl bg-black/20 border border-white/10">
          <h3 className="text-white/80 text-sm font-medium mb-3">
            Tomorrow's Meeting Approach
          </h3>
          <div className="space-y-2 text-xs text-white/60">
            <div>💡 Lead with Tuesday groundedness</div>
            <div>💫 Channel Monday vision as inspiration</div>
          </div>
          <motion.button
            className="mt-4 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40
                       text-amber-300 text-xs hover:bg-amber-500/30 transition-colors"
            whileHover={{ scale: 1.05 }}
          >
            Apply this pattern
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function WisdomKeeperInterface({ patterns }: { patterns: any }) {
  const [showMentorMode, setShowMentorMode] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="text-center">
        <h2 className="text-white/90 text-lg font-light mb-2">
          Sacred Observatory
        </h2>
        <p className="text-amber-300 text-sm">Wisdom Keeper Level</p>
      </div>

      {/* Master Integration Interface */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-black/30 to-amber-900/20 border border-white/10">
        <h3 className="text-white/90 text-base font-medium mb-4">
          Today's Emergence
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-white/70 text-sm mb-3">
              Void + Light confluence
            </p>
            <p className="text-white/60 text-xs italic">
              "Integration of unknown with clarity"
            </p>
          </div>
          
          <div className="space-y-2 text-xs text-white/60">
            <div>• Strategic unknowns → Creative tension</div>
            <div>• Team uncertainty → Innovation catalyst</div>
            <div>• Personal mystery → Leadership depth</div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          <div className="text-white/60 text-xs">
            Current Wisdom Streak: 43 days 🔥
          </div>
          
          <motion.button
            onClick={() => setShowMentorMode(true)}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-pink-500/20
                       border border-amber-500/40 text-amber-300 text-xs
                       hover:from-amber-500/30 hover:to-pink-500/30 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
          >
            Mentor Mode
          </motion.button>
        </div>
      </div>

      {/* Timeline Integration */}
      <div className="space-y-4">
        <h3 className="text-white/80 text-sm font-medium">
          Your Consciousness Garden
        </h3>
        <OfferingTimeline userId="" showStats={true} limit={15} />
      </div>
    </motion.div>
  );
}