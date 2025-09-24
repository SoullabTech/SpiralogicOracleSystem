'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo, useAnimation } from 'framer-motion';
import { ChevronLeft, Sparkles, Info, Settings2, Gem, Heart, Briefcase, Palette, Activity, Zap } from 'lucide-react';

// Crystal Focus Types
type CrystalFocus = 'career' | 'spiritual' | 'relational' | 'health' | 'creative' | 'general';

// Crystal Focus Menu Configuration
const CRYSTAL_OPTIONS = [
  {
    id: 'career' as CrystalFocus,
    name: 'Career',
    icon: Briefcase,
    description: 'Professional growth and purpose',
    color: '#8B7355',
    elements: ['earth', 'air'],
    prompt: 'What challenges are you facing in your professional journey?'
  },
  {
    id: 'spiritual' as CrystalFocus,
    name: 'Spiritual',
    icon: Gem,
    description: 'Inner wisdom and transcendence',
    color: '#9B59B6',
    elements: ['fire', 'water'],
    prompt: 'What spiritual insights are you seeking?'
  },
  {
    id: 'relational' as CrystalFocus,
    name: 'Relational',
    icon: Heart,
    description: 'Connections and emotional bonds',
    color: '#E91E63',
    elements: ['water', 'air'],
    prompt: 'How are your relationships evolving?'
  },
  {
    id: 'health' as CrystalFocus,
    name: 'Health',
    icon: Activity,
    description: 'Physical and emotional wellbeing',
    color: '#4CAF50',
    elements: ['earth', 'water'],
    prompt: 'What does your body-mind need right now?'
  },
  {
    id: 'creative' as CrystalFocus,
    name: 'Creative',
    icon: Palette,
    description: 'Expression and innovation',
    color: '#FF5722',
    elements: ['fire', 'air'],
    prompt: 'What wants to be expressed through you?'
  },
  {
    id: 'general' as CrystalFocus,
    name: 'Holistic',
    icon: Zap,
    description: 'Overall life integration',
    color: '#FFC107',
    elements: ['fire', 'water', 'earth', 'air'],
    prompt: 'What area of life needs the most attention?'
  }
];

// Organic Petal Interface with Spiralogic Facets
interface OrganicPetal {
  id: number;
  facetCode: string; // AIN, NEINE, etc.
  name: string;
  shortTitle: string;
  element: 'fire' | 'water' | 'earth' | 'air';
  elementNumber: number;
  phase: 'vector' | 'circle' | 'spiral';
  angle: number; // Position on flower (0-360)
  baseColor: string;
  value: number; // 0-10 scale
  description: string;
  question: string;
}

// Map petals to match the image design - 12 organic petals in 4 quadrants
const ORGANIC_PETALS: OrganicPetal[] = [
  // FIRE Quadrant (Top Right - Warm reds/oranges) - 90° to 0°
  {
    id: 1,
    facetCode: 'FEU',
    name: 'Ignite Will',
    shortTitle: 'Activate passion',
    element: 'fire',
    elementNumber: 1,
    phase: 'vector',
    angle: 75,
    baseColor: '#C75C4A', // Terracotta red
    value: 7,
    description: 'Awakening creative fire and life force',
    question: 'What passion wants to be expressed?'
  },
  {
    id: 2,
    facetCode: 'VUNV',
    name: 'Transform Trials',
    shortTitle: 'Alchemize challenges',
    element: 'fire',
    elementNumber: 2,
    phase: 'circle',
    angle: 45,
    baseColor: '#D97A5E', // Burnt sienna
    value: 7,
    description: 'Turning challenges into gold through action',
    question: 'How can you channel your fire constructively?'
  },
  {
    id: 3,
    facetCode: 'ZECH',
    name: 'Radiate Light',
    shortTitle: 'Shine authentically',
    element: 'fire',
    elementNumber: 3,
    phase: 'spiral',
    angle: 15,
    baseColor: '#E89B7F', // Salmon
    value: 7,
    description: 'Shining your unique light into the world',
    question: 'What authentic expression seeks release?'
  },

  // AIR Quadrant (Top Left - Golden yellows) - 0° to 270°
  {
    id: 4,
    facetCode: 'AIN',
    name: 'New Perspectives',
    shortTitle: 'Breathe possibilities',
    element: 'air',
    elementNumber: 1,
    phase: 'vector',
    angle: 345,
    baseColor: '#D4AF37', // Antique gold
    value: 7,
    description: 'Initiating fresh perspectives and mental patterns',
    question: 'What fresh perspective is calling to you?'
  },
  {
    id: 5,
    facetCode: 'ZWEI',
    name: 'Inner Awareness',
    shortTitle: 'Reflect deeply',
    element: 'air',
    elementNumber: 2,
    phase: 'circle',
    angle: 315,
    baseColor: '#E0C464', // Goldenrod
    value: 7,
    description: 'Developing self-reflection and mental clarity',
    question: 'What patterns are you becoming aware of?'
  },
  {
    id: 6,
    facetCode: 'AIRE',
    name: 'Integrate Wisdom',
    shortTitle: 'Synthesize learning',
    element: 'air',
    elementNumber: 3,
    phase: 'spiral',
    angle: 285,
    baseColor: '#F0D878', // Pale gold
    value: 7,
    description: 'Synthesizing wisdom from experience',
    question: 'How are your experiences becoming wisdom?'
  },

  // EARTH Quadrant (Bottom Left - Deep greens) - 270° to 180°
  {
    id: 7,
    facetCode: 'CHEN',
    name: 'Ground Body',
    shortTitle: 'Root deeply',
    element: 'earth',
    elementNumber: 1,
    phase: 'vector',
    angle: 255,
    baseColor: '#4A6741', // Forest green
    value: 7,
    description: 'Anchoring awareness in physical presence',
    question: 'What does your body need right now?'
  },
  {
    id: 8,
    facetCode: 'ALVE',
    name: 'Nurture Growth',
    shortTitle: 'Tend garden',
    element: 'earth',
    elementNumber: 2,
    phase: 'circle',
    angle: 225,
    baseColor: '#6B8E5C', // Sage green
    value: 7,
    description: 'Cultivating sustainable foundations',
    question: 'How can you nurture your growth?'
  },
  {
    id: 9,
    facetCode: 'ZWOIF',
    name: 'Manifest Abundance',
    shortTitle: 'Create harvest',
    element: 'earth',
    elementNumber: 3,
    phase: 'spiral',
    angle: 195,
    baseColor: '#8FAF79', // Olive green
    value: 7,
    description: 'Creating tangible results and harvest',
    question: 'What abundance is emerging in your life?'
  },

  // WATER Quadrant (Bottom Right - Ocean blues) - 180° to 90°
  {
    id: 10,
    facetCode: 'IEVE',
    name: 'Open Flow',
    shortTitle: 'Surrender gracefully',
    element: 'water',
    elementNumber: 1,
    phase: 'vector',
    angle: 165,
    baseColor: '#3E6B7C', // Deep teal
    value: 7,
    description: 'Surrendering to emotional currents',
    question: 'What emotions need acknowledgment?'
  },
  {
    id: 11,
    facetCode: 'AGHT',
    name: 'Deepen Intuition',
    shortTitle: 'Trust knowing',
    element: 'water',
    elementNumber: 2,
    phase: 'circle',
    angle: 135,
    baseColor: '#5A8FA3', // Steel blue
    value: 7,
    description: 'Cultivating inner knowing and receptivity',
    question: 'How can you trust your inner knowing more?'
  },
  {
    id: 12,
    facetCode: 'NEINE',
    name: 'Emotional Wisdom',
    shortTitle: 'Feel deeply',
    element: 'water',
    elementNumber: 3,
    phase: 'spiral',
    angle: 105,
    baseColor: '#7FB3C8', // Sky blue
    value: 7,
    description: 'Harmonizing feeling and being',
    question: 'How are your emotions becoming wisdom?'
  }
];

interface OrganicHoloflowerCheckInProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (values: number[], crystalFocus?: CrystalFocus, insights?: any) => void;
}

export function OrganicHoloflowerCheckIn({
  isOpen,
  onClose,
  onSubmit
}: OrganicHoloflowerCheckInProps) {
  const [petals, setPetals] = useState(ORGANIC_PETALS);
  const [selectedPetal, setSelectedPetal] = useState<OrganicPetal | null>(null);
  const [hoveredPetal, setHoveredPetal] = useState<number | null>(null);
  const [crystalFocus, setCrystalFocus] = useState<CrystalFocus | null>(null);
  const [showCrystalMenu, setShowCrystalMenu] = useState(true);
  const [showCaptions, setShowCaptions] = useState(false);
  const [isDragging, setIsDragging] = useState<number | null>(null);
  const [centerPressed, setCenterPressed] = useState(false);
  const centerAnimation = useAnimation();

  const containerRef = useRef<HTMLDivElement>(null);
  const centerX = 200; // Center of 400px container
  const centerY = 200;
  const petalRadius = 140; // Distance from center to petal base

  // Haptic feedback for mobile
  const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      switch(style) {
        case 'light': navigator.vibrate(10); break;
        case 'medium': navigator.vibrate(20); break;
        case 'heavy': navigator.vibrate([30, 10, 30]); break;
      }
    }
  };

  // Handle petal drag with organic feel
  const handlePetalDrag = (petalId: number, event: any, info: PanInfo) => {
    const petal = petals.find(p => p.id === petalId);
    if (!petal) return;

    // Calculate distance from center for natural drag feel
    const dragDistance = Math.sqrt(info.offset.x ** 2 + info.offset.y ** 2);
    const maxDrag = 100;
    const normalizedDrag = Math.min(dragDistance / maxDrag, 1);

    // Map drag to value change (inward = lower, outward = higher)
    const angle = Math.atan2(info.offset.y, info.offset.x);
    const petalAngle = (petal.angle * Math.PI) / 180;
    const isOutward = Math.abs(angle - petalAngle) < Math.PI / 2;

    const newValue = isOutward
      ? Math.min(10, 5 + normalizedDrag * 5)
      : Math.max(0, 5 - normalizedDrag * 5);

    setPetals(prev => prev.map(p =>
      p.id === petalId ? { ...p, value: Math.round(newValue * 10) / 10 } : p
    ));

    // Haptic feedback on value change
    if (Math.abs(newValue - petal.value) > 0.5) {
      triggerHaptic('light');
    }
  };

  // Calculate petal position with organic spread
  const getPetalPosition = (petal: OrganicPetal) => {
    const angleRad = (petal.angle - 90) * Math.PI / 180;
    const dynamicRadius = petalRadius * (0.6 + (petal.value / 10) * 0.4);

    return {
      x: centerX + dynamicRadius * Math.cos(angleRad),
      y: centerY + dynamicRadius * Math.sin(angleRad)
    };
  };

  // Handle center button press for submission
  const handleCenterPress = async () => {
    setCenterPressed(true);
    triggerHaptic('heavy');

    // Animate center bloom
    await centerAnimation.start({
      scale: [1, 1.3, 1],
      rotate: [0, 180, 360],
      transition: { duration: 0.8, ease: 'easeInOut' }
    });

    handleSubmit();
  };

  // Submit check-in data
  const handleSubmit = () => {
    const values = petals.map(p => p.value);
    const insights = {
      petals: petals.map(p => ({
        facetCode: p.facetCode,
        name: p.name,
        value: p.value,
        element: p.element,
        phase: p.phase
      })),
      crystalFocus: crystalFocus || 'general',
      elementBalance: calculateElementBalance(),
      coherence: calculateCoherence(),
      timestamp: new Date().toISOString()
    };

    // Save to localStorage
    localStorage.setItem('organicHoloflowerCheckIn', JSON.stringify(insights));

    onSubmit?.(values, crystalFocus || 'general', insights);

    // Trigger journal flow after brief pause
    setTimeout(() => {
      const event = new CustomEvent('holoflowerCheckInComplete', { detail: insights });
      window.dispatchEvent(event);
    }, 500);

    onClose();
  };

  const calculateElementBalance = () => {
    const balance = { fire: 0, water: 0, earth: 0, air: 0 };
    petals.forEach(p => {
      balance[p.element] += p.value / 3; // 3 petals per element
    });
    return balance;
  };

  const calculateCoherence = () => {
    const avg = petals.reduce((sum, p) => sum + p.value, 0) / petals.length;
    const variance = petals.reduce((sum, p) => sum + Math.pow(p.value - avg, 2), 0) / petals.length;
    return Math.max(0, 1 - (variance / 25));
  };

  // Crystal Focus Menu
  const CrystalFocusMenu = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-gradient-to-br from-purple-950/95 via-indigo-950/95 to-black/95 backdrop-blur-xl z-50 flex items-center justify-center p-4"
    >
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-light text-white mb-4 tracking-wide">Choose Your Crystal Focus</h2>
          <p className="text-white/70 text-lg">
            What aspect of your spiral needs attention today?
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {CRYSTAL_OPTIONS.map((crystal, index) => {
            const Icon = crystal.icon;
            return (
              <motion.button
                key={crystal.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setCrystalFocus(crystal.id);
                  setShowCrystalMenu(false);
                  triggerHaptic('medium');
                }}
                className="p-6 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 hover:border-white/30 transition-all backdrop-blur-sm"
              >
                <motion.div
                  className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${crystal.color}40, ${crystal.color}20)`,
                    borderColor: crystal.color,
                    borderWidth: 2
                  }}
                  whileHover={{ rotate: 360, transition: { duration: 0.6 } }}
                >
                  <Icon className="w-7 h-7" style={{ color: crystal.color }} />
                </motion.div>
                <h3 className="text-white font-medium text-sm mb-1">{crystal.name}</h3>
                <p className="text-white/50 text-xs">{crystal.description}</p>
              </motion.button>
            );
          })}
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={onClose}
          className="mt-8 text-white/40 hover:text-white/60 transition-colors mx-auto block text-sm"
        >
          Cancel
        </motion.button>
      </div>
    </motion.div>
  );

  // Organic Petal Component
  const OrganicPetal = ({ petal }: { petal: OrganicPetal }) => {
    const position = getPetalPosition(petal);
    const isHovered = hoveredPetal === petal.id;
    const isDraggingThis = isDragging === petal.id;
    const isSelected = selectedPetal?.id === petal.id;

    // Create organic petal path
    const petalPath = `
      M 0,0
      Q -15,-30 -10,-50
      Q -5,-65 0,-70
      Q 5,-65 10,-50
      Q 15,-30 0,0
    `;

    const petalScale = 0.6 + (petal.value / 10) * 0.4;

    return (
      <motion.g
        style={{
          transformOrigin: `${position.x}px ${position.y}px`
        }}
      >
        <motion.path
          d={petalPath}
          fill={`${petal.baseColor}${Math.round(50 + petal.value * 15).toString(16)}`}
          stroke={petal.baseColor}
          strokeWidth={isHovered || isSelected ? 2 : 1}
          strokeOpacity={0.6}
          style={{
            transform: `
              translate(${position.x}px, ${position.y}px)
              rotate(${petal.angle}deg)
              scale(${petalScale})
            `,
            filter: isHovered || isSelected ? 'brightness(1.2)' : 'brightness(1)',
            cursor: 'grab'
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: petalScale,
            opacity: 0.7 + (petal.value / 20)
          }}
          whileHover={{
            scale: petalScale * 1.1,
            filter: 'brightness(1.3) drop-shadow(0 0 20px rgba(255,255,255,0.3))'
          }}
          whileTap={{ scale: petalScale * 0.95 }}
          drag
          dragElastic={0.3}
          dragConstraints={{ left: -30, right: 30, top: -30, bottom: 30 }}
          onDrag={(e, info) => handlePetalDrag(petal.id, e, info)}
          onDragStart={() => {
            setIsDragging(petal.id);
            triggerHaptic('light');
          }}
          onDragEnd={() => setIsDragging(null)}
          onHoverStart={() => setHoveredPetal(petal.id)}
          onHoverEnd={() => setHoveredPetal(null)}
          onClick={() => {
            setSelectedPetal(petal);
            triggerHaptic('light');
          }}
        />

        {/* Value indicator */}
        {(isHovered || isDraggingThis) && (
          <motion.text
            x={position.x}
            y={position.y}
            textAnchor="middle"
            className="fill-white text-xs font-medium pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {petal.value.toFixed(1)}
          </motion.text>
        )}
      </motion.g>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && showCrystalMenu && <CrystalFocusMenu />}

      {isOpen && !showCrystalMenu && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gradient-to-br from-purple-950 via-indigo-950 to-black z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-20 bg-black/30 backdrop-blur-xl border-b border-white/10 px-4 py-3">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              <button
                onClick={onClose}
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm">Back</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowCaptions(!showCaptions)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  title="Toggle hints"
                >
                  <Info className="w-4 h-4 text-white/70" />
                </button>
              </div>
            </div>
          </div>

          {/* Main Holoflower Container */}
          <div className="flex items-center justify-center h-full px-4">
            <div className="relative" ref={containerRef}>
              {/* SVG Container for Organic Petals */}
              <svg
                width="400"
                height="400"
                className="absolute inset-0"
                style={{ touchAction: 'none' }}
              >
                {/* Background glow */}
                <defs>
                  <radialGradient id="centerGlow">
                    <stop offset="0%" stopColor="rgba(147,51,234,0.5)" />
                    <stop offset="50%" stopColor="rgba(147,51,234,0.2)" />
                    <stop offset="100%" stopColor="rgba(147,51,234,0)" />
                  </radialGradient>
                </defs>

                <circle cx={centerX} cy={centerY} r="150" fill="url(#centerGlow)" />

                {/* Render Organic Petals */}
                {petals.map(petal => (
                  <OrganicPetal key={petal.id} petal={petal} />
                ))}

                {/* Center Interactive Button */}
                <motion.g
                  animate={centerAnimation}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCenterPress}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Outer ring */}
                  <circle
                    cx={centerX}
                    cy={centerY}
                    r="35"
                    fill="url(#centerGlow)"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="2"
                  />

                  {/* Inner sacred geometry pattern */}
                  <motion.circle
                    cx={centerX}
                    cy={centerY}
                    r="25"
                    fill="rgba(147,51,234,0.3)"
                    stroke="rgba(255,255,255,0.5)"
                    strokeWidth="1"
                    animate={{
                      r: [25, 28, 25],
                      opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  />

                  {/* Submit text */}
                  <text
                    x={centerX}
                    y={centerY + 5}
                    textAnchor="middle"
                    className="fill-white text-xs font-light"
                    style={{ pointerEvents: 'none' }}
                  >
                    {centerPressed ? '✧' : 'Submit'}
                  </text>
                </motion.g>
              </svg>

              {/* Caption overlays */}
              <AnimatePresence>
                {showCaptions && petals.map(petal => {
                  const pos = getPetalPosition(petal);
                  return (
                    <motion.div
                      key={petal.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute pointer-events-none"
                      style={{
                        left: pos.x - 40,
                        top: pos.y - 60,
                        width: 80
                      }}
                    >
                      <div className="bg-black/80 backdrop-blur-sm px-2 py-1 rounded text-center">
                        <p className="text-white text-[10px] font-medium">{petal.facetCode}</p>
                        <p className="text-white/60 text-[9px]">{petal.shortTitle}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Selected Petal Detail Panel */}
          <AnimatePresence>
            {selectedPetal && (
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                className="absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-white/10 p-4 max-h-[40vh] overflow-y-auto"
              >
                <div className="max-w-2xl mx-auto">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white font-medium">{selectedPetal.name}</h3>
                      <p className="text-white/60 text-sm">{selectedPetal.facetCode} • {selectedPetal.element}</p>
                    </div>
                    <button
                      onClick={() => setSelectedPetal(null)}
                      className="text-white/40 hover:text-white/60"
                    >
                      ×
                    </button>
                  </div>

                  <p className="text-white/80 text-sm mb-3">{selectedPetal.description}</p>

                  <div className="p-3 bg-purple-600/10 rounded-lg border border-purple-600/30">
                    <p className="text-purple-400 text-xs mb-1">Reflection:</p>
                    <p className="text-white/90 text-sm">{selectedPetal.question}</p>
                  </div>

                  {/* Value adjustment slider */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-white/60 mb-2">
                      <span>Dense</span>
                      <span>{selectedPetal.value.toFixed(1)}</span>
                      <span>Radiant</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.5"
                      value={selectedPetal.value}
                      onChange={(e) => {
                        const newValue = parseFloat(e.target.value);
                        setPetals(prev => prev.map(p =>
                          p.id === selectedPetal.id ? { ...p, value: newValue } : p
                        ));
                        setSelectedPetal({ ...selectedPetal, value: newValue });
                        triggerHaptic('light');
                      }}
                      className="w-full"
                      style={{
                        background: `linear-gradient(to right, ${selectedPetal.baseColor}40 0%, ${selectedPetal.baseColor} ${selectedPetal.value * 10}%, #333 ${selectedPetal.value * 10}%, #333 100%)`
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating coherence indicator */}
          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-lg rounded-xl p-3">
            <p className="text-white/60 text-xs mb-1">Coherence</p>
            <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                animate={{ width: `${calculateCoherence() * 100}%` }}
              />
            </div>
          </div>

          {/* Crystal Focus Indicator */}
          {crystalFocus && (
            <div className="absolute top-16 left-4 bg-black/60 backdrop-blur-lg rounded-xl p-3">
              <p className="text-white/60 text-xs mb-1">Crystal Focus</p>
              <p className="text-white text-sm font-medium">
                {CRYSTAL_OPTIONS.find(c => c.id === crystalFocus)?.name}
              </p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}