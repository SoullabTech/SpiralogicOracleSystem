'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HoloflowerCore } from '../holoflower/HoloflowerCore';

/**
 * MANDALA OF PRESENCE
 * The holoflower at center surrounded by four consciousness fields
 * Each panel can be activated to augment the central presence
 *
 * CENTER: Holoflower - Pure presence and witnessing
 * TOP: Higher Self Systems (Conscious Awareness)
 * BOTTOM: Subconscious Operations (Shadow/Somatic)
 * LEFT: Emissary Analytics (Left Brain/Sequential)
 * RIGHT: Master Intuition (Right Brain/Wholeness)
 */

interface FieldResonance {
  top: number;    // Higher Self activation
  bottom: number; // Subconscious activation
  left: number;   // Emissary activation
  right: number;  // Master activation
}

interface ConsciousnessField {
  position: 'top' | 'bottom' | 'left' | 'right';
  name: string;
  subtitle: string;
  herrmann: string;
  jung: string;
  mcgilchrist: string;
  color: string;
  metrics: {
    primary: number;
    secondary: number;
    tertiary: number;
  };
  active: boolean;
}

const MandalaOfPresence: React.FC = () => {
  const [fieldResonance, setFieldResonance] = useState<FieldResonance>({
    top: 0.3,
    bottom: 0.3,
    left: 0.3,
    right: 0.3
  });

  const [activeFields, setActiveFields] = useState<Set<string>>(new Set());
  const [holoflowerEnergy, setHoloflowerEnergy] = useState<'dense' | 'emerging' | 'radiant'>('emerging');
  const [selectedPetal, setSelectedPetal] = useState<any>(null);

  // Define the four consciousness fields
  const fields: ConsciousnessField[] = [
    {
      position: 'top',
      name: 'Higher Self',
      subtitle: 'Witnessing Awareness',
      herrmann: 'A+D (Upper Brain)',
      jung: 'Conscious Mind',
      mcgilchrist: 'Integrated Awareness',
      color: 'purple',
      metrics: {
        primary: 0.75,   // Presence Quality
        secondary: 0.82, // Metacognitive Clarity
        tertiary: 0.68   // Sacred Resonance
      },
      active: false
    },
    {
      position: 'bottom',
      name: 'Deep Psyche',
      subtitle: 'Shadow & Soma',
      herrmann: 'B+C (Lower Brain)',
      jung: 'Unconscious',
      mcgilchrist: 'Embodied Knowing',
      color: 'indigo',
      metrics: {
        primary: 0.64,   // Shadow Integration
        secondary: 0.71, // Somatic Wisdom
        tertiary: 0.58   // Archetypal Resonance
      },
      active: false
    },
    {
      position: 'left',
      name: 'Emissary Mind',
      subtitle: 'Analysis & Structure',
      herrmann: 'A+B (Left Brain)',
      jung: 'Thinking/Sensation',
      mcgilchrist: 'Left Hemisphere',
      color: 'blue',
      metrics: {
        primary: 0.84,   // Analytical Clarity
        secondary: 0.79, // Pattern Recognition
        tertiary: 0.71   // Safety Protocols
      },
      active: false
    },
    {
      position: 'right',
      name: 'Master Wisdom',
      subtitle: 'Intuition & Wholeness',
      herrmann: 'C+D (Right Brain)',
      jung: 'Feeling/Intuition',
      mcgilchrist: 'Right Hemisphere',
      color: 'amber',
      metrics: {
        primary: 0.72,   // Intuitive Knowing
        secondary: 0.68, // Wholeness Perception
        tertiary: 0.81   // Connection Quality
      },
      active: false
    }
  ];

  // Activate/deactivate field
  const toggleField = (position: string) => {
    setActiveFields(prev => {
      const newSet = new Set(prev);
      if (newSet.has(position)) {
        newSet.delete(position);
        // Decrease resonance
        setFieldResonance(prev => ({
          ...prev,
          [position]: Math.max(0.3, prev[position as keyof FieldResonance] - 0.2)
        }));
      } else {
        newSet.add(position);
        // Increase resonance
        setFieldResonance(prev => ({
          ...prev,
          [position]: Math.min(1, prev[position as keyof FieldResonance] + 0.3)
        }));
      }
      return newSet;
    });

    // Update holoflower energy based on active fields
    updateHoloflowerEnergy();
  };

  const updateHoloflowerEnergy = () => {
    const totalResonance = Object.values(fieldResonance).reduce((sum, val) => sum + val, 0) / 4;
    if (totalResonance > 0.7) {
      setHoloflowerEnergy('radiant');
    } else if (totalResonance > 0.5) {
      setHoloflowerEnergy('emerging');
    } else {
      setHoloflowerEnergy('dense');
    }
  };

  // Handle petal selection from holoflower
  const handlePetalSelect = (petal: any) => {
    setSelectedPetal(petal);

    // Activate related fields based on element correspondences
    // Fire/Water = Right Hemisphere (Master)
    // Earth/Air = Left Hemisphere (Emissary)
    // Air/Fire = Conscious Processes (Upper)
    // Water/Earth = Subconscious Processes (Lower)

    const elementToFields: Record<string, string[]> = {
      'fire': ['right', 'top'],   // Fire = Right hemisphere + Conscious
      'water': ['right', 'bottom'], // Water = Right hemisphere + Subconscious
      'air': ['left', 'top'],     // Air = Left hemisphere + Conscious
      'earth': ['left', 'bottom'], // Earth = Left hemisphere + Subconscious
      'aether': ['top', 'bottom', 'left', 'right'] // Aether = All fields
    };

    const fieldsToActivate = elementToFields[petal.element] || [];
    fieldsToActivate.forEach(field => {
      if (!activeFields.has(field)) {
        toggleField(field);
      }
    });
  };

  // Render augmenting field panel
  const renderField = (field: ConsciousnessField) => {
    const isActive = activeFields.has(field.position);
    const resonance = fieldResonance[field.position];

    const positionStyles = {
      top: 'top-0 left-1/2 -translate-x-1/2 w-96 h-32',
      bottom: 'bottom-0 left-1/2 -translate-x-1/2 w-96 h-32',
      left: 'left-0 top-1/2 -translate-y-1/2 w-64 h-96',
      right: 'right-0 top-1/2 -translate-y-1/2 w-64 h-96'
    };

    return (
      <motion.div
        key={field.position}
        className={`absolute ${positionStyles[field.position]} z-20`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <motion.div
          className={`h-full bg-slate-900/80 backdrop-blur-md rounded-2xl border-2 p-4 cursor-pointer transition-all ${
            isActive
              ? `border-${field.color}-500 shadow-2xl shadow-${field.color}-500/20`
              : 'border-gray-700/50 hover:border-gray-600'
          }`}
          onClick={() => toggleField(field.position)}
          animate={{
            scale: isActive ? 1.02 : 1,
            borderWidth: isActive ? '3px' : '2px'
          }}
          whileHover={{ scale: isActive ? 1.02 : 1.01 }}
        >
          {/* Field content */}
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className={`text-sm font-medium ${
                  isActive ? `text-${field.color}-400` : 'text-gray-400'
                }`}>
                  {field.name}
                </h3>
                <p className="text-xs text-gray-500">{field.subtitle}</p>
              </div>
              <motion.div
                className={`w-2 h-2 rounded-full ${
                  isActive ? `bg-${field.color}-400` : 'bg-gray-600'
                }`}
                animate={{
                  scale: isActive ? [1, 1.2, 1] : 1
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
              />
            </div>

            {/* Metrics visualization */}
            <div className="flex-1 flex items-center justify-center">
              {field.position === 'top' || field.position === 'bottom' ? (
                // Horizontal layout for top/bottom
                <div className="flex gap-4 w-full">
                  <MetricBar label="Primary" value={field.metrics.primary * resonance} vertical={false} />
                  <MetricBar label="Secondary" value={field.metrics.secondary * resonance} vertical={false} />
                  <MetricBar label="Tertiary" value={field.metrics.tertiary * resonance} vertical={false} />
                </div>
              ) : (
                // Vertical layout for left/right
                <div className="flex flex-col gap-3 h-full justify-center">
                  <MetricBar label="Primary" value={field.metrics.primary * resonance} vertical={true} />
                  <MetricBar label="Secondary" value={field.metrics.secondary * resonance} vertical={true} />
                  <MetricBar label="Tertiary" value={field.metrics.tertiary * resonance} vertical={true} />
                </div>
              )}
            </div>

            {/* Resonance indicator */}
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Field Resonance</span>
                <span className={isActive ? `text-${field.color}-400` : 'text-gray-400'}>
                  {(resonance * 100).toFixed(0)}%
                </span>
              </div>
              <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${
                    isActive
                      ? `from-${field.color}-600 to-${field.color}-400`
                      : 'from-gray-600 to-gray-500'
                  }`}
                  animate={{ width: `${resonance * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Consciousness model labels */}
            {isActive && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-2 pt-2 border-t border-gray-800 text-xs space-y-1"
              >
                <div className="text-gray-500">
                  <span className="text-gray-600">Herrmann:</span> {field.herrmann}
                </div>
                <div className="text-gray-500">
                  <span className="text-gray-600">Jung:</span> {field.jung}
                </div>
                <div className="text-gray-500">
                  <span className="text-gray-600">McGilchrist:</span> {field.mcgilchrist}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Connection line to center */}
        {isActive && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <motion.line
              x1={field.position === 'left' || field.position === 'right' ? '50%' : '50%'}
              y1={field.position === 'top' || field.position === 'bottom' ? '50%' : '50%'}
              x2={field.position === 'left' ? '100%' : field.position === 'right' ? '0%' : '50%'}
              y2={field.position === 'top' ? '100%' : field.position === 'bottom' ? '0%' : '50%'}
              stroke={`url(#gradient-${field.position})`}
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1 }}
            />
            <defs>
              <linearGradient id={`gradient-${field.position}`}>
                <stop offset="0%" stopColor={`var(--${field.color}-500)`} stopOpacity="0" />
                <stop offset="50%" stopColor={`var(--${field.color}-400)`} stopOpacity="0.5" />
                <stop offset="100%" stopColor={`var(--${field.color}-300)`} stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        )}
      </motion.div>
    );
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Background sacred geometry */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full">
          {/* Mandala circles */}
          {[1, 2, 3, 4].map(i => (
            <motion.circle
              key={i}
              cx="50%"
              cy="50%"
              r={`${i * 15}%`}
              fill="none"
              stroke="rgba(147, 51, 234, 0.2)"
              strokeWidth="1"
              animate={{
                rotate: i % 2 === 0 ? 360 : -360
              }}
              transition={{
                duration: 60 + i * 10,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </svg>
      </div>

      {/* Central Holoflower */}
      <div className="absolute inset-0 z-10">
        <HoloflowerCore
          onPetalSelect={handlePetalSelect}
          energyState={holoflowerEnergy}
        />
      </div>

      {/* Four Augmenting Fields */}
      {fields.map(field => renderField(field))}

      {/* Field activation indicator */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30">
        <motion.div
          className="bg-slate-900/80 backdrop-blur-md rounded-full px-4 py-2 text-xs text-gray-400"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {activeFields.size === 0
            ? 'Click panels to augment presence'
            : `${activeFields.size} field${activeFields.size > 1 ? 's' : ''} active`
          }
        </motion.div>
      </div>

      {/* Selected petal info */}
      <AnimatePresence>
        {selectedPetal && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30"
          >
            <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl px-6 py-3 text-center">
              <div className="text-sm text-purple-400 font-medium">
                {selectedPetal.element} • {selectedPetal.name}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {selectedPetal.message}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper component for metric bars
const MetricBar: React.FC<{
  label: string;
  value: number;
  vertical: boolean;
}> = ({ label, value, vertical }) => (
  <div className={`${vertical ? 'w-full' : 'flex-1'}`}>
    <div className={`text-xs text-gray-600 mb-1 ${vertical ? '' : 'text-center'}`}>
      {label}
    </div>
    <div className={`${
      vertical
        ? 'h-2 bg-gray-800'
        : 'h-16 w-full bg-gray-800 relative'
    } rounded-full overflow-hidden`}>
      <motion.div
        className="bg-gradient-to-r from-purple-600 to-purple-400"
        animate={vertical
          ? { width: `${value * 100}%` }
          : { height: `${value * 100}%`, y: `${(1 - value) * 100}%` }
        }
        style={vertical ? {} : { position: 'absolute', bottom: 0, width: '100%' }}
        transition={{ duration: 0.5 }}
      />
    </div>
  </div>
);

export default MandalaOfPresence;