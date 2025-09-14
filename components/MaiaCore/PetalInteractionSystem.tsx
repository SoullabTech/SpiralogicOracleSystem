'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMaiaState } from '@/lib/hooks/useMaiaState';
import { getOfferingService } from '@/lib/services/offering-session-service';
import { PETAL_ELEMENTS } from '@/lib/types/offering-sessions';

type OfferingState = 'invitation' | 'offering' | 'resting' | 'completed';

interface OfferingSession {
  date: string;
  status: 'rest' | 'offering' | 'bloom' | 'transcendent';
  petalScores?: number[];
  reflection?: string;
  journalPrompt?: string;
}

interface PetalInteractionProps {
  isInvitation?: boolean;
  userId?: string; // Add userId for Supabase integration
  onOfferingComplete?: (session: OfferingSession) => void;
  onRestChosen?: () => void;
}

interface PetalMeaning {
  element: string;
  color: string;
  gradient: string;
  meaning: string;
  question: string;
  shadowAspect: string;
  lightAspect: string;
  position: { x: number; y: number; rotation: number };
}

const PETAL_MEANINGS: PetalMeaning[] = [
  {
    element: 'fire',
    color: '#FF6B6B',
    gradient: 'from-red-500 to-orange-500',
    meaning: 'Passion & Will',
    question: 'What ignites your soul?',
    shadowAspect: 'Rage, destruction, burnout',
    lightAspect: 'Creativity, courage, transformation',
    position: { x: 0, y: -80, rotation: 0 }
  },
  {
    element: 'water',
    color: '#4ECDC4',
    gradient: 'from-blue-500 to-cyan-500',
    meaning: 'Emotion & Flow',
    question: 'What needs to be felt?',
    shadowAspect: 'Overwhelm, stagnation, drowning',
    lightAspect: 'Intuition, healing, adaptability',
    position: { x: 57, y: -57, rotation: 45 }
  },
  {
    element: 'earth',
    color: '#95D5B2',
    gradient: 'from-green-600 to-emerald-500',
    meaning: 'Grounding & Form',
    question: 'What seeks manifestation?',
    shadowAspect: 'Rigidity, materialism, inertia',
    lightAspect: 'Stability, abundance, nurturing',
    position: { x: 80, y: 0, rotation: 90 }
  },
  {
    element: 'air',
    color: '#A8DADC',
    gradient: 'from-sky-400 to-indigo-400',
    meaning: 'Thought & Connection',
    question: 'What truth seeks expression?',
    shadowAspect: 'Anxiety, disconnection, overthinking',
    lightAspect: 'Clarity, communication, inspiration',
    position: { x: 57, y: 57, rotation: 135 }
  },
  {
    element: 'aether',
    color: '#E0AAFF',
    gradient: 'from-purple-500 to-pink-500',
    meaning: 'Spirit & Unity',
    question: 'What transcends all form?',
    shadowAspect: 'Spiritual bypassing, dissociation',
    lightAspect: 'Integration, wholeness, presence',
    position: { x: 0, y: 80, rotation: 180 }
  },
  {
    element: 'shadow',
    color: '#2D3436',
    gradient: 'from-gray-800 to-black',
    meaning: 'Hidden & Denied',
    question: 'What remains unseen?',
    shadowAspect: 'Repression, projection, denial',
    lightAspect: 'Integration, acceptance, power',
    position: { x: -57, y: 57, rotation: 225 }
  },
  {
    element: 'light',
    color: '#FFF8DC',
    gradient: 'from-yellow-200 to-white',
    meaning: 'Awareness & Clarity',
    question: 'What illuminates your path?',
    shadowAspect: 'Blindness, illusion, false light',
    lightAspect: 'Truth, revelation, awakening',
    position: { x: -80, y: 0, rotation: 270 }
  },
  {
    element: 'void',
    color: '#0F0E17',
    gradient: 'from-indigo-900 to-black',
    meaning: 'Potential & Mystery',
    question: 'What emerges from nothing?',
    shadowAspect: 'Nihilism, emptiness, despair',
    lightAspect: 'Possibility, creativity, source',
    position: { x: -57, y: -57, rotation: 315 }
  }
];

export function PetalInteractionSystem({ 
  isInvitation = true,
  userId,
  onOfferingComplete,
  onRestChosen 
}: PetalInteractionProps = {}) {
  const { preferences, setInteractionMode } = useMaiaState();
  const interactionMode = preferences.interactionMode;
  
  // Offering flow states
  const [offeringState, setOfferingState] = useState<OfferingState>('invitation');
  const [showInvitation, setShowInvitation] = useState(isInvitation);
  const [petalScores, setPetalScores] = useState<number[]>(new Array(8).fill(0));
  
  // Existing states
  const [selectedPetal, setSelectedPetal] = useState<PetalMeaning | null>(null);
  const [hoveredPetal, setHoveredPetal] = useState<PetalMeaning | null>(null);
  const [showModeToggle, setShowModeToggle] = useState(false);
  const [pulseSequence, setPulseSequence] = useState<number[]>([]);
  
  const isBeginnerMode = interactionMode === 'beginner';

  // Divine pulse sequence for advanced mode
  useEffect(() => {
    if (!isBeginnerMode && offeringState === 'offering') {
      const interval = setInterval(() => {
        const sequence = Array.from({ length: 3 }, () => 
          Math.floor(Math.random() * PETAL_MEANINGS.length)
        );
        setPulseSequence(sequence);
        setTimeout(() => setPulseSequence([]), 2000);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [isBeginnerMode, offeringState]);

  // Offering choice handlers
  const handleOfferNow = () => {
    setOfferingState('offering');
    setShowInvitation(false);
  };

  const handleNotToday = async () => {
    setOfferingState('resting');
    setShowInvitation(false);
    
    try {
      if (userId) {
        // Save rest session to Supabase
        const restSession = await getOfferingService().createRestSession(userId);
        
        const localSession: OfferingSession = {
          date: restSession.session_date,
          status: 'rest'
        };
        
        onOfferingComplete?.(localSession);
      }
      
      onRestChosen?.();
    } catch (error) {
      console.error('Error saving rest session:', error);
    }
    
    // Show rest state briefly, then reset
    setTimeout(() => {
      setOfferingState('invitation');
      setShowInvitation(true);
    }, 3000);
  };

  const handleOfferingComplete = async () => {
    setOfferingState('completed');
    
    try {
      if (userId) {
        // Get selected petals
        const selectedPetals = PETAL_ELEMENTS.filter((_, index) => petalScores[index] > 0);
        
        // Save offering session to Supabase
        const supabaseSession = await getOfferingService().createOfferingSession(
          userId,
          petalScores,
          selectedPetals,
          'Offering received with gratitude.',
          selectedPetal?.question
        );
        
        const localSession: OfferingSession = {
          date: supabaseSession.session_date,
          status: supabaseSession.status as 'rest' | 'offering' | 'bloom' | 'transcendent',
          petalScores,
          reflection: supabaseSession.oracle_reflection || 'Offering received with gratitude.',
          journalPrompt: selectedPetal?.question
        };
        
        onOfferingComplete?.(localSession);
      }
    } catch (error) {
      console.error('Error saving offering session:', error);
      
      // Fallback to local session if Supabase fails
      const localSession: OfferingSession = {
        date: new Date().toISOString().split('T')[0],
        status: 'bloom',
        petalScores,
        reflection: 'Offering received with gratitude.',
        journalPrompt: selectedPetal?.question
      };
      
      onOfferingComplete?.(localSession);
    }
    
    // Reset after showing completion
    setTimeout(() => {
      setOfferingState('invitation');
      setShowInvitation(true);
      setPetalScores(new Array(8).fill(0));
      setSelectedPetal(null);
    }, 4000);
  };

  const handlePetalClick = (petal: PetalMeaning, index: number) => {
    if (offeringState !== 'offering') return;
    
    setSelectedPetal(petal);
    
    // Update petal score (simple click = strength 5, can be enhanced with drag)
    const newScores = [...petalScores];
    newScores[index] = newScores[index] === 0 ? 5 : 0; // Toggle selection
    setPetalScores(newScores);
    
    // Send to Maia for processing
    const message = isBeginnerMode 
      ? `I'm drawn to ${petal.element} - ${petal.meaning}. ${petal.question}`
      : `[Intuitive selection: ${petal.element}]`;
    
    // Trigger Maia response
    window.dispatchEvent(new CustomEvent('maia:petal-selected', { 
      detail: { petal, mode: interactionMode, scores: newScores } 
    }));
  };

  const handleCenterClick = () => {
    if (offeringState === 'offering' && petalScores.some(score => score > 0)) {
      handleOfferingComplete();
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Invitation Overlay */}
      <AnimatePresence>
        {showInvitation && offeringState === 'invitation' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="text-center space-y-6 p-8 rounded-2xl bg-black/80 backdrop-blur-lg 
                         border border-white/20 shadow-2xl max-w-md mx-4"
            >
              {/* Gentle Pulsing Orb */}
              <motion.div
                className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-500/40 to-pink-500/40
                           border border-white/20 backdrop-blur-md"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Invitation Text */}
              <div className="space-y-3">
                <h2 className="text-white text-lg font-semibold">
                  The flower blooms, awaiting your touch
                </h2>
                <p className="text-white/70 text-sm">
                  Would you like to offer your soulprint today?
                </p>
              </div>

              {/* Choice Buttons */}
              <div className="flex space-x-4 pt-4">
                <motion.button
                  onClick={handleOfferNow}
                  className="flex-1 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20
                           border border-purple-500/40 text-white text-sm font-medium
                           hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Offer Now 🌸
                </motion.button>
                
                <motion.button
                  onClick={handleNotToday}
                  className="flex-1 px-6 py-3 rounded-full bg-white/10 border border-white/20 
                           text-white/80 text-sm font-medium
                           hover:bg-white/20 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Not Today ✨
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resting State Overlay */}
      <AnimatePresence>
        {offeringState === 'resting' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="text-center space-y-4 p-6 rounded-xl bg-black/80 backdrop-blur-lg 
                         border border-white/10 shadow-xl"
            >
              {/* Resting Seed Icon */}
              <motion.div
                className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-green-500/30 to-emerald-500/30
                           border border-green-500/20"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <p className="text-white/80 text-sm">
                Even in rest, the flower holds you.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion State Overlay */}
      <AnimatePresence>
        {offeringState === 'completed' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="text-center space-y-4 p-6 rounded-xl bg-black/80 backdrop-blur-lg 
                         border border-white/10 shadow-xl"
            >
              {/* Blooming Flower Icon */}
              <motion.div
                className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-pink-500/50 to-purple-500/50
                           border border-pink-500/30"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: 2,
                  ease: "easeInOut"
                }}
              />
              <p className="text-white/90 text-sm font-medium">
                Your petals have spoken.
              </p>
              <p className="text-white/70 text-xs">
                This offering has been received.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mode Toggle */}
      <AnimatePresence>
        {showModeToggle && offeringState === 'offering' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 right-4 z-50"
          >
            <button
              onClick={() => setInteractionMode(isBeginnerMode ? 'advanced' : 'beginner')}
              className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-lg border border-white/20
                         hover:bg-white/20 transition-all duration-300"
            >
              <span className="text-sm text-white/80">
                {isBeginnerMode ? '🌱 Guided' : '🌟 Intuitive'}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Central Holoflower */}
      <motion.div
        className="relative w-32 h-32"
        onHoverStart={() => offeringState === 'offering' && setShowModeToggle(true)}
        onHoverEnd={() => setShowModeToggle(false)}
        style={{ opacity: offeringState === 'offering' ? 1 : 0.3 }}
      >
        {/* Center Core */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30
                     backdrop-blur-md border border-white/20 cursor-pointer"
          onClick={handleCenterClick}
          animate={{
            scale: offeringState === 'offering' && petalScores.some(score => score > 0) 
              ? [1, 1.1, 1] 
              : [1, 1.05, 1],
            rotate: [0, 5, 0],
            borderColor: offeringState === 'offering' && petalScores.some(score => score > 0)
              ? ['rgba(168, 85, 247, 0.4)', 'rgba(236, 72, 153, 0.4)', 'rgba(168, 85, 247, 0.4)']
              : 'rgba(255, 255, 255, 0.2)'
          }}
          transition={{
            duration: offeringState === 'offering' && petalScores.some(score => score > 0) ? 2 : 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          whileHover={offeringState === 'offering' ? { scale: 1.15 } : {}}
          whileTap={offeringState === 'offering' ? { scale: 0.95 } : {}}
        >
          {/* Aether Center Pulse for Sealing */}
          {offeringState === 'offering' && petalScores.some(score => score > 0) && (
            <motion.div
              className="absolute inset-2 rounded-full bg-white/10"
              animate={{
                opacity: [0.3, 0.8, 0.3],
                scale: [0.8, 1, 0.8]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
        </motion.div>

        {/* Petals */}
        {PETAL_MEANINGS.map((petal, index) => (
          <motion.div
            key={petal.element}
            className="absolute w-12 h-12"
            style={{
              left: '50%',
              top: '50%',
              x: petal.position.x,
              y: petal.position.y,
              marginLeft: '-24px',
              marginTop: '-24px'
            }}
            animate={{
              scale: pulseSequence.includes(index) ? [1, 1.3, 1] : 1,
              opacity: offeringState === 'offering' 
                ? (hoveredPetal === petal ? 1 : 0.7)
                : (petalScores[index] > 0 ? 0.9 : 0.3)
            }}
            whileHover={offeringState === 'offering' ? { scale: 1.2 } : {}}
            onHoverStart={() => offeringState === 'offering' && setHoveredPetal(petal)}
            onHoverEnd={() => setHoveredPetal(null)}
            onClick={() => handlePetalClick(petal, index)}
          >
            {/* Petal Shape */}
            <motion.div
              className={`w-full h-full rounded-full bg-gradient-to-br ${petal.gradient}
                         cursor-pointer shadow-lg backdrop-blur-sm border-2
                         ${petalScores[index] > 0 ? 'border-white/60' : 'border-white/20'}`}
              style={{
                transform: `rotate(${petal.position.rotation}deg)`
              }}
              whileTap={offeringState === 'offering' ? { scale: 0.95 } : {}}
              animate={{
                borderColor: petalScores[index] > 0 
                  ? ['rgba(255, 255, 255, 0.6)', petal.color + '80', 'rgba(255, 255, 255, 0.6)']
                  : 'rgba(255, 255, 255, 0.2)'
              }}
              transition={{
                borderColor: { duration: 2, repeat: petalScores[index] > 0 ? Infinity : 0 }
              }}
            >
              {/* Inner Glow */}
              <motion.div
                className="absolute inset-2 rounded-full bg-white/20"
                animate={{
                  opacity: petalScores[index] > 0 
                    ? [0.4, 0.8, 0.4]
                    : [0.2, 0.5, 0.2]
                }}
                transition={{
                  duration: petalScores[index] > 0 ? 1.5 : 3,
                  repeat: Infinity,
                  delay: index * 0.2
                }}
              />
              
              {/* Selection Indicator */}
              {petalScores[index] > 0 && (
                <motion.div
                  className="absolute inset-1 rounded-full border border-white/40"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: 1, 
                    opacity: [0.6, 1, 0.6] 
                  }}
                  transition={{ 
                    scale: { duration: 0.3 },
                    opacity: { duration: 1.5, repeat: Infinity }
                  }}
                />
              )}
            </motion.div>

            {/* Beginner Mode: Hover Tooltip */}
            <AnimatePresence>
              {isBeginnerMode && hoveredPetal === petal && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  className="absolute z-50 w-48 p-3 rounded-lg bg-black/80 backdrop-blur-lg
                           border border-white/20 shadow-xl"
                  style={{
                    left: petal.position.x > 0 ? 'auto' : '100%',
                    right: petal.position.x > 0 ? '100%' : 'auto',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    marginLeft: petal.position.x > 0 ? '-8px' : '8px',
                    marginRight: petal.position.x > 0 ? '8px' : '-8px'
                  }}
                >
                  <h4 className="text-white font-semibold text-sm mb-1">
                    {petal.element.charAt(0).toUpperCase() + petal.element.slice(1)}
                  </h4>
                  <p className="text-white/80 text-xs mb-2">{petal.meaning}</p>
                  <p className="text-white/60 text-xs italic">{petal.question}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}

        {/* Advanced Mode: Divine Pulse Rings */}
        {!isBeginnerMode && (
          <AnimatePresence>
            {pulseSequence.map((petalIndex, i) => (
              <motion.div
                key={`pulse-${i}-${petalIndex}`}
                className="absolute inset-0 rounded-full border-2"
                style={{
                  borderColor: PETAL_MEANINGS[petalIndex].color + '40'
                }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: [1, 1.5, 2],
                  opacity: [0.6, 0.3, 0]
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 2,
                  delay: i * 0.2,
                  ease: "easeOut"
                }}
              />
            ))}
          </AnimatePresence>
        )}
      </motion.div>

      {/* Selected Petal Insight */}
      <AnimatePresence>
        {selectedPetal && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50
                     w-80 p-4 rounded-xl bg-black/80 backdrop-blur-lg border border-white/20"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-white font-semibold">
                {selectedPetal.element.charAt(0).toUpperCase() + selectedPetal.element.slice(1)} Speaks
              </h3>
              <button
                onClick={() => setSelectedPetal(null)}
                className="text-white/60 hover:text-white/80"
              >
                ✕
              </button>
            </div>
            
            {isBeginnerMode ? (
              <>
                <p className="text-white/80 text-sm mb-3">{selectedPetal.question}</p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-400 text-xs">Light:</span>
                    <span className="text-white/60 text-xs">{selectedPetal.lightAspect}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-red-400 text-xs">Shadow:</span>
                    <span className="text-white/60 text-xs">{selectedPetal.shadowAspect}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <p className="text-white/80 text-sm italic">
                  The {selectedPetal.element} petal resonates with your field...
                </p>
                <motion.div
                  className={`h-1 rounded-full bg-gradient-to-r ${selectedPetal.gradient}`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 2, ease: "easeOut" }}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mode Instructions */}
      <motion.div
        className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <p className="text-white/40 text-xs">
          {isBeginnerMode 
            ? 'Hover over petals to explore their meanings'
            : 'Trust your intuition - let the petals call to you'}
        </p>
      </motion.div>
    </div>
  );
}