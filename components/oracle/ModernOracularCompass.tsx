import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PromptCard {
  id: string;
  name: string;
  description: string;
  depth: number; // 0-100: how deeply engaged
  activations: number; // times activated
  lastActivated: Date;
  direction: 'up' | 'right' | 'down' | 'left';
  element: string;
  insight: string; // oracular insight that emerges at high depth
}

interface DirectionalField {
  direction: 'up' | 'right' | 'down' | 'left';
  element: string;
  cards: string[];
  totalDepth: number;
  symbol: string;
  oracle: string; // oracular question for this direction
}

// Modern divinatory prompt cards
const PROMPT_LIBRARY: Record<string, Omit<PromptCard, 'depth' | 'activations' | 'lastActivated'>> = {
  'analytic-idealism': {
    id: 'analytic-idealism',
    name: 'The Observer Within',
    description: 'Consciousness recognizing itself',
    direction: 'up',
    element: 'Aether',
    insight: 'All experience is the universe knowing itself through your eyes'
  },
  'non-dual-closure': {
    id: 'non-dual-closure',
    name: 'The Unified Field',
    description: 'Separation dissolves into wholeness',
    direction: 'up',
    element: 'Aether',
    insight: 'The questioner and question arise from the same silence'
  },
  'daimonic-attunement': {
    id: 'daimonic-attunement',
    name: 'The Inner Compass',
    description: 'Your natural destiny speaking',
    direction: 'right',
    element: 'Fire',
    insight: 'What persists despite resistance is your daimon calling'
  },
  'fire-weaving': {
    id: 'fire-weaving',
    name: 'The Sacred Forge',
    description: 'Will and vision in transformation',
    direction: 'right',
    element: 'Fire',
    insight: 'Your will is the universe expressing its creative force'
  },
  'natural-adaptive': {
    id: 'natural-adaptive',
    name: "The Daimon's Voice",
    description: 'True impulse vs imported desire',
    direction: 'left',
    element: 'Water',
    insight: 'Your authentic self flows beneath all adaptation'
  },
  'regret-offering': {
    id: 'regret-offering',
    name: 'The Sacred Wound',
    description: 'Failure as gift to the field',
    direction: 'left',
    element: 'Water',
    insight: 'Your regrets are offerings that teach the cosmos compassion'
  },
  'holotropic-invitation': {
    id: 'holotropic-invitation',
    name: 'The Open Path',
    description: 'Practice as invitation to wholeness',
    direction: 'down',
    element: 'Earth',
    insight: 'The simplest practices hold the deepest truths'
  },
  'earth-weaving': {
    id: 'earth-weaving',
    name: 'The Living Ground',
    description: 'Embodiment and daily rhythm',
    direction: 'down',
    element: 'Earth',
    insight: 'Your body knows the way when mind cannot find it'
  }
};

const DIRECTIONS: Record<string, DirectionalField> = {
  up: {
    direction: 'up',
    element: 'AETHER',
    cards: ['analytic-idealism', 'non-dual-closure'],
    totalDepth: 0,
    symbol: '◈',
    oracle: 'What dissolves when seen from above?'
  },
  right: {
    direction: 'right',
    element: 'FIRE',
    cards: ['daimonic-attunement', 'fire-weaving'],
    totalDepth: 0,
    symbol: '△',
    oracle: 'What wants to be born through action?'
  },
  left: {
    direction: 'left',
    element: 'WATER',
    cards: ['natural-adaptive', 'regret-offering'],
    totalDepth: 0,
    symbol: '○',
    oracle: 'What truth flows beneath the surface?'
  },
  down: {
    direction: 'down',
    element: 'EARTH',
    cards: ['holotropic-invitation', 'earth-weaving'],
    totalDepth: 0,
    symbol: '□',
    oracle: 'What roots are asking for attention?'
  }
};

export default function ModernOracularCompass() {
  const [activeCards, setActiveCards] = useState<Map<string, PromptCard>>(new Map());
  const [currentDirection, setCurrentDirection] = useState<string | null>(null);
  const [oracularMode, setOracularMode] = useState<'reading' | 'neutral'>('neutral');
  const [revealedInsights, setRevealedInsights] = useState<Set<string>>(new Set());

  // Activate direction and its cards
  const engageDirection = (direction: string) => {
    const dir = DIRECTIONS[direction];
    setCurrentDirection(direction);
    setOracularMode('reading');

    // Add or deepen cards from this direction
    dir.cards.forEach(cardId => {
      setActiveCards(prev => {
        const newMap = new Map(prev);
        const existing = newMap.get(cardId);

        if (existing) {
          // Deepen engagement
          newMap.set(cardId, {
            ...existing,
            depth: Math.min(100, existing.depth + 20),
            activations: existing.activations + 1,
            lastActivated: new Date()
          });

          // Reveal insight at depth threshold
          if (existing.depth >= 60 && !revealedInsights.has(cardId)) {
            setRevealedInsights(prev => new Set(prev).add(cardId));
          }
        } else {
          // First activation
          const baseCard = PROMPT_LIBRARY[cardId];
          newMap.set(cardId, {
            ...baseCard,
            depth: 20,
            activations: 1,
            lastActivated: new Date()
          });
        }

        return newMap;
      });
    });
  };

  // Return to center
  const returnToCenter = () => {
    setCurrentDirection(null);
    setOracularMode('neutral');
    setActiveCards(new Map());
    setRevealedInsights(new Set());
  };

  // Calculate total depth per direction
  const getDirectionalDepth = (direction: string): number => {
    const dir = DIRECTIONS[direction];
    let totalDepth = 0;

    dir.cards.forEach(cardId => {
      const card = activeCards.get(cardId);
      if (card) totalDepth += card.depth;
    });

    return totalDepth / dir.cards.length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-8">

      {/* Oracular Question */}
      <AnimatePresence>
        {currentDirection && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl font-light text-gold/80 tracking-wide">
              {DIRECTIONS[currentDirection].oracle}
            </h2>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compass */}
      <div className="relative w-[600px] h-[600px] mx-auto">

        {/* Sacred Geometry Background */}
        <svg className="absolute inset-0 w-full h-full opacity-10">
          <circle cx="300" cy="300" r="280" fill="none" stroke="currentColor" strokeWidth="1" className="text-gold" />
          <circle cx="300" cy="300" r="200" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gold" />
          <circle cx="300" cy="300" r="120" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gold" />
          <line x1="300" y1="20" x2="300" y2="580" stroke="currentColor" strokeWidth="0.5" className="text-gold" />
          <line x1="20" y1="300" x2="580" y2="300" stroke="currentColor" strokeWidth="0.5" className="text-gold" />
        </svg>

        {/* Directional Fields */}
        {Object.entries(DIRECTIONS).map(([key, dir]) => {
          const positions = {
            up: { x: 300, y: 80 },
            right: { x: 520, y: 300 },
            down: { x: 300, y: 520 },
            left: { x: 80, y: 300 }
          };

          const depth = getDirectionalDepth(key);
          const isActive = currentDirection === key;

          return (
            <motion.button
              key={key}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: positions[key].x,
                top: positions[key].y
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => engageDirection(key)}
            >
              <motion.div
                className="relative w-32 h-32 rounded-full border-2 border-gold/30 flex flex-col items-center justify-center"
                animate={{
                  backgroundColor: `rgba(255, 215, 0, ${depth / 500})`,
                  borderColor: isActive ? 'rgba(255, 215, 0, 0.8)' : 'rgba(255, 215, 0, 0.3)',
                  boxShadow: isActive ? '0 0 30px rgba(255, 215, 0, 0.5)' : 'none'
                }}
              >
                <span className="text-3xl mb-1">{dir.symbol}</span>
                <span className="text-sm font-light tracking-wider">{dir.element}</span>

                {/* Depth Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="64" cy="64" r="62"
                    fill="none"
                    stroke="rgba(255, 215, 0, 0.2)"
                    strokeWidth="4"
                  />
                  <circle
                    cx="64" cy="64" r="62"
                    fill="none"
                    stroke="rgba(255, 215, 0, 0.8)"
                    strokeWidth="4"
                    strokeDasharray={`${(depth / 100) * 390} 390`}
                    className="transition-all duration-500"
                  />
                </svg>
              </motion.div>
            </motion.button>
          );
        })}

        {/* Center Reset */}
        <motion.button
          className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          onClick={returnToCenter}
        >
          <div className="w-24 h-24 rounded-full bg-black/50 border-2 border-gold/50 flex items-center justify-center backdrop-blur-sm">
            <span className="text-gold font-light tracking-wider">CENTRE</span>
          </div>
        </motion.button>
      </div>

      {/* Active Cards Spread */}
      <div className="mt-12 max-w-6xl mx-auto">
        <AnimatePresence>
          {activeCards.size > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-4 gap-4"
            >
              {Array.from(activeCards.values()).map((card, index) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 50, rotateY: 180 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    rotateY: 0,
                    transition: { delay: index * 0.1 }
                  }}
                  className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-lg p-4 border border-gold/20"
                >
                  {/* Card Header */}
                  <div className="mb-3">
                    <h3 className="text-gold font-medium">{card.name}</h3>
                    <p className="text-gold/60 text-sm">{card.description}</p>
                  </div>

                  {/* Depth Meter */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gold/50 mb-1">
                      <span>Depth</span>
                      <span>{card.depth}%</span>
                    </div>
                    <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-gold/50 to-gold"
                        initial={{ width: 0 }}
                        animate={{ width: `${card.depth}%` }}
                      />
                    </div>
                  </div>

                  {/* Activation Count */}
                  <div className="text-xs text-gold/40">
                    Activated {card.activations}x
                  </div>

                  {/* Revealed Insight */}
                  <AnimatePresence>
                    {revealedInsights.has(card.id) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 pt-3 border-t border-gold/20"
                      >
                        <p className="text-sm text-gold/90 italic">
                          "{card.insight}"
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Neutral State Message */}
        {activeCards.size === 0 && (
          <div className="text-center text-gold/50 font-light">
            <p>The field awaits your inquiry</p>
            <p className="text-sm mt-2">Choose a direction to begin the reading</p>
          </div>
        )}
      </div>
    </div>
  );
}