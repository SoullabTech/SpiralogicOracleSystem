'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ElementalAnimationProps {
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ElementalAnimation({ 
  element, 
  size = 'md', 
  className = '' 
}: ElementalAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24', 
    lg: 'w-32 h-32'
  };

  const animations = {
    fire: {
      container: {
        background: 'radial-gradient(circle, rgba(220,38,38,0.2) 0%, rgba(248,113,113,0.1) 50%, transparent 100%)',
        borderRadius: '50%'
      },
      symbol: {
        initial: { scale: 0.8, opacity: 0 },
        animate: { 
          scale: [0.8, 1.1, 1],
          opacity: 1,
          transition: {
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse" as const,
            ease: "easeInOut"
          }
        }
      },
      particles: Array.from({ length: 6 }, (_, i) => ({
        initial: { y: 0, opacity: 0, scale: 0 },
        animate: {
          y: [-20, -40, -60],
          opacity: [0, 1, 0],
          scale: [0, 1, 0.5],
          transition: {
            duration: 3,
            delay: i * 0.3,
            repeat: Infinity,
            ease: "easeOut"
          }
        }
      }))
    },
    water: {
      container: {
        background: 'radial-gradient(circle, rgba(29,78,216,0.2) 0%, rgba(96,165,250,0.1) 50%, transparent 100%)',
        borderRadius: '50%'
      },
      symbol: {
        initial: { scale: 1 },
        animate: {
          scale: [1, 1.05, 1],
          transition: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }
      },
      ripples: Array.from({ length: 3 }, (_, i) => ({
        initial: { scale: 0, opacity: 0.8 },
        animate: {
          scale: [0, 2, 3],
          opacity: [0.8, 0.3, 0],
          transition: {
            duration: 3,
            delay: i * 1,
            repeat: Infinity,
            ease: "easeOut"
          }
        }
      }))
    },
    earth: {
      container: {
        background: 'radial-gradient(circle, rgba(146,64,14,0.2) 0%, rgba(161,98,7,0.1) 50%, transparent 100%)',
        borderRadius: '50%'
      },
      symbol: {
        initial: { y: 0 },
        animate: {
          y: [0, -2, 0],
          transition: {
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }
      },
      crystals: Array.from({ length: 4 }, (_, i) => ({
        initial: { opacity: 0.3, scale: 0.8 },
        animate: {
          opacity: [0.3, 0.8, 0.3],
          scale: [0.8, 1, 0.8],
          transition: {
            duration: 4,
            delay: i * 0.5,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }
      }))
    },
    air: {
      container: {
        background: 'radial-gradient(circle, rgba(3,105,161,0.2) 0%, rgba(56,189,248,0.1) 50%, transparent 100%)',
        borderRadius: '50%'
      },
      symbol: {
        initial: { x: 0 },
        animate: {
          x: [0, 3, -3, 0],
          transition: {
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }
      },
      wisps: Array.from({ length: 5 }, (_, i) => ({
        initial: { x: 0, opacity: 0 },
        animate: {
          x: [0, 20, 40],
          opacity: [0, 0.6, 0],
          transition: {
            duration: 4,
            delay: i * 0.8,
            repeat: Infinity,
            ease: "easeOut"
          }
        }
      }))
    },
    aether: {
      container: {
        background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, rgba(139,92,246,0.1) 50%, transparent 100%)',
        borderRadius: '50%'
      },
      symbol: {
        initial: { scale: 1, rotate: 0 },
        animate: {
          scale: [1, 1.1, 1],
          rotate: [0, 360],
          transition: {
            scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 20, repeat: Infinity, ease: "linear" }
          }
        }
      },
      orbit: Array.from({ length: 8 }, (_, i) => ({
        initial: { rotate: i * 45, scale: 0 },
        animate: {
          rotate: [i * 45, i * 45 + 360],
          scale: [0, 1, 0],
          transition: {
            rotate: { duration: 15, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, delay: i * 0.2, repeat: Infinity, ease: "easeInOut" }
          }
        }
      }))
    }
  };

  const currentAnimation = animations[element];
  
  const elementSymbols = {
    fire: '◆',
    water: '◊', 
    earth: '◾',
    air: '◈',
    aether: '◯'
  };

  const elementColors = {
    fire: 'text-red-500',
    water: 'text-blue-500',
    earth: 'text-amber-700',
    air: 'text-sky-500',
    aether: 'text-purple-500'
  };

  if (!isVisible) return null;

  return (
    <div className={`relative flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      {/* Container with background */}
      <div 
        className="absolute inset-0"
        style={currentAnimation.container}
      />
      
      {/* Element-specific animations */}
      {element === 'fire' && (
        <>
          {/* Fire particles */}
          {currentAnimation.particles.map((particle, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-red-400 rounded-full"
              style={{
                left: `${50 + (i - 3) * 8}%`,
                top: '50%'
              }}
              {...particle}
            />
          ))}
        </>
      )}

      {element === 'water' && (
        <>
          {/* Water ripples */}
          {currentAnimation.ripples.map((ripple, i) => (
            <motion.div
              key={i}
              className="absolute border border-blue-300 rounded-full"
              style={{
                width: '100%',
                height: '100%',
                left: '50%',
                top: '50%',
                marginLeft: '-50%',
                marginTop: '-50%'
              }}
              {...ripple}
            />
          ))}
        </>
      )}

      {element === 'earth' && (
        <>
          {/* Earth crystals */}
          {currentAnimation.crystals.map((crystal, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-amber-600 transform rotate-45"
              style={{
                left: `${30 + i * 15}%`,
                top: `${30 + (i % 2) * 20}%`
              }}
              {...crystal}
            />
          ))}
        </>
      )}

      {element === 'air' && (
        <>
          {/* Air wisps */}
          {currentAnimation.wisps.map((wisp, i) => (
            <motion.div
              key={i}
              className="absolute w-8 h-0.5 bg-sky-300 rounded-full opacity-60"
              style={{
                left: '20%',
                top: `${40 + i * 5}%`
              }}
              {...wisp}
            />
          ))}
        </>
      )}

      {element === 'aether' && (
        <>
          {/* Aether orbital points */}
          {currentAnimation.orbit.map((point, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-purple-400 rounded-full"
              style={{
                left: '50%',
                top: '20%',
                marginLeft: '-2px',
                transformOrigin: '2px 50px'
              }}
              {...point}
            />
          ))}
        </>
      )}

      {/* Central symbol */}
      <motion.div
        className={`relative z-10 text-4xl font-bold ${elementColors[element]} filter drop-shadow-lg`}
        {...currentAnimation.symbol}
      >
        {elementSymbols[element]}
      </motion.div>
    </div>
  );
}