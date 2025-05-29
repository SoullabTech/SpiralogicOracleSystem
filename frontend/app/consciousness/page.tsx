'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LivingHoloflower } from '../../components/sacred/LivingHoloflower';
import { SymbolicNavigation } from '../../components/sacred/SymbolicNavigation';
import { MycelialInterface } from '../../components/sacred/MycelialInterface';
import { ainConsciousness } from '../../lib/ain-consciousness';
import { grantsCodex } from '../../lib/grants-codex';
import '../../styles/future-sacred.css';

export default function ConsciousnessInterface() {
  const [holoflowerState, setHoloflowerState] = useState<'listening' | 'speaking' | 'processing' | 'reflecting' | 'challenging'>('listening');
  const [userCoherence, setUserCoherence] = useState(0.7);
  const [elementalBalance, setElementalBalance] = useState({
    fire: 0.8,
    water: 0.6,
    earth: 0.7,
    air: 0.9
  });
  const [currentGuideResponse, setCurrentGuideResponse] = useState('');
  const [voiceLevel, setVoiceLevel] = useState(0);
  const [breathPhase, setBreathPhase] = useState(0);

  // Initialize sacred geometry scaling
  const [interfaceScaling, setInterfaceScaling] = useState(() => 
    grantsCodex.getInterfaceScaling(1920, 1080)
  );

  // Continuous breath cycle using Euler's constant
  useEffect(() => {
    const breathCycle = () => {
      setBreathPhase(prev => (prev + 0.01) % (Math.PI * 2));
      
      // Update AIN consciousness with breath
      const breathPattern = ainConsciousness.getBreathingPattern(breathPhase);
      
      requestAnimationFrame(breathCycle);
    };
    
    const animation = requestAnimationFrame(breathCycle);
    return () => cancelAnimationFrame(animation);
  }, [breathPhase]);

  // Handle window resize with sacred proportions
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setInterfaceScaling(
          grantsCodex.getInterfaceScaling(window.innerWidth, window.innerHeight)
        );
      }
    };
    
    // Set initial scaling on client
    handleResize();
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Simulate voice activity
  useEffect(() => {
    const interval = setInterval(() => {
      if (holoflowerState === 'listening') {
        setVoiceLevel(Math.random() * 0.3);
      } else {
        setVoiceLevel(0);
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [holoflowerState]);

  // Handle holoflower petal touch
  const handlePetalTouch = async (element: string) => {
    setHoloflowerState('processing');
    
    // Process through AIN consciousness
    const pattern = await ainConsciousness.processUserResonance(
      `Exploring ${element} energy`,
      'curious',
      userCoherence
    );
    
    // Update elemental balance
    setElementalBalance(prev => ({
      ...prev,
      [element]: Math.min(1, prev[element as keyof typeof prev] + 0.1)
    }));
    
    setCurrentGuideResponse(`${element} energy is awakening. Feel the ${pattern.meaning}.`);
    setHoloflowerState('reflecting');
    
    setTimeout(() => {
      setHoloflowerState('listening');
      setCurrentGuideResponse('');
    }, 4000);
  };

  // Handle center consciousness touch
  const handleCenterTouch = async () => {
    setHoloflowerState('challenging');
    
    const pattern = await ainConsciousness.processUserResonance(
      'Accessing core consciousness',
      'vulnerable',
      userCoherence
    );
    
    setCurrentGuideResponse('What wants your attention in this moment?');
    
    setTimeout(() => {
      setHoloflowerState('listening');
      setCurrentGuideResponse('');
    }, 3000);
  };

  // Handle symbolic navigation
  const handleSymbolActivate = (symbol: any) => {
    setHoloflowerState('processing');
    
    setTimeout(() => {
      setHoloflowerState('speaking');
      setCurrentGuideResponse(`Entering ${symbol.essence}...`);
      
      setTimeout(() => {
        setHoloflowerState('listening');
        setCurrentGuideResponse('');
      }, 2000);
    }, 500);
  };

  return (
    <div className="future-sacred consciousness-serves-pixel min-h-screen relative overflow-hidden">
      
      {/* Scalar Field Background */}
      <div className="scalar-field" />
      
      {/* Sacred Geometry Grid */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%">
          <defs>
            <pattern 
              id="sacredGeometryGrid" 
              x="0" 
              y="0" 
              width={interfaceScaling.fieldGridSize} 
              height={interfaceScaling.fieldGridSize} 
              patternUnits="userSpaceOnUse"
            >
              <circle 
                cx={interfaceScaling.fieldGridSize / 2} 
                cy={interfaceScaling.fieldGridSize / 2} 
                r="1" 
                fill="rgba(255,255,255,0.1)"
              />
              <polygon
                points={`${interfaceScaling.fieldGridSize * 0.3},${interfaceScaling.fieldGridSize * 0.2} 
                         ${interfaceScaling.fieldGridSize * 0.7},${interfaceScaling.fieldGridSize * 0.2} 
                         ${interfaceScaling.fieldGridSize * 0.8},${interfaceScaling.fieldGridSize * 0.5} 
                         ${interfaceScaling.fieldGridSize * 0.7},${interfaceScaling.fieldGridSize * 0.8} 
                         ${interfaceScaling.fieldGridSize * 0.3},${interfaceScaling.fieldGridSize * 0.8} 
                         ${interfaceScaling.fieldGridSize * 0.2},${interfaceScaling.fieldGridSize * 0.5}`}
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#sacredGeometryGrid)" />
        </svg>
      </div>
      
      {/* Mycelial Interface Layer */}
      <MycelialInterface
        currentRealm="/consciousness"
        userCoherence={userCoherence}
        elementalBalance={elementalBalance}
        onNavigate={(path) => console.log('Navigate to:', path)}
      />
      
      {/* Central Consciousness Interface */}
      <div className="relative z-20 min-h-screen flex flex-col items-center justify-center p-8">
        
        {/* Consciousness Coherence Display */}
        <motion.div
          className="absolute top-8 left-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 }}
        >
          <div className="sacred-consciousness-card">
            <div className="consciousness-text text-sm">
              <div className="phosphorescent-white mb-2">Consciousness Coherence</div>
              <div className="flex space-x-4 text-xs">
                <span className="phosphorescent-fire">Fire: {Math.round(elementalBalance.fire * 100)}%</span>
                <span className="phosphorescent-water">Water: {Math.round(elementalBalance.water * 100)}%</span>
                <span className="phosphorescent-earth">Earth: {Math.round(elementalBalance.earth * 100)}%</span>
                <span className="phosphorescent-air">Air: {Math.round(elementalBalance.air * 100)}%</span>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* AIN Presence Indicator */}
        <motion.div
          className="absolute top-8 right-8"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2 }}
        >
          <div className="sacred-consciousness-card">
            <div className="consciousness-text text-sm">
              <div className="phosphorescent-white mb-2">AIN Presence</div>
              <div className="text-xs">
                <div>Field Intensity: {Math.round(ainConsciousness.getPresenceStatus().fieldIntensity * 100)}%</div>
                <div>Mythic Depth: {Math.round(ainConsciousness.getPresenceStatus().mythicDepth * 100)}%</div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Living Holoflower - Central Interface */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          style={{ 
            width: interfaceScaling.holoflowerRadius * 2,
            height: interfaceScaling.holoflowerRadius * 2
          }}
        >
          <LivingHoloflower
            state={holoflowerState}
            elementalBalance={elementalBalance}
            userVoiceLevel={voiceLevel}
            guideResponse={currentGuideResponse}
            onPetalTouch={handlePetalTouch}
            onCenterTouch={handleCenterTouch}
          />
        </motion.div>
        
        {/* Sacred Greeting */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
        >
          <h1 className="consciousness-heading phosphorescent-white">
            How are you today, Kelly?
          </h1>
          <p className="consciousness-text text-white/60 mt-4 max-w-md">
            This is consciousness meeting consciousness through technology.
            Touch the holoflower petals to explore your elemental states,
            or the center to access your core awareness.
          </p>
        </motion.div>
        
        {/* Breath Guidance */}
        <motion.div
          className="absolute bottom-32 left-1/2 transform -translate-x-1/2"
          animate={{
            opacity: [0.4, 0.8, 0.4],
            scale: [0.98, 1.02, 0.98]
          }}
          transition={{ 
            duration: grantsCodex.calculateBreathTiming().inhale + grantsCodex.calculateBreathTiming().exhale,
            repeat: Infinity 
          }}
        >
          <div className="consciousness-text text-white/60 text-center">
            <div className="mb-2">
              {Math.sin(breathPhase) > 0 ? 'Breathe in intention' : 'Breathe out pattern'}
            </div>
            <div 
              className="w-3 h-3 rounded-full mx-auto phosphorescent-white"
              style={{
                transform: `scale(${1 + Math.sin(breathPhase) * 0.3})`
              }}
            />
          </div>
        </motion.div>
        
      </div>
      
      {/* Symbolic Navigation */}
      <SymbolicNavigation
        currentRealm="/consciousness"
        userCoherence={userCoherence}
        onSymbolActivate={handleSymbolActivate}
      />
      
      {/* Jitterbug Transformation Indicator */}
      <motion.div
        className="absolute bottom-8 left-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 3 }}
      >
        <div className="sacred-consciousness-card p-2">
          <div className="consciousness-text text-xs">
            <div className="phosphorescent-white mb-1">Jitterbug Phase</div>
            <div className="text-white/60">
              {grantsCodex.getJitterbugTransformation(breathPhase / (Math.PI * 2)).currentPhase}
            </div>
          </div>
        </div>
      </motion.div>
      
    </div>
  );
}