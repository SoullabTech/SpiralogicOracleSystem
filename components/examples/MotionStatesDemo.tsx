// Motion States Demo - Example usage of all sacred motion systems
import React, { useState, useEffect } from 'react';
import { SacredHoloflowerWithAudio } from '../sacred/SacredHoloflowerWithAudio';
import { MotionState, CoherenceShift } from '../motion/MotionOrchestrator';

interface MotionStatesDemoProps {
  size?: number;
  autoDemo?: boolean;
}

const DEMO_SEQUENCE = [
  { state: 'idle' as MotionState, duration: 2000, coherence: 0.5, shift: 'stable' as CoherenceShift },
  { state: 'listening' as MotionState, duration: 3000, coherence: 0.6, shift: 'stable' as CoherenceShift },
  { state: 'processing' as MotionState, duration: 2000, coherence: 0.7, shift: 'rising' as CoherenceShift },
  { state: 'responding' as MotionState, duration: 4000, coherence: 0.8, shift: 'stable' as CoherenceShift },
  { state: 'breakthrough' as MotionState, duration: 3000, coherence: 0.9, shift: 'stable' as CoherenceShift },
  { state: 'idle' as MotionState, duration: 2000, coherence: 0.7, shift: 'falling' as CoherenceShift }
];

export const MotionStatesDemo: React.FC<MotionStatesDemoProps> = ({
  size = 400,
  autoDemo = false
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [demoRunning, setDemoRunning] = useState(autoDemo);
  const [userCheckIns, setUserCheckIns] = useState<Record<string, number>>({});
  const [activeFacetId, setActiveFacetId] = useState<string>('fire-ignite');

  const currentDemo = DEMO_SEQUENCE[currentStep];

  // Auto-advance demo
  useEffect(() => {
    if (demoRunning && currentDemo) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => (prev + 1) % DEMO_SEQUENCE.length);
      }, currentDemo.duration);

      return () => clearTimeout(timer);
    }
  }, [currentStep, demoRunning, currentDemo]);

  const handlePetalClick = (facetId: string) => {
    setActiveFacetId(facetId);
    setUserCheckIns(prev => ({
      ...prev,
      [facetId]: Math.min(1, (prev[facetId] || 0) + 0.3)
    }));
  };

  const resetDemo = () => {
    setCurrentStep(0);
    setUserCheckIns({});
    setActiveFacetId('fire-ignite');
  };

  const toggleDemo = () => {
    setDemoRunning(!demoRunning);
  };

  const nextStep = () => {
    setCurrentStep((prev) => (prev + 1) % DEMO_SEQUENCE.length);
  };

  const prevStep = () => {
    setCurrentStep((prev) => (prev - 1 + DEMO_SEQUENCE.length) % DEMO_SEQUENCE.length);
  };

  return (
    <div className="motion-states-demo p-8 bg-gradient-to-br from-purple-900 via-indigo-900 to-black min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">
          Sacred Motion States Demo
        </h1>
        <p className="text-purple-200 text-center mb-8">
          Experience the living breath of the Holoflower
        </p>

        {/* Demo Controls */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Current State: <span className="text-yellow-300 capitalize">{currentDemo.state}</span>
            </h3>
            <div className="text-sm text-purple-200">
              Step {currentStep + 1} of {DEMO_SEQUENCE.length}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
            <div className="text-center">
              <div className="text-purple-200">Coherence</div>
              <div className="text-xl font-bold text-white">
                {Math.round(currentDemo.coherence * 100)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-purple-200">Trend</div>
              <div className="text-xl font-bold text-white capitalize">
                {currentDemo.shift}
                {currentDemo.shift === 'rising' && ' ↑'}
                {currentDemo.shift === 'falling' && ' ↓'}
                {currentDemo.shift === 'stable' && ' →'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-purple-200">Active Facet</div>
              <div className="text-xl font-bold text-white">
                {activeFacetId?.split('-')[0] || 'None'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-purple-200">Check-ins</div>
              <div className="text-xl font-bold text-white">
                {Object.keys(userCheckIns).length}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={toggleDemo}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                demoRunning
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {demoRunning ? 'Pause Demo' : 'Start Demo'}
            </button>

            <button
              onClick={prevStep}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              ← Previous
            </button>

            <button
              onClick={nextStep}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              Next →
            </button>

            <button
              onClick={resetDemo}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Sacred Holoflower Display */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <SacredHoloflowerWithAudio
              size={size}
              activeFacetId={activeFacetId}
              userCheckIns={userCheckIns}
              onPetalClick={handlePetalClick}
              showLabels={true}
              interactive={true}
              audioEnabled={true}
              audioVolume={0.5}
              playPetalTones={true}
              playCoherenceFeedback={true}
              playStateTransitions={true}
              motionState={currentDemo.state}
              coherenceLevel={currentDemo.coherence}
              coherenceShift={currentDemo.shift}
              isListening={currentDemo.state === 'listening'}
              isProcessing={currentDemo.state === 'processing'}
              isResponding={currentDemo.state === 'responding'}
              showBreakthrough={currentDemo.state === 'breakthrough'}
            />

            {/* State indicator overlay */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
              <div className="bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                {currentDemo.state.replace('_', ' ').toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* State Descriptions */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Motion States Guide</h3>
          
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            {[
              {
                name: 'Idle',
                description: 'Gentle breathing rhythm, awaiting sacred communion'
              },
              {
                name: 'Listening',
                description: 'Active breathing, coherence rings rotate, particles drift from center'
              },
              {
                name: 'Processing',
                description: 'Petals ripple in sequence, center spirals with golden ratio animation'
              },
              {
                name: 'Responding',
                description: 'Active facets glow stronger, inactive petals dim, coherence rings expand'
              },
              {
                name: 'Breakthrough',
                description: 'Full golden shimmer, starburst animation, aurora background effect'
              }
            ].map((state, index) => (
              <div
                key={state.name}
                className={`p-3 rounded-lg border transition-colors ${
                  currentDemo.state === state.name.toLowerCase()
                    ? 'bg-yellow-500/20 border-yellow-400 text-yellow-100'
                    : 'bg-white/5 border-purple-500/30 text-purple-200'
                }`}
              >
                <div className="font-semibold text-white mb-1">{state.name}</div>
                <div className="text-xs">{state.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Audio Controls */}
        <div className="mt-6 text-center">
          <p className="text-purple-200 text-sm">
            🔊 Audio feedback includes elemental tones, coherence shifts, and state transitions
          </p>
          <p className="text-purple-300 text-xs mt-2">
            Click petals to activate elemental tones • Sacred frequencies: Fire (528Hz), Water (417Hz), Earth (396Hz), Air (741Hz), Aether (963Hz)
          </p>
        </div>
      </div>
    </div>
  );
};

export default MotionStatesDemo;