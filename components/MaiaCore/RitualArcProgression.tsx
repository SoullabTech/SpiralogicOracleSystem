'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMaiaState } from '@/lib/hooks/useMaiaState';

// Ritual Arc Milestones - Natural progression based on engagement
export interface RitualMilestone {
  id: string;
  name: string;
  threshold: number; // Number of sessions/interactions required
  petalConfiguration: 'simple' | 'full' | 'deep' | 'transcendent';
  centerState: 'seed' | 'bud' | 'bloom' | 'radiance';
  microcopy: {
    invitation: string;
    offering: string;
    completion: string;
    breathing: string;
  };
  unlockConditions: {
    minSessions: number;
    minDepth?: number; // Average petal activation intensity
    requiredElements?: string[]; // Must have engaged with these elements
    timeSpan?: number; // Days since first session
  };
}

export const RITUAL_MILESTONES: RitualMilestone[] = [
  {
    id: 'first-bloom',
    name: 'First Bloom',
    threshold: 1,
    petalConfiguration: 'simple',
    centerState: 'seed',
    microcopy: {
      invitation: "The flower awakens, sensing your presence for the first time...",
      offering: "Touch the petals that call to you. Let them know you're here.",
      completion: "Your first offering has been received. The seed stirs.",
      breathing: "Breathe with the rhythm of becoming..."
    },
    unlockConditions: {
      minSessions: 0
    }
  },
  {
    id: 'pattern-keeper',
    name: 'Pattern Keeper',
    threshold: 7,
    petalConfiguration: 'full',
    centerState: 'bud',
    microcopy: {
      invitation: "You return with familiar steps. The flower recognizes your rhythm...",
      offering: "Show me the patterns that live within you. Which elements sing your song?",
      completion: "Your patterns weave into the greater tapestry. The bud forms.",
      breathing: "Breathe into the patterns that emerge through repetition..."
    },
    unlockConditions: {
      minSessions: 7,
      timeSpan: 7 // At least 7 days of engagement
    }
  },
  {
    id: 'depth-seeker',
    name: 'Depth Seeker', 
    threshold: 21,
    petalConfiguration: 'deep',
    centerState: 'bloom',
    microcopy: {
      invitation: "The depths call to you now. Are you ready to dive beneath the surface?",
      offering: "Let your depths speak. What shadows and light dance in your soul?",
      completion: "The depths have been witnessed. The flower blooms in full recognition.",
      breathing: "Breathe into the vast spaces between thoughts..."
    },
    unlockConditions: {
      minSessions: 21,
      minDepth: 0.6, // Average activation intensity
      requiredElements: ['fire', 'water', 'earth', 'air'] // Must have engaged all elements
    }
  },
  {
    id: 'wisdom-keeper',
    name: 'Wisdom Keeper',
    threshold: 49,
    petalConfiguration: 'transcendent',
    centerState: 'radiance',
    microcopy: {
      invitation: "The flower now holds the wisdom of seasons. You are keeper and keeper.",
      offering: "What medicine do you carry for the world? Let it flow through sacred form.",
      completion: "Wisdom flows through you like light through petals. All is received.",
      breathing: "Breathe as the eternal witness, holding all with sacred presence..."
    },
    unlockConditions: {
      minSessions: 49,
      minDepth: 0.75,
      timeSpan: 49 // Deep relationship over time
    }
  }
];

interface UserProgress {
  totalSessions: number;
  averageDepth: number;
  elementsEngaged: Set<string>;
  daysSinceFirst: number;
  currentMilestone: RitualMilestone;
  nextMilestone?: RitualMilestone;
}

interface RitualArcProgressionProps {
  userId?: string;
  sessionHistory?: any[]; // From Supabase offering_sessions
  onMilestoneUnlocked?: (milestone: RitualMilestone) => void;
}

export function RitualArcProgression({ 
  userId, 
  sessionHistory = [],
  onMilestoneUnlocked 
}: RitualArcProgressionProps) {
  const { coherenceLevel } = useMaiaState();
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [showMilestoneTransition, setShowMilestoneTransition] = useState(false);
  const [newMilestone, setNewMilestone] = useState<RitualMilestone | null>(null);

  // Calculate user's current progress and milestone
  useEffect(() => {
    if (sessionHistory.length === 0) {
      // First time user - First Bloom
      setUserProgress({
        totalSessions: 0,
        averageDepth: 0,
        elementsEngaged: new Set(),
        daysSinceFirst: 0,
        currentMilestone: RITUAL_MILESTONES[0]
      });
      return;
    }

    // Calculate progress metrics
    const totalSessions = sessionHistory.length;
    const offeringSessions = sessionHistory.filter(s => s.status === 'offering' || s.status === 'bloom');
    
    const averageDepth = offeringSessions.length > 0 
      ? offeringSessions.reduce((sum, session) => {
          const scores = session.petal_scores || [];
          const sessionDepth = scores.reduce((s: number, score: number) => s + score, 0) / Math.max(scores.length, 1);
          return sum + sessionDepth;
        }, 0) / offeringSessions.length
      : 0;

    const elementsEngaged = new Set<string>();
    sessionHistory.forEach(session => {
      if (session.selected_petals) {
        session.selected_petals.forEach((element: string) => {
          elementsEngaged.add(element);
        });
      }
    });

    const firstSession = sessionHistory[sessionHistory.length - 1]; // Assuming reverse chronological
    const daysSinceFirst = firstSession 
      ? Math.floor((Date.now() - new Date(firstSession.session_date).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // Find current milestone
    let currentMilestone = RITUAL_MILESTONES[0];
    let nextMilestone: RitualMilestone | undefined;

    for (let i = RITUAL_MILESTONES.length - 1; i >= 0; i--) {
      const milestone = RITUAL_MILESTONES[i];
      const conditions = milestone.unlockConditions;
      
      const meetsConditions = 
        totalSessions >= conditions.minSessions &&
        (!conditions.minDepth || averageDepth >= conditions.minDepth) &&
        (!conditions.timeSpan || daysSinceFirst >= conditions.timeSpan) &&
        (!conditions.requiredElements || 
          conditions.requiredElements.every(element => elementsEngaged.has(element)));

      if (meetsConditions) {
        currentMilestone = milestone;
        nextMilestone = RITUAL_MILESTONES[i + 1];
        break;
      }
    }

    const progress = {
      totalSessions,
      averageDepth,
      elementsEngaged,
      daysSinceFirst,
      currentMilestone,
      nextMilestone
    };

    // Check for milestone unlock
    if (userProgress && userProgress.currentMilestone.id !== currentMilestone.id) {
      setNewMilestone(currentMilestone);
      setShowMilestoneTransition(true);
      onMilestoneUnlocked?.(currentMilestone);
    }

    setUserProgress(progress);
  }, [sessionHistory, userProgress, onMilestoneUnlocked]);

  // Milestone transition animation
  useEffect(() => {
    if (showMilestoneTransition && newMilestone) {
      const timer = setTimeout(() => {
        setShowMilestoneTransition(false);
        setNewMilestone(null);
      }, 6000); // 6 second celebration
      
      return () => clearTimeout(timer);
    }
  }, [showMilestoneTransition, newMilestone]);

  if (!userProgress) {
    return null; // Loading state
  }

  const { currentMilestone, nextMilestone } = userProgress;

  return (
    <div className="relative w-full h-full">
      {/* Milestone Unlock Celebration */}
      <AnimatePresence>
        {showMilestoneTransition && newMilestone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 30 }}
              animate={{ y: 0 }}
              className="text-center space-y-6 p-8 rounded-3xl bg-gradient-to-br from-purple-900/80 to-pink-900/80 
                         backdrop-blur-lg border border-white/20 shadow-2xl max-w-lg mx-4"
            >
              {/* Milestone Icon */}
              <motion.div
                className={`w-24 h-24 mx-auto rounded-full border-2 border-white/40 relative overflow-hidden
                           ${newMilestone.centerState === 'seed' ? 'bg-gradient-to-br from-green-500/40 to-emerald-600/40' :
                             newMilestone.centerState === 'bud' ? 'bg-gradient-to-br from-yellow-500/40 to-orange-500/40' :
                             newMilestone.centerState === 'bloom' ? 'bg-gradient-to-br from-pink-500/40 to-purple-500/40' :
                             'bg-gradient-to-br from-yellow-300/40 to-white/40'}`}
                animate={{
                  scale: [1, 1.2, 1.1],
                  rotate: [0, 10, 0],
                  boxShadow: [
                    '0 0 20px rgba(255,255,255,0.3)',
                    '0 0 40px rgba(255,255,255,0.6)',
                    '0 0 30px rgba(255,255,255,0.4)'
                  ]
                }}
                transition={{
                  duration: 3,
                  repeat: 1,
                  ease: "easeInOut"
                }}
              >
                {/* Inner radiance pattern based on milestone */}
                <motion.div
                  className="absolute inset-2 rounded-full"
                  style={{
                    background: `conic-gradient(from 0deg, 
                      rgba(255,255,255,0.3) 0deg, 
                      transparent 60deg, 
                      rgba(255,255,255,0.3) 120deg,
                      transparent 180deg,
                      rgba(255,255,255,0.3) 240deg,
                      transparent 300deg)`
                  }}
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 4, ease: "linear" }}
                />
              </motion.div>

              {/* Milestone Announcement */}
              <div className="space-y-3">
                <motion.h2 
                  className="text-white text-2xl font-light"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  {newMilestone.name} Awakens
                </motion.h2>
                <motion.p 
                  className="text-white/80 text-sm leading-relaxed italic"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2 }}
                >
                  {newMilestone.microcopy.completion}
                </motion.p>
              </div>

              {/* Progress Indicators */}
              <motion.div
                className="flex justify-center space-x-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
              >
                {RITUAL_MILESTONES.map((milestone, index) => (
                  <div
                    key={milestone.id}
                    className={`w-2 h-2 rounded-full transition-all duration-500 ${
                      milestone.id === newMilestone.id
                        ? 'bg-white scale-150'
                        : index < RITUAL_MILESTONES.findIndex(m => m.id === newMilestone.id)
                          ? 'bg-white/60'
                          : 'bg-white/20'
                    }`}
                  />
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sacred Breathing Rhythm - Changes with milestone */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          opacity: [0.05, 0.15, 0.05]
        }}
        transition={{
          duration: currentMilestone.centerState === 'seed' ? 6 :
                   currentMilestone.centerState === 'bud' ? 5 :
                   currentMilestone.centerState === 'bloom' ? 4.5 :
                   4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          background: `radial-gradient(circle, ${
            currentMilestone.centerState === 'seed' ? 'rgba(34,197,94,0.1)' :
            currentMilestone.centerState === 'bud' ? 'rgba(251,146,60,0.1)' :
            currentMilestone.centerState === 'bloom' ? 'rgba(236,72,153,0.1)' :
            'rgba(255,255,255,0.1)'
          }, transparent 60%)`
        }}
      />

      {/* Progress Whisper - Contextual guidance */}
      <motion.div
        className="absolute top-6 left-1/2 transform -translate-x-1/2 text-center z-20"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <p className="text-white/50 text-xs font-light italic max-w-sm">
          {currentMilestone.microcopy.breathing}
        </p>
        
        {/* Progress toward next milestone */}
        {nextMilestone && (
          <motion.div
            className="mt-3 max-w-xs mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            <div className="flex justify-between items-center text-xs text-white/40 mb-1">
              <span>{currentMilestone.name}</span>
              <span>{nextMilestone.name}</span>
            </div>
            <div className="w-full h-0.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500/60 to-pink-500/60 rounded-full"
                initial={{ width: '0%' }}
                animate={{ 
                  width: `${Math.min(100, (userProgress.totalSessions / nextMilestone.unlockConditions.minSessions) * 100)}%` 
                }}
                transition={{ duration: 2, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Current Milestone Context */}
      <motion.div
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center z-20"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        <div className={`px-4 py-2 rounded-full backdrop-blur-lg border border-white/20 
                        ${currentMilestone.centerState === 'seed' ? 'bg-green-500/10' :
                          currentMilestone.centerState === 'bud' ? 'bg-orange-500/10' :
                          currentMilestone.centerState === 'bloom' ? 'bg-pink-500/10' :
                          'bg-white/10'}`}>
          <p className="text-white/70 text-xs font-light">
            {currentMilestone.name} • {userProgress.totalSessions} offerings
          </p>
        </div>
      </motion.div>
    </div>
  );
}