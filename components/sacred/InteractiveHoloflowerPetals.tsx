'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from 'framer-motion';
import { TWELVE_FACETS, interpretPetalPosition, getHoloflowerReading } from '@/lib/holoflower/facets-interpretation';
import { calculateElementalBalance } from '@/data/spiralogic-facets-complete';
import { useMaiaState } from '@/lib/hooks/useMaiaState';
import Image from 'next/image';

interface PetalState {
  facetId: string;
  extension: number; // 0 (center) to 1 (fully extended)
  isActive: boolean;
  isDragging: boolean;
}

interface InteractiveHoloflowerProps {
  size?: number;
  onReadingUpdate?: (reading: any) => void;
  showInterpretation?: boolean;
  mode?: 'intuitive' | 'guided';
  initialStates?: Record<string, number>;
}

export const InteractiveHoloflowerPetals: React.FC<InteractiveHoloflowerProps> = ({
  size = 600,
  onReadingUpdate,
  showInterpretation = true,
  mode = 'guided',
  initialStates = {}
}) => {
  const { setState, setElements, coherenceLevel } = useMaiaState();
  const [petalStates, setPetalStates] = useState<Record<string, PetalState>>({});
  const [hoveredPetal, setHoveredPetal] = useState<string | null>(null);
  const [selectedPetal, setSelectedPetal] = useState<string | null>(null);
  const [currentReading, setCurrentReading] = useState<any>(null);
  
  const centerX = size / 2;
  const centerY = size / 2;
  const innerRadius = size * 0.08; // Center area
  const outerRadius = size * 0.45; // Maximum petal extension
  
  // Initialize petal states
  useEffect(() => {
    const states: Record<string, PetalState> = {};
    TWELVE_FACETS.forEach(facet => {
      states[facet.id] = {
        facetId: facet.id,
        extension: initialStates[facet.id] || 0.5, // Default to balanced middle position
        isActive: false,
        isDragging: false
      };
    });
    setPetalStates(states);
  }, [initialStates]);

  // Calculate petal visual properties based on extension
  const getPetalTransform = (facet: any, extension: number) => {
    const angleInRadians = (facet.angle * Math.PI) / 180; // Convert degrees to radians
    const distance = innerRadius + (outerRadius - innerRadius) * extension;
    const x = Math.cos(angleInRadians) * distance;
    const y = Math.sin(angleInRadians) * distance;
    
    return { x, y, angle: angleInRadians, distance };
  };

  // Handle radial dragging (in/out from center)
  const handlePetalDrag = useCallback((facetId: string, event: any, info: PanInfo) => {
    const facet = TWELVE_FACETS.find(f => f.id === facetId);
    if (!facet) return;

    // Calculate drag position relative to center
    const dx = info.point.x - centerX;
    const dy = info.point.y - centerY;
    const dragDistance = Math.sqrt(dx * dx + dy * dy);
    
    // Calculate extension (0 to 1)
    const extension = Math.max(0, Math.min(1, 
      (dragDistance - innerRadius) / (outerRadius - innerRadius)
    ));

    // Update petal state
    setPetalStates(prev => ({
      ...prev,
      [facetId]: {
        ...prev[facetId],
        extension,
        isDragging: true,
        isActive: true
      }
    }));

    // Get interpretation for this position
    const interpretation = interpretPetalPosition(facetId, extension);
    
    // Trigger visual feedback
    setState('processing');
    
    // Send update event
    window.dispatchEvent(new CustomEvent('holoflower:petal-adjusted', {
      detail: {
        facetId,
        extension,
        interpretation,
        facet
      }
    }));
  }, [centerX, centerY, innerRadius, outerRadius, setState]);

  const handlePetalDragEnd = useCallback((facetId: string) => {
    setPetalStates(prev => ({
      ...prev,
      [facetId]: {
        ...prev[facetId],
        isDragging: false
      }
    }));
    
    // Generate full reading
    const positions: Record<string, number> = {};
    Object.values(petalStates).forEach(state => {
      positions[state.facetId] = state.extension;
    });
    
    const reading = getHoloflowerReading(positions);
    setCurrentReading(reading);
    
    if (onReadingUpdate) {
      onReadingUpdate(reading);
    }
    
    // Update elemental balance
    const balance = calculateElementalBalance(
      Object.entries(positions)
        .filter(([_, ext]) => ext > 0.3)
        .map(([id]) => id)
    );
    setElements(balance);
    
    setState('responding');
    setTimeout(() => setState('idle'), 1000);
  }, [petalStates, onReadingUpdate, setElements, setState]);

  // Create petal path for visual
  const createPetalPath = (extension: number): string => {
    const width = 30 + extension * 20; // Petal width based on extension
    const length = 40 + extension * 100; // Petal length based on extension
    
    return `
      M 0,0
      Q ${-width/2},${-length/3} ${-width/3},${-length}
      Q 0,${-length * 1.1} 0,${-length}
      Q ${width/3},${-length} ${width/2},${-length/3}
      Q ${width/4},0 0,0
      Z
    `;
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Background Sacred Geometry */}
      <svg
        width={size}
        height={size}
        className="absolute inset-0"
        style={{ pointerEvents: 'none' }}
      >
        {/* Concentric guide circles */}
        <circle cx={centerX} cy={centerY} r={innerRadius} 
                fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <circle cx={centerX} cy={centerY} r={innerRadius + (outerRadius - innerRadius) * 0.25} 
                fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="5,5" />
        <circle cx={centerX} cy={centerY} r={innerRadius + (outerRadius - innerRadius) * 0.5} 
                fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="10,5" />
        <circle cx={centerX} cy={centerY} r={innerRadius + (outerRadius - innerRadius) * 0.75} 
                fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="5,5" />
        <circle cx={centerX} cy={centerY} r={outerRadius} 
                fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      </svg>

      {/* Interactive Petals */}
      <svg width={size} height={size} className="absolute inset-0">
        <defs>
          {/* Gradient definitions for each element */}
          <radialGradient id="fireGradient">
            <stop offset="0%" stopColor="#FF6B6B" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#C92A2A" stopOpacity="0.6" />
          </radialGradient>
          <radialGradient id="waterGradient">
            <stop offset="0%" stopColor="#4DABF7" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#1864AB" stopOpacity="0.6" />
          </radialGradient>
          <radialGradient id="earthGradient">
            <stop offset="0%" stopColor="#69DB7C" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#2F9E44" stopOpacity="0.6" />
          </radialGradient>
          <radialGradient id="airGradient">
            <stop offset="0%" stopColor="#FFD43B" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FAB005" stopOpacity="0.6" />
          </radialGradient>
          
          {/* Glow filter */}
          <filter id="petalGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <g transform={`translate(${centerX}, ${centerY})`}>
          {/* Render 12 Petals */}
          {TWELVE_FACETS.map((facet, index) => {
            const state = petalStates[facet.id];
            if (!state) return null;
            
            const { x, y, angle } = getPetalTransform(facet, state.extension);
            const isHovered = hoveredPetal === facet.id;
            const isSelected = selectedPetal === facet.id;
            const interpretation = interpretPetalPosition(facet.id, state.extension);
            
            return (
              <motion.g
                key={facet.id}
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={0}
                onDrag={(e, info) => handlePetalDrag(facet.id, e, info)}
                onDragEnd={() => handlePetalDragEnd(facet.id)}
                onHoverStart={() => setHoveredPetal(facet.id)}
                onHoverEnd={() => setHoveredPetal(null)}
                onClick={() => setSelectedPetal(facet.id === selectedPetal ? null : facet.id)}
                style={{ cursor: 'grab' }}
                whileDrag={{ cursor: 'grabbing' }}
              >
                <motion.path
                  d={createPetalPath(state.extension)}
                  fill={`url(#${facet.element}Gradient)`}
                  fillOpacity={state.extension * 0.4 + 0.4}
                  stroke={facet.color}
                  strokeWidth={isHovered ? 2 : 1}
                  strokeOpacity={isHovered ? 0.8 : 0.3}
                  filter={state.isActive ? "url(#petalGlow)" : undefined}
                  animate={{
                    x,
                    y,
                    rotate: (angle * 180 / Math.PI) + 90,
                    scale: isHovered ? 1.1 : 1,
                    strokeWidth: state.isDragging ? 3 : isHovered ? 2 : 1
                  }}
                  transition={{
                    type: state.isDragging ? "none" : "spring",
                    stiffness: 200,
                    damping: 20
                  }}
                />
                
                {/* Extension indicator dot */}
                <motion.circle
                  cx={0}
                  cy={0}
                  r={4}
                  fill={facet.color}
                  animate={{
                    cx: x,
                    cy: y,
                    opacity: state.isDragging ? 1 : 0.6
                  }}
                />
              </motion.g>
            );
          })}
        </g>
      </svg>

      {/* Center Sacred Core */}
      <motion.div
        className="absolute rounded-full bg-gradient-radial from-white/20 to-transparent"
        style={{
          width: innerRadius * 2,
          height: innerRadius * 2,
          left: centerX - innerRadius,
          top: centerY - innerRadius
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.6, 0.8, 0.6]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Interpretation Panel */}
      {showInterpretation && selectedPetal && petalStates[selectedPetal] && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-4 left-4 right-4 p-4 rounded-xl 
                     bg-black/80 backdrop-blur-lg border border-white/20"
        >
          {(() => {
            const facet = TWELVE_FACETS.find(f => f.id === selectedPetal);
            const state = petalStates[selectedPetal];
            const interpretation = interpretPetalPosition(selectedPetal, state.extension);
            
            return (
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-white font-semibold">{facet?.name}</h3>
                    <p className="text-white/60 text-sm">{facet?.domain}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-white/80 text-sm font-medium">
                      {interpretation.state}
                    </div>
                    <div className="text-white/50 text-xs">
                      {Math.round(state.extension * 100)}% Extended
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-white/70 text-sm italic">
                    {interpretation.meaning}
                  </p>
                  <p className="text-[#D4B896] text-sm">
                    <span className="font-medium">Guidance:</span> {interpretation.guidance}
                  </p>
                </div>

                {/* Extension scale visualization */}
                <div className="flex items-center space-x-3">
                  <span className="text-white/40 text-xs">Retracted</span>
                  <div className="flex-1 h-2 bg-white/10 rounded-full relative">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full"
                      animate={{ width: `${state.extension * 100}%` }}
                    />
                    <div className="absolute top-1/2 -translate-y-1/2 left-1/4 w-0.5 h-3 bg-white/20" />
                    <div className="absolute top-1/2 -translate-y-1/2 left-1/2 w-0.5 h-3 bg-white/30" />
                    <div className="absolute top-1/2 -translate-y-1/2 left-3/4 w-0.5 h-3 bg-white/20" />
                  </div>
                  <span className="text-white/40 text-xs">Extended</span>
                </div>
              </div>
            );
          })()}
        </motion.div>
      )}

      {/* Overall Reading Summary */}
      {currentReading && showInterpretation && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-4 left-4 w-64 p-3 rounded-lg 
                     bg-black/70 backdrop-blur-md border border-white/20"
        >
          <h4 className="text-white/80 text-xs font-semibold mb-2">Current State</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-white/50">Dominant:</span>
              <span className="text-white/80 capitalize">{currentReading.dominantElement}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Balance:</span>
              <span className="text-white/80">{Math.round(currentReading.balanceScore * 100)}%</span>
            </div>
            {currentReading.activeFacets.length > 0 && (
              <div className="pt-1 mt-1 border-t border-white/10">
                <span className="text-white/50">Active:</span>
                <div className="text-white/70 text-xs mt-1">
                  {currentReading.activeFacets.slice(0, 3).join(', ')}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Instructions */}
      {mode === 'guided' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 
                     text-white/40 text-xs text-center"
        >
          Drag petals toward center (retracted) or outward (extended) to indicate your state
        </motion.div>
      )}
    </div>
  );
};