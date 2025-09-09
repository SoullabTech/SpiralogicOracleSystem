"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Memory {
  id: string;
  type: 'journal' | 'dream' | 'ritual' | 'breakthrough' | 'oracle' | 'shadow';
  content: string;
  timestamp: string;
  element?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  archetypes?: string[];
  emotionalTone?: number;
  integrationLevel?: number;
  sacredContext?: boolean;
}

interface MemoryLayer {
  name: string;
  depth: number;
  memories: Memory[];
  color: string;
  opacity: number;
}

export function MemoryLayers() {
  const [layers, setLayers] = useState<MemoryLayer[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<number | null>(null);
  const [hoveredMemory, setHoveredMemory] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  
  // Memory type colors and configurations
  const memoryTypeConfig = {
    journal: { color: '#3B82F6', symbol: '📖', name: 'Journal' },
    dream: { color: '#D4B896', symbol: '🌙', name: 'Dream' },
    ritual: { color: '#EC4899', symbol: '🔮', name: 'Ritual' },
    breakthrough: { color: '#F59E0B', symbol: '⚡', name: 'Breakthrough' },
    oracle: { color: '#10B981', symbol: '🏛️', name: 'Oracle' },
    shadow: { color: '#6B7280', symbol: '🌑', name: 'Shadow' }
  };

  // Element configurations
  const elementConfig = {
    fire: { gradient: 'from-red-500 to-orange-500', symbol: '🔥' },
    water: { gradient: 'from-blue-500 to-cyan-500', symbol: '💧' },
    earth: { gradient: 'from-green-600 to-emerald-600', symbol: '🌍' },
    air: { gradient: 'from-gray-300 to-white', symbol: '💨' },
    aether: { gradient: 'from-amber-600 to-yellow-600', symbol: '✨' }
  };

  useEffect(() => {
    fetchMemoryLayers();
  }, [timeRange]);

  const fetchMemoryLayers = async () => {
    try {
      const response = await fetch(`/api/soul-memory/memories?timeRange=${timeRange}`);
      const data = await response.json();
      
      if (data.success) {
        organizeLayers(data.memories);
      }
    } catch (error) {
      console.error('Failed to fetch memories:', error);
    }
  };

  const organizeLayers = (memories: Memory[]) => {
    // Organize memories into layers by type and depth
    const layerMap = new Map<string, Memory[]>();
    
    memories.forEach(memory => {
      const key = memory.type;
      if (!layerMap.has(key)) {
        layerMap.set(key, []);
      }
      layerMap.get(key)?.push(memory);
    });

    const newLayers: MemoryLayer[] = Array.from(layerMap.entries()).map(([type, mems], index) => ({
      name: memoryTypeConfig[type as keyof typeof memoryTypeConfig]?.name || type,
      depth: index,
      memories: mems,
      color: memoryTypeConfig[type as keyof typeof memoryTypeConfig]?.color || '#94A3B8',
      opacity: 0.8 - (index * 0.1)
    }));

    setLayers(newLayers);
  };

  const getMemoryPosition = (memory: Memory, layerIndex: number) => {
    // Calculate position based on timestamp and layer
    const date = new Date(memory.timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Position calculation for circular visualization
    const angle = (diffDays * 3) % 360;
    const radius = 150 + (layerIndex * 60);
    const x = Math.cos((angle * Math.PI) / 180) * radius;
    const y = Math.sin((angle * Math.PI) / 180) * radius;
    
    return { x, y, angle };
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-gray-950 to-black overflow-hidden">
      {/* Header Controls */}
      <div className="absolute top-6 left-6 z-20">
        <h2 className="text-2xl font-bold text-white mb-4">Memory Layers</h2>
        <div className="flex gap-2">
          {(['week', 'month', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg transition-all ${
                timeRange === range
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="absolute top-6 right-6 z-20 bg-gray-900/80 backdrop-blur-sm rounded-lg p-4">
        <h3 className="text-white font-semibold mb-3">Memory Types</h3>
        <div className="space-y-2">
          {Object.entries(memoryTypeConfig).map(([type, config]) => (
            <div key={type} className="flex items-center gap-2">
              <span className="text-lg">{config.symbol}</span>
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: config.color }}
              />
              <span className="text-gray-300 text-sm">{config.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Central Visualization */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg width="100%" height="100%" className="absolute">
          {/* Concentric circles for layers */}
          {layers.map((layer, index) => (
            <g key={layer.name}>
              <circle
                cx="50%"
                cy="50%"
                r={150 + (index * 60)}
                fill="none"
                stroke={layer.color}
                strokeWidth="1"
                opacity="0.2"
                strokeDasharray="5,5"
              />
            </g>
          ))}
          
          {/* Connection lines between related memories */}
          {layers.flatMap((layer, layerIndex) =>
            layer.memories.map((memory, memIndex) => {
              const pos = getMemoryPosition(memory, layerIndex);
              if (memory.archetypes && memory.archetypes.length > 0 && memIndex < layer.memories.length - 1) {
                const nextPos = getMemoryPosition(layer.memories[memIndex + 1], layerIndex);
                return (
                  <line
                    key={`${memory.id}-line`}
                    x1={`calc(50% + ${pos.x}px)`}
                    y1={`calc(50% + ${pos.y}px)`}
                    x2={`calc(50% + ${nextPos.x}px)`}
                    y2={`calc(50% + ${nextPos.y}px)`}
                    stroke={layer.color}
                    strokeWidth="0.5"
                    opacity="0.3"
                  />
                );
              }
              return null;
            })
          )}
        </svg>

        {/* Memory Nodes */}
        <div className="relative w-full h-full">
          {layers.map((layer, layerIndex) => (
            <div key={layer.name} className="absolute inset-0">
              {layer.memories.map((memory) => {
                const pos = getMemoryPosition(memory, layerIndex);
                const isHovered = hoveredMemory === memory.id;
                const config = memoryTypeConfig[memory.type];
                
                return (
                  <motion.div
                    key={memory.id}
                    className="absolute"
                    style={{
                      left: `calc(50% + ${pos.x}px)`,
                      top: `calc(50% + ${pos.y}px)`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: isHovered ? 1.5 : 1, 
                      opacity: layer.opacity 
                    }}
                    transition={{ duration: 0.3 }}
                    onHoverStart={() => setHoveredMemory(memory.id)}
                    onHoverEnd={() => setHoveredMemory(null)}
                  >
                    {/* Memory Node */}
                    <div 
                      className={`relative cursor-pointer ${
                        memory.sacredContext ? 'animate-pulse' : ''
                      }`}
                    >
                      {/* Outer glow for sacred memories */}
                      {memory.sacredContext && (
                        <div 
                          className="absolute inset-0 rounded-full blur-md"
                          style={{
                            backgroundColor: config.color,
                            transform: 'scale(2)',
                            opacity: 0.3
                          }}
                        />
                      )}
                      
                      {/* Main node */}
                      <div
                        className="relative w-8 h-8 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: config.color,
                          boxShadow: `0 0 20px ${config.color}40`
                        }}
                      >
                        <span className="text-xs">{config.symbol}</span>
                      </div>

                      {/* Element indicator */}
                      {memory.element && (
                        <div 
                          className={`absolute -top-2 -right-2 w-4 h-4 rounded-full bg-gradient-to-br ${
                            elementConfig[memory.element].gradient
                          } flex items-center justify-center`}
                        >
                          <span className="text-xs">
                            {elementConfig[memory.element].symbol}
                          </span>
                        </div>
                      )}

                      {/* Integration level indicator */}
                      {memory.integrationLevel && (
                        <div 
                          className="absolute -bottom-1 left-1/2 transform -translate-x-1/2"
                          style={{
                            width: '20px',
                            height: '3px',
                            backgroundColor: '#10B981',
                            opacity: memory.integrationLevel / 100
                          }}
                        />
                      )}
                    </div>

                    {/* Hover tooltip */}
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute z-30 bottom-full mb-2 left-1/2 transform -translate-x-1/2"
                        >
                          <div className="bg-gray-900 text-white p-3 rounded-lg shadow-xl min-w-[200px] max-w-[300px]">
                            <div className="flex items-center gap-2 mb-2">
                              <span>{config.symbol}</span>
                              <span className="font-semibold">{config.name}</span>
                            </div>
                            <p className="text-xs text-gray-300 line-clamp-3">
                              {memory.content}
                            </p>
                            {memory.archetypes && memory.archetypes.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {memory.archetypes.map(archetype => (
                                  <span 
                                    key={archetype}
                                    className="text-xs bg-amber-600/30 px-2 py-1 rounded"
                                  >
                                    {archetype}
                                  </span>
                                ))}
                              </div>
                            )}
                            <div className="text-xs text-gray-400 mt-2">
                              {new Date(memory.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Central Self */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 60, repeat: Infinity, ease: "linear" },
              scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-600 to-yellow-600 opacity-80 flex items-center justify-center"
          >
            <span className="text-2xl">🔮</span>
          </motion.div>
        </div>
      </div>

      {/* Stats Panel */}
      <div className="absolute bottom-6 left-6 z-20 bg-gray-900/80 backdrop-blur-sm rounded-lg p-4">
        <h3 className="text-white font-semibold mb-2">Memory Statistics</h3>
        <div className="space-y-1 text-sm">
          <div className="text-gray-300">
            Total Memories: {layers.reduce((acc, layer) => acc + layer.memories.length, 0)}
          </div>
          <div className="text-gray-300">
            Active Layers: {layers.length}
          </div>
          <div className="text-gray-300">
            Sacred Moments: {
              layers.reduce((acc, layer) => 
                acc + layer.memories.filter(m => m.sacredContext).length, 0
              )
            }
          </div>
        </div>
      </div>
    </div>
  );
}