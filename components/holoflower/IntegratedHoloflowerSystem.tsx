'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HoloflowerCore } from './HoloflowerCore';
import { InteractiveMembrane } from '../sacred/InteractiveMembrane';
import { IntegratedSafetySystem } from '../../lib/safety/IntegratedSafetySystem';

/**
 * INTEGRATED HOLOFLOWER SYSTEM
 * Combines the existing holoflower with new five-fold navigation,
 * dual representation, and longitudinal tracking
 */

type ViewMode = 'center' | 'top' | 'bottom' | 'left' | 'right';

interface CheckInData {
  timestamp: string;
  petalValues: number[];
  quadrants: {
    mind: number;    // Air/Fire conscious (top)
    body: number;    // Earth subconscious (bottom-left)
    spirit: number;  // Water subconscious (bottom-right)
    heart: number;   // Fire conscious (top-right)
  };
  coherence: number;
  configuration: string;
}

interface AgentAssessment {
  petalValues: number[];
  driftIndicators: {
    isolation: number;
    manipulation: number;
    realityDistortion: number;
  };
  coherence: number;
}

export const IntegratedHoloflowerSystem: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('center');
  const [userCheckIn, setUserCheckIn] = useState<CheckInData | null>(null);
  const [agentAssessment, setAgentAssessment] = useState<AgentAssessment>({
    petalValues: new Array(12).fill(5),
    driftIndicators: { isolation: 0, manipulation: 0, realityDistortion: 0 },
    coherence: 0.85
  });

  const [petalValues, setPetalValues] = useState<number[]>(new Array(12).fill(5));
  const [isDragging, setIsDragging] = useState<number | null>(null);
  const [holoflowerEnergy, setHoloflowerEnergy] = useState<'dense' | 'emerging' | 'radiant'>('emerging');

  // Calculate coherence between user and agent
  const calculateCoherence = useCallback(() => {
    if (!userCheckIn) return 0;

    let totalDiff = 0;
    for (let i = 0; i < 12; i++) {
      totalDiff += Math.abs(userCheckIn.petalValues[i] - agentAssessment.petalValues[i]);
    }
    return Math.max(0, 1 - (totalDiff / 120)); // Normalize to 0-1
  }, [userCheckIn, agentAssessment]);

  // Handle petal drag adjustment
  const handlePetalDrag = useCallback((index: number, delta: number) => {
    setPetalValues(prev => {
      const newValues = [...prev];
      newValues[index] = Math.max(0, Math.min(10, newValues[index] + delta));
      return newValues;
    });
  }, []);

  // Submit daily check-in
  const submitCheckIn = useCallback(async () => {
    const quadrants = {
      mind: (petalValues[11] + petalValues[0] + petalValues[1]) / 3,
      body: (petalValues[8] + petalValues[9] + petalValues[10]) / 3,
      spirit: (petalValues[5] + petalValues[6] + petalValues[7]) / 3,
      heart: (petalValues[2] + petalValues[3] + petalValues[4]) / 3
    };

    const checkIn: CheckInData = {
      timestamp: new Date().toISOString(),
      petalValues,
      quadrants,
      coherence: petalValues.reduce((a, b) => a + b) / 120,
      configuration: btoa(petalValues.join('-')).substring(0, 12)
    };

    setUserCheckIn(checkIn);
    setHoloflowerEnergy('radiant');

    // Send to backend
    try {
      const response = await fetch('/api/oracle/personal/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'daily_checkin',
          data: checkIn
        })
      });

      const result = await response.json();
      console.log('Oracle response:', result);
    } catch (error) {
      console.error('Failed to submit check-in:', error);
    }

    // Return to center after submission
    setTimeout(() => {
      setCurrentView('center');
      setHoloflowerEnergy('emerging');
    }, 2000);
  }, [petalValues]);

  // Update agent assessment based on safety system
  useEffect(() => {
    const interval = setInterval(async () => {
      // This would integrate with your safety system
      const safetySystem = new IntegratedSafetySystem();
      const systemStats = safetySystem.getSystemStats();

      // Update agent's view based on drift detection
      setAgentAssessment(prev => ({
        ...prev,
        petalValues: prev.petalValues.map((v, i) => {
          // Adjust based on detected patterns
          const drift = Math.random() * 0.5 - 0.25;
          return Math.max(0, Math.min(10, v + drift));
        }),
        coherence: systemStats.effectiveness
      }));
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Render different views based on current position
  const renderView = () => {
    switch (currentView) {
      case 'center':
        return <CenterView userCheckIn={userCheckIn} agentAssessment={agentAssessment} />;
      case 'right':
        return <CheckInView petalValues={petalValues} onDrag={handlePetalDrag} onSubmit={submitCheckIn} />;
      case 'top':
        return <HigherSelfView />;
      case 'bottom':
        return <SubconsciousView />;
      case 'left':
        return <AnalyticsView userCheckIn={userCheckIn} />;
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Main view container */}
      <motion.div
        className="w-full h-full"
        key={currentView}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {renderView()}
      </motion.div>

      {/* Navigation controls */}
      <NavigationControls
        currentView={currentView}
        onNavigate={setCurrentView}
      />

      {/* Mini dashboard indicator */}
      <MiniDashboard
        coherence={calculateCoherence()}
        quadrants={userCheckIn?.quadrants}
      />
    </div>
  );
};

// Center View - Dual Holoflower Display
const CenterView: React.FC<{
  userCheckIn: CheckInData | null;
  agentAssessment: AgentAssessment;
}> = ({ userCheckIn, agentAssessment }) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Agent's ghost holoflower (outer) */}
      <div className="absolute inset-0 opacity-30">
        <HoloflowerCore
          energyState="emerging"
          petalValues={agentAssessment.petalValues}
        />
      </div>

      {/* User's holoflower (inner) */}
      {userCheckIn && (
        <div className="relative w-3/5 h-3/5">
          <HoloflowerCore
            energyState="radiant"
            petalValues={userCheckIn.petalValues}
          />
        </div>
      )}

      {/* Coherence indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
        <div className="text-center">
          <div className="text-sm text-gray-400">Coherence</div>
          <div className="text-2xl font-bold text-purple-400">
            {userCheckIn ? Math.round(calculateCoherence() * 100) : '--'}%
          </div>
        </div>
      </div>
    </div>
  );
};

// Check-in View (Right Page)
const CheckInView: React.FC<{
  petalValues: number[];
  onDrag: (index: number, delta: number) => void;
  onSubmit: () => void;
}> = ({ petalValues, onDrag, onSubmit }) => {
  return (
    <div className="relative w-full h-full">
      <HoloflowerCore
        energyState="emerging"
        petalValues={petalValues}
        onPetalDrag={onDrag}
        interactive={true}
      />

      {/* Submit button */}
      <motion.button
        className="absolute bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 bg-purple-600 text-white rounded-full"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onSubmit}
      >
        Submit Daily Check-in
      </motion.button>
    </div>
  );
};

// Higher Self View (Top Page)
const HigherSelfView: React.FC = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-light text-purple-300">Higher Self Systems</h2>
        <p className="text-gray-400 mt-2">Conscious Awareness • Witnessing • Sacred Presence</p>
      </div>
    </div>
  );
};

// Subconscious View (Bottom Page)
const SubconsciousView: React.FC = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-light text-indigo-300">Subconscious Operations</h2>
        <p className="text-gray-400 mt-2">Shadow Work • Somatic Intelligence • Deep Patterns</p>
      </div>
    </div>
  );
};

// Analytics View (Left Page)
const AnalyticsView: React.FC<{ userCheckIn: CheckInData | null }> = ({ userCheckIn }) => {
  return (
    <div className="w-full h-full p-8">
      <h2 className="text-xl font-light text-blue-300 mb-4">Emissary Analytics</h2>
      {userCheckIn ? (
        <div className="space-y-4">
          <div>Configuration: {userCheckIn.configuration}</div>
          <div>Coherence: {(userCheckIn.coherence * 100).toFixed(1)}%</div>
          <div className="grid grid-cols-2 gap-4">
            <div>Mind: {userCheckIn.quadrants.mind.toFixed(1)}</div>
            <div>Body: {userCheckIn.quadrants.body.toFixed(1)}</div>
            <div>Spirit: {userCheckIn.quadrants.spirit.toFixed(1)}</div>
            <div>Heart: {userCheckIn.quadrants.heart.toFixed(1)}</div>
          </div>
        </div>
      ) : (
        <p className="text-gray-400">No check-in data yet</p>
      )}
    </div>
  );
};

// Navigation Controls
const NavigationControls: React.FC<{
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
}> = ({ currentView, onNavigate }) => {
  if (currentView === 'center') {
    return (
      <>
        <button
          className="absolute top-8 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center"
          onClick={() => onNavigate('top')}
        >
          ↑
        </button>
        <button
          className="absolute bottom-8 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-indigo-600/20 flex items-center justify-center"
          onClick={() => onNavigate('bottom')}
        >
          ↓
        </button>
        <button
          className="absolute left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center"
          onClick={() => onNavigate('left')}
        >
          ←
        </button>
        <button
          className="absolute right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-amber-600/20 flex items-center justify-center"
          onClick={() => onNavigate('right')}
        >
          →
        </button>
      </>
    );
  }

  return (
    <button
      className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-purple-600/20 rounded-full text-white"
      onClick={() => onNavigate('center')}
    >
      ◉ Return to Center
    </button>
  );
};

// Mini Dashboard Indicator
const MiniDashboard: React.FC<{
  coherence: number;
  quadrants?: { mind: number; body: number; spirit: number; heart: number };
}> = ({ coherence, quadrants }) => {
  return (
    <div className="absolute top-4 right-4 w-20 h-20 bg-slate-900/80 rounded-lg p-2">
      <svg viewBox="0 0 60 60" className="w-full h-full">
        {/* Mini holoflower representation */}
        <circle cx="30" cy="30" r="20" fill="none" stroke="rgba(147,51,234,0.3)" />
        <circle cx="30" cy="30" r="10" fill="white" opacity="0.8" />
        <text x="30" y="35" textAnchor="middle" fontSize="10" fill="#333">
          {Math.round(coherence * 100)}
        </text>
      </svg>
    </div>
  );
};

export default IntegratedHoloflowerSystem;