import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PromptCard {
  id: number;
  name: string;
  domain: string;
  archetype: string;
  prompt: string;
}

interface Direction {
  name: string;
  element: string;
  purpose: string;
  cards: number[];
  color: string;
  position: { x: number; y: number };
}

const PROMPT_CARDS: Record<number, PromptCard> = {
  1: {
    id: 1,
    name: "Analytic Idealism Infusion",
    domain: "Consciousness-First Reality",
    archetype: "The Observer Within",
    prompt: "Reframe all insights as movements of consciousness..."
  },
  2: {
    id: 2,
    name: "Natural vs. Adaptive Self",
    domain: "Authentic Impulse Recognition",
    archetype: "The Daimon's Voice",
    prompt: "Distinguish between adaptive and natural impulses..."
  },
  3: {
    id: 3,
    name: "Elemental Weaving",
    domain: "Five Element Integration",
    archetype: "The Elemental Sage",
    prompt: "Bind insights to Fire, Water, Earth, Air, Aether..."
  },
  4: {
    id: 4,
    name: "Regret as Offering",
    domain: "Transformative Failure",
    archetype: "The Sacred Wound",
    prompt: "Frame failures as offerings to Nature's intelligence..."
  },
  5: {
    id: 5,
    name: "Non-Dual Closure",
    domain: "Unity Consciousness",
    archetype: "The Unified Field",
    prompt: "Close with unifying perspective, dissolve separation..."
  },
  6: {
    id: 6,
    name: "Holotropic Invitation",
    domain: "Open-Ended Practice",
    archetype: "The Gentle Guide",
    prompt: "Suggest practices as invitations to wholeness..."
  },
  7: {
    id: 7,
    name: "Daimonic Attunement",
    domain: "Natural Destiny",
    archetype: "The Inner Compass",
    prompt: "Highlight where the daimon speaks through patterns..."
  }
};

const DIRECTIONS: Record<string, Direction> = {
  up: {
    name: "AETHER",
    element: "Transcendence",
    purpose: "Opens vertical axis, dissolves boundaries",
    cards: [1, 5],
    color: "from-violet-500/20 to-amber-600/20",
    position: { x: 0, y: -150 }
  },
  right: {
    name: "FIRE",
    element: "Active Transformation",
    purpose: "Forward momentum, action, destiny",
    cards: [7, 3],
    color: "from-orange-500/20 to-red-600/20",
    position: { x: 150, y: 0 }
  },
  left: {
    name: "WATER",
    element: "Reflective Depth",
    purpose: "Shadow, memory, emotional insight",
    cards: [2, 4],
    color: "from-blue-500/20 to-cyan-600/20",
    position: { x: -150, y: 0 }
  },
  down: {
    name: "EARTH",
    element: "Grounded Practice",
    purpose: "Rooting, embodiment, integration",
    cards: [6, 3],
    color: "from-green-500/20 to-emerald-600/20",
    position: { x: 0, y: 150 }
  }
};

export default function OracularCompass() {
  const [activeDirection, setActiveDirection] = useState<string | null>(null);
  const [activeCards, setActiveCards] = useState<number[]>([]);
  const [intensity, setIntensity] = useState<Record<string, number>>({
    up: 0, right: 0, left: 0, down: 0
  });

  const handleDirectionClick = (direction: string) => {
    if (activeDirection === direction) {
      setActiveDirection(null);
      setActiveCards([]);
    } else {
      setActiveDirection(direction);
      setActiveCards(DIRECTIONS[direction].cards);
    }
  };

  const handleSwipe = (direction: string) => {
    setIntensity(prev => ({
      ...prev,
      [direction]: Math.min(prev[direction] + 25, 100)
    }));

    if (!activeCards.includes(...DIRECTIONS[direction].cards)) {
      setActiveCards([...activeCards, ...DIRECTIONS[direction].cards]);
    }
  };

  const handleCenter = () => {
    setActiveDirection(null);
    setActiveCards([]);
    setIntensity({ up: 0, right: 0, left: 0, down: 0 });
  };

  return (
    <div className="relative w-full h-screen bg-black flex items-center justify-center overflow-hidden">
      {/* Sacred Geometry Background */}
      <div className="absolute inset-0 opacity-10">
        <svg viewBox="0 0 800 800" className="w-full h-full">
          <circle cx="400" cy="400" r="300" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gold" />
          <circle cx="400" cy="400" r="200" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gold" />
          <circle cx="400" cy="400" r="100" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gold" />

          {/* Cardinal Lines */}
          <line x1="400" y1="100" x2="400" y2="700" stroke="currentColor" strokeWidth="0.5" className="text-gold" />
          <line x1="100" y1="400" x2="700" y2="400" stroke="currentColor" strokeWidth="0.5" className="text-gold" />
        </svg>
      </div>

      {/* Center Point */}
      <motion.div
        className="absolute z-50"
        whileHover={{ scale: 1.1 }}
        onClick={handleCenter}
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 border border-gold/50 flex items-center justify-center cursor-pointer">
          <span className="text-gold text-xs font-mono">CENTER</span>
        </div>
      </motion.div>

      {/* Directional Fields */}
      {Object.entries(DIRECTIONS).map(([key, dir]) => (
        <motion.div
          key={key}
          className="absolute"
          style={{
            x: dir.position.x,
            y: dir.position.y,
            opacity: intensity[key] / 100 + 0.3
          }}
          animate={{
            x: dir.position.x,
            y: dir.position.y
          }}
        >
          <motion.div
            className={`w-32 h-32 rounded-full bg-gradient-to-br ${dir.color} border border-gold/30 flex flex-col items-center justify-center cursor-pointer backdrop-blur-sm`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleDirectionClick(key)}
          >
            <span className="text-gold font-bold text-sm">{dir.name}</span>
            <span className="text-gold/70 text-xs mt-1">{dir.element}</span>
            {activeDirection === key && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute -bottom-8 text-gold/50 text-xs max-w-[150px] text-center"
              >
                {dir.purpose}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      ))}

      {/* Active Cards Display */}
      <AnimatePresence>
        {activeCards.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-10 left-10 right-10 bg-black/80 border border-gold/30 rounded-lg p-6 backdrop-blur-md"
          >
            <h3 className="text-gold font-bold mb-4">Active Prompt Cards</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeCards.map(cardId => {
                const card = PROMPT_CARDS[cardId];
                return (
                  <motion.div
                    key={cardId}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-br from-gold/10 to-transparent border border-gold/20 rounded p-3"
                  >
                    <h4 className="text-gold font-semibold text-sm">{card.name}</h4>
                    <p className="text-gold/60 text-xs mt-1">{card.archetype}</p>
                    <p className="text-gold/40 text-xs mt-2 line-clamp-2">{card.prompt}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gesture Instructions */}
      <div className="absolute top-10 left-10 text-gold/50 text-xs font-mono">
        <p>↑ Swipe Up: Transcendence</p>
        <p>→ Swipe Right: Action</p>
        <p>← Swipe Left: Reflection</p>
        <p>↓ Swipe Down: Grounding</p>
        <p>⊙ Tap Center: Reset</p>
      </div>

      {/* Intensity Meters */}
      <div className="absolute top-10 right-10 space-y-2">
        {Object.entries(intensity).map(([dir, value]) => (
          <div key={dir} className="flex items-center space-x-2">
            <span className="text-gold/50 text-xs w-12">{dir.toUpperCase()}</span>
            <div className="w-20 h-2 bg-gold/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-gold/50 to-gold"
                animate={{ width: `${value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}