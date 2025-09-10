import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedHoloflowerProps {
  size?: number;
  activePetals?: number[];
  onPetalClick?: (petalIndex: number) => void;
  animationMode?: 'breathing' | 'rotating' | 'pulsing' | 'static';
  showLabels?: boolean;
  interactive?: boolean;
}

const PETAL_DATA = [
  { id: 'earth-1', element: 'earth', color: '#D4AF37', label: 'Grounding', index: 0 },
  { id: 'earth-2', element: 'earth', color: '#B8941F', label: 'Stability', index: 1 },
  { id: 'earth-3', element: 'earth', color: '#947013', label: 'Foundation', index: 2 },
  { id: 'fire-1', element: 'fire', color: '#CD8A7A', label: 'Passion', index: 3 },
  { id: 'fire-2', element: 'fire', color: '#B56C5A', label: 'Energy', index: 4 },
  { id: 'fire-3', element: 'fire', color: '#9D4E3A', label: 'Transformation', index: 5 },
  { id: 'water-1', element: 'water', color: '#7FBBD3', label: 'Flow', index: 6 },
  { id: 'water-2', element: 'water', color: '#5FA3BF', label: 'Emotion', index: 7 },
  { id: 'water-3', element: 'water', color: '#3F8BAB', label: 'Intuition', index: 8 },
  { id: 'air-1', element: 'air', color: '#7A9B65', label: 'Thought', index: 9 },
  { id: 'air-2', element: 'air', color: '#62834D', label: 'Communication', index: 10 },
  { id: 'air-3', element: 'air', color: '#4A6B35', label: 'Clarity', index: 11 },
];

export const AnimatedHoloflower: React.FC<AnimatedHoloflowerProps> = ({
  size = 400,
  activePetals = [],
  onPetalClick,
  animationMode = 'breathing',
  showLabels = false,
  interactive = true,
}) => {
  const [hoveredPetal, setHoveredPetal] = useState<number | null>(null);
  const [selectedPetals, setSelectedPetals] = useState<number[]>(activePetals);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setSelectedPetals(activePetals);
  }, [activePetals]);

  const handlePetalClick = (index: number) => {
    if (!interactive) return;
    
    setSelectedPetals(prev => {
      const newSelection = prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index];
      return newSelection;
    });
    
    onPetalClick?.(index);
  };

  const getPetalAnimation = (index: number) => {
    const isActive = selectedPetals.includes(index);
    const isHovered = hoveredPetal === index;
    
    switch (animationMode) {
      case 'breathing':
        return {
          scale: isActive ? [1, 1.1, 1] : isHovered ? 1.05 : 1,
          opacity: isActive ? 1 : isHovered ? 0.9 : 0.7,
          transition: {
            scale: {
              repeat: isActive ? Infinity : 0,
              duration: 2,
              ease: "easeInOut"
            },
            opacity: { duration: 0.3 }
          }
        };
      
      case 'rotating':
        return {
          rotate: isActive ? 360 : 0,
          scale: isHovered ? 1.1 : 1,
          opacity: isActive ? 1 : isHovered ? 0.9 : 0.7,
          transition: {
            rotate: {
              repeat: isActive ? Infinity : 0,
              duration: 10,
              ease: "linear"
            },
            scale: { duration: 0.3 },
            opacity: { duration: 0.3 }
          }
        };
      
      case 'pulsing':
        return {
          scale: isActive ? [1, 1.2, 1] : isHovered ? 1.1 : 1,
          opacity: isActive ? [0.7, 1, 0.7] : isHovered ? 0.9 : 0.7,
          transition: {
            scale: {
              repeat: isActive ? Infinity : 0,
              duration: 1,
              ease: "easeInOut"
            },
            opacity: {
              repeat: isActive ? Infinity : 0,
              duration: 1,
              ease: "easeInOut"
            }
          }
        };
      
      default:
        return {
          scale: isHovered ? 1.1 : 1,
          opacity: isActive ? 1 : isHovered ? 0.9 : 0.7,
          transition: { duration: 0.3 }
        };
    }
  };

  const createPetalPath = (index: number): string => {
    const angle = (index * 30) - 90; // 12 petals, 30 degrees each
    const petalSize = index % 3; // 0 = inner, 1 = middle, 2 = outer
    
    let pathData = '';
    
    switch (petalSize) {
      case 0: // Inner petal (smallest)
        pathData = `M 0,0 Q -30,-60 -35,-100 Q -35,-120 -25,-130 Q -15,-135 0,-130 Q 15,-135 25,-130 Q 35,-120 35,-100 Q 30,-60 0,0 Z`;
        break;
      case 1: // Middle petal
        pathData = `M 0,0 Q -40,-80 -45,-140 Q -45,-165 -30,-175 Q -15,-180 0,-175 Q 15,-180 30,-175 Q 45,-165 45,-140 Q 40,-80 0,0 Z`;
        break;
      case 2: // Outer petal (largest)
        pathData = `M 0,0 Q -50,-100 -55,-180 Q -55,-210 -35,-220 Q -15,-225 0,-220 Q 15,-225 35,-220 Q 55,-210 55,-180 Q 50,-100 0,0 Z`;
        break;
    }
    
    return pathData;
  };

  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <svg
        ref={svgRef}
        width={size}
        height={size}
        viewBox="0 0 400 400"
        className="absolute inset-0"
      >
        <defs>
          {/* Glow filter for active petals */}
          <filter id="petalGlow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Shadow filter */}
          <filter id="petalShadow">
            <feDropShadow dx="1" dy="1" stdDeviation="2" floodOpacity="0.3"/>
          </filter>
        </defs>
        
        {/* Render petals */}
        <g transform="translate(200, 200)">
          {PETAL_DATA.map((petal, index) => (
            <motion.g
              key={petal.id}
              animate={getPetalAnimation(index)}
              whileHover={interactive ? { scale: 1.1 } : {}}
              whileTap={interactive ? { scale: 0.95 } : {}}
              onHoverStart={() => interactive && setHoveredPetal(index)}
              onHoverEnd={() => interactive && setHoveredPetal(null)}
              onClick={() => handlePetalClick(index)}
              style={{ 
                cursor: interactive ? 'pointer' : 'default',
                transformOrigin: 'center'
              }}
            >
              <motion.path
                d={createPetalPath(index)}
                fill={petal.color}
                filter={selectedPetals.includes(index) ? "url(#petalGlow)" : "url(#petalShadow)"}
                transform={`rotate(${index * 30})`}
              />
            </motion.g>
          ))}
        </g>
        
        {/* Center circle */}
        <motion.circle
          cx="200"
          cy="200"
          r="30"
          fill="url(#centerGradient)"
          animate={{
            scale: animationMode === 'breathing' ? [1, 1.1, 1] : 1,
            opacity: [0.8, 1, 0.8]
          }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: "easeInOut"
          }}
        />
        
        {/* Inner decorative circles */}
        <circle cx="200" cy="200" r="20" fill="#FFD700" opacity="0.6" />
        <circle cx="200" cy="200" r="10" fill="#FFFFFF" opacity="0.8" />
        
        {/* Center gradient definition */}
        <defs>
          <radialGradient id="centerGradient">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#FFA500" />
          </radialGradient>
        </defs>
      </svg>
      
      {/* Labels for petals */}
      {showLabels && (
        <AnimatePresence>
          {PETAL_DATA.map((petal, index) => {
            if (!selectedPetals.includes(index) && hoveredPetal !== index) return null;
            
            const angle = (index * 30 - 90) * (Math.PI / 180);
            const radius = 150;
            const x = Math.cos(angle) * radius + 200;
            const y = Math.sin(angle) * radius + 200;
            
            return (
              <motion.div
                key={`label-${petal.id}`}
                className="absolute bg-black/80 text-white text-xs px-2 py-1 rounded-full pointer-events-none"
                style={{
                  left: x - 40,
                  top: y - 10,
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                {petal.label}
              </motion.div>
            );
          })}
        </AnimatePresence>
      )}
    </div>
  );
};

export default AnimatedHoloflower;