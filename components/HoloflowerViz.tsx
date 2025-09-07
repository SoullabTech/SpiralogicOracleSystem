'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, PanInfo, AnimatePresence } from 'framer-motion';

// ============================================
// Types
// ============================================

interface PetalData {
  id: string;
  element: 'fire' | 'water' | 'earth' | 'air';
  stage: 1 | 2 | 3;
  angle: number;
  essence: string;
  keywords: string[];
  color: string;
  intensity: number; // 0-1
}

interface HoloflowerVizProps {
  mode?: 'checkin' | 'reading' | 'merged';
  onPetalChange?: (petalIntensities: Record<string, number>) => void;
  oracleHighlight?: { element: string; stage: number };
  userIntensities?: Record<string, number>;
  className?: string;
  showAetherDetails?: boolean;
}

// ============================================
// Constants
// ============================================

const ELEMENT_COLORS = {
  fire: {
    gradient: ['#FF6B35', '#FF9558', '#FFB87B'],
    glow: 'rgba(255, 107, 53, 0.4)'
  },
  water: {
    gradient: ['#4A90E2', '#5BA0F2', '#6BB0FF'],
    glow: 'rgba(74, 144, 226, 0.4)'
  },
  earth: {
    gradient: ['#8B7355', '#A0845C', '#B59963'],
    glow: 'rgba(139, 115, 85, 0.4)'
  },
  air: {
    gradient: ['#A8DADC', '#B8E6E8', '#C8F2F4'],
    glow: 'rgba(168, 218, 220, 0.4)'
  }
};

const PETALS: PetalData[] = [
  // Fire petals (0°, 30°, 60°)
  { id: 'Fire1', element: 'fire', stage: 1, angle: 0, essence: 'Spark', keywords: ['Ignition', 'Vision'], color: ELEMENT_COLORS.fire.gradient[0], intensity: 0 },
  { id: 'Fire2', element: 'fire', stage: 2, angle: 30, essence: 'Blaze', keywords: ['Passion', 'Creation'], color: ELEMENT_COLORS.fire.gradient[1], intensity: 0 },
  { id: 'Fire3', element: 'fire', stage: 3, angle: 60, essence: 'Phoenix', keywords: ['Rebirth', 'Mastery'], color: ELEMENT_COLORS.fire.gradient[2], intensity: 0 },
  
  // Water petals (90°, 120°, 150°)
  { id: 'Water1', element: 'water', stage: 1, angle: 90, essence: 'Droplet', keywords: ['Curiosity', 'Receptivity'], color: ELEMENT_COLORS.water.gradient[0], intensity: 0 },
  { id: 'Water2', element: 'water', stage: 2, angle: 120, essence: 'Flow', keywords: ['Surrender', 'Intuition'], color: ELEMENT_COLORS.water.gradient[1], intensity: 0 },
  { id: 'Water3', element: 'water', stage: 3, angle: 150, essence: 'Ocean', keywords: ['Unity', 'Wisdom'], color: ELEMENT_COLORS.water.gradient[2], intensity: 0 },
  
  // Earth petals (180°, 210°, 240°)
  { id: 'Earth1', element: 'earth', stage: 1, angle: 180, essence: 'Seed', keywords: ['Potential', 'Patience'], color: ELEMENT_COLORS.earth.gradient[0], intensity: 0 },
  { id: 'Earth2', element: 'earth', stage: 2, angle: 210, essence: 'Root', keywords: ['Foundation', 'Growth'], color: ELEMENT_COLORS.earth.gradient[1], intensity: 0 },
  { id: 'Earth3', element: 'earth', stage: 3, angle: 240, essence: 'Mountain', keywords: ['Permanence', 'Legacy'], color: ELEMENT_COLORS.earth.gradient[2], intensity: 0 },
  
  // Air petals (270°, 300°, 330°)
  { id: 'Air1', element: 'air', stage: 1, angle: 270, essence: 'Whisper', keywords: ['Inquiry', 'Lightness'], color: ELEMENT_COLORS.air.gradient[0], intensity: 0 },
  { id: 'Air2', element: 'air', stage: 2, angle: 300, essence: 'Wind', keywords: ['Movement', 'Clarity'], color: ELEMENT_COLORS.air.gradient[1], intensity: 0 },
  { id: 'Air3', element: 'air', stage: 3, angle: 330, essence: 'Sky', keywords: ['Freedom', 'Truth'], color: ELEMENT_COLORS.air.gradient[2], intensity: 0 },
];

// ============================================
// Petal Component
// ============================================

interface PetalProps {
  petal: PetalData;
  isInteractive: boolean;
  isHighlighted: boolean;
  onIntensityChange: (id: string, intensity: number) => void;
  showDetails: boolean;
}

const Petal: React.FC<PetalProps> = ({ 
  petal, 
  isInteractive, 
  isHighlighted,
  onIntensityChange,
  showDetails 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [localIntensity, setLocalIntensity] = useState(petal.intensity);
  const petalRef = useRef<SVGGElement>(null);

  // Create petal path (teardrop shape)
  const createPetalPath = (size: number, intensity: number) => {
    const baseSize = size;
    const extendedSize = baseSize + (intensity * baseSize * 0.5);
    const width = baseSize * 0.4;
    
    return `
      M 0,0
      Q ${width},${extendedSize * 0.3} ${width},${extendedSize * 0.6}
      T 0,${extendedSize}
      Q -${width},${extendedSize * 0.6} -${width},${extendedSize * 0.3}
      T 0,0
    `;
  };

  const handleDrag = (event: any, info: PanInfo) => {
    if (!isInteractive) return;
    
    // Calculate distance from center
    const distance = Math.sqrt(info.point.x ** 2 + info.point.y ** 2);
    const maxDistance = 200;
    const newIntensity = Math.min(1, Math.max(0, distance / maxDistance));
    
    setLocalIntensity(newIntensity);
    onIntensityChange(petal.id, newIntensity);
  };

  return (
    <motion.g
      ref={petalRef}
      transform={`rotate(${petal.angle})`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: isHighlighted ? 1.1 : 1,
        opacity: 1 
      }}
      transition={{ 
        duration: 0.5,
        delay: petal.angle / 360 * 0.3 
      }}
    >
      <motion.path
        d={createPetalPath(80, localIntensity)}
        fill={petal.color}
        fillOpacity={0.3 + localIntensity * 0.5}
        stroke={petal.color}
        strokeWidth={isHighlighted ? 3 : 1}
        style={{
          filter: isHighlighted ? `drop-shadow(0 0 20px ${ELEMENT_COLORS[petal.element].glow})` : 'none',
          cursor: isInteractive ? 'grab' : 'default'
        }}
        drag={isInteractive}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDrag={handleDrag}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
        whileHover={isInteractive ? { scale: 1.05 } : {}}
        whileDrag={{ scale: 1.1 }}
      />
      
      {showDetails && localIntensity > 0.3 && (
        <g transform={`rotate(-${petal.angle})`}>
          <foreignObject x={-40} y={60} width={80} height={60}>
            <div className="text-xs text-center text-white bg-black/50 rounded px-1 py-0.5">
              <div className="font-semibold">{petal.essence}</div>
              <div className="opacity-75">{Math.round(localIntensity * 100)}%</div>
            </div>
          </foreignObject>
        </g>
      )}
    </motion.g>
  );
};

// ============================================
// Aether Center Component
// ============================================

interface AetherCenterProps {
  intensity: number;
  stage?: 1 | 2 | 3; // Aether stage if applicable
  isInteractive: boolean;
  isHighlighted?: boolean;
  onIntensityChange: (intensity: number) => void;
  showDetails?: boolean;
}

const AetherCenter: React.FC<AetherCenterProps> = ({ 
  intensity, 
  stage,
  isInteractive, 
  isHighlighted = false,
  onIntensityChange,
  showDetails = true
}) => {
  const [localIntensity, setLocalIntensity] = useState(intensity);
  const [aetherStage, setAetherStage] = useState<1 | 2 | 3>(stage || 1);

  const handleClick = () => {
    if (!isInteractive) return;
    // Cycle through stages: 0 -> 1 -> 2 -> 3 -> 0
    if (localIntensity === 0) {
      setLocalIntensity(0.33);
      setAetherStage(1);
      onIntensityChange(0.33);
    } else if (aetherStage === 1) {
      setLocalIntensity(0.66);
      setAetherStage(2);
      onIntensityChange(0.66);
    } else if (aetherStage === 2) {
      setLocalIntensity(1);
      setAetherStage(3);
      onIntensityChange(1);
    } else {
      setLocalIntensity(0);
      setAetherStage(1);
      onIntensityChange(0);
    }
  };

  const getAetherText = () => {
    if (localIntensity === 0) return 'AETHER';
    switch (aetherStage) {
      case 1: return 'EXPANSION';
      case 2: return 'CONTRACTION';
      case 3: return 'STILLNESS';
      default: return 'AETHER';
    }
  };

  const getAetherColor = () => {
    if (isHighlighted) return '#FFFFFF';
    switch (aetherStage) {
      case 1: return '#E0E0E0'; // Expansive - silver-white
      case 2: return '#CCCCCC'; // Contractive - grey-silver
      case 3: return '#FFFFFF'; // Stillness - pure white
      default: return '#E0E0E0';
    }
  };

  return (
    <motion.g>
      {/* Outer glow ring for highlighted state */}
      {isHighlighted && (
        <motion.circle
          r={50}
          fill="none"
          stroke="white"
          strokeWidth={1}
          opacity={0.5}
          animate={{
            r: [45, 55, 45],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
      
      {/* Main Aether circle */}
      <motion.circle
        r={30 + localIntensity * 15}
        fill="url(#aetherGradient)"
        fillOpacity={0.3 + localIntensity * 0.5}
        stroke={getAetherColor()}
        strokeWidth={isHighlighted ? 3 : 2}
        style={{
          filter: isHighlighted 
            ? `drop-shadow(0 0 30px rgba(255, 255, 255, 0.9))`
            : `drop-shadow(0 0 ${10 + localIntensity * 20}px rgba(255, 255, 255, 0.6))`,
          cursor: isInteractive ? 'pointer' : 'default'
        }}
        onClick={handleClick}
        whileHover={isInteractive ? { scale: 1.1 } : {}}
        animate={{
          scale: isHighlighted ? [1.1, 1.15, 1.1] : [1, 1.05, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Aether text */}
      <text
        y={localIntensity > 0 ? 0 : 5}
        textAnchor="middle"
        fill="white"
        fontSize={localIntensity > 0 ? "10" : "12"}
        fontWeight="bold"
        style={{ pointerEvents: 'none' }}
      >
        {getAetherText()}
      </text>
      
      {/* Stage indicator */}
      {localIntensity > 0 && showDetails && (
        <text
          y={15}
          textAnchor="middle"
          fill="white"
          fontSize="8"
          opacity="0.7"
          style={{ pointerEvents: 'none' }}
        >
          Stage {aetherStage}
        </text>
      )}
    </motion.g>
  );
};

// ============================================
// Main HoloflowerViz Component
// ============================================

export const HoloflowerViz: React.FC<HoloflowerVizProps> = ({
  mode = 'checkin',
  onPetalChange,
  oracleHighlight,
  userIntensities = {},
  className = '',
  showAetherDetails = true
}) => {
  const [petalIntensities, setPetalIntensities] = useState<Record<string, number>>(userIntensities);
  const [aetherIntensity, setAetherIntensity] = useState(0);
  const [aetherStage, setAetherStage] = useState<1 | 2 | 3>(1);
  const [showDetails, setShowDetails] = useState(true);
  
  const isInteractive = mode === 'checkin';
  const isAetherHighlighted = oracleHighlight?.element === 'aether';

  // Initialize petals with user intensities
  useEffect(() => {
    setPetalIntensities(userIntensities);
  }, [userIntensities]);

  const handlePetalIntensityChange = (petalId: string, intensity: number) => {
    const newIntensities = {
      ...petalIntensities,
      [petalId]: intensity
    };
    setPetalIntensities(newIntensities);
    
    if (onPetalChange) {
      onPetalChange(newIntensities);
    }
  };

  const handleAetherChange = (intensity: number) => {
    setAetherIntensity(intensity);
    if (onPetalChange) {
      onPetalChange({
        ...petalIntensities,
        Aether: intensity
      });
    }
  };

  const isPetalHighlighted = (petal: PetalData) => {
    if (!oracleHighlight) return false;
    // Don't highlight petals if Aether is selected
    if (oracleHighlight.element === 'aether') return false;
    return petal.element === oracleHighlight.element && 
           petal.stage === oracleHighlight.stage;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Controls */}
      <div className="absolute top-0 right-0 z-10 space-y-2">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="px-3 py-1 bg-black/50 text-white rounded text-sm hover:bg-black/70 transition-colors"
        >
          {showDetails ? 'Hide' : 'Show'} Details
        </button>
        
        {isInteractive && (
          <button
            onClick={() => {
              setPetalIntensities({});
              setAetherIntensity(0);
              if (onPetalChange) {
                onPetalChange({});
              }
            }}
            className="px-3 py-1 bg-red-500/50 text-white rounded text-sm hover:bg-red-500/70 transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* SVG Holoflower */}
      <svg 
        width="500" 
        height="500" 
        viewBox="-250 -250 500 500"
        className="w-full h-full"
      >
        {/* Definitions */}
        <defs>
          <radialGradient id="aetherGradient">
            <stop offset="0%" stopColor="white" stopOpacity="0.8" />
            <stop offset="50%" stopColor="purple" stopOpacity="0.5" />
            <stop offset="100%" stopColor="indigo" stopOpacity="0.2" />
          </radialGradient>
          
          {/* Element gradients */}
          {Object.entries(ELEMENT_COLORS).map(([element, colors]) => (
            <radialGradient key={element} id={`${element}Gradient`}>
              <stop offset="0%" stopColor={colors.gradient[0]} />
              <stop offset="50%" stopColor={colors.gradient[1]} />
              <stop offset="100%" stopColor={colors.gradient[2]} />
            </radialGradient>
          ))}
        </defs>

        {/* Background circle */}
        <circle 
          r="240" 
          fill="none" 
          stroke="white" 
          strokeWidth="0.5" 
          opacity="0.2"
        />

        {/* Spiral guides */}
        {[1, 2, 3].map(stage => (
          <circle
            key={stage}
            r={60 * stage}
            fill="none"
            stroke="white"
            strokeWidth="0.5"
            opacity="0.1"
            strokeDasharray="5,5"
          />
        ))}

        {/* Petals */}
        <g>
          {PETALS.map(petal => (
            <Petal
              key={petal.id}
              petal={{
                ...petal,
                intensity: petalIntensities[petal.id] || 0
              }}
              isInteractive={isInteractive}
              isHighlighted={isPetalHighlighted(petal)}
              onIntensityChange={handlePetalIntensityChange}
              showDetails={showDetails}
            />
          ))}
        </g>

        {/* Aether Center */}
        <AetherCenter
          intensity={aetherIntensity}
          stage={isAetherHighlighted ? oracleHighlight?.stage as (1 | 2 | 3) : aetherStage}
          isInteractive={isInteractive}
          isHighlighted={isAetherHighlighted}
          onIntensityChange={handleAetherChange}
          showDetails={showAetherDetails && showDetails}
        />
      </svg>

      {/* Mode indicator */}
      <div className="absolute bottom-0 left-0 px-3 py-1 bg-black/50 text-white rounded text-sm">
        Mode: {mode === 'checkin' ? 'Check-In (Interactive)' : 
               mode === 'reading' ? 'Oracle Reading' : 
               'Merged View'}
        {isAetherHighlighted && (
          <span className="ml-2 text-xs opacity-75">
            | Aether Stage {oracleHighlight?.stage}
          </span>
        )}
      </div>

      {/* Instructions */}
      {isInteractive && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-center text-white bg-black/70 px-4 py-2 rounded"
        >
          <p className="text-sm">Drag petals outward to increase intensity</p>
          <p className="text-xs opacity-75">Click Aether to toggle center</p>
        </motion.div>
      )}
    </div>
  );
};

export default HoloflowerViz;