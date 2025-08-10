import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface PetalState {
  id: string;
  label: string;
  value: number; // 0-100
  color: string;
  angle: number; // degrees for positioning
}

interface HoloflowerState {
  petals: PetalState[];
  timestamp: Date;
  reflection?: string;
}

const HoloflowerCheckIn: React.FC = () => {
  const [currentState, setCurrentState] = useState<HoloflowerState>({
    petals: [
      { id: 'fire', label: 'Fire', value: 50, color: '#dc2626', angle: 0 },
      { id: 'water', label: 'Water', value: 50, color: '#0369a1', angle: 60 },
      { id: 'earth', label: 'Earth', value: 50, color: '#16a34a', angle: 120 },
      { id: 'air', label: 'Air', value: 50, color: '#7c3aed', angle: 180 },
      { id: 'aether', label: 'Aether', value: 50, color: '#d4af37', angle: 240 },
      { id: 'shadow', label: 'Shadow', value: 50, color: '#374151', angle: 300 }
    ],
    timestamp: new Date()
  });

  const [activeElement, setActiveElement] = useState<string | null>(null);
  const [reflection, setReflection] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updatePetalValue = (id: string, value: number) => {
    setCurrentState(prev => ({
      ...prev,
      petals: prev.petals.map(petal =>
        petal.id === id ? { ...petal, value: Math.max(0, Math.min(100, value)) } : petal
      )
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const checkInData = {
      ...currentState,
      reflection: reflection.trim() || undefined,
      timestamp: new Date()
    };

    try {
      // Submit to backend
      const response = await fetch('/api/holoflower/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkInData)
      });

      if (response.ok) {
        // Reset form or show success state
        setReflection('');
        // Could trigger a success animation or redirect
      }
    } catch (error) {
      console.error('Check-in submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculatePetalPath = (petal: PetalState): string => {
    const centerX = 150;
    const centerY = 150;
    const maxRadius = 80;
    const minRadius = 20;
    const radius = minRadius + (maxRadius - minRadius) * (petal.value / 100);

    const angleRad = (petal.angle * Math.PI) / 180;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.618 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-light text-amber-100 mb-2">Holoflower State</h1>
          <p className="text-slate-300">Attune to your elemental landscape</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Holoflower Visualization */}
          <div className="flex justify-center">
            <div className="relative">
              <svg width="300" height="300" className="transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="150"
                  cy="150"
                  r="100"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="1"
                  opacity="0.3"
                />

                {/* Petals */}
                {currentState.petals.map((petal) => (
                  <motion.path
                    key={petal.id}
                    d={calculatePetalPath(petal)}
                    fill={petal.color}
                    opacity={activeElement === petal.id ? 0.9 : 0.7}
                    stroke={petal.color}
                    strokeWidth="2"
                    className="cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setActiveElement(activeElement === petal.id ? null : petal.id)}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.1 * currentState.petals.indexOf(petal) }}
                  />
                ))}

                {/* Center point */}
                <circle
                  cx="150"
                  cy="150"
                  r="4"
                  fill="#d4af37"
                />
              </svg>

              {/* Element labels */}
              {currentState.petals.map((petal) => {
                const labelRadius = 120;
                const angleRad = (petal.angle * Math.PI) / 180;
                const x = 150 + labelRadius * Math.cos(angleRad);
                const y = 150 + labelRadius * Math.sin(angleRad);

                return (
                  <div
                    key={`label-${petal.id}`}
                    className="absolute text-sm font-medium text-slate-300 transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${x}px`,
                      top: `${y}px`,
                    }}
                  >
                    {petal.label}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            {activeElement ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                {(() => {
                  const petal = currentState.petals.find(p => p.id === activeElement);
                  if (!petal) return null;

                  return (
                    <>
                      <h3 className="text-xl text-amber-100 font-medium">{petal.label} Element</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm text-slate-400">
                          <span>Depletion</span>
                          <span>Intensity</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={petal.value}
                          onChange={(e) => updatePetalValue(petal.id, parseInt(e.target.value))}
                          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                          style={{
                            background: `linear-gradient(to right, #475569 0%, ${petal.color} ${petal.value}%, #475569 ${petal.value}%)`
                          }}
                        />
                        <div className="text-center text-lg font-medium" style={{ color: petal.color }}>
                          {petal.value}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            ) : (
              <div className="text-center text-slate-400 py-8">
                <p>Select an element to adjust its intensity</p>
              </div>
            )}

            {/* Quick preset buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setCurrentState(prev => ({
                  ...prev,
                  petals: prev.petals.map(p => ({ ...p, value: 30 }))
                }))}
                className="px-4 py-2 bg-slate-700 text-slate-300 text-sm hover:bg-slate-600 transition-colors"
              >
                Reset Low
              </button>
              <button
                onClick={() => setCurrentState(prev => ({
                  ...prev,
                  petals: prev.petals.map(p => ({ ...p, value: 70 }))
                }))}
                className="px-4 py-2 bg-slate-700 text-slate-300 text-sm hover:bg-slate-600 transition-colors"
              >
                Reset High
              </button>
            </div>

            {/* Reflection input */}
            <div className="space-y-3">
              <label className="block text-amber-100 font-medium">Brief Reflection</label>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="What patterns do you notice?..."
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-amber-100 placeholder-slate-400 focus:border-amber-500 focus:outline-none transition-colors resize-none"
                rows={3}
                maxLength={280}
              />
              <div className="text-right text-xs text-slate-400">
                {reflection.length}/280
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full px-6 py-3 bg-amber-600 text-slate-900 font-medium tracking-wide hover:bg-amber-500 disabled:bg-slate-600 disabled:text-slate-400 transition-colors"
            >
              {isSubmitting ? 'Recording State...' : 'Complete Check-In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { HoloflowerCheckIn };