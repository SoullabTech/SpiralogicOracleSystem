import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PromptCard {
  id: number;
  name: string;
  archetype: string;
  element: string;
  timestamp: Date;
  direction: 'up' | 'right' | 'down' | 'left';
  intensity: number;
}

interface StackViewProps {
  activeCards: PromptCard[];
  maxVisible?: number;
  layout?: 'spread' | 'stack' | 'spiral';
}

/**
 * Prompt Card Stack View - Shows accumulated cards like a tarot spread
 * Cards appear as they're activated, creating a visual journey map
 */
export default function PromptCardStack({
  activeCards,
  maxVisible = 7,
  layout = 'spread'
}: StackViewProps) {

  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  // Card visual themes based on direction/element
  const cardThemes = {
    up: {
      gradient: 'from-violet-600 to-amber-800',
      symbol: '☉',
      title: 'Transcendence'
    },
    right: {
      gradient: 'from-orange-600 to-red-800',
      symbol: '△',
      title: 'Transformation'
    },
    left: {
      gradient: 'from-blue-600 to-cyan-800',
      symbol: '◯',
      title: 'Reflection'
    },
    down: {
      gradient: 'from-green-600 to-emerald-800',
      symbol: '◻',
      title: 'Grounding'
    }
  };

  // Calculate card positions based on layout
  const getCardPosition = (index: number, total: number) => {
    switch (layout) {
      case 'spread':
        // Horizontal spread like tarot
        const spreadWidth = 600;
        const cardWidth = 120;
        const overlap = 0.7;
        const totalWidth = cardWidth * total * overlap;
        const startX = -totalWidth / 2;
        return {
          x: startX + (index * cardWidth * overlap),
          y: Math.sin(index * 0.5) * 20, // Slight wave
          rotate: (index - total / 2) * 3, // Fan effect
          z: index
        };

      case 'stack':
        // Vertical stack with slight offset
        return {
          x: index * 5,
          y: index * -30,
          rotate: index * 2,
          z: total - index
        };

      case 'spiral':
        // Spiral pattern
        const angle = (index / total) * Math.PI * 2;
        const radius = 150 + index * 20;
        return {
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          rotate: (angle * 180) / Math.PI + 90,
          z: index
        };

      default:
        return { x: 0, y: 0, rotate: 0, z: index };
    }
  };

  // Get visible cards (most recent if exceeds max)
  const visibleCards = activeCards.slice(-maxVisible);

  return (
    <div className="relative w-full h-full flex items-center justify-center">

      {/* Background sacred geometry */}
      <div className="absolute inset-0 opacity-10">
        <svg viewBox="0 0 800 800" className="w-full h-full">
          {/* Vesica Piscis */}
          <circle cx="350" cy="400" r="150" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gold" />
          <circle cx="450" cy="400" r="150" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gold" />

          {/* Seed of Life pattern */}
          {[0, 60, 120, 180, 240, 300].map(angle => {
            const rad = (angle * Math.PI) / 180;
            const cx = 400 + Math.cos(rad) * 100;
            const cy = 400 + Math.sin(rad) * 100;
            return (
              <circle key={angle} cx={cx} cy={cy} r="100"
                fill="none" stroke="currentColor" strokeWidth="0.3"
                className="text-gold opacity-30"
              />
            );
          })}
        </svg>
      </div>

      {/* Card Stack/Spread */}
      <div className="relative" style={{ perspective: '1000px' }}>
        <AnimatePresence>
          {visibleCards.map((card, index) => {
            const position = getCardPosition(index, visibleCards.length);
            const theme = cardThemes[card.direction];
            const isHovered = hoveredCard === card.id;
            const isSelected = selectedCard === card.id;

            return (
              <motion.div
                key={card.id}
                className="absolute cursor-pointer"
                initial={{
                  opacity: 0,
                  scale: 0,
                  x: 0,
                  y: -200
                }}
                animate={{
                  opacity: 1,
                  scale: isSelected ? 1.2 : (isHovered ? 1.05 : 1),
                  x: position.x,
                  y: position.y,
                  rotateZ: position.rotate,
                  z: isHovered ? 100 : position.z
                }}
                exit={{
                  opacity: 0,
                  scale: 0,
                  y: 200
                }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                  delay: index * 0.1
                }}
                onHoverStart={() => setHoveredCard(card.id)}
                onHoverEnd={() => setHoveredCard(null)}
                onClick={() => setSelectedCard(isSelected ? null : card.id)}
                style={{ zIndex: isHovered ? 100 : position.z }}
              >
                {/* Card Container */}
                <div className={`
                  relative w-32 h-48 rounded-lg overflow-hidden
                  bg-gradient-to-br ${theme.gradient}
                  border-2 border-gold/30
                  shadow-2xl
                `}>

                  {/* Card Back Pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0 bg-repeat"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23FFD700' fill-opacity='0.3'%3E%3Cpath d='M20 20l10-10-10-10-10 10z'/%3E%3C/g%3E%3C/svg%3E")`,
                        backgroundSize: '20px 20px'
                      }}
                    />
                  </div>

                  {/* Card Content */}
                  <div className="relative h-full flex flex-col items-center justify-between p-3 text-white">

                    {/* Direction Symbol */}
                    <div className="text-4xl opacity-80">
                      {theme.symbol}
                    </div>

                    {/* Card Name */}
                    <div className="text-center">
                      <p className="text-xs font-bold mb-1">{card.name}</p>
                      <p className="text-xs opacity-70">{card.archetype}</p>
                    </div>

                    {/* Element & Intensity */}
                    <div className="w-full">
                      <p className="text-xs text-center mb-1">{theme.title}</p>
                      <div className="w-full h-1 bg-black/30 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gold"
                          initial={{ width: 0 }}
                          animate={{ width: `${card.intensity}%` }}
                        />
                      </div>
                    </div>

                  </div>

                  {/* Glow Effect */}
                  {isHovered && (
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{
                        background: 'radial-gradient(circle at center, rgba(255,215,0,0.3), transparent)',
                        boxShadow: '0 0 30px rgba(255,215,0,0.5)'
                      }}
                    />
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Selected Card Detail */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-4 right-4 w-64 p-4 bg-black/90 rounded-lg border border-gold/30 backdrop-blur-md"
          >
            {(() => {
              const card = visibleCards.find(c => c.id === selectedCard);
              if (!card) return null;

              return (
                <>
                  <h3 className="text-gold font-bold mb-2">{card.name}</h3>
                  <p className="text-gold/70 text-sm mb-2">{card.archetype}</p>
                  <div className="text-gold/50 text-xs space-y-1">
                    <p>Element: {card.element}</p>
                    <p>Direction: {card.direction.toUpperCase()}</p>
                    <p>Intensity: {card.intensity}%</p>
                    <p>Activated: {new Date(card.timestamp).toLocaleTimeString()}</p>
                  </div>
                </>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Layout Switcher */}
      <div className="absolute bottom-4 left-4 flex gap-2">
        {['spread', 'stack', 'spiral'].map(l => (
          <button
            key={l}
            onClick={() => {/* Add layout switch handler */}}
            className={`
              px-3 py-1 rounded text-xs font-mono
              ${layout === l ? 'bg-gold/30 text-gold' : 'bg-gold/10 text-gold/50'}
              hover:bg-gold/20 transition-colors
            `}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Card Counter */}
      <div className="absolute top-4 left-4 text-gold/70 text-sm font-mono">
        {visibleCards.length} cards active
        {activeCards.length > maxVisible && ` (${activeCards.length} total)`}
      </div>
    </div>
  );
}