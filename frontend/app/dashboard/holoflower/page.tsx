'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flower2, RotateCcw, Save, Info } from 'lucide-react';
import { SacredTopNavigation, BottomNavigation } from '@/components/layout/BottomNavigation';
import { SacredCard } from '@/components/ui/SacredCard';
import { SacredButton } from '@/components/ui/SacredButton';
import { HoloflowerVisualization } from '@/components/sacred/HoloflowerVisualization';
import { sacredData } from '@/lib/sacred-data';

interface PetalState {
  id: number;
  name: string;
  element: string;
  value: number;
  description: string;
}

const initialPetals: PetalState[] = [
  { id: 1, name: "Vitality", element: "Fire", value: 0.8, description: "Your physical energy and life force" },
  { id: 2, name: "Emotions", element: "Water", value: 0.6, description: "Emotional balance and flow" },
  { id: 3, name: "Creativity", element: "Fire", value: 0.9, description: "Creative expression and innovation" },
  { id: 4, name: "Relationships", element: "Water", value: 0.7, description: "Connection with others" },
  { id: 5, name: "Growth", element: "Air", value: 0.8, description: "Learning and personal development" },
  { id: 6, name: "Purpose", element: "Earth", value: 0.5, description: "Sense of meaning and direction" },
  { id: 7, name: "Communication", element: "Air", value: 0.9, description: "Expression and dialogue" },
  { id: 8, name: "Grounding", element: "Earth", value: 0.6, description: "Stability and practical foundation" }
];

export default function HoloflowerPage() {
  const [petals, setPetals] = useState<PetalState[]>(initialPetals);
  const [hasChanges, setHasChanges] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load real holoflower data from backend
  useEffect(() => {
    const loadHoloflowerData = async () => {
      try {
        const holoflowerState = await sacredData.getHoloflowerState('demo-user');
        if (holoflowerState && holoflowerState.petals) {
          setPetals(holoflowerState.petals.map(p => ({
            id: p.id,
            name: p.name,
            element: p.element,
            value: p.value,
            description: getDescription(p.name)
          })));
        }
      } catch (error) {
        console.log('Using demo holoflower data for consciousness demonstration');
      } finally {
        setLoading(false);
      }
    };

    loadHoloflowerData();
  }, []);

  const getDescription = (name: string) => {
    const descriptions: Record<string, string> = {
      'Vitality': 'Your physical energy and life force',
      'Emotions': 'Emotional balance and flow',
      'Creativity': 'Creative expression and innovation',
      'Relationships': 'Connection with others',
      'Growth': 'Learning and personal development',
      'Purpose': 'Sense of meaning and direction',
      'Communication': 'Expression and dialogue',
      'Grounding': 'Stability and practical foundation'
    };
    return descriptions[name] || 'An aspect of your inner landscape';
  };

  const handlePetalChange = async (id: number, value: number) => {
    setPetals(prev => prev.map(petal => 
      petal.id === id ? { ...petal, value } : petal
    ));
    setHasChanges(true);

    // Auto-save to backend in real-time
    try {
      await sacredData.updateHoloflowerPetal('demo-user', id, value);
    } catch (error) {
      console.log('Demo mode: holoflower update simulated');
    }
  };

  const handleSave = async () => {
    try {
      // Batch save all changes to backend
      for (const petal of petals) {
        await sacredData.updateHoloflowerPetal('demo-user', petal.id, petal.value);
      }
      setHasChanges(false);
    } catch (error) {
      console.log('Demo mode: save simulated');
      setHasChanges(false);
    }
  };

  const handleReset = async () => {
    try {
      const holoflowerState = await sacredData.getHoloflowerState('demo-user');
      if (holoflowerState) {
        setPetals(holoflowerState.petals.map(p => ({
          id: p.id,
          name: p.name,
          element: p.element,
          value: p.value,
          description: getDescription(p.name)
        })));
      }
    } catch (error) {
      setPetals(initialPetals);
    }
    setHasChanges(false);
  };

  const getElementColor = (element: string) => {
    switch (element) {
      case 'Fire': return 'soullab-fire';
      case 'Water': return 'soullab-water';
      case 'Earth': return 'soullab-earth';
      case 'Air': return 'soullab-air';
      default: return 'soullab-gray';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-soullab-white flex items-center justify-center">
        <div className="text-center">
          <div className="soullab-spinner mb-4" />
          <p className="soullab-text">Loading your Sacred Holoflower...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soullab-white soullab-spiral-bg">
      <SacredTopNavigation />
      
      <main className="pb-24 md:pb-0">
        <div className="soullab-container py-soullab-lg">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-soullab-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="soullab-heading-2 mb-soullab-sm">Your Holoflower</h1>
                <p className="soullab-text">
                  Adjust each petal to reflect your current state. Your holoflower is a living map of your inner landscape.
                </p>
              </div>
              
              <SacredButton
                variant="ghost"
                size="sm"
                onClick={() => setShowInfo(!showInfo)}
                className={showInfo ? 'bg-soullab-fire/10 text-soullab-fire' : ''}
              >
                <Info className="w-4 h-4" />
                How it works
              </SacredButton>
            </div>
          </motion.div>

          {/* Info Panel */}
          {showInfo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-soullab-lg"
            >
              <SacredCard variant="minimal">
                <h3 className="soullab-heading-3 mb-soullab-sm">Sacred Geometry Meets Personal Awareness</h3>
                <p className="soullab-text mb-soullab-md">
                  Your holoflower is an interactive mandala that represents different aspects of your life. 
                  Each petal corresponds to a core dimension of human experience. By adjusting the size of each petal, 
                  you create a visual representation of your current state.
                </p>
                <p className="soullab-text">
                  This isn't mystical diagnosis - it's a simple, beautiful way to check in with yourself 
                  and track how things shift over time.
                </p>
              </SacredCard>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-soullab-lg">
            
            {/* Holoflower Visualization */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <SacredCard variant="premium" className="h-[600px]">
                <div className="flex items-center justify-between mb-soullab-md">
                  <h3 className="soullab-heading-3">Interactive Visualization</h3>
                  <div className="flex gap-2">
                    {hasChanges && (
                      <SacredButton
                        variant="fire"
                        size="sm"
                        onClick={handleSave}
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </SacredButton>
                    )}
                    <SacredButton
                      variant="ghost"
                      size="sm"
                      onClick={handleReset}
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset
                    </SacredButton>
                  </div>
                </div>
                
                <div className="flex-1">
                  <HoloflowerVisualization 
                    userId="user-123"
                    petals={petals}
                    onPetalChange={handlePetalChange}
                    interactive={true}
                  />
                </div>
              </SacredCard>
            </motion.div>

            {/* Petal Controls */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-soullab-md"
            >
              <SacredCard>
                <h3 className="soullab-heading-3 mb-soullab-md">Adjust Your Petals</h3>
                <div className="space-y-soullab-md">
                  {petals.map((petal) => (
                    <div key={petal.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`
                            w-3 h-3 rounded-full bg-${getElementColor(petal.element)}
                          `} />
                          <span className="soullab-text font-medium">{petal.name}</span>
                        </div>
                        <span className="soullab-text-small text-soullab-gray">
                          {Math.round(petal.value * 100)}%
                        </span>
                      </div>
                      
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={petal.value}
                        onChange={(e) => handlePetalChange(petal.id, parseFloat(e.target.value))}
                        className={`
                          w-full h-2 bg-soullab-gray/20 rounded-soullab-spiral 
                          appearance-none cursor-pointer
                          [&::-webkit-slider-thumb]:appearance-none
                          [&::-webkit-slider-thumb]:w-4
                          [&::-webkit-slider-thumb]:h-4
                          [&::-webkit-slider-thumb]:rounded-full
                          [&::-webkit-slider-thumb]:bg-${getElementColor(petal.element)}
                          [&::-webkit-slider-thumb]:cursor-pointer
                        `}
                      />
                      
                      <p className="soullab-text-small text-soullab-gray">
                        {petal.description}
                      </p>
                    </div>
                  ))}
                </div>
              </SacredCard>

              {/* Overall Balance */}
              <SacredCard variant="minimal">
                <h4 className="soullab-heading-3 mb-soullab-sm">Overall Balance</h4>
                <div className="grid grid-cols-2 gap-soullab-md">
                  {['Fire', 'Water', 'Earth', 'Air'].map((element) => {
                    const elementPetals = petals.filter(p => p.element === element);
                    const avg = elementPetals.reduce((sum, p) => sum + p.value, 0) / elementPetals.length;
                    
                    return (
                      <div key={element} className="text-center">
                        <div className={`
                          w-8 h-8 rounded-soullab-spiral bg-${getElementColor(element)}/10
                          flex items-center justify-center mx-auto mb-2
                        `}>
                          <div className={`w-3 h-3 rounded-full bg-${getElementColor(element)}`} />
                        </div>
                        <div className="soullab-text-small font-medium">{element}</div>
                        <div className={`text-lg font-bold text-${getElementColor(element)}`}>
                          {Math.round(avg * 100)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </SacredCard>
            </motion.div>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}