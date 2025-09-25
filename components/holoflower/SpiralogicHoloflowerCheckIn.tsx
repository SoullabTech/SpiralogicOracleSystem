'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ChevronLeft, Sparkles, Info, Flame, Droplet, Mountain, Wind, Star } from 'lucide-react';

// Complete 12-Facet Spiralogic Model
interface SpiralogicFacet {
  id: number;
  name: string;
  focusState: string; // "I Experience", "My Heart", etc.
  element: 'fire' | 'water' | 'earth' | 'air';
  phase: 'vector' | 'circle' | 'spiral'; // Cardinal/Fixed/Mutable
  description: string;
  keyQuestion: string;
  deeperMeaning: string;
  color: string;
  angle: number; // Position on holoflower (0-360 degrees)
  value: number; // Current value (0-10)
  symbol?: string; // Optional icon/symbol
}

// Properly mapped 12 Facets according to Spiralogic documentation
const SPIRALOGIC_12_FACETS: SpiralogicFacet[] = [
  // FIRE - Spiritual, Intuitive Intelligence (Top-right quadrant, 30-120°)
  {
    id: 1,
    name: 'Self-Awareness',
    focusState: 'I Experience',
    element: 'fire',
    phase: 'vector',
    description: 'Ego, Persona, Free Will, and Vision for the Future',
    keyQuestion: 'What does your intuition frequently tell you?',
    deeperMeaning: 'Creating a clear and compelling future through personal identity and vision',
    color: '#FF6B6B',
    angle: 30,
    value: 5,
    symbol: '🔥'
  },
  {
    id: 2,
    name: 'Self-In-World',
    focusState: 'I Express',
    element: 'fire',
    phase: 'circle',
    description: 'Play, Personal Expression, Self/World Resonance',
    keyQuestion: 'In what ways do you creatively express your individuality?',
    deeperMeaning: 'Bringing inner vision to outer expression and refining through feedback',
    color: '#FF8E53',
    angle: 60,
    value: 5,
    symbol: '✨'
  },
  {
    id: 3,
    name: 'Transcendent Self',
    focusState: 'I Expand',
    element: 'fire',
    phase: 'spiral',
    description: 'Spiritual Essence, Path, and Expansive Development',
    keyQuestion: 'How do you actively work on your spiritual growth?',
    deeperMeaning: 'Growing spiritually wise through fulfilling vision while resonating with the world',
    color: '#FFA500',
    angle: 90,
    value: 5,
    symbol: '🌟'
  },

  // WATER - Emotional, Psychic Intelligence (Bottom-right quadrant, 120-210°)
  {
    id: 4,
    name: 'Emotional Intelligence',
    focusState: 'My Heart',
    element: 'water',
    phase: 'vector',
    description: 'Capacity to feel seen, nurtured, and at home',
    keyQuestion: 'How would you evaluate your emotional intelligence?',
    deeperMeaning: 'Discovering what emotionally resonates and connecting with inner truth',
    color: '#4A90E2',
    angle: 120,
    value: 5,
    symbol: '💧'
  },
  {
    id: 5,
    name: 'Inner Transformation',
    focusState: 'My Healing',
    element: 'water',
    phase: 'circle',
    description: 'Transforming subconscious patterns into coherence',
    keyQuestion: 'What outdated patterns do you wish to transform?',
    deeperMeaning: 'Inner transformation through facing shadows and releasing blocks',
    color: '#5DA3FA',
    angle: 150,
    value: 5,
    symbol: '🌊'
  },
  {
    id: 6,
    name: 'Deep Self-Awareness',
    focusState: 'My Holiness',
    element: 'water',
    phase: 'spiral',
    description: 'Connection with inner gold, soul essence',
    keyQuestion: 'How connected do you feel with your innermost self?',
    deeperMeaning: 'Discovering inner truth and the golden seed as gift to the world',
    color: '#7BB7FF',
    angle: 180,
    value: 5,
    symbol: '💎'
  },

  // EARTH - Somatic, Embodied Intelligence (Bottom-left quadrant, 210-300°)
  {
    id: 7,
    name: 'Purpose & Mission',
    focusState: 'The Mission',
    element: 'earth',
    phase: 'vector',
    description: 'Developing awareness of place in the world',
    keyQuestion: 'How would you define your purpose or mission in life?',
    deeperMeaning: 'Grounding inner visions into workable form and service',
    color: '#8B7355',
    angle: 210,
    value: 5,
    symbol: '🌍'
  },
  {
    id: 8,
    name: 'Resources & Plans',
    focusState: 'The Means',
    element: 'earth',
    phase: 'circle',
    description: 'Bringing together teams and resources for success',
    keyQuestion: 'What resources do you need to succeed?',
    deeperMeaning: 'Building resources to manifest dreams into reality',
    color: '#A0826D',
    angle: 240,
    value: 5,
    symbol: '🌱'
  },
  {
    id: 9,
    name: 'Refined Medicine',
    focusState: 'The Medicine',
    element: 'earth',
    phase: 'spiral',
    description: 'Ethics, service, and refined plan of action',
    keyQuestion: 'How do you give back to society and the planet?',
    deeperMeaning: 'Perfecting offerings as well-formed gifts to the world',
    color: '#B8956A',
    angle: 270,
    value: 5,
    symbol: '🌾'
  },

  // AIR - Mental, Relational, Communicative Intelligence (Top-left quadrant, 300-30°)
  {
    id: 10,
    name: 'Interpersonal',
    focusState: 'This Connection',
    element: 'air',
    phase: 'vector',
    description: 'Perfecting one-to-one relationships',
    keyQuestion: 'How would you describe your interpersonal patterns?',
    deeperMeaning: 'Understanding how we relate reflects our inner organization',
    color: '#87CEEB',
    angle: 300,
    value: 5,
    symbol: '🤝'
  },
  {
    id: 11,
    name: 'Collective Dynamics',
    focusState: 'This Community',
    element: 'air',
    phase: 'circle',
    description: 'Relating to groups and collective paradigms',
    keyQuestion: 'How do you contribute to group dynamics?',
    deeperMeaning: 'Building conscious collectives through authentic connection',
    color: '#ADD8E6',
    angle: 330,
    value: 5,
    symbol: '👥'
  },
  {
    id: 12,
    name: 'Codified Systems',
    focusState: 'This Consciousness',
    element: 'air',
    phase: 'spiral',
    description: 'Elevated communications and formal systems',
    keyQuestion: 'How proficient are you in formal communications?',
    deeperMeaning: 'Codifying wisdom into clear and concise intelligence',
    color: '#B0E0E6',
    angle: 0,
    value: 5,
    symbol: '📡'
  }
];

// Element icons for visual representation
const ELEMENT_ICONS = {
  fire: <Flame className="w-4 h-4" />,
  water: <Droplet className="w-4 h-4" />,
  earth: <Mountain className="w-4 h-4" />,
  air: <Wind className="w-4 h-4" />,
  aether: <Star className="w-4 h-4" />
};

// Phase indicators
const PHASE_SYMBOLS = {
  vector: '→', // Direction, initiation
  circle: '○', // Integration, process
  spiral: '◉'  // Transformation, completion
};

interface SpiralogicHoloflowerCheckInProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (values: number[], insights: any) => void;
  crystalFocus?: 'career' | 'spiritual' | 'relational' | 'health' | 'creative' | 'general';
}

export function SpiralogicHoloflowerCheckIn({
  isOpen,
  onClose,
  onSubmit,
  crystalFocus = 'general'
}: SpiralogicHoloflowerCheckInProps) {
  const [facets, setFacets] = useState(SPIRALOGIC_12_FACETS);
  const [hoveredFacet, setHoveredFacet] = useState<number | null>(null);
  const [selectedFacet, setSelectedFacet] = useState<SpiralogicFacet | null>(null);
  const [isDragging, setIsDragging] = useState<number | null>(null);
  const [journalNotes, setJournalNotes] = useState<{ [key: number]: string }>({});

  // Calculate center position
  const centerX = 300;
  const centerY = 300;
  const baseRadius = 200;

  // Handle petal drag
  const handlePetalDrag = (facetId: number, event: any, info: PanInfo) => {
    setFacets(prev => prev.map(f => {
      if (f.id === facetId) {
        const dragDistance = Math.sqrt(info.offset.x ** 2 + info.offset.y ** 2);
        const direction = info.offset.x > 0 || info.offset.y < 0 ? 1 : -1;
        const deltaValue = (dragDistance / 50) * direction;
        const newValue = Math.max(0, Math.min(10, f.value + deltaValue));
        return { ...f, value: Math.round(newValue * 10) / 10 };
      }
      return f;
    }));
  };

  // Calculate petal position based on value
  const getPetalPosition = (facet: SpiralogicFacet) => {
    // Adjust radius based on value (dense=inner, radiant=outer)
    const valueRadius = baseRadius * (0.3 + (facet.value / 10) * 0.7);
    const radians = (facet.angle - 90) * Math.PI / 180;

    // Add phase-based offset for visual hierarchy
    const phaseOffset = facet.phase === 'vector' ? 0 : facet.phase === 'circle' ? 10 : 20;

    return {
      x: centerX + (valueRadius + phaseOffset) * Math.cos(radians),
      y: centerY + (valueRadius + phaseOffset) * Math.sin(radians)
    };
  };

  // Calculate elemental balance
  const calculateElementalBalance = () => {
    const elements = { fire: 0, water: 0, earth: 0, air: 0 };
    facets.forEach(f => {
      elements[f.element] += f.value;
    });

    // Normalize to 0-10 scale
    Object.keys(elements).forEach(key => {
      elements[key as keyof typeof elements] = elements[key as keyof typeof elements] / 3;
    });

    return elements;
  };

  // Calculate phase progression
  const calculatePhaseProgression = () => {
    const phases = { vector: 0, circle: 0, spiral: 0 };
    facets.forEach(f => {
      phases[f.phase] += f.value;
    });

    // Normalize to 0-10 scale
    Object.keys(phases).forEach(key => {
      phases[key as keyof typeof phases] = phases[key as keyof typeof phases] / 4;
    });

    return phases;
  };

  // Handle submission
  const handleSubmit = () => {
    const values = facets.map(f => f.value);
    const insights = {
      elementalBalance: calculateElementalBalance(),
      phaseProgression: calculatePhaseProgression(),
      dominantElement: getDominantElement(),
      currentPhase: getCurrentPhase(),
      journalNotes,
      crystalFocus,
      timestamp: new Date().toISOString()
    };

    onSubmit?.(values, insights);

    // Save to localStorage
    localStorage.setItem('spiralogicCheckIn', JSON.stringify({
      values,
      insights,
      timestamp: insights.timestamp
    }));

    onClose();
  };

  const getDominantElement = () => {
    const balance = calculateElementalBalance();
    return Object.entries(balance).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  };

  const getCurrentPhase = () => {
    const progression = calculatePhaseProgression();
    return Object.entries(progression).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 z-50 overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-black/70 backdrop-blur-xl border-b border-white/10 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <button
                onClick={onClose}
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Back</span>
              </button>

              <div className="text-center">
                <h2 className="text-xl font-light text-white">Spiralogic 12-Facet Check-In</h2>
                <p className="text-sm text-white/60 mt-1">
                  {crystalFocus !== 'general' && `Crystal Focus: ${crystalFocus}`}
                </p>
              </div>

              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg flex items-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Submit Check-In
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto p-6 grid lg:grid-cols-2 gap-8">
            {/* Left: Holoflower Visualization */}
            <div className="flex flex-col items-center">
              <div className="relative" style={{ width: '600px', height: '600px' }}>
                {/* Background circles for phases */}
                <svg className="absolute inset-0" viewBox="0 0 600 600">
                  {/* Vector circle */}
                  <circle
                    cx="300"
                    cy="300"
                    r="140"
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="1"
                    strokeDasharray="5,5"
                  />
                  {/* Circle circle */}
                  <circle
                    cx="300"
                    cy="300"
                    r="180"
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="1"
                    strokeDasharray="5,5"
                  />
                  {/* Spiral circle */}
                  <circle
                    cx="300"
                    cy="300"
                    r="220"
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="1"
                    strokeDasharray="5,5"
                  />
                </svg>

                {/* Center Aether point */}
                <motion.div
                  className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-600/30 to-pink-600/30 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                    {ELEMENT_ICONS.aether}
                  </div>
                </motion.div>

                {/* Element Labels */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute" style={{ top: '10%', right: '20%' }}>
                    <div className="flex items-center gap-1 text-orange-400">
                      {ELEMENT_ICONS.fire}
                      <span className="text-xs uppercase tracking-wider">Fire</span>
                    </div>
                  </div>
                  <div className="absolute" style={{ bottom: '20%', right: '10%' }}>
                    <div className="flex items-center gap-1 text-blue-400">
                      {ELEMENT_ICONS.water}
                      <span className="text-xs uppercase tracking-wider">Water</span>
                    </div>
                  </div>
                  <div className="absolute" style={{ bottom: '10%', left: '20%' }}>
                    <div className="flex items-center gap-1 text-amber-600">
                      {ELEMENT_ICONS.earth}
                      <span className="text-xs uppercase tracking-wider">Earth</span>
                    </div>
                  </div>
                  <div className="absolute" style={{ top: '20%', left: '10%' }}>
                    <div className="flex items-center gap-1 text-cyan-400">
                      {ELEMENT_ICONS.air}
                      <span className="text-xs uppercase tracking-wider">Air</span>
                    </div>
                  </div>
                </div>

                {/* Petals */}
                {facets.map((facet) => {
                  const position = getPetalPosition(facet);
                  const isHovered = hoveredFacet === facet.id;
                  const isDraggingThis = isDragging === facet.id;
                  const isSelected = selectedFacet?.id === facet.id;

                  return (
                    <motion.div
                      key={facet.id}
                      className="absolute"
                      style={{
                        left: position.x - 35,
                        top: position.y - 35,
                      }}
                    >
                      {/* Petal */}
                      <motion.div
                        drag
                        dragElastic={0.2}
                        dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
                        onDrag={(e, info) => handlePetalDrag(facet.id, e, info)}
                        onDragStart={() => setIsDragging(facet.id)}
                        onDragEnd={() => setIsDragging(null)}
                        onHoverStart={() => setHoveredFacet(facet.id)}
                        onHoverEnd={() => setHoveredFacet(null)}
                        onClick={() => setSelectedFacet(facet)}
                        className="relative w-[70px] h-[70px] cursor-grab active:cursor-grabbing"
                        whileHover={{ scale: 1.15 }}
                        whileDrag={{ scale: 1.25 }}
                        animate={{
                          scale: isSelected ? 1.2 : 1,
                        }}
                      >
                        {/* Petal background */}
                        <div
                          className="absolute inset-0 rounded-full"
                          style={{
                            background: `radial-gradient(circle at center, ${facet.color}90, ${facet.color}40)`,
                            opacity: 0.4 + (facet.value / 10) * 0.6,
                            boxShadow: isSelected ? `0 0 20px ${facet.color}80` : 'none',
                          }}
                        />

                        {/* Phase indicator */}
                        <div className="absolute -top-1 -right-1 text-white/80 text-xs">
                          {PHASE_SYMBOLS[facet.phase]}
                        </div>

                        {/* Value and symbol */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-lg">{facet.symbol}</span>
                          <span className="text-white font-medium text-xs">
                            {facet.value.toFixed(1)}
                          </span>
                        </div>
                      </motion.div>

                      {/* Facet label (on hover) */}
                      <AnimatePresence>
                        {(isHovered || isDraggingThis || isSelected) && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 pointer-events-none z-10"
                          >
                            <div className="bg-black/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20 whitespace-nowrap">
                              <p className="text-white text-sm font-medium">{facet.name}</p>
                              <p className="text-white/60 text-xs">{facet.focusState}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>

              {/* Elemental Balance Display */}
              <div className="mt-6 w-full max-w-md">
                <h3 className="text-white/80 text-sm mb-3">Elemental Balance</h3>
                <div className="space-y-2">
                  {Object.entries(calculateElementalBalance()).map(([element, value]) => (
                    <div key={element} className="flex items-center gap-3">
                      <div className="w-16 text-white/60 text-sm capitalize flex items-center gap-1">
                        {ELEMENT_ICONS[element as keyof typeof ELEMENT_ICONS]}
                        {element}
                      </div>
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-amber-500 to-pink-500"
                          animate={{ width: `${value * 10}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <span className="text-white/60 text-xs w-8">{value.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Facet Details and Reflection */}
            <div className="space-y-6">
              {/* Selected Facet Detail */}
              {selectedFacet ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white/5 rounded-xl border border-white/10 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{selectedFacet.symbol}</span>
                        <h3 className="text-xl font-light text-white">
                          {selectedFacet.name}
                        </h3>
                        <span className="text-xs text-white/40">
                          {PHASE_SYMBOLS[selectedFacet.phase]}
                        </span>
                      </div>
                      <p className="text-amber-400 text-sm mb-1">
                        {selectedFacet.focusState}
                      </p>
                      <p className="text-white/60 text-sm">
                        {selectedFacet.description}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedFacet(null)}
                      className="text-white/40 hover:text-white/60"
                    >
                      ×
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Key Question */}
                    <div className="p-4 bg-amber-600/10 rounded-lg border border-amber-600/30">
                      <p className="text-amber-400 text-xs mb-2">Reflection Question:</p>
                      <p className="text-white/90">{selectedFacet.keyQuestion}</p>
                    </div>

                    {/* Deeper Meaning */}
                    <div>
                      <p className="text-white/40 text-xs mb-2">Deeper Meaning:</p>
                      <p className="text-white/70 text-sm leading-relaxed">
                        {selectedFacet.deeperMeaning}
                      </p>
                    </div>

                    {/* Value Adjustment */}
                    <div>
                      <p className="text-white/40 text-xs mb-2">Adjust Value (Dense ↔ Radiant):</p>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => {
                            setFacets(prev => prev.map(f =>
                              f.id === selectedFacet.id
                                ? { ...f, value: Math.max(0, f.value - 0.5) }
                                : f
                            ));
                            setSelectedFacet(prev => prev ? { ...prev, value: Math.max(0, prev.value - 0.5) } : null);
                          }}
                          className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-white"
                        >
                          −
                        </button>

                        <div className="flex-1">
                          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full"
                              style={{ backgroundColor: selectedFacet.color }}
                              animate={{ width: `${(selectedFacet.value / 10) * 100}%` }}
                            />
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setFacets(prev => prev.map(f =>
                              f.id === selectedFacet.id
                                ? { ...f, value: Math.min(10, f.value + 0.5) }
                                : f
                            ));
                            setSelectedFacet(prev => prev ? { ...prev, value: Math.min(10, prev.value + 0.5) } : null);
                          }}
                          className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-white"
                        >
                          +
                        </button>

                        <span className="text-white font-medium min-w-[3ch]">
                          {selectedFacet.value.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {/* Journal Note */}
                    <div>
                      <p className="text-white/40 text-xs mb-2">Personal Reflection:</p>
                      <textarea
                        value={journalNotes[selectedFacet.id] || ''}
                        onChange={(e) => setJournalNotes(prev => ({
                          ...prev,
                          [selectedFacet.id]: e.target.value
                        }))}
                        placeholder="What comes up for you in this facet?"
                        className="w-full h-20 p-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-white/30 resize-none focus:outline-none focus:border-amber-400/50"
                      />
                    </div>
                  </div>
                </motion.div>
              ) : (
                // Instructions when no facet selected
                <div className="bg-white/5 rounded-xl border border-white/10 p-8 text-center">
                  <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                  <h3 className="text-lg font-light text-white mb-2">
                    Explore Your 12 Facets
                  </h3>
                  <p className="text-white/60 text-sm mb-4">
                    Click on any petal to explore its meaning and adjust your current state.
                    Drag petals outward for expansion (radiant) or inward for contraction (dense).
                  </p>
                  <div className="text-left space-y-2 max-w-sm mx-auto">
                    <div className="flex items-center gap-2 text-white/50 text-xs">
                      <span>{PHASE_SYMBOLS.vector}</span>
                      <span>Vector: Initiation, direction, intelligence</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/50 text-xs">
                      <span>{PHASE_SYMBOLS.circle}</span>
                      <span>Circle: Integration, process, intention</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/50 text-xs">
                      <span>{PHASE_SYMBOLS.spiral}</span>
                      <span>Spiral: Transformation, completion, goal</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Phase Progression */}
              <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                <h3 className="text-white/80 text-sm mb-4">Phase Progression</h3>
                <div className="space-y-3">
                  {Object.entries(calculatePhaseProgression()).map(([phase, value]) => (
                    <div key={phase} className="flex items-center gap-3">
                      <div className="w-20 text-white/60 text-sm flex items-center gap-2">
                        <span>{PHASE_SYMBOLS[phase as keyof typeof PHASE_SYMBOLS]}</span>
                        <span className="capitalize">{phase}</span>
                      </div>
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-indigo-500 to-amber-500"
                          animate={{ width: `${value * 10}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <span className="text-white/60 text-xs w-8">{value.toFixed(1)}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-amber-600/10 rounded-lg border border-amber-600/30">
                  <p className="text-amber-400 text-xs mb-1">Current Focus:</p>
                  <p className="text-white/80 text-sm">
                    {getCurrentPhase() === 'vector' && 'Initiating new directions and exploring possibilities'}
                    {getCurrentPhase() === 'circle' && 'Integrating experiences and developing processes'}
                    {getCurrentPhase() === 'spiral' && 'Completing cycles and achieving transformation'}
                  </p>
                </div>
              </div>

              {/* Crystal Focus Context (if applicable) */}
              {crystalFocus !== 'general' && (
                <div className="bg-amber-600/10 rounded-xl border border-amber-600/30 p-6">
                  <h3 className="text-amber-400 text-sm mb-3">Crystal Focus: {crystalFocus}</h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    {crystalFocus === 'career' && 'Your Earth and Air facets are especially important for manifesting professional goals.'}
                    {crystalFocus === 'spiritual' && 'Fire and Water facets guide your spiritual journey and inner transformation.'}
                    {crystalFocus === 'relational' && 'Air and Water facets support deeper connections and emotional intelligence.'}
                    {crystalFocus === 'health' && 'Earth and Water facets ground your physical and emotional wellbeing.'}
                    {crystalFocus === 'creative' && 'Fire and Air facets fuel your creative expression and communication.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}