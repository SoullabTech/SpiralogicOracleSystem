// frontend/src/components/dashboard/HoloflowerDashboard.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface ElementalState {
  element: string;
  intensity: number;
  emoji: string;
  color: string;
  angle: number;
}

interface HoloflowerEntry {
  id: string;
  user_id: string;
  fire: number;
  water: number;
  earth: number;
  air: number;
  aether: number;
  shadow: number;
  reflection?: string;
  created_at: string;
}

const HoloflowerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [elementalStates, setElementalStates] = useState<ElementalState[]>([
    { element: 'fire', intensity: 50, emoji: '🔥', color: '#dc2626', angle: 0 },
    { element: 'water', intensity: 50, emoji: '🌊', color: '#0369a1', angle: 60 },
    { element: 'earth', intensity: 50, emoji: '🌱', color: '#16a34a', angle: 120 },
    { element: 'air', intensity: 50, emoji: '💨', color: '#7c3aed', angle: 180 },
    { element: 'aether', intensity: 50, emoji: '✨', color: '#d4af37', angle: 240 },
    { element: 'shadow', intensity: 50, emoji: '🌑', color: '#374151', angle: 300 }
  ]);

  const [reflection, setReflection] = useState('');
  const [saving, setSaving] = useState(false);
  const [recentEntries, setRecentEntries] = useState<HoloflowerEntry[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  useEffect(() => {
    loadRecentEntries();
  }, [user]);

  const loadRecentEntries = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('holoflower_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (data) {
        setRecentEntries(data);
      }
    } catch (error) {
      console.error('Failed to load recent entries:', error);
    }
  };

  const updateElementIntensity = (element: string, intensity: number) => {
    setElementalStates(prev =>
      prev.map(state =>
        state.element === element ? { ...state, intensity } : state
      )
    );
  };

  const handleSubmitCheckIn = async () => {
    if (!user) return;

    setSaving(true);

    try {
      const entryData = {
        user_id: user.id,
        fire: elementalStates.find(s => s.element === 'fire')?.intensity || 50,
        water: elementalStates.find(s => s.element === 'water')?.intensity || 50,
        earth: elementalStates.find(s => s.element === 'earth')?.intensity || 50,
        air: elementalStates.find(s => s.element === 'air')?.intensity || 50,
        aether: elementalStates.find(s => s.element === 'aether')?.intensity || 50,
        shadow: elementalStates.find(s => s.element === 'shadow')?.intensity || 50,
        reflection: reflection.trim() || null,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('holoflower_entries')
        .insert(entryData);

      if (error) throw error;

      // Reset form
      setReflection('');
      setSelectedElement(null);

      // Reload recent entries
      await loadRecentEntries();

    } catch (error) {
      console.error('Failed to save Holoflower check-in:', error);
    } finally {
      setSaving(false);
    }
  };

  const calculatePetalPath = (state: ElementalState): string => {
    const centerX = 150;
    const centerY = 150;
    const maxRadius = 80;
    const minRadius = 20;
    const radius = minRadius + (maxRadius - minRadius) * (state.intensity / 100);

    const angleRad = (state.angle * Math.PI) / 180;
    const x = centerX + radius * Math.cos(angleRad);
    const y = centerY + radius * Math.sin(angleRad);

    // Create organic petal shape
    const controlRadius = radius * 0.7;
    const angle1 = angleRad - 0.3;
    const angle2 = angleRad + 0.3;

    const cx1 = centerX + controlRadius * Math.cos(angle1);
    const cy1 = centerY + controlRadius * Math.sin(angle1);
    const cx2 = centerX + controlRadius * Math.cos(angle2);
    const cy2 = centerY + controlRadius * Math.sin(angle2);

    return `M ${centerX} ${centerY} Q ${cx1} ${cy1} ${x} ${y} Q ${cx2} ${cy2} ${centerX} ${centerY}`;
  };

  const getCoherenceLevel = (): number => {
    const average = elementalStates.reduce((sum, state) => sum + state.intensity, 0) / elementalStates.length;
    const variance = elementalStates.reduce((sum, state) => sum + Math.pow(state.intensity - average, 2), 0) / elementalStates.length;
    const standardDeviation = Math.sqrt(variance);

    // Lower standard deviation = higher coherence
    return Math.max(0, Math.min(100, 100 - (standardDeviation * 2)));
  };

  return (
    <div className="min-h-screen bg-[#0E0F1B] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-light text-[#F6E27F] mb-4">Holoflower Check-In</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Attune to your elemental landscape. Adjust each petal to reflect your current state.
          </p>

          {/* Coherence Indicator */}
          <div className="mt-6 flex justify-center">
            <div className="bg-[#1A1C2C] border border-gray-600 rounded-xl p-4 min-w-[200px]">
              <div className="text-sm text-gray-400 mb-1">Current Coherence</div>
              <div className="text-2xl font-light text-[#F6E27F]">
                {Math.round(getCoherenceLevel())}%
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Holoflower Visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="relative">
              <svg width="300" height="300" className="drop-shadow-lg">
                {/* Background circles */}
                <circle cx="150" cy="150" r="100" fill="none" stroke="#334155" strokeWidth="1" opacity="0.3" />
                <circle cx="150" cy="150" r="60" fill="none" stroke="#334155" strokeWidth="1" opacity="0.2" />

                {/* Petals */}
                {elementalStates.map((state, index) => (
                  <motion.path
                    key={state.element}
                    d={calculatePetalPath(state)}
                    fill={state.color}
                    opacity={selectedElement === state.element ? 0.9 : 0.7}
                    stroke={state.color}
                    strokeWidth="2"
                    className="cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setSelectedElement(selectedElement === state.element ? null : state.element)}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.1 * index }}
                  />
                ))}

                {/* Center point */}
                <circle cx="150" cy="150" r="6" fill="#F6E27F" opacity="0.8" />
              </svg>

              {/* Element labels */}
              {elementalStates.map((state) => {
                const labelRadius = 120;
                const angleRad = (state.angle * Math.PI) / 180;
                const x = 150 + labelRadius * Math.cos(angleRad);
                const y = 150 + labelRadius * Math.sin(angleRad);

                return (
                  <div
                    key={`label-${state.element}`}
                    className="absolute text-sm font-medium text-gray-300 transform -translate-x-1/2 -translate-y-1/2 flex items-center space-x-1"
                    style={{
                      left: `${x}px`,
                      top: `${y}px`,
                    }}
                  >
                    <span className="text-lg">{state.emoji}</span>
                    <span className="capitalize">{state.element}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Controls */}
          <div className="space-y-6">
            {/* Element Slider */}
            {selectedElement ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[#1A1C2C] border border-gray-600 rounded-xl p-6"
              >
                {(() => {
                  const state = elementalStates.find(s => s.element === selectedElement);
                  if (!state) return null;

                  return (
                    <>
                      <h3 className="text-xl text-[#F6E27F] font-medium mb-4 flex items-center">
                        <span className="text-2xl mr-3">{state.emoji}</span>
                        <span className="capitalize">{state.element} Element</span>
                      </h3>

                      <div className="space-y-4">
                        <div className="flex justify-between text-sm text-gray-400">
                          <span>Depleted</span>
                          <span>Intense</span>
                        </div>

                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={state.intensity}
                          onChange={(e) => updateElementIntensity(state.element, parseInt(e.target.value))}
                          className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, #374151 0%, ${state.color} ${state.intensity}%, #374151 ${state.intensity}%)`
                          }}
                        />

                        <div className="text-center">
                          <span className="text-2xl font-light" style={{ color: state.color }}>
                            {state.intensity}
                          </span>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            ) : (
              <div className="bg-[#1A1C2C] border border-gray-600 rounded-xl p-6 text-center">
                <p className="text-gray-400">Click on an element petal to adjust its intensity</p>
              </div>
            )}

            {/* Reflection */}
            <div className="bg-[#1A1C2C] border border-gray-600 rounded-xl p-6">
              <h3 className="text-lg text-[#F6E27F] font-medium mb-3">Brief Reflection</h3>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="What patterns do you notice in your elemental state today?"
                className="w-full px-4 py-3 bg-[#0E0F1B] border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:border-[#F6E27F] focus:outline-none resize-none"
                rows={3}
                maxLength={280}
              />
              <div className="text-right text-xs text-gray-500 mt-2">
                {reflection.length}/280
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmitCheckIn}
              disabled={saving}
              className="w-full bg-[#F6E27F] text-[#0E0F1B] py-3 px-6 rounded-xl font-medium hover:bg-[#F6E27F]/90 disabled:bg-gray-600 disabled:text-gray-400 transition-colors"
            >
              {saving ? 'Recording State...' : 'Complete Check-In'}
            </button>

            {/* Recent Entries */}
            {recentEntries.length > 0 && (
              <div className="bg-[#1A1C2C] border border-gray-600 rounded-xl p-6">
                <h3 className="text-lg text-[#F6E27F] font-medium mb-3">Recent Check-Ins</h3>
                <div className="space-y-2">
                  {recentEntries.slice(0, 3).map((entry) => (
                    <div key={entry.id} className="flex justify-between items-center text-sm">
                      <span className="text-gray-300">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </span>
                      <span className="text-gray-500">
                        Coherence: {Math.round(
                          100 - (Math.sqrt(
                            ([entry.fire, entry.water, entry.earth, entry.air, entry.aether, entry.shadow]
                              .reduce((sum, val) => sum + Math.pow(val - 50, 2), 0) / 6)
                          ) * 2)
                        )}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HoloflowerDashboard;