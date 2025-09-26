'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllFacets, type WisdomFacet, type Element } from '@/lib/wisdom/WisdomFacets';
import { Sparkles, Info } from 'lucide-react';

interface ConstellationMapProps {
  selectedFacets?: string[];
  onFacetClick?: (facetId: string) => void;
  activeElement?: Element;
  showConnections?: boolean;
}

const ELEMENT_COLORS = {
  earth: { primary: '#8B7355', glow: 'rgba(139, 115, 85, 0.6)', name: 'Earth' },
  water: { primary: '#4A90E2', glow: 'rgba(74, 144, 226, 0.6)', name: 'Water' },
  fire: { primary: '#E94B3C', glow: 'rgba(233, 75, 60, 0.6)', name: 'Fire' },
  air: { primary: '#A8D8EA', glow: 'rgba(168, 216, 234, 0.6)', name: 'Air' },
  aether: { primary: '#B8A4E5', glow: 'rgba(184, 164, 229, 0.6)', name: 'Aether' }
};

const ELEMENT_EMOJIS = {
  earth: '🜃',
  water: '🜄',
  fire: '🜂',
  air: '🜁',
  aether: '🜀'
};

// Position each voice in the constellation based on primary elements
// Positions are in % of container (x, y)
const VOICE_POSITIONS: Record<string, { x: number; y: number }> = {
  // Earth cluster (bottom-left)
  maslow: { x: 20, y: 70 },
  tolstoy: { x: 15, y: 80 },
  somatic: { x: 25, y: 85 },

  // Water cluster (left-center)
  jung: { x: 15, y: 40 },
  brown: { x: 25, y: 50 },

  // Fire cluster (top-center)
  nietzsche: { x: 50, y: 15 },
  frankl: { x: 60, y: 20 },

  // Air cluster (right-center)
  hesse: { x: 75, y: 35 },
  buddhist: { x: 80, y: 45 },

  // Aether cluster (top-right)
  integral: { x: 85, y: 25 }
};

export function ConstellationMap({
  selectedFacets = [],
  onFacetClick,
  activeElement,
  showConnections = true
}: ConstellationMapProps) {
  const [hoveredFacet, setHoveredFacet] = useState<string | null>(null);
  const [detailFacet, setDetailFacet] = useState<WisdomFacet | null>(null);

  const facets = useMemo(() => getAllFacets(), []);

  const getVoiceColor = (facet: WisdomFacet): { primary: string; glow: string } => {
    // Use primary element for color
    const primaryElement = facet.primaryElements[0];
    return ELEMENT_COLORS[primaryElement];
  };

  const isActive = (facet: WisdomFacet): boolean => {
    if (selectedFacets.includes(facet.id)) return true;
    if (activeElement && facet.primaryElements.includes(activeElement)) return true;
    return false;
  };

  const handleVoiceClick = (facet: WisdomFacet) => {
    setDetailFacet(detailFacet?.id === facet.id ? null : facet);
    onFacetClick?.(facet.id);
  };

  return (
    <div className="relative w-full h-[600px] bg-gradient-to-b from-[#0a0e1a] to-[#1a1f3a] rounded-2xl border border-amber-500/20 overflow-hidden">
      {/* Background stars */}
      <div className="absolute inset-0 opacity-30">
        {Array.from({ length: 100 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-amber-200 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.3
            }}
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      {/* Element legend */}
      <div className="absolute top-4 left-4 z-20">
        <div className="bg-black/60 backdrop-blur-sm border border-amber-500/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-amber-200/70 font-medium">Elements</span>
          </div>
          <div className="space-y-1.5">
            {Object.entries(ELEMENT_COLORS).map(([element, color]) => (
              <button
                key={element}
                onClick={() => activeElement === element ? null : null}
                className={`flex items-center gap-2 text-xs transition-opacity ${
                  activeElement && activeElement !== element ? 'opacity-40' : 'opacity-100'
                }`}
              >
                <span className="text-base">{ELEMENT_EMOJIS[element as Element]}</span>
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: color.primary }}
                  />
                  <span className="text-amber-200/70">{color.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="absolute top-4 right-4 z-20">
        <div className="bg-black/60 backdrop-blur-sm border border-amber-500/20 rounded-lg px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-amber-200/70">The Wisdom Constellation</span>
            <Info className="w-3.5 h-3.5 text-amber-400/60" />
          </div>
        </div>
      </div>

      {/* Connection lines (subtle) */}
      {showConnections && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(212, 184, 150, 0.1)" />
              <stop offset="100%" stopColor="rgba(212, 184, 150, 0)" />
            </linearGradient>
          </defs>
          {/* Draw subtle connections between related voices */}
          {facets.map((facet, i) => {
            const pos1 = VOICE_POSITIONS[facet.id];
            if (!pos1) return null;

            return facets.slice(i + 1).map((otherFacet) => {
              const pos2 = VOICE_POSITIONS[otherFacet.id];
              if (!pos2) return null;

              // Connect if they share an element
              const sharedElements = facet.primaryElements.filter(el =>
                otherFacet.primaryElements.includes(el)
              );

              if (sharedElements.length === 0) return null;

              return (
                <line
                  key={`${facet.id}-${otherFacet.id}`}
                  x1={`${pos1.x}%`}
                  y1={`${pos1.y}%`}
                  x2={`${pos2.x}%`}
                  y2={`${pos2.y}%`}
                  stroke="url(#connectionGradient)"
                  strokeWidth="1"
                  opacity={hoveredFacet === facet.id || hoveredFacet === otherFacet.id ? 0.4 : 0.1}
                />
              );
            });
          })}
        </svg>
      )}

      {/* Voice stars */}
      <div className="absolute inset-0 z-10">
        {facets.map((facet) => {
          const position = VOICE_POSITIONS[facet.id];
          if (!position) return null;

          const colors = getVoiceColor(facet);
          const active = isActive(facet);
          const hovered = hoveredFacet === facet.id;
          const selected = selectedFacets.includes(facet.id);

          return (
            <motion.div
              key={facet.id}
              className="absolute cursor-pointer group"
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              onMouseEnter={() => setHoveredFacet(facet.id)}
              onMouseLeave={() => setHoveredFacet(null)}
              onClick={() => handleVoiceClick(facet)}
              whileHover={{ scale: 1.2 }}
              animate={{
                scale: selected ? 1.3 : active ? 1.15 : 1,
                opacity: activeElement && !facet.primaryElements.includes(activeElement) ? 0.3 : 1
              }}
              transition={{ duration: 0.3 }}
            >
              {/* Glow effect */}
              <motion.div
                className="absolute inset-0 rounded-full blur-xl -z-10"
                style={{
                  backgroundColor: colors.glow,
                  width: '40px',
                  height: '40px',
                  marginLeft: '-8px',
                  marginTop: '-8px'
                }}
                animate={{
                  opacity: hovered ? 0.8 : selected ? 0.6 : active ? 0.4 : 0.2,
                  scale: hovered ? 1.5 : 1
                }}
              />

              {/* Star core */}
              <div
                className="relative w-6 h-6 rounded-full flex items-center justify-center border-2"
                style={{
                  backgroundColor: selected ? colors.primary : `${colors.primary}40`,
                  borderColor: colors.primary,
                  boxShadow: selected ? `0 0 20px ${colors.glow}` : 'none'
                }}
              >
                <span className="text-xs">✨</span>
              </div>

              {/* Voice name tooltip */}
              <AnimatePresence>
                {hovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 pointer-events-none whitespace-nowrap z-50"
                  >
                    <div className="bg-black/90 backdrop-blur-sm border border-amber-500/30 rounded-lg px-3 py-2">
                      <div className="text-xs text-amber-100 font-medium mb-0.5">
                        {facet.name}
                      </div>
                      <div className="text-xs text-amber-200/60">
                        {facet.tradition}
                      </div>
                      <div className="flex gap-1 mt-1">
                        {facet.primaryElements.map(el => (
                          <span key={el} className="text-xs opacity-70">
                            {ELEMENT_EMOJIS[el]}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {detailFacet && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute right-4 bottom-4 w-80 z-30"
          >
            <div className="bg-black/90 backdrop-blur-md border border-amber-500/30 rounded-xl p-5 shadow-2xl">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-base font-medium text-amber-100 mb-1">
                    {detailFacet.name}
                  </h3>
                  <p className="text-xs text-amber-200/60">{detailFacet.tradition}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDetailFacet(null);
                  }}
                  className="text-amber-200/60 hover:text-amber-200/80"
                >
                  ×
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-amber-200/80 leading-relaxed">
                    {detailFacet.description}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-amber-300 mb-1">Core Question:</p>
                  <p className="text-xs text-amber-200/70 italic">
                    &ldquo;{detailFacet.coreQuestion}&rdquo;
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-amber-300 mb-1">When to use:</p>
                  <p className="text-xs text-amber-200/70">
                    {detailFacet.when}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-amber-300 mb-1.5">Elements:</p>
                  <div className="flex gap-2">
                    {detailFacet.primaryElements.map(el => (
                      <div
                        key={el}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/20"
                      >
                        <span className="text-sm">{ELEMENT_EMOJIS[el]}</span>
                        <span className="text-xs text-amber-200/70">
                          {ELEMENT_COLORS[el].name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-amber-300 mb-1.5">Key Themes:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {detailFacet.keyThemes.slice(0, 5).map(theme => (
                      <span
                        key={theme}
                        className="px-2 py-0.5 text-xs bg-amber-500/5 border border-amber-500/20 rounded-full text-amber-200/60"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}