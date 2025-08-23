"use client";

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConstellationVisual } from '@/lib/beta/constellation';

interface ConstellationCanvasProps {
  visual: ConstellationVisual;
  onPhase?: (phase: string) => void;
  onComplete?: () => void;
  allowSkip?: boolean;
}

type AnimationPhase = 'title' | 'points' | 'links' | 'badges' | 'seal' | 'complete';

export function ConstellationCanvas({ 
  visual, 
  onPhase, 
  onComplete,
  allowSkip = false 
}: ConstellationCanvasProps) {
  const [currentPhase, setCurrentPhase] = useState<AnimationPhase>('title');
  const [visiblePoints, setVisiblePoints] = useState<Set<string>>(new Set());
  const [visibleLinks, setVisibleLinks] = useState<Set<string>>(new Set());
  const [showBadges, setShowBadges] = useState(false);
  const [showSeal, setShowSeal] = useState(false);
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  useEffect(() => {
    if (prefersReducedMotion) {
      // Skip animations if user prefers reduced motion
      setVisiblePoints(new Set(visual.points.map(p => p.id)));
      setVisibleLinks(new Set(visual.links.map((l, i) => `${l.from}-${l.to}-${i}`)));
      setShowBadges(true);
      setShowSeal(true);
      setCurrentPhase('complete');
      onPhase?.('complete');
      return;
    }

    startAnimation();
    
    return () => {
      timeoutRefs.current.forEach(clearTimeout);
    };
  }, [visual, prefersReducedMotion]);

  const addTimeout = (callback: () => void, delay: number) => {
    const timeout = setTimeout(callback, delay);
    timeoutRefs.current.push(timeout);
    return timeout;
  };

  const startAnimation = () => {
    const animDuration = parseInt(process.env.NEXT_PUBLIC_CEREMONY_ANIM_MS || '24000');
    const phases = {
      title: 2000,
      points: 6000,
      links: 6000,
      badges: 3000,
      seal: 3000
    };

    let elapsed = 0;

    // Phase 1: Title (already visible)
    onPhase?.('title');
    
    // Phase 2: Points shimmer in
    elapsed += phases.title;
    addTimeout(() => {
      setCurrentPhase('points');
      onPhase?.('points');
      
      visual.points.forEach((point, index) => {
        addTimeout(() => {
          setVisiblePoints(prev => new Set([...prev, point.id]));
        }, (index * phases.points) / visual.points.length);
      });
    }, elapsed);

    // Phase 3: Links weave progressively
    elapsed += phases.points;
    addTimeout(() => {
      setCurrentPhase('links');
      onPhase?.('links');
      
      visual.links.forEach((link, index) => {
        addTimeout(() => {
          setVisibleLinks(prev => new Set([...prev, `${link.from}-${link.to}-${index}`]));
        }, (index * phases.links) / visual.links.length);
      });
    }, elapsed);

    // Phase 4: Badge icons/labels pulse
    elapsed += phases.links;
    addTimeout(() => {
      setCurrentPhase('badges');
      onPhase?.('badges');
      setShowBadges(true);
    }, elapsed);

    // Phase 5: Final seal
    elapsed += phases.badges;
    addTimeout(() => {
      setCurrentPhase('seal');
      onPhase?.('seal');
      setShowSeal(true);
    }, elapsed);

    // Phase 6: Complete
    elapsed += phases.seal;
    addTimeout(() => {
      setCurrentPhase('complete');
      onPhase?.('complete');
    }, elapsed);
  };

  const handleSkip = () => {
    if (!allowSkip) return;
    
    timeoutRefs.current.forEach(clearTimeout);
    setVisiblePoints(new Set(visual.points.map(p => p.id)));
    setVisibleLinks(new Set(visual.links.map((l, i) => `${l.from}-${l.to}-${i}`)));
    setShowBadges(true);
    setShowSeal(true);
    setCurrentPhase('complete');
    onPhase?.('complete');
  };

  const getBadgeEmoji = (badgeCode: string): string => {
    const emojiMap: Record<string, string> = {
      'PIONEER': '🧭',
      'VOICE_VOYAGER': '🎙️',
      'THREAD_WEAVER': '🕸️',
      'SOUL_KEEPER': '🔮',
      'PATTERN_SCOUT': '🌌',
      'SHADOW_STEWARD': '🌑',
      'PATHFINDER': '🌿',
      'FEEDBACK_FRIEND': '📝'
    };
    return emojiMap[badgeCode] || '⭐';
  };

  return (
    <div className="relative w-full h-[500px] bg-black/90 rounded-2xl border border-zinc-800 overflow-hidden">
      {/* Skip button for development */}
      {allowSkip && currentPhase !== 'complete' && (
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 z-20 text-xs text-zinc-500 hover:text-zinc-300 transition"
        >
          Skip Animation
        </button>
      )}

      {/* Title and subtitle */}
      <AnimatePresence>
        {currentPhase !== 'complete' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-x-0 top-8 text-center z-10"
          >
            <h2 className="text-xl font-semibold text-white mb-2">
              {visual.title}
            </h2>
            <p className="text-sm text-zinc-400">
              {visual.subtitle}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SVG Constellation */}
      <svg 
        viewBox="0 0 600 400" 
        className="w-full h-full absolute inset-0"
        style={{ filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.3))' }}
      >
        {/* Background gradient */}
        <defs>
          <radialGradient id="bgGradient" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.1)" />
            <stop offset="100%" stopColor="rgba(0, 0, 0, 0.9)" />
          </radialGradient>
          
          {/* Glow filters */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          <filter id="starGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <rect width="100%" height="100%" fill="url(#bgGradient)" />

        {/* Constellation Links */}
        {visual.links.map((link, index) => {
          const fromPoint = visual.points.find(p => p.id === link.from);
          const toPoint = visual.points.find(p => p.id === link.to);
          const linkId = `${link.from}-${link.to}-${index}`;
          
          if (!fromPoint || !toPoint || !visibleLinks.has(linkId)) return null;

          return (
            <motion.line
              key={linkId}
              x1={fromPoint.x}
              y1={fromPoint.y}
              x2={toPoint.x}
              y2={toPoint.y}
              stroke={visual.palette[index % visual.palette.length]}
              strokeWidth={Math.max(1, link.weight * 2)}
              strokeOpacity={0.6}
              filter="url(#glow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{ 
                duration: 1.5, 
                ease: "easeInOut",
                delay: 0.2 
              }}
            />
          );
        })}

        {/* Constellation Points */}
        {visual.points.map((point, index) => {
          if (!visiblePoints.has(point.id)) return null;

          const color = visual.palette[index % visual.palette.length];
          const isPrimary = point.primary;

          return (
            <g key={point.id}>
              {/* Outer glow ring */}
              <motion.circle
                cx={point.x}
                cy={point.y}
                r={isPrimary ? 12 : 8}
                fill="none"
                stroke={color}
                strokeWidth={1}
                strokeOpacity={0.3}
                filter="url(#starGlow)"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [0, 1.2, 1], 
                  opacity: [0, 0.8, 0.3] 
                }}
                transition={{ 
                  duration: 2,
                  times: [0, 0.6, 1],
                  ease: "easeOut"
                }}
              />
              
              {/* Main star point */}
              <motion.circle
                cx={point.x}
                cy={point.y}
                r={isPrimary ? 6 : 4}
                fill={color}
                filter="url(#starGlow)"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  duration: 1.5,
                  ease: "backOut",
                  delay: 0.3 
                }}
              />

              {/* Badge icon overlay */}
              {showBadges && (
                <motion.text
                  x={point.x}
                  y={point.y + 2}
                  textAnchor="middle"
                  fontSize={isPrimary ? "16" : "12"}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ 
                    duration: 0.8,
                    ease: "backOut" 
                  }}
                >
                  {getBadgeEmoji(point.badgeCode)}
                </motion.text>
              )}
            </g>
          );
        })}

        {/* Central seal/mandala */}
        {showSeal && (
          <motion.g
            initial={{ scale: 0, opacity: 0, rotate: -45 }}
            animate={{ scale: 1, opacity: 0.4, rotate: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
          >
            <circle
              cx={300}
              cy={200}
              r={80}
              fill="none"
              stroke="url(#bgGradient)"
              strokeWidth={2}
              strokeDasharray="5,5"
              filter="url(#glow)"
            />
            <circle
              cx={300}
              cy={200}
              r={60}
              fill="none"
              stroke="rgba(59, 130, 246, 0.3)"
              strokeWidth={1}
              filter="url(#glow)"
            />
          </motion.g>
        )}
      </svg>

      {/* Completion state */}
      <AnimatePresence>
        {currentPhase === 'complete' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <div className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, duration: 0.8, ease: "backOut" }}
                className="text-6xl mb-4"
              >
                🎓
              </motion.div>
              <h3 className="text-2xl font-bold text-white">
                Constellation Complete
              </h3>
              <p className="text-zinc-300 max-w-md">
                Your journey through the {visual.title.toLowerCase()} is sealed. 
                Welcome to your graduated pioneer status.
              </p>
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
                onClick={onComplete}
                className="mt-6 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
              >
                Continue to Profile
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}