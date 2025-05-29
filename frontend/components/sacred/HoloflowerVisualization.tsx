'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HoloflowerHouse {
  id: string;
  element: 'fire' | 'earth' | 'air' | 'water';
  phase: 'cardinal' | 'fixed' | 'mutable';
  angle: number;
  radius: number;
  color: string;
  intensity: number;
  x?: number;
  y?: number;
  size?: number;
}

interface HoloflowerState {
  houses: HoloflowerHouse[];
  centerIntegration: number;
  overallBalance: number;
  activeTransformations: string[];
}

interface PetalState {
  id: number;
  name: string;
  element: string;
  value: number;
  description: string;
}

interface HoloflowerVisualizationProps {
  userId?: string;
  className?: string;
  petals?: PetalState[];
  onPetalChange?: (id: number, value: number) => void;
  interactive?: boolean;
}

export const HoloflowerVisualization: React.FC<HoloflowerVisualizationProps> = ({ 
  userId, 
  className = '',
  petals = [],
  onPetalChange,
  interactive = false
}) => {
  const [state, setState] = useState<HoloflowerState | null>(null);
  const [selectedHouse, setSelectedHouse] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize default state if no WebSocket data
  useEffect(() => {
    if (petals.length > 0) {
      // Create simplified state from petals for demo
      const defaultState: HoloflowerState = {
        houses: petals.map((petal, index) => ({
          id: petal.id.toString(),
          element: petal.element.toLowerCase() as 'fire' | 'earth' | 'air' | 'water',
          phase: 'cardinal' as const,
          angle: (index * Math.PI * 2) / petals.length,
          radius: 120,
          color: getElementColor(petal.element),
          intensity: petal.value,
        })),
        centerIntegration: 0.7,
        overallBalance: petals.reduce((sum, p) => sum + p.value, 0) / petals.length,
        activeTransformations: []
      };
      setState(defaultState);
      setIsConnected(true);
      return;
    }

    // Only connect to WebSocket if userId is provided and no petals data
    if (!userId) {
      setIsConnected(false);
      return;
    }

    try {
      const ws = new WebSocket(`ws://localhost:5002/ws/holoflower/${userId}`);

      ws.onopen = () => {
        setIsConnected(true);
        console.log('Connected to holoflower WebSocket');
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'initial-state' || data.type === 'state-update') {
          setState(data.state);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.log('Disconnected from holoflower WebSocket');
      };

      return () => {
        ws.close();
      };
    } catch (error) {
      console.log('WebSocket connection failed, using demo mode');
      setIsConnected(false);
    }
  }, [userId, petals]);

  const getElementColor = (element: string) => {
    switch (element.toLowerCase()) {
      case 'fire': return '#a94724';
      case 'air': return '#cea22c';
      case 'earth': return '#6d7934';
      case 'water': return '#236586';
      default: return '#777777';
    }
  };

  // Draw sacred geometry on canvas
  useEffect(() => {
    if (!canvasRef.current || !state) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw sacred geometry patterns
    ctx.strokeStyle = 'rgba(206, 162, 44, 0.1)'; // Air element color
    ctx.lineWidth = 1;

    // Draw flower of life pattern
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6;
      const x = centerX + Math.cos(angle) * 60;
      const y = centerY + Math.sin(angle) * 60;
      
      ctx.beginPath();
      ctx.arc(x, y, 60, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw central circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 60, 0, Math.PI * 2);
    ctx.stroke();

    // Draw connections between houses
    state.activeTransformations.forEach(transformation => {
      const [fromId, toId] = transformation.split('->');
      const fromHouse = state.houses.find(h => h.id === fromId);
      const toHouse = state.houses.find(h => h.id === toId);
      
      if (fromHouse && toHouse && fromHouse.x && fromHouse.y && toHouse.x && toHouse.y) {
        ctx.beginPath();
        ctx.moveTo(centerX + fromHouse.x, centerY + fromHouse.y);
        ctx.lineTo(centerX + toHouse.x, centerY + toHouse.y);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.stroke();
      }
    });
  }, [state]);

  const handleHouseClick = (houseId: string) => {
    setSelectedHouse(houseId);
  };

  const updateHouseIntensity = (houseId: string, intensity: number) => {
    // Update local state for interactive mode
    if (interactive && onPetalChange) {
      onPetalChange(parseInt(houseId), intensity);
    }
    
    // Also try WebSocket if available
    // Note: wsRef removed since we're not always using WebSocket
  };

  const integrateAether = () => {
    // For demo mode, just a visual effect
    console.log('Aether integration activated');
  };

  if (!state) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-soullab-gold animate-pulse">Loading Sacred Geometry...</div>
      </div>
    );
  }

  const elementColors = {
    fire: 'rgb(169, 71, 36)',
    air: 'rgb(206, 162, 44)',
    earth: 'rgb(109, 121, 52)',
    water: 'rgb(35, 101, 134)'
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Sacred Geometry Background */}
      <canvas
        ref={canvasRef}
        width={600}
        height={600}
        className="absolute inset-0 w-full h-full"
      />

      {/* Holoflower Visualization */}
      <svg
        viewBox="0 0 600 600"
        className="absolute inset-0 w-full h-full"
      >
        {/* Center Aether Integration */}
        <motion.circle
          cx={300}
          cy={300}
          r={40}
          fill="url(#aether-gradient)"
          fillOpacity={state.centerIntegration}
          animate={{
            r: [40, 45, 40],
            fillOpacity: [state.centerIntegration, state.centerIntegration + 0.1, state.centerIntegration]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          onClick={integrateAether}
          className="cursor-pointer"
        />

        {/* Houses */}
        {state.houses.map((house) => {
          const x = 300 + Math.cos(house.angle) * house.radius;
          const y = 300 + Math.sin(house.angle) * house.radius;
          const size = house.intensity * 30 + 10;

          return (
            <g key={house.id}>
              <motion.circle
                cx={x}
                cy={y}
                r={size}
                fill={elementColors[house.element]}
                fillOpacity={house.intensity}
                stroke={selectedHouse === house.id ? '#fff' : 'none'}
                strokeWidth={2}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleHouseClick(house.id)}
                className="cursor-pointer"
              />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="10"
                className="pointer-events-none"
              >
                {house.phase[0].toUpperCase()}
              </text>
            </g>
          );
        })}

        {/* Gradients */}
        <defs>
          <radialGradient id="aether-gradient">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#FFA500" />
          </radialGradient>
        </defs>
      </svg>

      {/* Selected House Details */}
      <AnimatePresence>
        {selectedHouse && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-4 right-4 bg-sacred-deep-dark/90 backdrop-blur-sm border border-soullab-gold/20 rounded-lg p-4"
          >
            {(() => {
              const house = state.houses.find(h => h.id === selectedHouse);
              if (!house) return null;

              return (
                <>
                  <h3 className="text-soullab-gold font-semibold mb-2">
                    {house.element.charAt(0).toUpperCase() + house.element.slice(1)} - {house.phase}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sacred-pure-white/70">Intensity</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={house.intensity * 100}
                        onChange={(e) => updateHouseIntensity(house.id, Number(e.target.value) / 100)}
                        className="w-32"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedHouse(null)}
                    className="mt-3 text-xs text-sacred-pure-white/50 hover:text-sacred-pure-white"
                  >
                    Close
                  </button>
                </>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Balance Indicator */}
      <div className="absolute top-4 right-4 text-right">
        <div className="text-xs text-sacred-pure-white/50 mb-1">Overall Balance</div>
        <div className="text-2xl font-semibold text-soullab-gold">
          {(state.overallBalance * 100).toFixed(0)}%
        </div>
      </div>

      {/* Connection Status */}
      <div className="absolute top-4 left-4">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
      </div>
    </div>
  );
};