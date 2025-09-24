'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ChevronLeft, X } from 'lucide-react';

interface OrganicPetal {
  id: number;
  name: string;
  element: 'fire' | 'water' | 'earth' | 'air';
  angle: number;
  color: string;
  value: number; // 0-10 how expanded the petal is
}

// Simple, clean petal data matching your design image
const ORGANIC_PETALS: OrganicPetal[] = [
  // Fire quadrant (top right - warm colors)
  { id: 1, name: 'Passion', element: 'fire', angle: 30, color: '#D97A5E', value: 7 },
  { id: 2, name: 'Energy', element: 'fire', angle: 60, color: '#E89B7F', value: 7 },
  { id: 3, name: 'Vision', element: 'fire', angle: 90, color: '#C75C4A', value: 7 },

  // Water quadrant (bottom right - blue colors)
  { id: 4, name: 'Flow', element: 'water', angle: 120, color: '#5A8FA3', value: 7 },
  { id: 5, name: 'Emotion', element: 'water', angle: 150, color: '#7FB3C8', value: 7 },
  { id: 6, name: 'Intuition', element: 'water', angle: 180, color: '#3E6B7C', value: 7 },

  // Earth quadrant (bottom left - green colors)
  { id: 7, name: 'Ground', element: 'earth', angle: 210, color: '#6B8E5C', value: 7 },
  { id: 8, name: 'Nurture', element: 'earth', angle: 240, color: '#8FAF79', value: 7 },
  { id: 9, name: 'Manifest', element: 'earth', angle: 270, color: '#4A6741', value: 7 },

  // Air quadrant (top left - golden colors)
  { id: 10, name: 'Breathe', element: 'air', angle: 300, color: '#E0C464', value: 7 },
  { id: 11, name: 'Connect', element: 'air', angle: 330, color: '#F0D878', value: 7 },
  { id: 12, name: 'Inspire', element: 'air', angle: 360, color: '#D4AF37', value: 7 }
];

interface SimpleOrganicHoloflowerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (values: number[]) => void;
}

export function SimpleOrganicHoloflower({
  isOpen,
  onClose,
  onSubmit
}: SimpleOrganicHoloflowerProps) {
  const [petals, setPetals] = useState(ORGANIC_PETALS);
  const [selectedPetal, setSelectedPetal] = useState<OrganicPetal | null>(null);
  const [isDragging, setIsDragging] = useState<number | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const centerX = 250;
  const centerY = 250;

  // Haptic feedback for mobile
  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  // Handle petal drag - natural in/out movement
  const handlePetalDrag = (petalId: number, event: any, info: PanInfo) => {
    const petal = petals.find(p => p.id === petalId);
    if (!petal) return;

    // Calculate drag distance from center
    const dragX = info.point.x - centerX;
    const dragY = info.point.y - centerY;
    const distance = Math.sqrt(dragX * dragX + dragY * dragY);

    // Map distance to value (closer = smaller value, further = larger value)
    const newValue = Math.max(0, Math.min(10, (distance / 25)));

    setPetals(prev => prev.map(p =>
      p.id === petalId ? { ...p, value: newValue } : p
    ));

    triggerHaptic();
  };

  // Create organic petal path
  const createPetalPath = (petal: OrganicPetal) => {
    const angleRad = (petal.angle - 90) * Math.PI / 180;
    const baseRadius = 80;
    const petalLength = baseRadius + (petal.value * 10);
    const petalWidth = 25 + (petal.value * 3);

    // Calculate petal base position
    const baseX = centerX + Math.cos(angleRad) * 50;
    const baseY = centerY + Math.sin(angleRad) * 50;

    // Calculate petal tip position
    const tipX = centerX + Math.cos(angleRad) * petalLength;
    const tipY = centerY + Math.sin(angleRad) * petalLength;

    // Calculate control points for curves
    const perpAngle = angleRad + Math.PI / 2;
    const cp1X = baseX + Math.cos(perpAngle) * petalWidth;
    const cp1Y = baseY + Math.sin(perpAngle) * petalWidth;
    const cp2X = baseX - Math.cos(perpAngle) * petalWidth;
    const cp2Y = baseY - Math.sin(perpAngle) * petalWidth;

    // Create smooth petal path
    return `
      M ${baseX} ${baseY}
      Q ${cp1X} ${cp1Y}, ${tipX} ${tipY}
      Q ${cp2X} ${cp2Y}, ${baseX} ${baseY}
      Z
    `;
  };

  const handleSubmit = () => {
    const values = petals.map(p => p.value);
    onSubmit?.(values);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 z-50 overflow-hidden"
      >
        {/* Simple Header */}
        <div className="absolute top-0 left-0 right-0 bg-black/30 backdrop-blur-sm px-4 py-3">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back</span>
            </button>

            <h2 className="text-white font-light">Daily Energy Check-In</h2>

            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>

        {/* Main Holoflower */}
        <div className="flex items-center justify-center h-full">
          <div className="relative">
            {/* Instructions */}
            <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 text-center">
              <p className="text-white/60 text-sm">
                Drag petals in or out to match your energy
              </p>
            </div>

            {/* SVG Holoflower */}
            <svg
              ref={svgRef}
              width="500"
              height="500"
              className="touch-none"
              style={{ touchAction: 'none' }}
            >
              {/* Background circles */}
              <circle cx={centerX} cy={centerY} r="200" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <circle cx={centerX} cy={centerY} r="150" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <circle cx={centerX} cy={centerY} r="100" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

              {/* Center circle with sacred geometry pattern */}
              <defs>
                <radialGradient id="centerGradient">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                  <stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </radialGradient>
              </defs>

              <circle cx={centerX} cy={centerY} r="40" fill="url(#centerGradient)" />

              {/* Sacred geometry center pattern */}
              <g transform={`translate(${centerX}, ${centerY})`}>
                {[...Array(12)].map((_, i) => {
                  const angle = (i * 30) * Math.PI / 180;
                  const r = 30;
                  return (
                    <circle
                      key={i}
                      cx={Math.cos(angle) * r}
                      cy={Math.sin(angle) * r}
                      r="2"
                      fill="rgba(255,255,255,0.3)"
                    />
                  );
                })}
              </g>

              {/* Render Organic Petals */}
              {petals.map(petal => (
                <motion.path
                  key={petal.id}
                  d={createPetalPath(petal)}
                  fill={petal.color}
                  fillOpacity={0.7 + (petal.value / 30)}
                  stroke={petal.color}
                  strokeWidth="1"
                  strokeOpacity="0.3"
                  drag
                  dragElastic={0.2}
                  dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
                  onDrag={(e, info) => handlePetalDrag(petal.id, e, info)}
                  onDragStart={() => {
                    setIsDragging(petal.id);
                    triggerHaptic();
                  }}
                  onDragEnd={() => setIsDragging(null)}
                  whileHover={{
                    fillOpacity: 0.9,
                    filter: 'brightness(1.2)'
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedPetal(petal)}
                  style={{ cursor: 'grab' }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    filter: isDragging === petal.id ? 'brightness(1.3) drop-shadow(0 0 20px rgba(255,255,255,0.5))' : 'brightness(1)'
                  }}
                  transition={{ delay: petal.id * 0.03 }}
                />
              ))}

              {/* Center submit button */}
              <motion.g
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  cx={centerX}
                  cy={centerY}
                  r="25"
                  fill="rgba(255,255,255,0.1)"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="2"
                />
                <text
                  x={centerX}
                  y={centerY + 5}
                  textAnchor="middle"
                  fill="white"
                  fontSize="12"
                  opacity="0.8"
                >
                  ✓
                </text>
              </motion.g>
            </svg>

            {/* Selected petal info */}
            <AnimatePresence>
              {selectedPetal && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute -bottom-24 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm rounded-lg px-4 py-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedPetal.color }} />
                    <span className="text-white text-sm">{selectedPetal.name}</span>
                    <span className="text-white/60 text-xs">
                      {Math.round(selectedPetal.value * 10)}%
                    </span>
                    <button
                      onClick={() => setSelectedPetal(null)}
                      className="text-white/40 hover:text-white/60 ml-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Energy Balance */}
            <div className="absolute top-full mt-8 left-1/2 transform -translate-x-1/2">
              <div className="flex gap-6 text-xs text-white/60">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#D97A5E' }} />
                  <span>Fire</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#5A8FA3' }} />
                  <span>Water</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#6B8E5C' }} />
                  <span>Earth</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#E0C464' }} />
                  <span>Air</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}