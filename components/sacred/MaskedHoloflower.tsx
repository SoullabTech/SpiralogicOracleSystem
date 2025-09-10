import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface MaskedHoloflowerProps {
  size?: number;
  activePetals?: number[];
  onPetalClick?: (petalIndex: number) => void;
  interactive?: boolean;
}

// Define clip paths for each of the 12 petals
const PETAL_MASKS = [
  // Earth petals (yellow/gold) - Top left quadrant
  {
    id: 'earth-1',
    clipPath: 'polygon(50% 50%, 30% 10%, 20% 15%, 15% 25%, 20% 40%, 35% 45%)',
    transform: 'rotate(210deg)',
    color: '#D4AF37',
  },
  {
    id: 'earth-2', 
    clipPath: 'polygon(50% 50%, 35% 15%, 25% 20%, 20% 30%, 25% 40%, 38% 43%)',
    transform: 'rotate(230deg)',
    color: '#B8941F',
  },
  {
    id: 'earth-3',
    clipPath: 'polygon(50% 50%, 40% 20%, 30% 25%, 25% 35%, 30% 42%, 42% 45%)',
    transform: 'rotate(250deg)',
    color: '#947013',
  },
  
  // Fire petals (red/coral) - Top right quadrant  
  {
    id: 'fire-1',
    clipPath: 'polygon(50% 50%, 60% 20%, 70% 25%, 75% 35%, 70% 42%, 58% 45%)',
    transform: 'rotate(290deg)',
    color: '#CD8A7A',
  },
  {
    id: 'fire-2',
    clipPath: 'polygon(50% 50%, 65% 15%, 75% 20%, 80% 30%, 75% 40%, 62% 43%)',
    transform: 'rotate(310deg)', 
    color: '#B56C5A',
  },
  {
    id: 'fire-3',
    clipPath: 'polygon(50% 50%, 70% 10%, 80% 15%, 85% 25%, 80% 40%, 65% 45%)',
    transform: 'rotate(330deg)',
    color: '#9D4E3A',
  },
  
  // Water petals (blue) - Bottom right quadrant
  {
    id: 'water-1',
    clipPath: 'polygon(50% 50%, 70% 90%, 80% 85%, 85% 75%, 80% 60%, 65% 55%)',
    transform: 'rotate(30deg)',
    color: '#3F8BAB',
  },
  {
    id: 'water-2',
    clipPath: 'polygon(50% 50%, 65% 85%, 75% 80%, 80% 70%, 75% 60%, 62% 57%)',
    transform: 'rotate(50deg)',
    color: '#5FA3BF',
  },
  {
    id: 'water-3',
    clipPath: 'polygon(50% 50%, 60% 80%, 70% 75%, 75% 65%, 70% 58%, 58% 55%)',
    transform: 'rotate(70deg)',
    color: '#7FBBD3',
  },
  
  // Air petals (green) - Bottom left quadrant
  {
    id: 'air-1',
    clipPath: 'polygon(50% 50%, 40% 80%, 30% 75%, 25% 65%, 30% 58%, 42% 55%)',
    transform: 'rotate(110deg)',
    color: '#4A6B35',
  },
  {
    id: 'air-2',
    clipPath: 'polygon(50% 50%, 35% 85%, 25% 80%, 20% 70%, 25% 60%, 38% 57%)',
    transform: 'rotate(130deg)',
    color: '#62834D',
  },
  {
    id: 'air-3',
    clipPath: 'polygon(50% 50%, 30% 90%, 20% 85%, 15% 75%, 20% 60%, 35% 55%)',
    transform: 'rotate(150deg)',
    color: '#7A9B65',
  },
];

export const MaskedHoloflower: React.FC<MaskedHoloflowerProps> = ({
  size = 400,
  activePetals = [],
  onPetalClick,
  interactive = true,
}) => {
  const [hoveredPetal, setHoveredPetal] = useState<number | null>(null);
  const [selectedPetals, setSelectedPetals] = useState<number[]>(activePetals);

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

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Base image with white removed via CSS */}
      <div 
        className="absolute inset-0"
        style={{
          filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.2))',
          mixBlendMode: 'multiply'
        }}
      >
        <Image
          src="/Users/andreanezat/Desktop/SpiralogicHoloflower_nobg.png"
          alt="Holoflower"
          width={size}
          height={size}
          className="object-contain"
          style={{
            // Remove white background using CSS filters
            filter: 'contrast(1.2) brightness(1.1)',
          }}
        />
      </div>
      
      {/* Individual petal overlays for interaction */}
      {PETAL_MASKS.map((petal, index) => {
        const isActive = selectedPetals.includes(index);
        const isHovered = hoveredPetal === index;
        
        return (
          <motion.div
            key={petal.id}
            className="absolute inset-0"
            style={{
              clipPath: petal.clipPath,
              transformOrigin: 'center',
            }}
            animate={{
              scale: isActive ? 1.1 : isHovered ? 1.05 : 1,
              opacity: isActive ? 1 : isHovered ? 0.9 : 0,
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onHoverStart={() => setHoveredPetal(index)}
            onHoverEnd={() => setHoveredPetal(null)}
            onClick={() => handlePetalClick(index)}
          >
            {/* Highlight overlay */}
            <div
              className="w-full h-full"
              style={{
                background: `radial-gradient(circle at center, ${petal.color}88, ${petal.color}44)`,
                mixBlendMode: 'screen',
                cursor: interactive ? 'pointer' : 'default',
              }}
            />
          </motion.div>
        );
      })}
      
      {/* Center glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        style={{
          width: size * 0.15,
          height: size * 0.15,
          background: 'radial-gradient(circle, #FFD700, transparent)',
          filter: 'blur(8px)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.6, 0.8, 0.6],
        }}
        transition={{
          repeat: Infinity,
          duration: 3,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};

export default MaskedHoloflower;