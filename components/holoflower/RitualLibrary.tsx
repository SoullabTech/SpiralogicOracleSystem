'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Clock, Moon, Sun, Sunrise, Sunset, Star, Play, Pause, Check } from 'lucide-react';
import { RITUALS, type Ritual } from '@/lib/data/rituals';
import { PetalVoicePreview } from '@/components/voice/PetalVoicePreview';
import type { Element } from '@/lib/types/oracle';

interface RitualLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  selectedElement?: Element;
  selectedPetalNumber?: number;
}

interface RitualCardProps {
  ritual: Ritual;
  onSelect: (ritual: Ritual) => void;
}

function RitualCard({ ritual, onSelect }: RitualCardProps) {
  const getElementColor = (element: Element) => {
    switch (element) {
      case 'air': return '#87CEEB';
      case 'fire': return '#FF6B6B';
      case 'water': return '#4A90E2';
      case 'earth': return '#8B7355';
      case 'aether': return '#9B59B6';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400';
      case 'intermediate': return 'text-yellow-400';
      case 'advanced': return 'text-red-400';
      default: return 'text-white/60';
    }
  };

  const getTimeIcon = (time?: string) => {
    switch (time) {
      case 'morning': return <Sunrise className="w-4 h-4" />;
      case 'midday': return <Sun className="w-4 h-4" />;
      case 'evening': return <Sunset className="w-4 h-4" />;
      case 'night': return <Moon className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(ritual)}
      className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 cursor-pointer transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
            style={{ backgroundColor: getElementColor(ritual.element) }}
          >
            {ritual.element[0].toUpperCase()}
          </div>
          <div>
            <h3 className="text-white font-medium">{ritual.name}</h3>
            <p className={`text-xs ${getDifficultyColor(ritual.difficulty)}`}>
              {ritual.difficulty}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-white/60">
          {getTimeIcon(ritual.bestTime)}
          <span className="text-xs">{ritual.duration} min</span>
        </div>
      </div>
      
      <p className="text-white/70 text-sm mb-2">{ritual.description}</p>
      
      <div className="flex items-center gap-2 text-white/50 text-xs">
        <Star className="w-3 h-3" />
        <span className="italic">{ritual.intention}</span>
      </div>

      {ritual.tools && ritual.tools.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {ritual.tools.map((tool, idx) => (
            <span
              key={idx}
              className="text-xs px-2 py-0.5 bg-white/5 rounded-full text-white/60"
            >
              {tool}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

interface RitualPlayerProps {
  ritual: Ritual;
  onClose: () => void;
}

function RitualPlayer({ ritual, onClose }: RitualPlayerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const currentStepData = ritual.steps[currentStep];

  useEffect(() => {
    if (isPlaying && currentStepData?.duration && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isPlaying && timeRemaining === 0 && currentStep < ritual.steps.length - 1) {
      // Auto-advance to next step
      handleNextStep();
    }
  }, [isPlaying, timeRemaining, currentStep]);

  useEffect(() => {
    if (currentStepData?.duration) {
      setTimeRemaining(currentStepData.duration);
    }
  }, [currentStep, currentStepData]);

  const handleNextStep = () => {
    setCompletedSteps(prev => [...prev, currentStep]);
    if (currentStep < ritual.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsPlaying(false);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-light text-white mb-1">{ritual.name}</h2>
          <p className="text-white/60 text-sm">{ritual.intention}</p>
        </div>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white transition-colors"
        >
          ×
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          {ritual.steps.map((_, idx) => (
            <div
              key={idx}
              className={`flex-1 h-1 rounded-full transition-all ${
                completedSteps.includes(idx)
                  ? 'bg-green-500'
                  : idx === currentStep
                  ? 'bg-amber-500'
                  : 'bg-white/10'
              }`}
            />
          ))}
        </div>
        <p className="text-white/60 text-sm">
          Step {currentStep + 1} of {ritual.steps.length}
        </p>
      </div>

      {/* Current step */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white/5 rounded-xl p-6 mb-4">
          <h3 className="text-white text-lg mb-4">{currentStepData.instruction}</h3>
          
          {currentStepData.visualization && (
            <div className="mb-4 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <p className="text-amber-300 text-sm italic">
                Visualization: {currentStepData.visualization}
              </p>
            </div>
          )}

          {currentStepData.mantra && (
            <div className="mb-4 p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
              <p className="text-indigo-300 text-sm font-medium">
                Mantra: "{currentStepData.mantra}"
              </p>
            </div>
          )}

          {currentStepData.breathCount && (
            <div className="flex items-center gap-2 text-white/60">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                🌬️
              </div>
              <span className="text-sm">{currentStepData.breathCount} breaths</span>
            </div>
          )}

          {timeRemaining > 0 && (
            <div className="mt-4 text-center">
              <div className="text-3xl font-light text-white mb-2">
                {formatTime(timeRemaining)}
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <motion.div
                  className="bg-amber-500 h-2 rounded-full"
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: currentStepData.duration, ease: 'linear' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Voice guidance */}
        {ritual.voiceGuidance && (
          <div className="mb-4">
            <PetalVoicePreview
              text={currentStepData.instruction}
              context={`ritual_${ritual.id}_step_${currentStep}`}
              element={ritual.element}
              autoPlay={isPlaying}
            />
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevStep}
            disabled={currentStep === 0}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-white/30 text-white rounded-lg transition-colors"
          >
            Previous
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            {isPlaying ? (
              <>
                <Pause className="w-5 h-5" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                {currentStep === 0 ? 'Start' : 'Resume'}
              </>
            )}
          </button>

          <button
            onClick={handleNextStep}
            disabled={currentStep === ritual.steps.length - 1}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-white/30 text-white rounded-lg transition-colors"
          >
            {currentStep === ritual.steps.length - 1 ? 'Complete' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function RitualLibrary({ isOpen, onClose, selectedElement, selectedPetalNumber }: RitualLibraryProps) {
  const [selectedRitual, setSelectedRitual] = useState<Ritual | null>(null);
  const [filterElement, setFilterElement] = useState<Element | 'all'>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  // Filter rituals based on selections
  const filteredRituals = RITUALS.filter(ritual => {
    const elementMatch = filterElement === 'all' || ritual.element === filterElement;
    const difficultyMatch = filterDifficulty === 'all' || ritual.difficulty === filterDifficulty;
    const petalMatch = !selectedPetalNumber || ritual.petalNumber === selectedPetalNumber;
    return elementMatch && difficultyMatch && (!selectedElement || ritual.element === selectedElement) && petalMatch;
  });

  useEffect(() => {
    if (selectedElement) {
      setFilterElement(selectedElement);
    }
  }, [selectedElement]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gradient-to-br from-black to-indigo-950 rounded-3xl p-6 max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col border border-amber-500/20"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedRitual ? (
              <RitualPlayer
                ritual={selectedRitual}
                onClose={() => setSelectedRitual(null)}
              />
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-amber-400" />
                    <h2 className="text-2xl font-light text-white">Ritual Library</h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-white/60 hover:text-white text-2xl transition-colors"
                  >
                    ×
                  </button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-white/60 text-sm">Element:</span>
                    <div className="flex gap-1">
                      {(['all', 'air', 'fire', 'water', 'earth', 'aether'] as const).map(elem => (
                        <button
                          key={elem}
                          onClick={() => setFilterElement(elem)}
                          className={`px-3 py-1 rounded-lg text-sm transition-all ${
                            filterElement === elem
                              ? 'bg-amber-600 text-white'
                              : 'bg-white/10 text-white/60 hover:bg-white/20'
                          }`}
                        >
                          {elem === 'all' ? 'All' : elem.charAt(0).toUpperCase() + elem.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-white/60 text-sm">Level:</span>
                    <div className="flex gap-1">
                      {['all', 'beginner', 'intermediate', 'advanced'].map(diff => (
                        <button
                          key={diff}
                          onClick={() => setFilterDifficulty(diff)}
                          className={`px-3 py-1 rounded-lg text-sm transition-all ${
                            filterDifficulty === diff
                              ? 'bg-amber-600 text-white'
                              : 'bg-white/10 text-white/60 hover:bg-white/20'
                          }`}
                        >
                          {diff === 'all' ? 'All' : diff.charAt(0).toUpperCase() + diff.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Ritual grid */}
                <div className="flex-1 overflow-y-auto">
                  <div className="grid gap-4 md:grid-cols-2">
                    {filteredRituals.map(ritual => (
                      <RitualCard
                        key={ritual.id}
                        ritual={ritual}
                        onSelect={setSelectedRitual}
                      />
                    ))}
                  </div>
                  
                  {filteredRituals.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-white/60">No rituals found matching your filters</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}