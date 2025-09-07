// Motion Orchestrator - Framer Motion components for Sacred Holoflower
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

export type MotionState = 
  | 'idle' 
  | 'listening' 
  | 'processing' 
  | 'responding' 
  | 'breakthrough';

export type CoherenceShift = 'rising' | 'falling' | 'stable';

interface MotionOrchestratorProps {
  motionState: MotionState;
  coherenceLevel: number; // 0.0 - 1.0
  coherenceShift?: CoherenceShift;
  activeFacetIds?: string[];
  children: React.ReactNode;
  onMotionComplete?: (state: MotionState) => void;
}

// Animation variants for different motion states
const containerVariants: Variants = {
  idle: {
    scale: 1,
    transition: { duration: 0.5, ease: "easeInOut" }
  },
  listening: {
    scale: [1, 1.02, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  processing: {
    rotate: [0, 5, -5, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  responding: {
    scale: 1.05,
    transition: { duration: 0.8, ease: "easeOut" }
  },
  breakthrough: {
    scale: [1, 1.2, 1.1, 1],
    rotate: [0, 10, -5, 0],
    transition: {
      duration: 3,
      ease: "easeOut"
    }
  }
};

const glowVariants: Variants = {
  idle: {
    opacity: 0.3,
    scale: 1
  },
  listening: {
    opacity: [0.3, 0.6, 0.3],
    scale: [1, 1.1, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  processing: {
    opacity: [0.3, 1, 0.3],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  responding: {
    opacity: 0.8,
    scale: 1.05
  },
  breakthrough: {
    opacity: [0.3, 1, 0.8],
    scale: [1, 1.3, 1.1],
    transition: {
      duration: 3,
      ease: "easeOut"
    }
  }
};

export const MotionOrchestrator: React.FC<MotionOrchestratorProps> = ({
  motionState,
  coherenceLevel,
  coherenceShift = 'stable',
  activeFacetIds = [],
  children,
  onMotionComplete
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [isLowPower, setIsLowPower] = useState(false);

  useEffect(() => {
    // Check for low power mode
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setIsLowPower(battery.level < 0.2);
      });
    }
  }, []);

  const getCoherenceColor = (level: number): string => {
    if (level >= 0.7) return '#10B981';
    if (level >= 0.4) return '#F59E0B';
    return '#EF4444';
  };

  const coherenceRingVariants: Variants = {
    idle: {
      rotate: 0,
      opacity: 0.3,
      scale: 1,
      stroke: getCoherenceColor(coherenceLevel)
    },
    listening: {
      rotate: shouldReduceMotion ? 0 : 360,
      opacity: [0.3, 0.6, 0.3],
      transition: {
        rotate: {
          duration: isLowPower ? 60 : 30,
          repeat: Infinity,
          ease: "linear"
        },
        opacity: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }
    },
    processing: {
      scale: [1, 1.02, 1],
      opacity: [0.3, 0.8, 0.3],
      stroke: getCoherenceColor(coherenceLevel),
      transition: {
        duration: 1,
        repeat: 3,
        ease: "easeInOut"
      }
    },
    responding: {
      opacity: coherenceLevel >= 0.7 ? 0.9 : 0.6,
      scale: 1.02,
      stroke: getCoherenceColor(coherenceLevel),
      transition: { duration: 0.5 }
    },
    breakthrough: {
      stroke: "#FFD700",
      opacity: [0.3, 1, 0.8],
      scale: [1, 1.1, 1.05],
      transition: {
        duration: 3,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      className="motion-orchestrator relative"
      variants={shouldReduceMotion ? {} : containerVariants}
      animate={shouldReduceMotion ? "idle" : motionState}
      onAnimationComplete={() => onMotionComplete?.(motionState)}
    >
      {/* Coherence Rings */}
      <div className="absolute inset-0 pointer-events-none">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 400 400"
          className="absolute inset-0"
        >
          <defs>
            <filter id="coherence-glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Outer coherence ring */}
          <motion.circle
            cx="200"
            cy="200"
            r="180"
            fill="none"
            strokeWidth="2"
            strokeDasharray="5,5"
            filter="url(#coherence-glow)"
            variants={coherenceRingVariants}
            animate={motionState}
          />

          {/* Inner coherence ring */}
          <motion.circle
            cx="200"
            cy="200"
            r="140"
            fill="none"
            strokeWidth="1"
            strokeDasharray="3,3"
            opacity="0.5"
            variants={coherenceRingVariants}
            animate={motionState}
            transition={{
              ...coherenceRingVariants.listening?.transition,
              rotate: {
                duration: isLowPower ? 45 : 25,
                repeat: Infinity,
                ease: "linear"
              }
            }}
          />
        </svg>
      </div>

      {/* Coherence Shift Effects */}
      <AnimatePresence>
        {coherenceShift === 'rising' && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: -20 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 2 }}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-green-400 rounded-full"
                style={{
                  left: `${45 + i * 20}%`,
                  top: '50%'
                }}
                animate={{
                  y: [-20, -60],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
              />
            ))}
          </motion.div>
        )}

        {coherenceShift === 'falling' && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 20 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 2 }}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-red-400 rounded-full"
                style={{
                  left: `${45 + i * 20}%`,
                  top: '50%'
                }}
                animate={{
                  y: [20, 60],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center Aether Glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none flex items-center justify-center"
        variants={shouldReduceMotion ? {} : glowVariants}
        animate={shouldReduceMotion ? "idle" : motionState}
      >
        <div
          className="w-16 h-16 rounded-full"
          style={{
            background: `radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.1) 70%, transparent 100%)`,
            filter: 'blur(8px)'
          }}
        />
      </motion.div>

      {/* Breakthrough Starburst */}
      <AnimatePresence>
        {motionState === 'breakthrough' && (
          <motion.div
            className="absolute inset-0 pointer-events-none flex items-center justify-center"
            initial={{ scale: 0, rotate: 0 }}
            animate={{ 
              scale: [0, 2, 1.5, 0], 
              rotate: [0, 180, 360, 540],
              opacity: [0, 1, 0.8, 0]
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ 
              duration: 3, 
              ease: "easeOut",
              times: [0, 0.3, 0.8, 1]
            }}
          >
            <div className="w-32 h-32 relative">
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-16 bg-gradient-to-t from-transparent via-yellow-300 to-transparent"
                  style={{
                    left: '50%',
                    top: '50%',
                    transformOrigin: '0 0',
                    transform: `rotate(${i * 45}deg)`
                  }}
                  animate={{
                    scaleY: [0, 1, 0.8, 0],
                    opacity: [0, 1, 0.6, 0]
                  }}
                  transition={{
                    duration: 3,
                    delay: i * 0.1,
                    ease: "easeOut"
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Particle Drift Effect */}
      {motionState === 'listening' && !shouldReduceMotion && !isLowPower && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-60"
              style={{
                left: `${40 + Math.random() * 20}%`,
                top: `${40 + Math.random() * 20}%`
              }}
              animate={{
                x: [0, 30, 60],
                y: [0, -20, -60],
                opacity: [0.6, 0.3, 0],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 8,
                delay: i * 1.3,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </div>
      )}

      {/* Main Content */}
      {children}
    </motion.div>
  );
};

export default MotionOrchestrator;