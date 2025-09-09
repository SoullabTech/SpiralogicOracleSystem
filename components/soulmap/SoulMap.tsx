'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { usePetalInteractions, useSacredCheckIn, useOracleJournal } from '@/lib/hooks/useOracleData';
import type { Element, EnergyState, PetalInteraction } from '@/lib/types/oracle';

interface SoulMapNode {
  id: string;
  element: Element;
  strength: number; // 0-100
  connections: string[];
  position: { x: number; y: number };
  state: EnergyState;
}

interface Archetype {
  name: string;
  description: string;
  dominantElement: Element;
  shadowElement: Element;
  affinity: number; // 0-100 how much user matches
}

const ARCHETYPES: Archetype[] = [
  {
    name: 'The Visionary',
    description: 'Air-dominant soul who brings fresh perspectives and innovation',
    dominantElement: 'air',
    shadowElement: 'earth',
    affinity: 0
  },
  {
    name: 'The Alchemist',
    description: 'Fire-dominant transformer who transmutes challenges into gold',
    dominantElement: 'fire',
    shadowElement: 'water',
    affinity: 0
  },
  {
    name: 'The Oracle',
    description: 'Water-dominant intuitive who flows with emotional wisdom',
    dominantElement: 'water',
    shadowElement: 'fire',
    affinity: 0
  },
  {
    name: 'The Guardian',
    description: 'Earth-dominant nurturer who creates stable foundations',
    dominantElement: 'earth',
    shadowElement: 'air',
    affinity: 0
  },
  {
    name: 'The Mystic',
    description: 'Aether-dominant bridge between realms',
    dominantElement: 'aether',
    shadowElement: 'earth',
    affinity: 0
  }
];

export function SoulMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { interactions, fetchRecentInteractions } = usePetalInteractions();
  const { checkIns } = useSacredCheckIn();
  const { entries } = useOracleJournal();
  
  const [soulNodes, setSoulNodes] = useState<SoulMapNode[]>([]);
  const [userArchetype, setUserArchetype] = useState<Archetype | null>(null);
  const [elementBalance, setElementBalance] = useState<Record<Element, number>>({
    air: 0, fire: 0, water: 0, earth: 0, aether: 0
  });
  const [shadowToRadiantRatio, setShadowToRadiantRatio] = useState(50);

  useEffect(() => {
    fetchRecentInteractions(100);
  }, []);

  useEffect(() => {
    if (interactions.length === 0) return;

    // Calculate element strengths
    const elementCounts: Record<Element, number> = {
      air: 0, fire: 0, water: 0, earth: 0, aether: 0
    };
    const elementStates: Record<Element, { dense: number; emerging: number; radiant: number }> = {
      air: { dense: 0, emerging: 0, radiant: 0 },
      fire: { dense: 0, emerging: 0, radiant: 0 },
      water: { dense: 0, emerging: 0, radiant: 0 },
      earth: { dense: 0, emerging: 0, radiant: 0 },
      aether: { dense: 0, emerging: 0, radiant: 0 }
    };

    interactions.forEach(interaction => {
      elementCounts[interaction.element]++;
      elementStates[interaction.element][interaction.petalState]++;
    });

    const total = interactions.length;
    const balance: Record<Element, number> = {} as any;
    const nodes: SoulMapNode[] = [];

    // Create nodes for soul map
    Object.entries(elementCounts).forEach(([element, count]) => {
      const elem = element as Element;
      const percentage = (count / total) * 100;
      balance[elem] = percentage;

      // Calculate average state for this element
      const states = elementStates[elem];
      const stateTotal = states.dense + states.emerging + states.radiant;
      let dominantState: EnergyState = 'emerging';
      
      if (stateTotal > 0) {
        if (states.radiant > states.dense && states.radiant > states.emerging) {
          dominantState = 'radiant';
        } else if (states.dense > states.radiant && states.dense > states.emerging) {
          dominantState = 'dense';
        }
      }

      // Position nodes in pentagram formation
      const angle = getElementAngle(elem);
      const radius = 150;
      const x = Math.cos(angle) * radius + 200;
      const y = Math.sin(angle) * radius + 200;

      nodes.push({
        id: elem,
        element: elem,
        strength: percentage,
        connections: getElementConnections(elem),
        position: { x, y },
        state: dominantState
      });
    });

    setSoulNodes(nodes);
    setElementBalance(balance);

    // Calculate shadow to radiant ratio
    const totalDense = Object.values(elementStates).reduce((sum, s) => sum + s.dense, 0);
    const totalRadiant = Object.values(elementStates).reduce((sum, s) => sum + s.radiant, 0);
    const totalStates = totalDense + totalRadiant;
    if (totalStates > 0) {
      setShadowToRadiantRatio((totalRadiant / totalStates) * 100);
    }

    // Determine user archetype
    const dominantElement = Object.entries(balance).reduce((a, b) => 
      balance[a[0] as Element] > b[1] ? a : b
    )[0] as Element;

    const matchedArchetype = ARCHETYPES.map(arch => ({
      ...arch,
      affinity: arch.dominantElement === dominantElement ? balance[dominantElement] : 0
    })).sort((a, b) => b.affinity - a.affinity)[0];

    setUserArchetype(matchedArchetype);
  }, [interactions]);

  // Draw soul map on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections between nodes
    soulNodes.forEach(node => {
      node.connections.forEach(targetId => {
        const target = soulNodes.find(n => n.id === targetId);
        if (!target) return;

        ctx.beginPath();
        ctx.moveTo(node.position.x, node.position.y);
        ctx.lineTo(target.position.x, target.position.y);
        
        const gradient = ctx.createLinearGradient(
          node.position.x, node.position.y,
          target.position.x, target.position.y
        );
        gradient.addColorStop(0, getElementColor(node.element) + '33');
        gradient.addColorStop(1, getElementColor(target.element) + '33');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = Math.min(node.strength, target.strength) / 10;
        ctx.stroke();
      });
    });

    // Draw nodes
    soulNodes.forEach(node => {
      const radius = 20 + (node.strength / 2);
      
      // Outer glow
      const glow = ctx.createRadialGradient(
        node.position.x, node.position.y, 0,
        node.position.x, node.position.y, radius * 2
      );
      glow.addColorStop(0, getElementColor(node.element) + '66');
      glow.addColorStop(1, 'transparent');
      
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(node.position.x, node.position.y, radius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Main node
      ctx.fillStyle = getElementColor(node.element);
      ctx.beginPath();
      ctx.arc(node.position.x, node.position.y, radius, 0, Math.PI * 2);
      ctx.fill();

      // State indicator
      ctx.strokeStyle = node.state === 'radiant' ? '#fff' : 
                       node.state === 'dense' ? '#000' : '#888';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Element label
      ctx.fillStyle = '#fff';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(node.element.toUpperCase(), node.position.x, node.position.y + radius + 20);
      ctx.fillText(`${Math.round(node.strength)}%`, node.position.x, node.position.y + radius + 35);
    });
  }, [soulNodes]);

  function getElementAngle(element: Element): number {
    const angles = {
      air: -Math.PI / 2,
      fire: -Math.PI / 2 + (2 * Math.PI / 5),
      water: -Math.PI / 2 + (4 * Math.PI / 5),
      earth: -Math.PI / 2 + (6 * Math.PI / 5),
      aether: -Math.PI / 2 + (8 * Math.PI / 5)
    };
    return angles[element];
  }

  function getElementConnections(element: Element): string[] {
    const connections: Record<Element, Element[]> = {
      air: ['fire', 'aether'],
      fire: ['air', 'earth'],
      water: ['earth', 'aether'],
      earth: ['fire', 'water'],
      aether: ['air', 'water']
    };
    return connections[element];
  }

  function getElementColor(element: Element): string {
    const colors = {
      air: '#87CEEB',
      fire: '#FF6B6B',
      water: '#4A90E2',
      earth: '#8B7355',
      aether: '#9B59B6'
    };
    return colors[element];
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-indigo-950 to-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-light text-white mb-2">Your Soul Map</h1>
          <p className="text-white/60">A visual representation of your spiritual essence</p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Soul Map Canvas */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10"
          >
            <h2 className="text-xl font-light text-white mb-4">Elemental Matrix</h2>
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={400}
                height={400}
                className="w-full max-w-md mx-auto"
                style={{ background: 'radial-gradient(circle, rgba(159,122,234,0.1) 0%, transparent 70%)' }}
              />
              
              {/* Center soul indicator */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 opacity-30"
                />
                <div className="absolute inset-2 rounded-full bg-white/20" />
              </div>
            </div>

            {/* Shadow to Radiant Scale */}
            <div className="mt-6">
              <div className="flex justify-between text-white/60 text-sm mb-2">
                <span>Shadow</span>
                <span>Radiant</span>
              </div>
              <div className="w-full h-4 bg-gradient-to-r from-gray-800 via-purple-600 to-white rounded-full">
                <motion.div
                  className="h-4 w-1 bg-white rounded-full shadow-lg"
                  initial={{ x: 0 }}
                  animate={{ x: `${shadowToRadiantRatio * 3.5}px` }}
                  transition={{ duration: 1 }}
                />
              </div>
              <p className="text-center text-white/60 text-sm mt-2">
                {Math.round(shadowToRadiantRatio)}% Radiant Energy
              </p>
            </div>
          </motion.div>

          {/* Archetype & Insights */}
          <div className="space-y-6">
            {/* Primary Archetype */}
            {userArchetype && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10"
              >
                <h2 className="text-xl font-light text-white mb-4">Your Archetype</h2>
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
                    style={{ backgroundColor: getElementColor(userArchetype.dominantElement) + '33' }}
                  >
                    {userArchetype.dominantElement === 'air' && '🌬️'}
                    {userArchetype.dominantElement === 'fire' && '🔥'}
                    {userArchetype.dominantElement === 'water' && '💧'}
                    {userArchetype.dominantElement === 'earth' && '🌍'}
                    {userArchetype.dominantElement === 'aether' && '✨'}
                  </div>
                  <div>
                    <h3 className="text-2xl font-light text-white">{userArchetype.name}</h3>
                    <p className="text-white/60">{userArchetype.description}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Dominant Element</span>
                    <span className="text-white capitalize">{userArchetype.dominantElement}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Shadow Element</span>
                    <span className="text-white capitalize">{userArchetype.shadowElement}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Affinity Match</span>
                    <span className="text-white">{Math.round(userArchetype.affinity)}%</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Element Balance */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10"
            >
              <h2 className="text-xl font-light text-white mb-4">Elemental Balance</h2>
              <div className="space-y-3">
                {Object.entries(elementBalance).map(([element, percentage]) => (
                  <div key={element}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white capitalize">{element}</span>
                      <span className="text-white/60">{Math.round(percentage)}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <motion.div
                        className="h-2 rounded-full"
                        style={{ backgroundColor: getElementColor(element as Element) }}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: 0.1 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Journey Insights */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10"
            >
              <h2 className="text-xl font-light text-white mb-4">Soul Insights</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-1.5" />
                  <p className="text-white/80 text-sm">
                    Your soul resonates most strongly with {userArchetype?.dominantElement} energy,
                    suggesting a natural affinity for {userArchetype?.dominantElement === 'air' ? 'innovation and communication' :
                    userArchetype?.dominantElement === 'fire' ? 'transformation and passion' :
                    userArchetype?.dominantElement === 'water' ? 'intuition and emotional depth' :
                    userArchetype?.dominantElement === 'earth' ? 'grounding and nurturing' :
                    'bridging realms and mystical connection'}.
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full mt-1.5" />
                  <p className="text-white/80 text-sm">
                    Consider exploring your shadow element ({userArchetype?.shadowElement}) 
                    to achieve greater balance and unlock hidden potentials.
                  </p>
                </div>

                {shadowToRadiantRatio > 70 && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-1.5" />
                    <p className="text-white/80 text-sm">
                      You're in a high vibrational state! Your energy is predominantly radiant.
                    </p>
                  </div>
                )}

                {shadowToRadiantRatio < 30 && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-1.5" />
                    <p className="text-white/80 text-sm">
                      You're in a transformative phase. Honor the shadow work happening now.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}