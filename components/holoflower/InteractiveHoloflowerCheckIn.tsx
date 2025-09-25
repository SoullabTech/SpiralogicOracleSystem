'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ChevronLeft, Sparkles, Info } from 'lucide-react';

// 12-Facet Spiralogic Model Mapping
interface SpiralogicFacet {
  id: number;
  name: string;
  code: string; // AIN, NEINE, etc.
  element: 'air' | 'fire' | 'water' | 'earth' | 'aether';
  elementNumber: number;
  phase: 'vector' | 'circle' | 'spiral';
  description: string;
  focus: string;
  question: string;
  crystal?: string;
  color: string;
  angle: number; // Position on the holoflower (0-360 degrees)
  value: number; // Current value (0-10)
}

const SPIRALOGIC_FACETS: SpiralogicFacet[] = [
  // AIR - Mental/Communication (12-3 o'clock positions)
  {
    id: 1,
    name: 'Beginning New Cycles',
    code: 'AIN',
    element: 'air',
    elementNumber: 1,
    phase: 'vector',
    description: 'Initiating fresh perspectives and new mental patterns',
    focus: 'What new understanding wants to emerge?',
    question: 'What fresh perspective is calling to you?',
    crystal: 'Clear Quartz',
    color: '#87CEEB',
    angle: 0, // 12 o'clock
    value: 5
  },
  {
    id: 2,
    name: 'Building Inner Awareness',
    code: 'ZWEI',
    element: 'air',
    elementNumber: 2,
    phase: 'circle',
    description: 'Developing self-reflection and mental clarity',
    focus: 'How can you deepen your self-understanding?',
    question: 'What patterns are you becoming aware of?',
    color: '#ADD8E6',
    angle: 30,
    value: 5
  },
  {
    id: 3,
    name: 'Integrating Lessons',
    code: 'AIRE',
    element: 'air',
    elementNumber: 3,
    phase: 'spiral',
    description: 'Synthesizing wisdom from experience',
    focus: 'What wisdom is crystallizing?',
    question: 'How are your experiences becoming wisdom?',
    color: '#B0E0E6',
    angle: 60,
    value: 5
  },

  // FIRE - Passion/Action (3-6 o'clock positions)
  {
    id: 4,
    name: 'Igniting Passion',
    code: 'FEU',
    element: 'fire',
    elementNumber: 1,
    phase: 'vector',
    description: 'Awakening creative fire and life force',
    focus: 'What excites your soul?',
    question: 'What passion wants to be expressed?',
    crystal: 'Carnelian',
    color: '#FF6B6B',
    angle: 90, // 3 o'clock
    value: 5
  },
  {
    id: 5,
    name: 'Transforming Through Action',
    code: 'VUNV',
    element: 'fire',
    elementNumber: 2,
    phase: 'circle',
    description: 'Alchemizing energy into manifestation',
    focus: 'What needs to be transformed?',
    question: 'How can you channel your fire constructively?',
    color: '#FF8E53',
    angle: 120,
    value: 5
  },
  {
    id: 6,
    name: 'Radiating Authenticity',
    code: 'ZECH',
    element: 'fire',
    elementNumber: 3,
    phase: 'spiral',
    description: 'Shining your unique light into the world',
    focus: 'How can you shine more brightly?',
    question: 'What authentic expression seeks release?',
    color: '#FFA500',
    angle: 150,
    value: 5
  },

  // WATER - Emotional/Intuitive (6-9 o'clock positions)
  {
    id: 7,
    name: 'Opening to Flow',
    code: 'IEVE',
    element: 'water',
    elementNumber: 1,
    phase: 'vector',
    description: 'Surrendering to emotional currents',
    focus: 'Where is life inviting you to flow?',
    question: 'What emotions need acknowledgment?',
    crystal: 'Moonstone',
    color: '#4A90E2',
    angle: 180, // 6 o'clock
    value: 5
  },
  {
    id: 8,
    name: 'Deepening Intuition',
    code: 'AGHT',
    element: 'water',
    elementNumber: 2,
    phase: 'circle',
    description: 'Cultivating inner knowing and receptivity',
    focus: 'What is your intuition telling you?',
    question: 'How can you trust your inner knowing more?',
    color: '#5DA3FA',
    angle: 210,
    value: 5
  },
  {
    id: 9,
    name: 'Emotional Integration',
    code: 'NEINE',
    element: 'water',
    elementNumber: 3,
    phase: 'spiral',
    description: 'Harmonizing feeling and being',
    focus: 'What emotional wisdom have you gained?',
    question: 'How are your emotions becoming wisdom?',
    color: '#7BB7FF',
    angle: 240,
    value: 5
  },

  // EARTH - Physical/Material (9-12 o'clock positions)
  {
    id: 10,
    name: 'Grounding in Body',
    code: 'CHEN',
    element: 'earth',
    elementNumber: 1,
    phase: 'vector',
    description: 'Anchoring awareness in physical presence',
    focus: 'How can you honor your body\'s wisdom?',
    question: 'What does your body need right now?',
    crystal: 'Black Tourmaline',
    color: '#8B7355',
    angle: 270, // 9 o'clock
    value: 5
  },
  {
    id: 11,
    name: 'Nurturing Growth',
    code: 'ALVE',
    element: 'earth',
    elementNumber: 2,
    phase: 'circle',
    description: 'Cultivating sustainable foundations',
    focus: 'What needs patient tending?',
    question: 'How can you nurture your growth?',
    color: '#A0826D',
    angle: 300,
    value: 5
  },
  {
    id: 12,
    name: 'Manifesting Abundance',
    code: 'ZWOIF',
    element: 'earth',
    elementNumber: 3,
    phase: 'spiral',
    description: 'Creating tangible results and harvest',
    focus: 'What are you ready to manifest?',
    question: 'What abundance is emerging in your life?',
    crystal: 'Citrine',
    color: '#CD853F',
    angle: 330,
    value: 5
  }
];

interface InteractiveHoloflowerCheckInProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (values: number[]) => void;
}

export function InteractiveHoloflowerCheckIn({
  isOpen,
  onClose,
  onSubmit
}: InteractiveHoloflowerCheckInProps) {
  const [facets, setFacets] = useState(SPIRALOGIC_FACETS);
  const [hoveredFacet, setHoveredFacet] = useState<number | null>(null);
  const [selectedFacet, setSelectedFacet] = useState<SpiralogicFacet | null>(null);
  const [isDragging, setIsDragging] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate center position for petals
  const centerX = 250;
  const centerY = 250;
  const radius = 180;

  // Handle petal drag to adjust value
  const handlePetalDrag = (
    facetId: number,
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    setFacets(prev => prev.map(f => {
      if (f.id === facetId) {
        // Calculate new value based on drag distance from center
        const dragDistance = Math.sqrt(info.offset.x ** 2 + info.offset.y ** 2);
        const direction = info.offset.x > 0 || info.offset.y < 0 ? 1 : -1;
        const deltaValue = (dragDistance / 50) * direction;
        const newValue = Math.max(0, Math.min(10, f.value + deltaValue));

        return { ...f, value: Math.round(newValue * 10) / 10 };
      }
      return f;
    }));
  };

  // Handle direct value adjustment
  const handleValueChange = (facetId: number, delta: number) => {
    setFacets(prev => prev.map(f => {
      if (f.id === facetId) {
        const newValue = Math.max(0, Math.min(10, f.value + delta));
        return { ...f, value: newValue };
      }
      return f;
    }));
  };

  // Calculate petal position
  const getPetalPosition = (angle: number, value: number) => {
    const adjustedRadius = radius * (0.5 + (value / 10) * 0.5); // Petals expand/contract based on value
    const radians = (angle - 90) * Math.PI / 180; // -90 to start from top
    return {
      x: centerX + adjustedRadius * Math.cos(radians),
      y: centerY + adjustedRadius * Math.sin(radians)
    };
  };

  // Submit check-in
  const handleSubmit = () => {
    const values = facets.map(f => f.value);
    const checkInData = {
      values,
      facets: facets.map(f => ({
        code: f.code,
        name: f.name,
        value: f.value,
        element: f.element,
        phase: f.phase
      })),
      coherence: calculateCoherence(),
      timestamp: new Date().toISOString(),
      // Create a unique configuration signature
      signature: btoa(values.join('-')).substring(0, 12)
    };

    // Save comprehensive check-in data
    localStorage.setItem('lastHoloflowerConfig', JSON.stringify(checkInData));
    localStorage.setItem('lastCheckInTime', checkInData.timestamp);

    // Save for journal integration
    const journalPrompt = `Today's Holoflower Reading:\n${
      facets.filter(f => f.value > 7).map(f => `- Strong ${f.element}: ${f.name} (${f.value}/10)`).join('\n')
    }\n${facets.filter(f => f.value < 3).map(f => `- Needs attention in ${f.element}: ${f.name} (${f.value}/10)`).join('\n')}`;

    sessionStorage.setItem('holoflowerJournalPrompt', journalPrompt);
    sessionStorage.setItem('holoflowerCheckInComplete', 'true');

    onSubmit?.(values);
    onClose();

    // Trigger journal flow after a brief pause
    setTimeout(() => {
      const event = new CustomEvent('holoflowerCheckInComplete', {
        detail: checkInData
      });
      window.dispatchEvent(event);
    }, 500);
  };

  // Calculate overall coherence
  const calculateCoherence = () => {
    const avg = facets.reduce((sum, f) => sum + f.value, 0) / facets.length;
    const variance = facets.reduce((sum, f) => sum + Math.pow(f.value - avg, 2), 0) / facets.length;
    return Math.max(0, 1 - (variance / 25)); // Normalize to 0-1
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          className="fixed inset-y-0 right-0 w-full md:w-3/4 lg:w-2/3 bg-gradient-to-br from-black via-indigo-950 to-black z-50 overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-black/50 backdrop-blur-xl border-b border-white/10 px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={onClose}
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Back</span>
              </button>

              <h2 className="text-xl font-light text-white">Daily Holoflower Check-In</h2>

              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Submit & Journal
              </button>
            </div>

            {/* Coherence & Phase Indicators */}
            <div className="mt-3 px-2 space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Overall Coherence</span>
                  <span className="text-amber-400">{Math.round(calculateCoherence() * 100)}%</span>
                </div>
                <div className="mt-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-500 to-pink-500"
                    animate={{ width: `${calculateCoherence() * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Phase Balance */}
              <div className="flex gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-white/40">Vector:</span>
                  <span className="text-cyan-400">{facets.filter(f => f.phase === 'vector').length}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-white/40">Circle:</span>
                  <span className="text-orange-400">{facets.filter(f => f.phase === 'circle').length}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-white/40">Spiral:</span>
                  <span className="text-amber-400">{facets.filter(f => f.phase === 'spiral').length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6">
            {/* Instructions */}
            <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-white/80 text-sm leading-relaxed mb-2">
                🌸 <strong>Intuitive Divination:</strong> Let your inner wisdom guide you as you adjust each petal.
              </p>
              <p className="text-white/70 text-sm">
                Drag petals outward for expansion (radiant) or inward for contraction (dense).
                Trust your first instinct – your body knows where you are.
              </p>
              <p className="text-white/60 text-xs mt-2">
                After check-in, you'll be guided to journal insights and chat with MAIA.
              </p>
            </div>

            {/* Holoflower Container */}
            <div className="relative mx-auto" style={{ width: '500px', height: '500px' }}>
              {/* Center Circle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-600/30 to-pink-600/30 backdrop-blur-sm border border-white/20"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.5, 0.3]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                />
              </div>

              {/* Petals */}
              {facets.map((facet) => {
                const position = getPetalPosition(facet.angle, facet.value);
                const isHovered = hoveredFacet === facet.id;
                const isDraggingThis = isDragging === facet.id;

                return (
                  <motion.div
                    key={facet.id}
                    className="absolute"
                    style={{
                      left: position.x - 40,
                      top: position.y - 40,
                    }}
                  >
                    {/* Petal */}
                    <motion.div
                      drag
                      dragElastic={0.2}
                      dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
                      onDrag={(e, info) => handlePetalDrag(facet.id, e as any, info)}
                      onDragStart={() => setIsDragging(facet.id)}
                      onDragEnd={() => setIsDragging(null)}
                      onHoverStart={() => setHoveredFacet(facet.id)}
                      onHoverEnd={() => setHoveredFacet(null)}
                      onClick={() => setSelectedFacet(facet)}
                      className="relative w-20 h-20 cursor-grab active:cursor-grabbing"
                      whileHover={{ scale: 1.1 }}
                      whileDrag={{ scale: 1.2 }}
                    >
                      {/* Petal Shape */}
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: `radial-gradient(circle at center, ${facet.color}80, ${facet.color}40)`,
                          opacity: 0.5 + (facet.value / 10) * 0.5,
                          transform: `scale(${0.8 + (facet.value / 10) * 0.4})`,
                        }}
                      />

                      {/* Value Indicator */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {facet.value.toFixed(1)}
                        </span>
                      </div>
                    </motion.div>

                    {/* Facet Label (appears on hover or when dragging) */}
                    <AnimatePresence>
                      {(isHovered || isDraggingThis) && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 pointer-events-none z-50"
                        >
                          <div className="bg-black/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20 whitespace-nowrap">
                            <p className="text-white text-sm font-medium">{facet.code}: {facet.name}</p>
                            <p className="text-white/60 text-xs">{facet.element} {facet.elementNumber} • {facet.phase}</p>
                            <p className="text-white/40 text-[10px] mt-1">{facet.focus}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}

              {/* Element Labels in Outer Ring */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Air Label (Top) */}
                <div className="absolute" style={{ top: '5%', left: '50%', transform: 'translateX(-50%)' }}>
                  <span className="text-cyan-400 text-xs uppercase tracking-wider">Air</span>
                  <span className="text-cyan-300 text-[10px] block">Mental • Communication</span>
                </div>

                {/* Fire Label (Right) */}
                <div className="absolute" style={{ top: '50%', right: '5%', transform: 'translateY(-50%)' }}>
                  <span className="text-orange-400 text-xs uppercase tracking-wider">Fire</span>
                  <span className="text-orange-300 text-[10px] block">Passion • Action</span>
                </div>

                {/* Water Label (Bottom) */}
                <div className="absolute" style={{ bottom: '5%', left: '50%', transform: 'translateX(-50%)' }}>
                  <span className="text-blue-400 text-xs uppercase tracking-wider">Water</span>
                  <span className="text-blue-300 text-[10px] block">Emotion • Intuition</span>
                </div>

                {/* Earth Label (Left) */}
                <div className="absolute" style={{ top: '50%', left: '5%', transform: 'translateY(-50%)' }}>
                  <span className="text-amber-600 text-xs uppercase tracking-wider">Earth</span>
                  <span className="text-amber-500 text-[10px] block">Body • Material</span>
                </div>
              </div>
            </div>

            {/* Selected Facet Detail */}
            <AnimatePresence>
              {selectedFacet && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-8 p-6 bg-white/5 rounded-xl border border-white/10"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-light text-white mb-1">
                        {selectedFacet.code}: {selectedFacet.name}
                      </h3>
                      <p className="text-white/60 text-sm mb-2">
                        {selectedFacet.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="px-2 py-1 bg-white/10 rounded" style={{ borderColor: selectedFacet.color, borderWidth: '1px' }}>
                          {selectedFacet.element} {selectedFacet.elementNumber}
                        </span>
                        <span className="px-2 py-1 bg-white/10 rounded">
                          {selectedFacet.phase} phase
                        </span>
                        {selectedFacet.crystal && (
                          <span className="px-2 py-1 bg-amber-600/20 rounded text-amber-300">
                            💎 {selectedFacet.crystal}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedFacet(null)}
                      className="text-white/40 hover:text-white/60 text-2xl"
                    >
                      ×
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Focus State */}
                    <div>
                      <p className="text-amber-400 text-sm mb-2">Focus:</p>
                      <p className="text-white/90 italic">{selectedFacet.focus}</p>
                    </div>

                    {/* Reflection Question */}
                    <div>
                      <p className="text-amber-400 text-sm mb-2">Reflection:</p>
                      <p className="text-white/80">{selectedFacet.question}</p>
                    </div>

                    {/* Value Adjustment */}
                    <div>
                      <p className="text-amber-400 text-sm mb-2">Adjust Value:</p>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleValueChange(selectedFacet.id, -0.5)}
                          className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-white"
                        >
                          -
                        </button>

                        <div className="flex-1">
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full"
                              style={{ backgroundColor: selectedFacet.color }}
                              animate={{ width: `${(selectedFacet.value / 10) * 100}%` }}
                            />
                          </div>
                        </div>

                        <button
                          onClick={() => handleValueChange(selectedFacet.id, 0.5)}
                          className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-white"
                        >
                          +
                        </button>

                        <span className="text-white font-medium min-w-[3ch]">
                          {selectedFacet.value.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Daily Ritual Guide */}
            <div className="mt-8 p-4 bg-gradient-to-br from-amber-600/10 to-pink-600/10 rounded-lg border border-amber-600/30">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-3">
                  <div className="text-sm text-white/80">
                    <p className="font-medium mb-1">🌙 Your Daily Ritual:</p>
                    <div className="space-y-1 text-white/60 ml-4">
                      <p>1. Intuitively adjust petals to match your energy</p>
                      <p>2. Notice which elements call for attention</p>
                      <p>3. Submit to receive your field signature</p>
                      <p>4. Journal emerging insights</p>
                      <p>5. Chat with MAIA for deeper guidance</p>
                    </div>
                  </div>
                  <div className="text-xs text-amber-300 italic">
                    "Your configuration creates a unique energetic signature that MAIA uses to support your journey."
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}