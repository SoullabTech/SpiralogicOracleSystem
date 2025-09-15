import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

interface PromptCard {
  id: number;
  name: string;
  shortName: string;
  prompt: string;
  effect: string;
}

interface DirectionalField {
  direction: 'up' | 'right' | 'down' | 'left';
  element: string;
  purpose: string;
  cards: number[];
  color: {
    primary: string;
    secondary: string;
    glow: string;
  };
  symbol: string;
}

const PROMPT_CARDS: Record<number, PromptCard> = {
  1: {
    id: 1,
    name: "Analytic Idealism Infusion",
    shortName: "Consciousness-First",
    prompt: "Reframe all insights as movements of consciousness rather than external data points.",
    effect: "Shifts tone from mechanical → phenomenological"
  },
  2: {
    id: 2,
    name: "Natural vs. Adaptive Self",
    shortName: "True Impulse",
    prompt: "Distinguish between adaptive (coping) and natural (essence) impulses.",
    effect: "Builds daimon logic into narrative"
  },
  3: {
    id: 3,
    name: "Elemental Weaving",
    shortName: "Elements",
    prompt: "Bind all insights to Fire, Water, Earth, Air, Aether.",
    effect: "Anchors in Spiralogic's elemental wisdom"
  },
  4: {
    id: 4,
    name: "Regret as Offering",
    shortName: "Sacred Wound",
    prompt: "Frame failures as offerings to Nature's intelligence.",
    effect: "Prevents moralizing, honors suffering"
  },
  5: {
    id: 5,
    name: "Non-Dual Closure",
    shortName: "Unity",
    prompt: "Close with unifying perspective, dissolve subject/object split.",
    effect: "Leaves resonance instead of resolution"
  },
  6: {
    id: 6,
    name: "Holotropic Invitation",
    shortName: "Open Practice",
    prompt: "Suggest practices as invitations to wholeness, not tasks.",
    effect: "Protects attention over distraction"
  },
  7: {
    id: 7,
    name: "Daimonic Attunement",
    shortName: "Inner Compass",
    prompt: "Highlight where the daimon speaks through persistent patterns.",
    effect: "Reveals natural destiny"
  }
};

const DIRECTIONS: Record<string, DirectionalField> = {
  up: {
    direction: 'up',
    element: 'AETHER',
    purpose: 'Transcendence • Dissolving boundaries into wholeness',
    cards: [1, 5],
    color: {
      primary: '#8B5CF6',
      secondary: '#A78BFA',
      glow: 'rgba(139, 92, 246, 0.4)'
    },
    symbol: '⬆'
  },
  right: {
    direction: 'right',
    element: 'FIRE',
    purpose: 'Action • Forward momentum, destiny, transformation',
    cards: [7, 3],
    color: {
      primary: '#EF4444',
      secondary: '#F87171',
      glow: 'rgba(239, 68, 68, 0.4)'
    },
    symbol: '➡'
  },
  left: {
    direction: 'left',
    element: 'WATER',
    purpose: 'Reflection • Shadow, memory, emotional depth',
    cards: [2, 4],
    color: {
      primary: '#3B82F6',
      secondary: '#60A5FA',
      glow: 'rgba(59, 130, 246, 0.4)'
    },
    symbol: '⬅'
  },
  down: {
    direction: 'down',
    element: 'EARTH',
    purpose: 'Grounding • Embodiment, daily rhythm, integration',
    cards: [6, 3],
    color: {
      primary: '#10B981',
      secondary: '#34D399',
      glow: 'rgba(16, 185, 129, 0.4)'
    },
    symbol: '⬇'
  }
};

export default function OracularCompassV2() {
  const [activeDirection, setActiveDirection] = useState<string | null>(null);
  const [activeCards, setActiveCards] = useState<Set<number>>(new Set());
  const [intensity, setIntensity] = useState<Record<string, number>>({
    up: 0, right: 0, left: 0, down: 0
  });
  const [centerActive, setCenterActive] = useState(false);
  const compassRef = useRef<HTMLDivElement>(null);

  // Handle swipe gestures
  useEffect(() => {
    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!e.changedTouches[0]) return;

      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;

      const deltaX = endX - startX;
      const deltaY = endY - startY;

      const threshold = 50;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > threshold) activateDirection('right');
        else if (deltaX < -threshold) activateDirection('left');
      } else {
        if (deltaY > threshold) activateDirection('down');
        else if (deltaY < -threshold) activateDirection('up');
      }
    };

    const element = compassRef.current;
    if (element) {
      element.addEventListener('touchstart', handleTouchStart);
      element.addEventListener('touchend', handleTouchEnd);

      return () => {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, []);

  const activateDirection = (direction: string) => {
    setActiveDirection(direction);
    const dir = DIRECTIONS[direction];

    // Add cards from this direction
    setActiveCards(prev => {
      const newSet = new Set(prev);
      dir.cards.forEach(card => newSet.add(card));
      return newSet;
    });

    // Increase intensity
    setIntensity(prev => ({
      ...prev,
      [direction]: Math.min(100, prev[direction] + 25)
    }));
  };

  const resetCompass = () => {
    setActiveDirection(null);
    setActiveCards(new Set());
    setIntensity({ up: 0, right: 0, left: 0, down: 0 });
    setCenterActive(true);
    setTimeout(() => setCenterActive(false), 1000);
  };

  return (
    <div ref={compassRef} className="relative w-full h-screen bg-gradient-to-br from-gray-950 to-black overflow-hidden">

      {/* Sacred Geometry Grid */}
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 800 800">
        <defs>
          <radialGradient id="centerGlow">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Concentric Circles */}
        <circle cx="400" cy="400" r="350" fill="none" stroke="#FFD700" strokeWidth="0.5" strokeOpacity="0.3" />
        <circle cx="400" cy="400" r="250" fill="none" stroke="#FFD700" strokeWidth="0.5" strokeOpacity="0.4" />
        <circle cx="400" cy="400" r="150" fill="none" stroke="#FFD700" strokeWidth="0.5" strokeOpacity="0.5" />
        <circle cx="400" cy="400" r="50" fill="url(#centerGlow)" />

        {/* Cardinal Cross */}
        <line x1="400" y1="50" x2="400" y2="750" stroke="#FFD700" strokeWidth="1" strokeOpacity="0.2" />
        <line x1="50" y1="400" x2="750" y2="400" stroke="#FFD700" strokeWidth="1" strokeOpacity="0.2" />

        {/* Diagonal Cross */}
        <line x1="150" y1="150" x2="650" y2="650" stroke="#FFD700" strokeWidth="0.5" strokeOpacity="0.1" />
        <line x1="650" y1="150" x2="150" y2="650" stroke="#FFD700" strokeWidth="0.5" strokeOpacity="0.1" />
      </svg>

      {/* Directional Fields */}
      <div className="absolute inset-0 flex items-center justify-center">
        {Object.entries(DIRECTIONS).map(([key, dir]) => {
          const isActive = activeDirection === key;
          const fieldIntensity = intensity[key] / 100;

          const positions = {
            up: { x: 0, y: -200 },
            right: { x: 200, y: 0 },
            down: { x: 0, y: 200 },
            left: { x: -200, y: 0 }
          };

          return (
            <motion.div
              key={key}
              className="absolute cursor-pointer select-none"
              style={{
                x: positions[key].x,
                y: positions[key].y,
              }}
              animate={{
                scale: isActive ? 1.2 : 1,
                opacity: 0.5 + fieldIntensity * 0.5
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => activateDirection(key)}
            >
              {/* Field Glow */}
              <motion.div
                className="absolute inset-0 rounded-full blur-xl"
                style={{
                  background: `radial-gradient(circle, ${dir.color.glow}, transparent)`,
                  width: '180px',
                  height: '180px',
                  x: '-90px',
                  y: '-90px'
                }}
                animate={{
                  opacity: fieldIntensity
                }}
              />

              {/* Field Circle */}
              <motion.div
                className="relative w-36 h-36 rounded-full border-2 flex flex-col items-center justify-center"
                style={{
                  borderColor: dir.color.primary,
                  background: `linear-gradient(135deg, ${dir.color.glow}, transparent)`
                }}
              >
                <span className="text-3xl mb-1">{dir.symbol}</span>
                <span className="text-white font-bold text-lg">{dir.element}</span>
                <div className="absolute -bottom-2 w-32 h-1 rounded-full bg-gradient-to-r opacity-50"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${dir.color.primary}, transparent)`
                  }}
                />
              </motion.div>

              {/* Intensity Meter */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full"
                  style={{ background: dir.color.primary }}
                  animate={{ width: `${intensity[key]}%` }}
                />
              </div>
            </motion.div>
          );
        })}

        {/* Center Reset Point */}
        <motion.div
          className="absolute w-24 h-24 rounded-full cursor-pointer"
          style={{
            background: centerActive
              ? 'radial-gradient(circle, rgba(255, 215, 0, 0.6), rgba(255, 215, 0, 0.1))'
              : 'radial-gradient(circle, rgba(255, 215, 0, 0.3), transparent)',
            border: '2px solid rgba(255, 215, 0, 0.5)'
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={resetCompass}
          animate={{
            boxShadow: centerActive
              ? '0 0 50px rgba(255, 215, 0, 0.8)'
              : '0 0 20px rgba(255, 215, 0, 0.3)'
          }}
        >
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gold font-mono text-sm">CENTER</span>
          </div>
        </motion.div>
      </div>

      {/* Active Direction Info */}
      <AnimatePresence>
        {activeDirection && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-8 left-8 right-8 bg-black/80 backdrop-blur-md rounded-lg p-6 border border-gold/30"
          >
            <h3 className="text-2xl font-bold mb-2" style={{ color: DIRECTIONS[activeDirection].color.primary }}>
              {DIRECTIONS[activeDirection].element}
            </h3>
            <p className="text-gold/70 text-sm mb-4">{DIRECTIONS[activeDirection].purpose}</p>
            <div className="flex gap-4">
              {DIRECTIONS[activeDirection].cards.map(cardId => (
                <div key={cardId} className="flex-1 p-3 rounded bg-gold/10 border border-gold/20">
                  <h4 className="text-gold font-semibold text-sm mb-1">
                    {PROMPT_CARDS[cardId].shortName}
                  </h4>
                  <p className="text-gold/50 text-xs">{PROMPT_CARDS[cardId].effect}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Cards Panel */}
      <AnimatePresence>
        {activeCards.size > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute bottom-8 left-8 w-80 bg-black/80 backdrop-blur-md rounded-lg p-4 border border-gold/30"
          >
            <h4 className="text-gold font-bold text-sm mb-3">Active Prompt Cards</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {Array.from(activeCards).map(cardId => (
                <motion.div
                  key={cardId}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-2 rounded bg-gradient-to-r from-gold/20 to-transparent border border-gold/20"
                >
                  <h5 className="text-gold text-xs font-semibold">{PROMPT_CARDS[cardId].name}</h5>
                  <p className="text-gold/60 text-xs mt-1">{PROMPT_CARDS[cardId].prompt}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Instructions */}
      <div className="absolute bottom-8 right-8 text-gold/50 text-xs space-y-1 font-mono">
        <p>⬆ Swipe Up: Transcendence/Unity</p>
        <p>➡ Swipe Right: Action/Destiny</p>
        <p>⬅ Swipe Left: Shadow/Reflection</p>
        <p>⬇ Swipe Down: Grounding/Practice</p>
        <p>⊙ Tap Center: Reset to neutral</p>
      </div>

      {/* Voice Command Indicator */}
      <div className="absolute top-8 right-8 text-gold/70 text-xs">
        <p>Voice: "Oracle, turn {activeDirection || 'center'}"</p>
      </div>
    </div>
  );
}