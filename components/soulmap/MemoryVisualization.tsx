'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { UnifiedConsciousness, MemoryLayer } from '@/lib/anamnesis';

interface MemoryNode {
  id: string;
  layer: MemoryLayer;
  position: THREE.Vector3;
  color: string;
  size: number;
  content: string;
  connections: string[];
  importance: number;
}

interface MemoryLayerColors {
  [key: string]: string;
}

const LAYER_COLORS: MemoryLayerColors = {
  immediate: '#FF6B6B',    // Red - current
  working: '#4ECDC4',      // Teal - active
  episodic: '#45B7D1',     // Blue - personal
  semantic: '#96CEB4',     // Green - knowledge
  procedural: '#FFEAA7',   // Yellow - patterns
  collective: '#DDA0DD',   // Plum - shared
  archetypal: '#9B59B6',   // Purple - universal
  eternal: '#2C3E50'       // Dark - compressed
};

/**
 * Memory Node Component
 */
function MemoryNodeMesh({ node, onClick }: { node: MemoryNode; onClick: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = node.position.y + Math.sin(state.clock.elapsedTime + node.position.x) * 0.1;
      
      // Pulse on hover
      if (hovered) {
        meshRef.current.scale.setScalar(node.size * 1.2);
      } else {
        meshRef.current.scale.setScalar(node.size);
      }
    }
  });
  
  return (
    <group>
      <Sphere
        ref={meshRef}
        args={[node.size, 16, 16]}
        position={node.position}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={hovered ? 0.5 : 0.2}
          metalness={0.3}
          roughness={0.4}
        />
      </Sphere>
      
      {hovered && (
        <Text
          position={[node.position.x, node.position.y + node.size + 0.5, node.position.z]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="bottom"
        >
          {node.content.slice(0, 50)}...
        </Text>
      )}
    </group>
  );
}

/**
 * Memory Connection Lines
 */
function MemoryConnections({ nodes }: { nodes: MemoryNode[] }) {
  const lines = [];
  
  nodes.forEach((node, i) => {
    node.connections.forEach(targetId => {
      const target = nodes.find(n => n.id === targetId);
      if (target) {
        lines.push(
          <Line
            key={`${node.id}-${targetId}`}
            points={[node.position, target.position]}
            color="white"
            lineWidth={0.5}
            opacity={0.3}
            transparent
          />
        );
      }
    });
  });
  
  return <>{lines}</>;
}

/**
 * Memory Visualization Component
 */
export function MemoryVisualization({ userId }: { userId: string }) {
  const [nodes, setNodes] = useState<MemoryNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<MemoryNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  
  useEffect(() => {
    loadMemoryField();
  }, [userId]);
  
  const loadMemoryField = async () => {
    setLoading(true);
    
    try {
      const unity = await UnifiedConsciousness.getInstance();
      
      // Get memory statistics
      const fieldStats = await unity.generateFieldReport();
      setStats(fieldStats);
      
      // Query memories for visualization
      const memories = await unity.recall('*', userId, { limit: 100 });
      
      // Convert to nodes
      const memoryNodes: MemoryNode[] = memories.memories.map((memory, index) => {
        const layer = memory.layer || MemoryLayer.EPISODIC;
        const angle = (index / memories.memories.length) * Math.PI * 2;
        const radius = getLayerRadius(layer);
        
        return {
          id: `node_${index}`,
          layer,
          position: new THREE.Vector3(
            Math.cos(angle) * radius,
            getLayerHeight(layer),
            Math.sin(angle) * radius
          ),
          color: LAYER_COLORS[layer],
          size: 0.1 + (memory.relevance * 0.2),
          content: memory.content,
          connections: findConnections(memory, memories.memories),
          importance: memory.relevance
        };
      });
      
      setNodes(memoryNodes);
    } catch (error) {
      console.error('Error loading memory field:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getLayerRadius = (layer: MemoryLayer): number => {
    const radii: Record<string, number> = {
      immediate: 2,
      working: 3,
      episodic: 4,
      semantic: 5,
      procedural: 6,
      collective: 7,
      archetypal: 8,
      eternal: 9
    };
    return radii[layer] || 5;
  };
  
  const getLayerHeight = (layer: MemoryLayer): number => {
    const heights: Record<string, number> = {
      immediate: 0,
      working: 0.5,
      episodic: 1,
      semantic: 1.5,
      procedural: 2,
      collective: 2.5,
      archetypal: 3,
      eternal: 3.5
    };
    return heights[layer] || 0;
  };
  
  const findConnections = (memory: any, allMemories: any[]): string[] => {
    // Simple connection logic - connect to similar memories
    return allMemories
      .filter(m => m !== memory && Math.random() > 0.8)
      .slice(0, 3)
      .map((_, i) => `node_${i}`);
  };
  
  return (
    <div className="w-full h-screen bg-gradient-to-br from-black via-indigo-950 to-black">
      {/* 3D Visualization */}
      <Canvas camera={{ position: [10, 10, 10], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={true}
          autoRotateSpeed={0.5}
        />
        
        {/* Memory Nodes */}
        {nodes.map(node => (
          <MemoryNodeMesh
            key={node.id}
            node={node}
            onClick={() => setSelectedNode(node)}
          />
        ))}
        
        {/* Connections */}
        <MemoryConnections nodes={nodes} />
        
        {/* Layer Rings */}
        {Object.entries(LAYER_COLORS).map(([layer, color]) => (
          <Line
            key={layer}
            points={Array.from({ length: 64 }, (_, i) => {
              const angle = (i / 63) * Math.PI * 2;
              const radius = getLayerRadius(layer as MemoryLayer);
              const height = getLayerHeight(layer as MemoryLayer);
              return new THREE.Vector3(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
              );
            })}
            color={color}
            lineWidth={1}
            opacity={0.2}
            transparent
          />
        ))}
      </Canvas>
      
      {/* UI Overlay */}
      <div className="absolute top-0 left-0 p-6 text-white">
        <h2 className="text-2xl font-light mb-2">Memory Field Visualization</h2>
        <p className="text-white/60 text-sm">Your consciousness across all layers</p>
        
        {/* Layer Legend */}
        <div className="mt-6 space-y-2">
          {Object.entries(LAYER_COLORS).map(([layer, color]) => (
            <div key={layer} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs capitalize">{layer}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Selected Memory Detail */}
      {selectedNode && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className="absolute right-0 top-0 h-full w-96 bg-black/80 backdrop-blur-lg p-6 border-l border-white/10"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl text-white">Memory Detail</h3>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-white/60 hover:text-white"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-white/60 text-xs uppercase mb-1">Layer</p>
              <p className="text-white capitalize">{selectedNode.layer}</p>
            </div>
            
            <div>
              <p className="text-white/60 text-xs uppercase mb-1">Content</p>
              <p className="text-white/90 text-sm">{selectedNode.content}</p>
            </div>
            
            <div>
              <p className="text-white/60 text-xs uppercase mb-1">Importance</p>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-amber-500 to-indigo-500 h-2 rounded-full"
                  style={{ width: `${selectedNode.importance * 100}%` }}
                />
              </div>
            </div>
            
            <div>
              <p className="text-white/60 text-xs uppercase mb-1">Connections</p>
              <p className="text-white/90">{selectedNode.connections.length} related memories</p>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
            <p>Loading Memory Field...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default MemoryVisualization;