"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion, PanInfo } from "framer-motion";
import { cn } from "@/lib/utils";
import { SPIRALOGIC_FACETS_COMPLETE } from "@/data/spiralogic-facets-complete";

type PetalScore = Record<string, number>;

interface EnhancedPetalScaffoldProps {
  onComplete?: (scores: PetalScore) => void;
  size?: number;
  showLabels?: boolean;
  mode?: 'guided' | 'intuitive';
}

export default function EnhancedPetalScaffold({
  onComplete,
  size = 400,
  showLabels = true,
  mode = 'guided'
}: EnhancedPetalScaffoldProps) {
  const [scores, setScores] = useState<PetalScore>({});
  const [activeElements, setActiveElements] = useState<Record<string, number>>({
    fire: 0, water: 0, earth: 0, air: 0
  });
  const [hoveredPetal, setHoveredPetal] = useState<string | null>(null);
  const [draggedPetal, setDraggedPetal] = useState<string | null>(null);

  const centerX = size / 2;
  const centerY = size / 2;
  const petalRadius = size / 3;
  const petalSize = size / 16;
  const maxDragDistance = size / 4;

  // Calculate elemental balance from scores
  useEffect(() => {
    const elementCounts = { fire: 0, water: 0, earth: 0, air: 0 };
    const elementTotals = { fire: 0, water: 0, earth: 0, air: 0 };

    SPIRALOGIC_FACETS_COMPLETE.forEach(facet => {
      const score = scores[facet.id] || 0;
      elementTotals[facet.element as keyof typeof elementTotals] += score;
      if (score > 0) {
        elementCounts[facet.element as keyof typeof elementCounts]++;
      }
    });

    // Calculate average activation per element
    const newActiveElements: Record<string, number> = {};
    Object.keys(elementTotals).forEach(element => {
      const total = elementTotals[element as keyof typeof elementTotals];
      const count = elementCounts[element as keyof typeof elementCounts];
      newActiveElements[element] = count > 0 ? total / count : 0;
    });

    setActiveElements(newActiveElements);
  }, [scores]);

  // Handle petal drag with distance-based scoring
  const handlePetalDrag = useCallback((facetId: string, info: PanInfo) => {
    const deltaX = info.offset.x;
    const deltaY = info.offset.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Normalize distance to 0-1 score (closer to center = higher score)
    const normalizedScore = Math.max(0, Math.min(1, 1 - (distance / maxDragDistance)));
    
    setScores(prev => ({
      ...prev,
      [facetId]: normalizedScore
    }));
  }, [maxDragDistance]);

  // Handle completion
  const handleComplete = useCallback(() => {
    if (onComplete) {
      // Include elemental balance in completion data
      onComplete({
        ...scores,
        _elementalBalance: activeElements,
        _totalActivation: Object.values(scores).reduce((sum, score) => sum + score, 0),
        _timestamp: new Date().toISOString()
      });
    }
  }, [onComplete, scores, activeElements]);

  return (
    <div 
      className="relative flex items-center justify-center bg-gradient-to-br from-indigo-900/20 via-amber-900/20 to-pink-900/20 rounded-3xl"
      style={{ width: size, height: size }}
    >
      {/* Sacred geometry background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" className="overflow-visible">
          {/* Flower of Life inspired pattern */}
          {Array.from({ length: 6 }).map((_, i) => (
            <circle
              key={i}
              cx={centerX}
              cy={centerY}
              r={petalRadius / 3}
              fill="none"
              stroke="white"
              strokeWidth="1"
              transform={`rotate(${i * 60} ${centerX} ${centerY}) translate(${petalRadius / 4} 0)`}
            />
          ))}
          
          {/* Outer ring */}
          <circle
            cx={centerX}
            cy={centerY}
            r={petalRadius}
            fill="none"
            stroke="white"
            strokeWidth="0.5"
            strokeDasharray="4,4"
          />
        </svg>
      </div>

      {/* 12 Spiralogic Facet Petals */}
      {SPIRALOGIC_FACETS_COMPLETE.map((facet, index) => {
        const score = scores[facet.id] || 0;
        const isActive = score > 0;
        const isHovered = hoveredPetal === facet.id;
        const isDragged = draggedPetal === facet.id;

        // Calculate petal position using facet angle data
        const angle = facet.angle.start + (facet.angle.end - facet.angle.start) / 2;
        const x = centerX + Math.cos(angle) * petalRadius - petalSize / 2;
        const y = centerY + Math.sin(angle) * petalRadius - petalSize / 2;

        return (
          <motion.div
            key={facet.id}
            drag
            dragConstraints={{
              left: -maxDragDistance,
              right: maxDragDistance, 
              top: -maxDragDistance,
              bottom: maxDragDistance
            }}
            dragElastic={0.3}
            onDragStart={() => setDraggedPetal(facet.id)}
            onDrag={(_, info) => handlePetalDrag(facet.id, info)}
            onDragEnd={() => setDraggedPetal(null)}
            onHoverStart={() => setHoveredPetal(facet.id)}
            onHoverEnd={() => setHoveredPetal(null)}
            className="absolute cursor-grab active:cursor-grabbing"
            style={{ 
              left: x, 
              top: y,
              width: petalSize * 2,
              height: petalSize * 2
            }}
            animate={{
              scale: isDragged ? 1.3 : isHovered ? 1.15 : 1,
              opacity: isActive ? 1 : 0.8,
              boxShadow: isActive 
                ? `0 0 ${20 * score}px ${facet.color.glow}80`
                : '0 0 0px transparent'
            }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            transition={{ 
              scale: { duration: 0.2 },
              boxShadow: { duration: 0.5 }
            }}
          >
            {/* Petal Body */}
            <motion.div
              className={cn(
                "w-full h-full rounded-full border-2 relative overflow-hidden shadow-lg",
                "cursor-grab active:cursor-grabbing"
              )}
              style={{
                background: `linear-gradient(135deg, ${facet.color.base}, ${facet.color.glow})`,
                borderColor: isActive ? facet.color.glow : 'rgba(255,255,255,0.3)'
              }}
              animate={{
                rotate: isDragged ? [0, 10, -10, 0] : 0,
                borderColor: isActive ? facet.color.glow + '80' : 'rgba(255,255,255,0.3)'
              }}
            >
              {/* Inner glow animation */}
              <motion.div
                className="absolute inset-1 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${facet.color.glow}60, transparent 70%)`
                }}
                animate={{
                  opacity: [0.3, 0.7, 0.3],
                  scale: [0.8, 1.1, 0.8]
                }}
                transition={{
                  duration: 3 + (index * 0.2),
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Activation pulse ring */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2"
                  style={{ borderColor: facet.color.glow + '80' }}
                  initial={{ scale: 1, opacity: 1 }}
                  animate={{ 
                    scale: [1, 1.5, 2],
                    opacity: [0.8, 0.4, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut"
                  }}
                />
              )}

              {/* Stage indicator dot */}
              <div
                className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-white/60"
                style={{
                  background: `repeating-linear-gradient(45deg, white 0, white 2px, transparent 2px, transparent 4px)`.repeat(facet.stage)
                }}
              />
            </motion.div>

            {/* Guided mode: Petal labels and tooltips */}
            {mode === 'guided' && (
              <>
                {/* Element + Stage label */}
                {showLabels && (
                  <motion.div
                    className="absolute -bottom-8 left-1/2 transform -translate-x-1/2
                             text-white/60 text-xs font-light text-center whitespace-nowrap"
                    animate={{ 
                      opacity: isHovered ? 1 : 0.5,
                      scale: isHovered ? 1.05 : 1
                    }}
                  >
                    {facet.element.charAt(0).toUpperCase() + facet.element.slice(1)} {facet.stage}
                  </motion.div>
                )}

                {/* Hover tooltip */}
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 10 }}
                    className="absolute z-50 w-64 p-4 rounded-xl bg-black/90 backdrop-blur-lg
                             border border-white/20 shadow-xl text-white"
                    style={{
                      left: x > centerX ? 'auto' : '100%',
                      right: x > centerX ? '100%' : 'auto',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      marginLeft: x > centerX ? '-12px' : '12px',
                      marginRight: x > centerX ? '12px' : '-12px'
                    }}
                  >
                    <div className="mb-3">
                      <h4 className="font-semibold text-white mb-1 text-sm">
                        {facet.facet}
                      </h4>
                      <p className="text-white/80 text-xs mb-2 italic">
                        {facet.essence}
                      </p>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs px-2 py-1 rounded-full"
                              style={{ 
                                backgroundColor: facet.color.base + '40',
                                color: facet.color.glow 
                              }}>
                          {facet.archetype}
                        </span>
                        <span className="text-xs text-white/50">
                          Score: {Math.round(score * 100)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-white/70 space-y-1">
                      <p><strong>Practice:</strong> {facet.practice}</p>
                      {facet.keyQuestions && facet.keyQuestions.length > 0 && (
                        <p><strong>Reflect:</strong> {facet.keyQuestions[0]}</p>
                      )}
                    </div>
                    
                    {/* Drag instruction */}
                    <div className="mt-3 pt-2 border-t border-white/20">
                      <p className="text-xs text-white/50 text-center">
                        Drag toward center to activate • Distance = Resonance
                      </p>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        );
      })}

      {/* Central Aether Core */}
      <motion.div
        className="absolute w-20 h-20 rounded-full cursor-pointer z-10
                 bg-gradient-to-br from-amber-400 via-pink-400 to-indigo-400
                 border-2 border-white/40 shadow-2xl
                 flex items-center justify-center"
        style={{
          left: centerX - 40,
          top: centerY - 40
        }}
        whileHover={{ 
          scale: 1.1,
          boxShadow: '0 0 30px rgba(168,85,247,0.6)'
        }}
        whileTap={{ scale: 0.95 }}
        onClick={handleComplete}
        animate={{
          rotate: [0, 360],
          boxShadow: Object.values(scores).some(s => s > 0)
            ? '0 0 20px rgba(168,85,247,0.8)'
            : '0 0 10px rgba(168,85,247,0.4)'
        }}
        transition={{
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
          boxShadow: { duration: 1 }
        }}
      >
        {/* Inner sacred symbol */}
        <motion.div
          className="w-12 h-12 rounded-full border border-white/60 relative"
          animate={{ rotate: [0, -360] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        >
          {/* Six-pointed star pattern */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/80 rounded-full"
              style={{
                left: '50%',
                top: '50%',
                transform: `
                  translate(-50%, -50%) 
                  rotate(${i * 60}deg) 
                  translateY(-16px)
                `
              }}
            />
          ))}
        </motion.div>
        
        {/* Complete label */}
        <motion.span
          className="absolute -bottom-8 text-white/70 text-xs font-light"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Complete
        </motion.span>
      </motion.div>

      {/* Elemental Balance Display */}
      {Object.values(activeElements).some(val => val > 0) && (
        <motion.div
          className="absolute top-4 left-4 space-y-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h5 className="text-white/60 text-xs font-medium mb-2">Elemental Balance</h5>
          {Object.entries(activeElements).map(([element, value]) => (
            <div key={element} className="flex items-center space-x-3">
              <span className="text-white/50 text-xs w-12 capitalize">{element}</span>
              <div className="w-16 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className={cn(
                    "h-full rounded-full",
                    element === 'fire' ? 'bg-gradient-to-r from-red-500 to-orange-400' :
                    element === 'water' ? 'bg-gradient-to-r from-blue-500 to-cyan-400' :
                    element === 'earth' ? 'bg-gradient-to-r from-green-600 to-emerald-400' :
                    'bg-gradient-to-r from-sky-400 to-indigo-400'
                  )}
                  initial={{ width: '0%' }}
                  animate={{ width: `${value * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
              <span className="text-white/40 text-xs">{Math.round(value * 100)}%</span>
            </div>
          ))}
        </motion.div>
      )}

      {/* Usage Instructions */}
      <motion.div
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <p className="text-white/40 text-xs font-light mb-1">
          {mode === 'guided' 
            ? 'Drag petals toward center • Hover to explore meanings'
            : 'Feel into the field • Trust your knowing'
          }
        </p>
        <p className="text-white/30 text-xs">
          Click Aether core when ready to proceed
        </p>
      </motion.div>
    </div>
  );
}