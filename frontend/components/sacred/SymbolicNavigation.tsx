'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface SacredSymbol {
  glyph: string;
  essence: string;
  realm: string;
  frequency: number;
  geometry: string;
}

interface SymbolicNavigationProps {
  currentRealm?: string;
  userCoherence?: number;
  onSymbolActivate?: (symbol: SacredSymbol) => void;
}

export const SymbolicNavigation: React.FC<SymbolicNavigationProps> = ({
  currentRealm = 'guide',
  userCoherence = 0.7,
  onSymbolActivate
}) => {
  const router = useRouter();
  const [activeSymbol, setActiveSymbol] = useState<string | null>(null);
  const [breathPhase, setBreathPhase] = useState(0);

  // Sacred symbol definitions - pure intelligence
  const sacredSymbols: SacredSymbol[] = [
    {
      glyph: '🧭',
      essence: 'Guide Consciousness',
      realm: '/dashboard',
      frequency: 528, // Love frequency
      geometry: 'hexagon'
    },
    {
      glyph: '🌺',
      essence: 'Living Holoflower',
      realm: '/dashboard/holoflower',
      frequency: 741, // Awakening frequency
      geometry: 'octagon'
    },
    {
      glyph: '✨',
      essence: 'Cosmic Timing',
      realm: '/dashboard/astrology',
      frequency: 963, // Pineal activation
      geometry: 'pentagram'
    },
    {
      glyph: '📔',
      essence: 'Memory Palace',
      realm: '/dashboard/journal',
      frequency: 432, // Earth resonance
      geometry: 'square'
    },
    {
      glyph: '🎙️',
      essence: 'Voice Portal',
      realm: '/dashboard/voice',
      frequency: 396, // Liberation frequency
      geometry: 'triangle'
    }
  ];

  // Continuous breath rhythm for symbol animation
  useEffect(() => {
    const breathCycle = () => {
      setBreathPhase(prev => (prev + 0.01) % (Math.PI * 2));
      requestAnimationFrame(breathCycle);
    };
    
    const animation = requestAnimationFrame(breathCycle);
    return () => cancelAnimationFrame(animation);
  }, []);

  // Navigate through symbolic intelligence
  const activateSymbol = (symbol: SacredSymbol) => {
    setActiveSymbol(symbol.glyph);
    onSymbolActivate?.(symbol);
    
    // Haptic feedback simulation
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50]);
    }
    
    // Navigate after portal animation
    setTimeout(() => {
      router.push(symbol.realm);
      setActiveSymbol(null);
    }, 800);
  };

  // Sacred geometry calculations
  const getSymbolPosition = (index: number, total: number) => {
    const angle = (index * 360 / total) * Math.PI / 180;
    const radius = 120;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return { x, y, angle };
  };

  // Symbol morphing based on coherence and breath
  const getSymbolAnimation = (symbol: SacredSymbol, index: number) => {
    const isActive = activeSymbol === symbol.glyph;
    const isCurrent = currentRealm.includes(symbol.realm.split('/').pop() || '');
    const breathInfluence = Math.sin(breathPhase + index * 0.5) * 0.1;
    const coherenceScale = 0.8 + userCoherence * 0.4;
    
    return {
      scale: isActive ? 1.5 : isCurrent ? 1.2 + breathInfluence : 1 + breathInfluence * 0.5,
      rotate: isActive ? 360 : breathPhase * 10,
      opacity: isActive ? 1 : isCurrent ? 0.9 : 0.6 + userCoherence * 0.4,
      filter: isActive ? 'brightness(1.5) saturate(1.3)' : 
              isCurrent ? 'brightness(1.2)' : 'brightness(0.8)',
      transition: {
        scale: { duration: isActive ? 0.8 : 2, ease: "easeInOut" },
        rotate: { duration: isActive ? 0.8 : 8, ease: "linear" },
        opacity: { duration: 1.5 },
        filter: { duration: 0.5 }
      }
    };
  };

  // Portal emergence effect
  const getPortalEffect = (symbol: SacredSymbol) => {
    if (activeSymbol !== symbol.glyph) return null;
    
    return (
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: [0, 0.8, 0],
          scale: [0, 2, 4],
          rotate: 360
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div 
          className="w-full h-full rounded-full border-2 border-white"
          style={{ 
            clipPath: symbol.geometry === 'hexagon' ? 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)' :
                     symbol.geometry === 'octagon' ? 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' :
                     symbol.geometry === 'pentagram' ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' :
                     symbol.geometry === 'square' ? 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' :
                     'polygon(50% 0%, 100% 100%, 0% 100%)'
          }}
        />
      </motion.div>
    );
  };

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
      
      {/* Mycelial Connection Field */}
      <div className="relative w-80 h-24">
        
        {/* Sacred Symbol Grid */}
        <div className="flex justify-center items-center space-x-8">
          {sacredSymbols.map((symbol, index) => {
            const isActive = activeSymbol === symbol.glyph;
            const isCurrent = currentRealm.includes(symbol.realm.split('/').pop() || '');
            
            return (
              <motion.div
                key={symbol.glyph}
                className="relative group cursor-pointer"
                onClick={() => activateSymbol(symbol)}
                onHoverStart={() => setActiveSymbol(symbol.glyph)}
                onHoverEnd={() => setActiveSymbol(null)}
                {...getSymbolAnimation(symbol, index)}
              >
                
                {/* Symbol Container */}
                <div className="relative w-12 h-12 flex items-center justify-center">
                  
                  {/* Sacred Geometry Background */}
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `conic-gradient(from ${index * 72}deg, 
                        rgba(169, 71, 36, 0.2) 0deg,
                        rgba(206, 162, 44, 0.2) 90deg,
                        rgba(109, 121, 52, 0.2) 180deg,
                        rgba(35, 101, 134, 0.2) 270deg,
                        rgba(169, 71, 36, 0.2) 360deg)`
                    }}
                    animate={{
                      rotate: breathPhase * 20,
                      opacity: isCurrent ? 0.8 : 0.3
                    }}
                    transition={{ duration: 0.1 }}
                  />
                  
                  {/* Phosphorescent Glow */}
                  <motion.div
                    className="absolute inset-0 rounded-full border border-white/30"
                    animate={{
                      boxShadow: isActive ? 
                        `0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(255,255,255,0.4)` :
                        isCurrent ?
                        `0 0 10px rgba(255,255,255,0.4)` :
                        `0 0 5px rgba(255,255,255,0.2)`
                    }}
                    transition={{ duration: 0.3 }}
                  />
                  
                  {/* Symbol Glyph */}
                  <motion.span
                    className="text-2xl relative z-10"
                    style={{
                      filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.5))'
                    }}
                    animate={{
                      scale: isActive ? 1.2 : 1,
                      textShadow: isActive ? 
                        '0 0 15px rgba(255,255,255,0.8)' :
                        '0 0 5px rgba(255,255,255,0.3)'
                    }}
                  >
                    {symbol.glyph}
                  </motion.span>
                  
                  {/* Portal Effect */}
                  <AnimatePresence>
                    {getPortalEffect(symbol)}
                  </AnimatePresence>
                  
                </div>
                
                {/* Essence Emergence (on hover) */}
                <AnimatePresence>
                  {activeSymbol === symbol.glyph && (
                    <motion.div
                      className="absolute -top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
                      initial={{ opacity: 0, y: 10, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.8 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-1 border border-white/20">
                        <span className="text-white text-xs font-light tracking-wider">
                          {symbol.essence}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Frequency Resonance Indicator */}
                {isCurrent && (
                  <motion.div
                    className="absolute -bottom-8 left-1/2 transform -translate-x-1/2"
                    animate={{
                      opacity: [0.5, 1, 0.5],
                      scale: [0.8, 1, 0.8]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="w-1 h-1 bg-white rounded-full" />
                  </motion.div>
                )}
                
              </motion.div>
            );
          })}
        </div>
        
        {/* Mycelial Connection Lines */}
        <svg 
          className="absolute inset-0 pointer-events-none"
          width="100%" 
          height="100%"
        >
          <defs>
            <linearGradient id="mycelialGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
          </defs>
          
          {/* Connecting pathways */}
          {sacredSymbols.map((_, index) => {
            if (index === sacredSymbols.length - 1) return null;
            
            return (
              <motion.line
                key={`connection-${index}`}
                x1={`${20 + index * 20}%`}
                y1="50%"
                x2={`${40 + index * 20}%`}
                y2="50%"
                stroke="url(#mycelialGradient)"
                strokeWidth="1"
                animate={{
                  opacity: [0.3, 0.8, 0.3],
                  strokeDasharray: ["0,10", "5,5", "0,10"]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  delay: index * 0.5 
                }}
              />
            );
          })}
        </svg>
        
      </div>
    </div>
  );
};