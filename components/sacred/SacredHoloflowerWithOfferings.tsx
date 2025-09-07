'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SacredHoloflower } from './SacredHoloflower';
import { useMotionState, useAetherState } from '@/lib/state/sacred-store';

interface OfferingOrb {
  id: string;
  element: 'Fire' | 'Water' | 'Earth' | 'Air';
  hasAether: boolean;
  coherence: number;
  title: string;
  angle: number; // Orbital position
  distance: number; // From center
  size: number;
  opacity: number;
  pulseIntensity: number;
}

interface SacredHoloflowerWithOfferingsProps {
  offerings: Array<{
    id: string;
    title: string;
    element: 'Fire' | 'Water' | 'Earth' | 'Air';
    aetherDetected: boolean;
    coherence: number;
  }>;
  onOfferingClick?: (offering: any) => void;
  className?: string;
}

export function SacredHoloflowerWithOfferings({
  offerings,
  onOfferingClick,
  className = ''
}: SacredHoloflowerWithOfferingsProps) {
  const [orbitingOfferings, setOrbitingOfferings] = useState<OfferingOrb[]>([]);
  const [newOffering, setNewOffering] = useState<OfferingOrb | null>(null);
  const animationRef = useRef<number>();
  const { coherence } = useMotionState();
  const { active: aetherActive, stage: aetherStage } = useAetherState();

  // Convert offerings to orbiting orbs
  useEffect(() => {
    const orbs = offerings.map((offering, index) => ({
      id: offering.id,
      element: offering.element,
      hasAether: offering.aetherDetected,
      coherence: offering.coherence,
      title: offering.title,
      angle: (index * (360 / offerings.length)) * (Math.PI / 180),
      distance: 180 + (offering.coherence * 60), // Distance based on coherence
      size: 8 + (offering.coherence * 12), // Size based on coherence
      opacity: 0.6 + (offering.coherence * 0.4),
      pulseIntensity: offering.aetherDetected ? 1.5 : 1
    }));
    
    setOrbitingOfferings(orbs);
  }, [offerings]);

  // Animate orbital motion
  useEffect(() => {
    let rotationSpeed = 0.001; // Base speed
    if (aetherActive) rotationSpeed *= (1 + aetherStage);
    
    const animate = () => {
      setOrbitingOfferings(prev => prev.map(orb => ({
        ...orb,
        angle: orb.angle + rotationSpeed
      })));
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [aetherActive, aetherStage]);

  // Handle new offering integration
  const integrateOffering = (offering: any) => {
    // Create temporary orb that spirals into the center
    const tempOrb: OfferingOrb = {
      id: `temp_${Date.now()}`,
      element: offering.element,
      hasAether: offering.hasAether,
      coherence: offering.coherence,
      title: offering.title,
      angle: Math.random() * Math.PI * 2,
      distance: 400, // Start far out
      size: 20,
      opacity: 1,
      pulseIntensity: offering.hasAether ? 2 : 1
    };
    
    setNewOffering(tempOrb);
    
    // Animate spiral into center, then integrate
    setTimeout(() => {
      setNewOffering(null);
      // Add to permanent orbital offerings (would update from parent)
    }, 3000);
  };

  const getElementColor = (element: string) => {
    switch (element) {
      case 'Fire': return '#ff6b35';
      case 'Water': return '#4ecdc4';
      case 'Earth': return '#45b7d1';
      case 'Air': return '#a8e6cf';
      default: return '#d4af37';
    }
  };

  const getElementGradient = (element: string) => {
    switch (element) {
      case 'Fire': return 'radial-gradient(circle, #ff6b35, #ff4757)';
      case 'Water': return 'radial-gradient(circle, #4ecdc4, #00d2d3)';
      case 'Earth': return 'radial-gradient(circle, #45b7d1, #2c3e50)';
      case 'Air': return 'radial-gradient(circle, #a8e6cf, #dcedc1)';
      default: return 'radial-gradient(circle, #d4af37, #f39c12)';
    }
  };

  return (
    <div className={`relative ${className}`} style={{ width: '100%', height: '100%' }}>
      {/* Sacred Holoflower at center */}
      <SacredHoloflower 
        className="absolute inset-0"
        size="full"
      />
      
      {/* Orbiting offering orbs */}
      <div className="absolute inset-0 pointer-events-none">
        {orbitingOfferings.map((orb) => {
          const x = 50 + (Math.cos(orb.angle) * orb.distance / 10); // Percentage from center
          const y = 50 + (Math.sin(orb.angle) * orb.distance / 10);
          
          return (
            <motion.div
              key={orb.id}
              className="absolute pointer-events-auto cursor-pointer"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
                width: `${orb.size}px`,
                height: `${orb.size}px`
              }}
              onClick={() => onOfferingClick?.(orb)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              {/* Orb glow */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: getElementGradient(orb.element),
                  filter: 'blur(4px)',
                  opacity: orb.opacity * 0.7
                }}
                animate={{
                  scale: [1, orb.pulseIntensity, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
              
              {/* Orb core */}
              <motion.div
                className="absolute inset-0 rounded-full border"
                style={{
                  background: getElementGradient(orb.element),
                  borderColor: getElementColor(orb.element),
                  borderWidth: '1px',
                  opacity: orb.opacity
                }}
                animate={{
                  boxShadow: [
                    `0 0 10px ${getElementColor(orb.element)}`,
                    `0 0 20px ${getElementColor(orb.element)}`,
                    `0 0 10px ${getElementColor(orb.element)}`
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
              
              {/* Aether indicator */}
              {orb.hasAether && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(230, 213, 255, 0.3), transparent)',
                    border: '1px solid rgba(230, 213, 255, 0.6)'
                  }}
                  animate={{
                    scale: [1.2, 1.5, 1.2],
                    opacity: [0.6, 1, 0.6]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity
                  }}
                />
              )}
              
              {/* Coherence ring */}
              <motion.div
                className="absolute rounded-full border-2"
                style={{
                  width: `${orb.size + 10}px`,
                  height: `${orb.size + 10}px`,
                  left: '-5px',
                  top: '-5px',
                  borderColor: getElementColor(orb.element),
                  borderStyle: 'dashed',
                  opacity: orb.coherence
                }}
                animate={{
                  rotate: 360
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              />
            </motion.div>
          );
        })}
      </div>
      
      {/* New offering integration animation */}
      <AnimatePresence>
        {newOffering && (
          <motion.div
            className="absolute"
            initial={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              x: Math.cos(newOffering.angle) * 400,
              y: Math.sin(newOffering.angle) * 400,
              scale: 1.5,
              opacity: 1
            }}
            animate={{
              x: 0,
              y: 0,
              scale: [1.5, 0.5, 0],
              rotate: [0, 720, 1080]
            }}
            exit={{
              scale: 0,
              opacity: 0
            }}
            transition={{
              duration: 3,
              ease: 'easeInOut'
            }}
          >
            <div
              style={{
                width: `${newOffering.size}px`,
                height: `${newOffering.size}px`,
                background: getElementGradient(newOffering.element),
                borderRadius: '50%',
                filter: `drop-shadow(0 0 20px ${getElementColor(newOffering.element)})`
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Sacred field enhancement from offerings */}
      {orbitingOfferings.length > 0 && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle, transparent 40%, rgba(212, 175, 55, 0.1) 60%, transparent 80%)`,
          }}
          animate={{
            opacity: [0.5, 0.8, 0.5],
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      )}
    </div>
  );
}

// Export integration function for parent components
export const integrateNewOffering = (
  holoflowerRef: React.RefObject<any>,
  offering: any
) => {
  if (holoflowerRef.current) {
    holoflowerRef.current.integrateOffering(offering);
  }
};