'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LivingHoloflower } from './LivingHoloflower';
import { SymbolicNavigation } from './SymbolicNavigation';
import { ainConsciousness } from '../../lib/ain-consciousness';

interface MycelialNode {
  id: string;
  type: 'consciousness' | 'memory' | 'pattern' | 'gateway';
  position: { x: number; y: number };
  connections: string[];
  energy: number;
  resonance: number;
}

interface MycelialInterfaceProps {
  currentRealm: string;
  userCoherence: number;
  elementalBalance: {
    fire: number;
    water: number;
    earth: number;
    air: number;
  };
  onNavigate?: (path: string) => void;
  onNodeActivate?: (node: MycelialNode) => void;
}

export const MycelialInterface: React.FC<MycelialInterfaceProps> = ({
  currentRealm,
  userCoherence,
  elementalBalance,
  onNavigate,
  onNodeActivate
}) => {
  const [activeNodes, setActiveNodes] = useState<MycelialNode[]>([]);
  const [connectionPaths, setConnectionPaths] = useState<string[]>([]);
  const [fieldState, setFieldState] = useState('dormant');
  const [breathPhase, setBreathPhase] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Sacred constants
  const PHI = 1.618033988749;
  const ROOT_TEN = Math.sqrt(10);

  // Initialize mycelial network
  useEffect(() => {
    const initializeNetwork = () => {
      const nodes: MycelialNode[] = [
        {
          id: 'center',
          type: 'consciousness',
          position: { x: 0.5, y: 0.5 },
          connections: ['guide', 'holoflower', 'memory', 'voice'],
          energy: userCoherence,
          resonance: 0.8
        },
        {
          id: 'guide',
          type: 'gateway',
          position: { x: 0.2, y: 0.3 },
          connections: ['center', 'memory'],
          energy: currentRealm.includes('dashboard') ? 0.9 : 0.4,
          resonance: 0.7
        },
        {
          id: 'holoflower',
          type: 'pattern',
          position: { x: 0.8, y: 0.3 },
          connections: ['center', 'voice'],
          energy: currentRealm.includes('holoflower') ? 0.9 : 0.5,
          resonance: Object.values(elementalBalance).reduce((a, b) => a + b) / 4
        },
        {
          id: 'memory',
          type: 'memory',
          position: { x: 0.3, y: 0.8 },
          connections: ['center', 'guide'],
          energy: currentRealm.includes('journal') ? 0.9 : 0.3,
          resonance: 0.6
        },
        {
          id: 'voice',
          type: 'gateway',
          position: { x: 0.7, y: 0.8 },
          connections: ['center', 'holoflower'],
          energy: 0.5,
          resonance: 0.5
        }
      ];
      
      setActiveNodes(nodes);
    };
    
    initializeNetwork();
  }, [currentRealm, userCoherence, elementalBalance]);

  // Continuous breath cycle for field animation
  useEffect(() => {
    const breathCycle = () => {
      setBreathPhase(prev => (prev + 0.01) % (Math.PI * 2));
      requestAnimationFrame(breathCycle);
    };
    
    const animation = requestAnimationFrame(breathCycle);
    return () => cancelAnimationFrame(animation);
  }, []);

  // Update field state based on activity
  useEffect(() => {
    const totalEnergy = activeNodes.reduce((sum, node) => sum + node.energy, 0);
    const avgEnergy = totalEnergy / activeNodes.length;
    
    if (avgEnergy > 0.8) {
      setFieldState('luminous');
    } else if (avgEnergy > 0.6) {
      setFieldState('active');
    } else if (avgEnergy > 0.4) {
      setFieldState('stirring');
    } else {
      setFieldState('dormant');
    }
  }, [activeNodes]);

  // Draw mycelial connections on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw connection pathways
    activeNodes.forEach(node => {
      node.connections.forEach(connectionId => {
        const targetNode = activeNodes.find(n => n.id === connectionId);
        if (!targetNode) return;
        
        const startX = node.position.x * canvas.width;
        const startY = node.position.y * canvas.height;
        const endX = targetNode.position.x * canvas.width;
        const endY = targetNode.position.y * canvas.height;
        
        // Calculate pathway energy
        const pathwayEnergy = (node.energy + targetNode.energy) / 2;
        const breathInfluence = Math.sin(breathPhase) * 0.2 + 0.8;
        const opacity = pathwayEnergy * breathInfluence * 0.3;
        
        // Draw organic pathway
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        
        // Create organic curve using sacred geometry
        const midX = (startX + endX) / 2 + Math.sin(breathPhase * PHI) * 50;
        const midY = (startY + endY) / 2 + Math.cos(breathPhase * ROOT_TEN) * 30;
        
        ctx.quadraticCurveTo(midX, midY, endX, endY);
        
        // Style based on field state
        const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
        gradient.addColorStop(0, `rgba(169, 71, 36, ${opacity})`);
        gradient.addColorStop(0.5, `rgba(206, 162, 44, ${opacity})`);
        gradient.addColorStop(1, `rgba(35, 101, 134, ${opacity})`);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = pathwayEnergy * 3;
        ctx.lineCap = 'round';
        ctx.stroke();
        
        // Add energy pulses
        if (pathwayEnergy > 0.6) {
          const pulsePosition = (breathPhase % (Math.PI * 2)) / (Math.PI * 2);
          const pulseX = startX + (endX - startX) * pulsePosition;
          const pulseY = startY + (endY - startY) * pulsePosition;
          
          ctx.beginPath();
          ctx.arc(pulseX, pulseY, 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 2})`;
          ctx.fill();
        }
      });
    });
  }, [activeNodes, breathPhase, fieldState]);

  // Handle node activation
  const activateNode = (node: MycelialNode) => {
    // Update node energy
    setActiveNodes(prev => prev.map(n => 
      n.id === node.id 
        ? { ...n, energy: Math.min(1, n.energy + 0.2) }
        : n
    ));
    
    // Trigger AIN consciousness response
    ainConsciousness.modulatePresence(userCoherence, node.energy);
    
    // Callback
    onNodeActivate?.(node);
    
    // Navigate if it's a gateway
    if (node.type === 'gateway') {
      const pathMap: Record<string, string> = {
        guide: '/dashboard',
        voice: '/dashboard/voice',
        memory: '/dashboard/journal'
      };
      
      if (pathMap[node.id]) {
        onNavigate?.(pathMap[node.id]);
      }
    }
  };

  // Get field visualization style
  const getFieldStyle = () => {
    const baseOpacity = fieldState === 'luminous' ? 0.15 :
                      fieldState === 'active' ? 0.1 :
                      fieldState === 'stirring' ? 0.05 : 0.02;
    
    return {
      background: `radial-gradient(ellipse at center, 
        rgba(169, 71, 36, ${baseOpacity}) 0%,
        rgba(206, 162, 44, ${baseOpacity * 0.8}) 25%,
        rgba(109, 121, 52, ${baseOpacity * 0.6}) 50%,
        rgba(35, 101, 134, ${baseOpacity * 0.8}) 75%,
        rgba(0, 0, 0, 0.9) 100%)`,
      transition: 'all 3s ease-in-out'
    };
  };

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-10"
      style={getFieldStyle()}
    >
      
      {/* Mycelial Connection Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ mixBlendMode: 'screen' }}
      />
      
      {/* Sacred Geometry Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <svg width="100%" height="100%" className="opacity-20">
          <defs>
            <pattern 
              id="sacredGrid" 
              x="0" 
              y="0" 
              width={`${100 * PHI}`} 
              height={`${100 * PHI}`} 
              patternUnits="userSpaceOnUse"
            >
              <circle 
                cx={`${50 * PHI}`} 
                cy={`${50 * PHI}`} 
                r="1" 
                fill="rgba(255,255,255,0.1)"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#sacredGrid)" />
        </svg>
      </div>
      
      {/* Interactive Nodes */}
      {activeNodes.map((node) => (
        <motion.div
          key={node.id}
          className="absolute pointer-events-auto cursor-pointer"
          style={{
            left: `${node.position.x * 100}%`,
            top: `${node.position.y * 100}%`,
            transform: 'translate(-50%, -50%)'
          }}
          onClick={() => activateNode(node)}
          animate={{
            scale: [1, 1 + node.energy * 0.3, 1],
            opacity: [0.6, node.energy, 0.6]
          }}
          transition={{ 
            duration: 2 + node.resonance, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Node Visualization */}
          <div 
            className="w-4 h-4 rounded-full border border-white/40"
            style={{
              background: `radial-gradient(circle,
                rgba(255,255,255,${node.energy * 0.8}) 0%,
                rgba(255,255,255,${node.energy * 0.4}) 50%,
                rgba(255,255,255,0) 100%)`
            }}
          />
          
          {/* Node Energy Pulse */}
          <motion.div
            className="absolute inset-0 rounded-full border border-white/20"
            animate={{
              scale: [1, 2, 1],
              opacity: [node.energy, 0, node.energy]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              delay: node.position.x * 2
            }}
          />
        </motion.div>
      ))}
      
      {/* Field Status Indicator */}
      <motion.div
        className="absolute top-4 right-4 pointer-events-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
      >
        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/20">
          <div className="text-white text-xs font-light tracking-wider uppercase">
            Field State: {fieldState}
          </div>
          <div className="text-white/60 text-xs mt-1">
            Coherence: {Math.round(userCoherence * 100)}%
          </div>
        </div>
      </motion.div>
      
      {/* Breathing Guidance */}
      <motion.div
        className="absolute bottom-32 left-1/2 transform -translate-x-1/2 pointer-events-auto"
        animate={{
          opacity: [0.4, 0.8, 0.4],
          scale: [0.95, 1.05, 0.95]
        }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <div className="text-white/60 text-sm font-light text-center">
          {Math.sin(breathPhase) > 0 ? 'Inhale intention' : 'Exhale pattern'}
        </div>
      </motion.div>
      
    </div>
  );
};