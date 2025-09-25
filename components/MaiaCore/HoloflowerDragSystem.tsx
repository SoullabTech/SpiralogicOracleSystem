'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { useMaiaState } from '@/lib/hooks/useMaiaState';
import { SPIRALOGIC_FACETS_COMPLETE, getFacetById, calculateElementalBalance } from '@/data/spiralogic-facets-complete';

interface DragResult {
  facetId: string;
  intensity: number; // 0-1 based on drag distance
  angle: number; // radians
  position: { x: number; y: number };
}

interface HoloflowerProps {
  size?: number;
  onPetalDrag?: (result: DragResult) => void;
  showTooltips?: boolean;
  mode?: 'guided' | 'intuitive';
}

export function HoloflowerDragSystem({ 
  size = 300, 
  onPetalDrag, 
  showTooltips = true,
  mode = 'guided' 
}: HoloflowerProps) {
  const { preferences, setState, setElements, coherenceLevel } = useMaiaState();
  const [draggedFacet, setDraggedFacet] = useState<string | null>(null);
  const [hoveredFacet, setHoveredFacet] = useState<string | null>(null);
  const [activeFacets, setActiveFacets] = useState<Record<string, number>>({});
  const [showInsight, setShowInsight] = useState<string | null>(null);
  
  const centerX = size / 2;
  const centerY = size / 2;
  const maxDragDistance = size / 3;
  const petalSize = size / 12;

  // Create motion values for center coherence visualization
  const coherenceScale = useTransform(
    useMotionValue(coherenceLevel),
    [0, 1],
    [0.8, 1.2]
  );

  const handlePetalDrag = useCallback((facetId: string, info: PanInfo) => {
    const deltaX = info.offset.x;
    const deltaY = info.offset.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const intensity = Math.min(distance / maxDragDistance, 1);
    const angle = Math.atan2(deltaY, deltaX);

    // Update active facets with drag intensity
    setActiveFacets(prev => ({
      ...prev,
      [facetId]: intensity
    }));

    // Calculate elemental balance from active facets
    const balance = calculateElementalBalance(Object.keys(activeFacets));
    setElements(balance);

    // Trigger Oracle processing
    const result: DragResult = {
      facetId,
      intensity,
      angle,
      position: { x: deltaX, y: deltaY }
    };

    if (onPetalDrag) {
      onPetalDrag(result);
    }

    // Generate contextual insight
    const facet = getFacetById(facetId);
    if (facet && 'essence' in facet) {
      const insights = [
        `${facet.essence} (${Math.round(intensity * 100)}% activation)`,
        `${facet.practice}`,
        ...facet.keyQuestions || []
      ];
      setShowInsight(insights[Math.floor(Math.random() * insights.length)]);
    }

    // Send to PersonalOracleAgent
    window.dispatchEvent(new CustomEvent('maia:facet-activated', {
      detail: {
        facetId,
        facet,
        intensity,
        balance,
        mode: preferences.interactionMode
      }
    }));
  }, [activeFacets, maxDragDistance, onPetalDrag, preferences.interactionMode, setElements]);

  const handlePetalDragEnd = useCallback((facetId: string) => {
    setDraggedFacet(null);
    
    // Gradual fade of activation
    setTimeout(() => {
      setActiveFacets(prev => {
        const updated = { ...prev };
        if (updated[facetId]) {
          updated[facetId] *= 0.7; // Decay factor
          if (updated[facetId] < 0.1) {
            delete updated[facetId];
          }
        }
        return updated;
      });
    }, 2000);
  }, []);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Center Holoflower Core */}
      <motion.div
        className="absolute rounded-full bg-gradient-to-br from-amber-500/30 to-pink-500/30 
                   backdrop-blur-md border border-white/40"
        style={{
          width: petalSize * 2,
          height: petalSize * 2,
          left: centerX - petalSize,
          top: centerY - petalSize
        }}
        animate={{
          scale: coherenceScale,
          rotate: [0, 360]
        }}
        transition={{
          scale: { duration: 2, ease: "easeInOut" },
          rotate: { duration: 20, repeat: Infinity, ease: "linear" }
        }}
      >
        {/* Inner mandala pattern */}
        <motion.div
          className="absolute inset-2 rounded-full border border-white/20"
          animate={{ rotate: [0, -360] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        >
          {/* Sacred geometry dots */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/40 rounded-full"
              style={{
                left: '50%',
                top: '50%',
                transform: `
                  translate(-50%, -50%) 
                  rotate(${i * 60}deg) 
                  translateY(-8px)
                `
              }}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* 12 Spiralogic Facet Petals */}
      {SPIRALOGIC_FACETS_COMPLETE.map((facet, index) => {
        const isActive = activeFacets[facet.id] > 0;
        const intensity = activeFacets[facet.id] || 0;
        const isDragged = draggedFacet === facet.id;
        const isHovered = hoveredFacet === facet.id;

        // Calculate petal position on the circle
        const angle = facet.angle.start + (facet.angle.end - facet.angle.start) / 2;
        const radius = size / 2.8;
        const x = centerX + Math.cos(angle) * radius - petalSize / 2;
        const y = centerY + Math.sin(angle) * radius - petalSize / 2;

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
            dragElastic={0.2}
            onDragStart={() => {
              setDraggedFacet(facet.id);
              setState('processing');
            }}
            onDrag={(_, info) => handlePetalDrag(facet.id, info)}
            onDragEnd={() => {
              handlePetalDragEnd(facet.id);
              setState('responding');
              setTimeout(() => setState('idle'), 1000);
            }}
            onHoverStart={() => setHoveredFacet(facet.id)}
            onHoverEnd={() => setHoveredFacet(null)}
            className="absolute cursor-grab active:cursor-grabbing"
            style={{ 
              left: x, 
              top: y,
              width: petalSize,
              height: petalSize
            }}
            animate={{
              scale: isDragged ? 1.3 : isHovered ? 1.1 : 1,
              opacity: isActive ? 1 : 0.8,
              boxShadow: isActive 
                ? `0 0 ${20 * intensity}px ${facet.color.glow}80`
                : '0 0 0px transparent'
            }}
            whileHover={{ 
              scale: 1.15,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Petal Visual */}
            <motion.div
              className="w-full h-full rounded-full border-2 border-white/30 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${facet.color.base}, ${facet.color.glow})`,
                boxShadow: `0 2px 8px ${facet.color.shadow}40`
              }}
              animate={{
                borderColor: isActive ? facet.color.glow : 'rgba(255,255,255,0.3)',
                rotate: isDragged ? [0, 10, 0] : 0
              }}
            >
              {/* Inner glow effect */}
              <motion.div
                className="absolute inset-1 rounded-full"
                style={{ 
                  background: `radial-gradient(circle, ${facet.color.glow}40, transparent 70%)`
                }}
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  scale: [0.8, 1.1, 0.8]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: index * 0.2
                }}
              />

              {/* Activation pulse */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2"
                  style={{ borderColor: facet.color.glow }}
                  initial={{ scale: 1, opacity: 1 }}
                  animate={{ 
                    scale: [1, 1.5, 2],
                    opacity: [0.8, 0.4, 0]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeOut"
                  }}
                />
              )}
            </motion.div>

            {/* Tooltips for Guided Mode */}
            {showTooltips && mode === 'guided' && isHovered && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                className="absolute z-50 w-56 p-3 rounded-lg bg-black/90 backdrop-blur-lg
                         border border-white/20 shadow-xl text-white text-sm"
                style={{
                  left: x > centerX ? 'auto' : '100%',
                  right: x > centerX ? '100%' : 'auto',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  marginLeft: x > centerX ? '-8px' : '8px',
                  marginRight: x > centerX ? '8px' : '-8px'
                }}
              >
                <div className="mb-2">
                  <h4 className="font-semibold text-white mb-1">{facet.facet}</h4>
                  <p className="text-white/70 text-xs mb-2">{facet.essence}</p>
                  <div className="flex items-center space-x-1 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10">
                      {facet.element.toUpperCase()} {facet.stage}
                    </span>
                    <span className="text-xs text-white/50">
                      {facet.archetype}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-white/60">
                  <p className="italic">{facet.practice}</p>
                </div>
                
                {/* Drag instruction */}
                <div className="mt-2 pt-2 border-t border-white/10">
                  <p className="text-xs text-white/50">
                    Drag to activate • Distance = Intensity
                  </p>
                </div>
              </motion.div>
            )}

            {/* Minimalist label for guided mode */}
            {mode === 'guided' && !isHovered && (
              <motion.div
                className="absolute -bottom-6 left-1/2 transform -translate-x-1/2
                         text-white/40 text-xs font-light text-center whitespace-nowrap"
                animate={{ opacity: isActive ? 0.8 : 0.4 }}
              >
                {facet.element} {facet.stage}
              </motion.div>
            )}
          </motion.div>
        );
      })}

      {/* Elemental Balance Visualization */}
      <motion.div
        className="absolute top-4 left-4 space-y-1 text-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: Object.keys(activeFacets).length > 0 ? 0.8 : 0 }}
      >
        {['fire', 'water', 'earth', 'air'].map(element => {
          const facets = SPIRALOGIC_FACETS_COMPLETE.filter(f => f.element === element);
          const activeCount = facets.filter(f => activeFacets[f.id]).length;
          const balance = activeCount / facets.length;
          
          return (
            <div key={element} className="flex items-center space-x-2">
              <span className="text-white/60 w-12 capitalize">{element}</span>
              <div className="w-16 h-1 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${
                    element === 'fire' ? 'from-red-500 to-orange-500' :
                    element === 'water' ? 'from-blue-500 to-cyan-500' :
                    element === 'earth' ? 'from-green-600 to-emerald-500' :
                    'from-sky-400 to-indigo-400'
                  }`}
                  animate={{ width: `${balance * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Dynamic Insight Display */}
      {showInsight && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          onAnimationComplete={() => {
            setTimeout(() => setShowInsight(null), 4000);
          }}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2
                   max-w-md p-4 rounded-xl bg-black/70 backdrop-blur-lg 
                   border border-white/30 text-center"
        >
          <p className="text-white/90 text-sm leading-relaxed italic">
            {showInsight}
          </p>
        </motion.div>
      )}

      {/* Usage Instructions */}
      <motion.div
        className="absolute bottom-2 right-4 text-xs text-white/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        {mode === 'guided' ? 'Hover to explore • Drag to activate' : 'Feel into the petals • Trust your knowing'}
      </motion.div>
    </div>
  );
}