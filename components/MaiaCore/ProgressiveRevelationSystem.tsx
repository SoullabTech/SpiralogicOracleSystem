'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getOfferingService } from '@/lib/services/offering-session-service';

interface ProgressiveRevelationProps {
  userId: string;
  children: React.ReactNode;
}

interface UserContext {
  cursorIdleTime: number;
  scrollBehavior: 'gentle' | 'rushed' | 'contemplative';
  sessionDuration: number;
  reflectiveMoments: number;
  isInReflectiveState: boolean;
}

export function ProgressiveRevelationSystem({ userId, children }: ProgressiveRevelationProps) {
  const [userContext, setUserContext] = useState<UserContext>({
    cursorIdleTime: 0,
    scrollBehavior: 'gentle',
    sessionDuration: 0,
    reflectiveMoments: 0,
    isInReflectiveState: false
  });

  const [shouldReveal, setShouldReveal] = useState(false);
  const [revelationLevel, setRevelationLevel] = useState<number>(0);
  const [personalInsight, setPersonalInsight] = useState<string | null>(null);

  // Track user behavior patterns
  useEffect(() => {
    let idleTimer: NodeJS.Timeout;
    let sessionTimer: NodeJS.Timeout;
    let cursorIdleTime = 0;
    let sessionStart = Date.now();
    let reflectiveMoments = 0;

    // Cursor idle detection
    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      cursorIdleTime = 0;
      
      idleTimer = setTimeout(() => {
        cursorIdleTime += 1000;
        if (cursorIdleTime >= 3000) { // 3 seconds of stillness
          reflectiveMoments++;
          setUserContext(prev => ({ 
            ...prev, 
            cursorIdleTime,
            reflectiveMoments,
            isInReflectiveState: true 
          }));
          
          // Check if conditions are right for revelation
          checkRevelationConditions();
        }
      }, 1000);
    };

    // Session duration tracking
    sessionTimer = setInterval(() => {
      const duration = Date.now() - sessionStart;
      setUserContext(prev => ({ 
        ...prev, 
        sessionDuration: duration
      }));
    }, 1000);

    // Scroll behavior detection
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      setUserContext(prev => ({ 
        ...prev, 
        isInReflectiveState: false 
      }));
      
      scrollTimeout = setTimeout(() => {
        setUserContext(prev => ({ 
          ...prev, 
          scrollBehavior: 'contemplative' 
        }));
      }, 2000);
    };

    // Event listeners
    document.addEventListener('mousemove', resetIdleTimer);
    document.addEventListener('scroll', handleScroll);

    return () => {
      clearTimeout(idleTimer);
      clearTimeout(sessionTimer);
      clearTimeout(scrollTimeout);
      document.removeEventListener('mousemove', resetIdleTimer);
      document.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const checkRevelationConditions = useCallback(async () => {
    // Only reveal when user is naturally reflective
    const conditions = {
      isStill: userContext.cursorIdleTime >= 3000,
      hasReflectiveMoments: userContext.reflectiveMoments >= 2,
      sufficientDuration: userContext.sessionDuration >= 30000, // 30 seconds
      isContemplative: userContext.scrollBehavior === 'contemplative'
    };

    const shouldRevealNow = Object.values(conditions).filter(Boolean).length >= 2;

    if (shouldRevealNow && !shouldReveal) {
      setShouldReveal(true);
      await loadPersonalInsight();
    }
  }, [userContext, shouldReveal]);

  const loadPersonalInsight = async () => {
    try {
      const [timeline, stats, streak] = await Promise.all([
        getOfferingService().getUserTimeline(userId, 14),
        getOfferingService().getUserStats(userId),
        getOfferingService().getOfferingStreak(userId)
      ]);

      // Generate contextual insight based on their patterns
      const insights = generateContextualInsight(timeline, stats, streak);
      setPersonalInsight(insights);
      
      // Determine revelation level based on their journey
      const level = calculateRevelationLevel(timeline, stats);
      setRevelationLevel(level);
      
    } catch (error) {
      console.error('Error loading personal insight:', error);
    }
  };

  const generateContextualInsight = (timeline: any[], stats: any, streak: number) => {
    if (!timeline.length) {
      return "I sense something stirring. Would you like to explore what's emerging within you?";
    }

    if (streak >= 7) {
      return "Your consistency reveals a deeper rhythm. What if this daily practice is preparing you for something significant?";
    }

    if (stats?.offering_percentage > 70) {
      return "I notice you rarely choose rest. What would change if you trusted your need for stillness as much as your drive to offer?";
    }

    const recentPattern = timeline.slice(0, 3);
    const hasVariety = new Set(recentPattern.map(s => s.status)).size > 1;
    
    if (hasVariety) {
      return "Your soul speaks in seasons - sometimes offering, sometimes resting. This dance of engagement and retreat might be your natural wisdom.";
    }

    return "What if your inner landscape is more complex and beautiful than you've allowed yourself to see?";
  };

  const calculateRevelationLevel = (timeline: any[], stats: any) => {
    if (!timeline.length) return 0; // First Bloom
    if (timeline.length < 7) return 1; // Early Blooms
    if (timeline.length < 30) return 2; // Deep Roots
    return 3; // Wisdom Keeper
  };

  const dismissRevelation = () => {
    setShouldReveal(false);
    setPersonalInsight(null);
    
    // Reset context to prevent immediate re-trigger
    setUserContext(prev => ({
      ...prev,
      isInReflectiveState: false,
      reflectiveMoments: 0
    }));
  };

  return (
    <div className="relative">
      {/* Contextual Revelation Overlay */}
      <AnimatePresence>
        {shouldReveal && personalInsight && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={dismissRevelation}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="max-w-md mx-4 p-8 rounded-2xl bg-black/80 backdrop-blur-lg 
                         border border-white/20 shadow-2xl text-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Gentle breathing orb */}
              <motion.div
                className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br 
                           from-amber-500/30 to-pink-500/30 border border-white/20"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Personal insight */}
              <motion.p
                className="text-white/90 text-sm leading-relaxed mb-6 italic"
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                "{personalInsight}"
              </motion.p>

              {/* Action buttons */}
              <div className="flex flex-col space-y-3">
                <motion.button
                  onClick={dismissRevelation}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-500/20 to-pink-500/20
                           border border-amber-500/40 text-white text-sm font-medium
                           hover:from-amber-500/30 hover:to-pink-500/30 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Yes, I'm curious 🌸
                </motion.button>
                
                <motion.button
                  onClick={dismissRevelation}
                  className="px-6 py-2 rounded-full bg-white/10 border border-white/20 
                           text-white/70 text-sm hover:bg-white/20 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Maybe later ✨
                </motion.button>
              </div>

              {/* Revelation level indicator */}
              <div className="flex justify-center space-x-1 mt-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i <= revelationLevel 
                        ? 'bg-amber-400' 
                        : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transparent interface wrapper */}
      <motion.div
        animate={{
          filter: shouldReveal ? 'blur(1px)' : 'blur(0px)',
          opacity: shouldReveal ? 0.7 : 1
        }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>

      {/* Subtle context indicators (only when not revealing) */}
      {!shouldReveal && userContext.isInReflectiveState && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed bottom-8 right-8 text-white/30 text-xs"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🌸
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

// Enhanced context detection hook
export function useReflectiveState() {
  const [isReflective, setIsReflective] = useState(false);
  
  useEffect(() => {
    let idleTimer: NodeJS.Timeout;
    let isIdle = false;

    const handleActivity = () => {
      clearTimeout(idleTimer);
      isIdle = false;
      setIsReflective(false);
      
      idleTimer = setTimeout(() => {
        isIdle = true;
        setIsReflective(true);
      }, 2000);
    };

    document.addEventListener('mousemove', handleActivity);
    document.addEventListener('scroll', handleActivity);
    document.addEventListener('keypress', handleActivity);

    return () => {
      clearTimeout(idleTimer);
      document.removeEventListener('mousemove', handleActivity);
      document.removeEventListener('scroll', handleActivity);
      document.removeEventListener('keypress', handleActivity);
    };
  }, []);

  return isReflective;
}