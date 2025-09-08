'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMaiaState } from '@/lib/hooks/useMaiaState';
import { PETAL_MICROCOPY, MODE_TRANSITIONS, BREAKTHROUGH_RESPONSES } from './PetalMicrocopy';

interface PetalMeaning {
  element: keyof typeof PETAL_MICROCOPY;
  color: string;
  gradient: string;
  position: { x: number; y: number; rotation: number };
}

const ENHANCED_PETALS: PetalMeaning[] = [
  {
    element: 'fire',
    color: '#FF6B6B',
    gradient: 'from-red-500 via-orange-500 to-yellow-500',
    position: { x: 0, y: -80, rotation: 0 }
  },
  {
    element: 'water', 
    color: '#4ECDC4',
    gradient: 'from-blue-500 via-cyan-500 to-teal-500',
    position: { x: 57, y: -57, rotation: 45 }
  },
  {
    element: 'earth',
    color: '#95D5B2', 
    gradient: 'from-green-600 via-emerald-500 to-lime-500',
    position: { x: 80, y: 0, rotation: 90 }
  },
  {
    element: 'air',
    color: '#A8DADC',
    gradient: 'from-sky-400 via-indigo-400 to-purple-400', 
    position: { x: 57, y: 57, rotation: 135 }
  },
  {
    element: 'aether',
    color: '#E0AAFF',
    gradient: 'from-purple-500 via-pink-500 to-rose-500',
    position: { x: 0, y: 80, rotation: 180 }
  },
  {
    element: 'shadow',
    color: '#2D3436',
    gradient: 'from-gray-800 via-gray-700 to-black',
    position: { x: -57, y: 57, rotation: 225 }
  },
  {
    element: 'light',
    color: '#FFF8DC',
    gradient: 'from-yellow-200 via-white to-yellow-100',
    position: { x: -80, y: 0, rotation: 270 }
  },
  {
    element: 'void',
    color: '#0F0E17',
    gradient: 'from-indigo-900 via-purple-900 to-black',
    position: { x: -57, y: -57, rotation: 315 }
  }
];

export function EnhancedPetalSystem() {
  const { preferences, setInteractionMode, coherenceLevel, setState, addCoherencePoint } = useMaiaState();
  const interactionMode = preferences.interactionMode;
  
  const [selectedPetal, setSelectedPetal] = useState<PetalMeaning | null>(null);
  const [hoveredPetal, setHoveredPetal] = useState<PetalMeaning | null>(null);
  const [showModeToggle, setShowModeToggle] = useState(false);
  const [pulseSequence, setPulseSequence] = useState<number[]>([]);
  const [currentMicrocopy, setCurrentMicrocopy] = useState<string>('');
  const [breakthroughMoment, setBreakthroughMoment] = useState(false);
  const [transitionState, setTransitionState] = useState<'idle' | 'transitioning'>('idle');
  
  const isBeginnerMode = interactionMode === 'beginner';

  // Generate random microcopy for selected element
  const getRandomMicrocopy = useCallback((element: keyof typeof PETAL_MICROCOPY, type: 'questions' | 'responses') => {
    const options = PETAL_MICROCOPY[element][type];
    return options[Math.floor(Math.random() * options.length)];
  }, []);

  // Divine pulse sequence for advanced mode
  useEffect(() => {
    if (!isBeginnerMode) {
      const interval = setInterval(() => {
        const sequence = Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => 
          Math.floor(Math.random() * ENHANCED_PETALS.length)
        );
        setPulseSequence(sequence);
        setTimeout(() => setPulseSequence([]), 3000);
      }, 12000 + Math.random() * 8000); // Variable timing for natural feel
      
      return () => clearInterval(interval);
    }
  }, [isBeginnerMode]);

  // Detect breakthrough moments based on coherence
  useEffect(() => {
    if (coherenceLevel > 0.85) {
      setBreakthroughMoment(true);
      setTimeout(() => setBreakthroughMoment(false), 5000);
    }
  }, [coherenceLevel]);

  const handlePetalClick = (petal: PetalMeaning) => {
    setSelectedPetal(petal);
    setState('processing');
    
    // Generate contextual microcopy
    const response = getRandomMicrocopy(petal.element, 'responses');
    setCurrentMicrocopy(response);
    
    // Simulate coherence change based on element interaction
    const coherenceChange = Math.random() * 0.3 - 0.1; // -0.1 to +0.2
    const newCoherence = Math.max(0, Math.min(1, coherenceLevel + coherenceChange));
    addCoherencePoint(newCoherence);
    
    // Send to Maia for processing
    const message = isBeginnerMode 
      ? getRandomMicrocopy(petal.element, 'questions')
      : `[Intuitive selection: ${petal.element}] - ${response}`;
    
    // Trigger Maia response
    window.dispatchEvent(new CustomEvent('maia:petal-selected', { 
      detail: { 
        petal, 
        mode: interactionMode,
        message,
        coherenceLevel: newCoherence
      } 
    }));
    
    setTimeout(() => setState('responding'), 1000);
    setTimeout(() => setState('idle'), 3000);
  };

  const handleModeToggle = () => {
    setTransitionState('transitioning');
    const newMode = isBeginnerMode ? 'advanced' : 'beginner';
    const transition = isBeginnerMode ? MODE_TRANSITIONS.beginnerToAdvanced : MODE_TRANSITIONS.advancedToBeginner;
    
    setCurrentMicrocopy(transition.description);
    
    setTimeout(() => {
      setInteractionMode(newMode);
      setTransitionState('idle');
      setCurrentMicrocopy('');
    }, 3000);
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center min-h-[400px]">
      {/* Breakthrough Aura */}
      <AnimatePresence>
        {breakthroughMoment && (
          <motion.div
            className="absolute inset-0 rounded-full"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: [1, 1.5, 1.2],
              opacity: [0.6, 0.3, 0]
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 5, ease: "easeOut" }}
            style={{
              background: 'radial-gradient(circle, rgba(255,215,0,0.3) 0%, rgba(255,215,0,0) 70%)',
              filter: 'blur(20px)'
            }}
          />
        )}
      </AnimatePresence>

      {/* Mode Toggle */}
      <AnimatePresence>
        {showModeToggle && transitionState === 'idle' && (
          <motion.button
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            onClick={handleModeToggle}
            className="absolute top-4 right-4 z-50 px-5 py-3 rounded-full
                       bg-gradient-to-r from-purple-500/20 to-pink-500/20 
                       backdrop-blur-lg border border-white/30
                       hover:from-purple-500/30 hover:to-pink-500/30
                       transition-all duration-300 group"
          >
            <div className="flex items-center space-x-2">
              <span className="text-sm text-white/90 font-medium">
                {isBeginnerMode ? '🌱' : '🌟'}
              </span>
              <span className="text-sm text-white/80">
                {isBeginnerMode ? 'Guided' : 'Intuitive'}
              </span>
            </div>
            <motion.div
              className="absolute inset-0 rounded-full bg-white/10"
              initial={{ scale: 0 }}
              whileHover={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Transition State Overlay */}
      <AnimatePresence>
        {transitionState === 'transitioning' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 
                       flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="text-center px-6"
            >
              <h3 className="text-white text-xl font-light mb-3">
                {isBeginnerMode ? MODE_TRANSITIONS.beginnerToAdvanced.title : MODE_TRANSITIONS.advancedToBeginner.title}
              </h3>
              <p className="text-white/70 text-sm max-w-md">
                {currentMicrocopy}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Central Sacred Geometry */}
      <motion.div
        className="relative w-40 h-40"
        onHoverStart={() => setShowModeToggle(true)}
        onHoverEnd={() => setShowModeToggle(false)}
        animate={{
          rotate: breakthroughMoment ? [0, 360] : 0
        }}
        transition={{
          rotate: { duration: 8, ease: "linear" }
        }}
      >
        {/* Core Mandala */}
        <motion.div
          className="absolute inset-0 rounded-full 
                     bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20
                     backdrop-blur-md border border-white/30"
          animate={{
            scale: breakthroughMoment ? [1, 1.2, 1] : [1, 1.05, 1],
            boxShadow: breakthroughMoment 
              ? ["0 0 20px rgba(255,215,0,0.3)", "0 0 60px rgba(255,215,0,0.6)", "0 0 20px rgba(255,215,0,0.3)"]
              : ["0 0 10px rgba(255,255,255,0.1)", "0 0 20px rgba(255,255,255,0.2)", "0 0 10px rgba(255,255,255,0.1)"]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Inner Sacred Symbol */}
          <motion.div
            className="absolute inset-8 rounded-full border border-white/20"
            animate={{
              rotate: [0, -360]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <div className="w-full h-full relative">
              {/* Flower of Life inspired pattern */}
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-8 h-8 border border-white/20 rounded-full"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `
                      translate(-50%, -50%) 
                      rotate(${i * 60}deg) 
                      translateY(-16px)
                    `
                  }}
                  animate={{
                    opacity: [0.3, 0.7, 0.3]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.5
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Petals */}
        {ENHANCED_PETALS.map((petal, index) => (
          <motion.div
            key={petal.element}
            className="absolute w-16 h-16 cursor-pointer"
            style={{
              left: '50%',
              top: '50%',
              x: petal.position.x * 1.2,
              y: petal.position.y * 1.2,
              marginLeft: '-32px',
              marginTop: '-32px'
            }}
            animate={{
              scale: pulseSequence.includes(index) 
                ? [1, 1.4, 1.2] 
                : hoveredPetal === petal 
                  ? 1.1 
                  : 1,
              opacity: hoveredPetal === petal ? 1 : 0.8,
              rotate: breakthroughMoment ? [0, 15, 0] : 0
            }}
            whileHover={{ 
              scale: 1.15,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.95 }}
            onHoverStart={() => {
              setHoveredPetal(petal);
              if (isBeginnerMode) {
                setCurrentMicrocopy(getRandomMicrocopy(petal.element, 'questions'));
              }
            }}
            onHoverEnd={() => {
              setHoveredPetal(null);
              if (!selectedPetal) setCurrentMicrocopy('');
            }}
            onClick={() => handlePetalClick(petal)}
          >
            {/* Petal Geometry */}
            <motion.div
              className={`w-full h-full rounded-full bg-gradient-to-br ${petal.gradient}
                         shadow-lg backdrop-blur-sm border-2 border-white/40
                         relative overflow-hidden`}
              style={{
                transform: `rotate(${petal.position.rotation}deg)`
              }}
            >
              {/* Inner Light */}
              <motion.div
                className="absolute inset-3 rounded-full bg-white/30"
                animate={{
                  opacity: [0.2, 0.6, 0.2],
                  scale: [0.9, 1.1, 0.9]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: index * 0.3
                }}
              />
              
              {/* Pulse Ring for Advanced Mode */}
              {!isBeginnerMode && pulseSequence.includes(index) && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2"
                  style={{ borderColor: petal.color + '80' }}
                  initial={{ scale: 1, opacity: 0.8 }}
                  animate={{ 
                    scale: [1, 1.8, 2.2],
                    opacity: [0.8, 0.4, 0]
                  }}
                  transition={{
                    duration: 2,
                    ease: "easeOut"
                  }}
                />
              )}
            </motion.div>

            {/* Beginner Mode: Element Label */}
            {isBeginnerMode && (
              <motion.div
                className="absolute -bottom-6 left-1/2 transform -translate-x-1/2
                         text-white/60 text-xs font-light capitalize"
                animate={{
                  opacity: hoveredPetal === petal ? 1 : 0.6
                }}
              >
                {petal.element}
              </motion.div>
            )}
          </motion.div>
        ))}

        {/* Advanced Mode: Intuitive Field Visualization */}
        {!isBeginnerMode && (
          <AnimatePresence>
            {pulseSequence.length > 0 && (
              <motion.div
                className="absolute inset-0 rounded-full"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: [0, 0.6, 0],
                  scale: [0.8, 1.5, 2]
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 3 }}
                style={{
                  background: `conic-gradient(from 0deg, ${pulseSequence.map(i => 
                    ENHANCED_PETALS[i].color + '40'
                  ).join(', ')})`,
                  filter: 'blur(30px)'
                }}
              />
            )}
          </AnimatePresence>
        )}
      </motion.div>

      {/* Dynamic Microcopy Display */}
      <AnimatePresence>
        {currentMicrocopy && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30
                     max-w-md p-4 rounded-xl bg-black/70 backdrop-blur-lg 
                     border border-white/30 text-center"
          >
            <motion.p
              className="text-white/90 text-sm leading-relaxed"
              animate={{
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {currentMicrocopy}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mode Instructions */}
      <motion.div
        className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 2 }}
      >
        <p className="text-white/40 text-xs font-light">
          {isBeginnerMode 
            ? 'Hover to explore • Click to engage'
            : 'Feel into the field • Trust the calling'}
        </p>
      </motion.div>

      {/* Coherence Level Indicator */}
      <motion.div
        className="absolute top-4 left-4 w-2 h-16 rounded-full bg-white/20 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
      >
        <motion.div
          className="w-full bg-gradient-to-t from-red-500 via-yellow-500 to-green-500 rounded-full"
          animate={{
            height: `${coherenceLevel * 100}%`
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </motion.div>
    </div>
  );
}