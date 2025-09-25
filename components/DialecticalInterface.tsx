/**
 * 🌊 Dialectical Interface Component
 * Split-panel UI that displays both Machine and Cultural layers
 * with transparent bridge showing how structural analysis becomes archetypal meaning
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DialecticalResponse, Element, VoiceTone } from '../lib/dialectical-ai/core';

interface DialecticalInterfaceProps {
  response: DialecticalResponse;
  userPreference: 'analytical' | 'mythic' | 'balanced';
  onPreferenceChange: (preference: 'analytical' | 'mythic' | 'balanced') => void;
  showBridge: boolean;
  onBridgeToggle: (show: boolean) => void;
}

export const DialecticalInterface: React.FC<DialecticalInterfaceProps> = ({
  response,
  userPreference,
  onPreferenceChange,
  showBridge,
  onBridgeToggle
}) => {
  const [expandedLayer, setExpandedLayer] = useState<'machine' | 'cultural' | null>(null);
  const [animateElements, setAnimateElements] = useState(false);

  // Animate elements on mount
  useEffect(() => {
    setAnimateElements(true);
  }, [response]);

  // Calculate panel widths based on user preference
  const getPanelWidth = (layer: 'machine' | 'cultural') => {
    switch (userPreference) {
      case 'analytical':
        return layer === 'machine' ? '70%' : '30%';
      case 'mythic':
        return layer === 'machine' ? '30%' : '70%';
      default:
        return '50%';
    }
  };

  const elementColors = {
    fire: '#FF6B35',
    water: '#4682B4',
    earth: '#87A96B',
    air: '#E6E6FA'
  };

  return (
    <div className="dialectical-interface w-full max-w-4xl mx-auto bg-white/5 backdrop-blur-md rounded-lg border border-white/10">

      {/* Header with confidence indicator */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-amber-400 animate-pulse" />
          <span className="text-sm font-medium text-gray-700">Maya's Dialectical Response</span>
          <ConfidenceIndicator confidence={response.confidence} />
        </div>

        <PanelBalanceSlider
          value={userPreference}
          onChange={onPreferenceChange}
        />
      </div>

      {/* Main split-panel interface */}
      <div className="flex min-h-[400px]">

        {/* Machine Layer Panel */}
        <motion.div
          className="machine-panel border-r border-white/10 p-6"
          style={{ width: getPanelWidth('machine') }}
          animate={{ width: getPanelWidth('machine') }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-4 h-4 rounded border-2 border-gray-400 flex items-center justify-center">
              <div className="w-2 h-2 bg-gray-400 rounded-sm" />
            </div>
            <h3 className="font-semibold text-gray-800">Structural Analysis</h3>
          </div>

          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Pattern Observation */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Pattern Observed</h4>
                <p className="text-gray-800">{response.machine_layer.pattern_observed}</p>
              </div>

              {/* Data Confidence */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-blue-600">Data Points</div>
                  <div className="text-2xl font-bold text-blue-800">
                    {response.machine_layer.data_points}
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-green-600">Confidence</div>
                  <div className="text-2xl font-bold text-green-800">
                    {Math.round(response.machine_layer.confidence_level * 100)}%
                  </div>
                </div>
              </div>

              {/* Uncertainty Notes */}
              {response.machine_layer.uncertainty_notes.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-yellow-800 mb-2">Limitations</h4>
                  <ul className="space-y-1">
                    {response.machine_layer.uncertainty_notes.map((note, index) => (
                      <li key={index} className="text-sm text-yellow-700">• {note}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Audit Trail */}
              <details className="group">
                <summary className="cursor-pointer text-sm font-medium text-gray-600 group-open:text-gray-800">
                  View Reasoning Process
                </summary>
                <div className="mt-2 space-y-1">
                  {response.machine_layer.audit_trail.map((step, index) => (
                    <div key={index} className="text-sm text-gray-600 pl-4 border-l-2 border-gray-200">
                      {step}
                    </div>
                  ))}
                </div>
              </details>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Cultural Layer Panel */}
        <motion.div
          className="cultural-panel p-6 relative"
          style={{ width: getPanelWidth('cultural') }}
          animate={{ width: getPanelWidth('cultural') }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <ElementalIcon element={response.cultural_layer.elemental_resonance[0]} />
            <h3 className="font-semibold text-gray-800">Archetypal Translation</h3>
          </div>

          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Maya's Response */}
              <div className="bg-gradient-to-br from-amber-50 to-pink-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-400 to-pink-400 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">M</span>
                  </div>
                  <span className="text-sm font-medium text-amber-700">Maya</span>
                </div>
                <p className="text-gray-800 leading-relaxed">
                  {response.cultural_layer.maya_witness}
                </p>
              </div>

              {/* Elemental Resonance */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-600">Elemental Resonance</h4>
                <div className="flex gap-2">
                  {response.cultural_layer.elemental_resonance.map((element, index) => (
                    <motion.div
                      key={element}
                      initial={{ scale: 0 }}
                      animate={{ scale: animateElements ? 1 : 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`px-3 py-1 rounded-full text-sm font-medium text-white`}
                      style={{ backgroundColor: elementColors[element] }}
                    >
                      {element.toUpperCase()}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Spiral Position */}
              <div className="bg-indigo-50 p-3 rounded-lg">
                <h4 className="text-sm font-medium text-indigo-600 mb-2">Spiral Position</h4>
                <div className="flex items-center justify-between">
                  <span className="text-indigo-800 capitalize">
                    {response.cultural_layer.spiral_position.element} {response.cultural_layer.spiral_position.phase}
                  </span>
                  <div className="text-sm text-indigo-600">
                    {Math.round(response.cultural_layer.spiral_position.confidence * 100)}% confident
                  </div>
                </div>
              </div>

              {/* Ritual Suggestions */}
              {response.cultural_layer.ritual_suggestions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-600">Sacred Practices</h4>
                  <div className="space-y-2">
                    {response.cultural_layer.ritual_suggestions.map((ritual, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="bg-white/50 border border-white/20 p-3 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-800">
                            {ritual.suggestion}
                          </span>
                          <span className="text-xs text-gray-500">{ritual.time_estimate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ElementalIcon element={ritual.element} size="sm" />
                          <span className="text-xs text-gray-600 capitalize">{ritual.element} practice</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mythic Context */}
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                <h4 className="text-sm font-medium text-amber-800 mb-2">Mythic Context</h4>
                <p className="text-sm text-amber-700">{response.cultural_layer.mythic_context}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Bridge Explanation */}
      <AnimatePresence>
        {showBridge && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/10 p-4 bg-gradient-to-r from-blue-50 to-amber-50"
          >
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-400 to-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-800 mb-1">Dialectical Bridge</h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {response.bridge_explanation}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Controls */}
      <div className="flex items-center justify-between p-4 border-t border-white/10">
        <button
          onClick={() => onBridgeToggle(!showBridge)}
          className="text-sm text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-1"
        >
          <span>{showBridge ? 'Hide' : 'Show'} Bridge</span>
          <motion.div
            animate={{ rotate: showBridge ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            ↓
          </motion.div>
        </button>

        <div className="text-xs text-gray-500">
          Generated {new Date(response.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

// Supporting components
const ConfidenceIndicator: React.FC<{ confidence: number }> = ({ confidence }) => {
  const getConfidenceColor = (conf: number) => {
    if (conf > 0.8) return 'bg-green-400';
    if (conf > 0.6) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`w-1 h-3 rounded-sm ${
              i < confidence * 5 ? getConfidenceColor(confidence) : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-gray-600">{Math.round(confidence * 100)}%</span>
    </div>
  );
};

const PanelBalanceSlider: React.FC<{
  value: 'analytical' | 'mythic' | 'balanced';
  onChange: (value: 'analytical' | 'mythic' | 'balanced') => void;
}> = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-2 bg-white/20 rounded-full p-1">
      {[
        { key: 'analytical', label: 'Analytical' },
        { key: 'balanced', label: 'Balanced' },
        { key: 'mythic', label: 'Mythic' }
      ].map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key as any)}
          className={`px-3 py-1 text-xs rounded-full transition-all ${
            value === key
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

const ElementalIcon: React.FC<{
  element: Element;
  size?: 'sm' | 'md' | 'lg'
}> = ({ element, size = 'md' }) => {
  const icons = {
    fire: '🔥',
    water: '💧',
    earth: '🌍',
    air: '🌬️'
  };

  const sizeClasses = {
    sm: 'w-4 h-4 text-sm',
    md: 'w-6 h-6 text-base',
    lg: 'w-8 h-8 text-lg'
  };

  return (
    <div className={`${sizeClasses[size]} flex items-center justify-center`}>
      {icons[element]}
    </div>
  );
};

export default DialecticalInterface;