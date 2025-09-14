/**
 * Mobile Consciousness UI Components
 * Touch-based embodied consciousness interface
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MobileConsciousnessCompanion, ConsciousTouch, MicroWitnessSession } from '@/lib/mobile-consciousness';

interface SomaticIndicatorProps {
  tension: number;
  movement: string;
  groundedness: number;
}

function SomaticIndicator({ tension, movement, groundedness }: SomaticIndicatorProps) {
  const getIndicatorColor = (value: number) => {
    if (value < 0.3) return 'bg-emerald-400'; // Relaxed
    if (value < 0.6) return 'bg-amber-400';   // Moderate
    return 'bg-rose-400';                     // Tense
  };

  return (
    <div className="flex items-center space-x-4 p-4 bg-gray-900/20 rounded-2xl backdrop-blur-sm">
      <div className="text-center">
        <div className={`w-3 h-3 rounded-full ${getIndicatorColor(tension)} animate-pulse`} />
        <p className="text-xs text-gray-400 mt-1">Tension</p>
      </div>
      <div className="text-center">
        <div className={`w-3 h-3 rounded-full ${movement === 'still' ? 'bg-blue-400' : 'bg-orange-400'}`} />
        <p className="text-xs text-gray-400 mt-1">Movement</p>
      </div>
      <div className="text-center">
        <div className={`w-3 h-3 rounded-full ${getIndicatorColor(1 - groundedness)}`} />
        <p className="text-xs text-gray-400 mt-1">Grounded</p>
      </div>
    </div>
  );
}

interface PresenceOrbProps {
  presenceLevel: number;
  isActive: boolean;
  onTouch: (touch: ConsciousTouch) => void;
}

function PresenceOrb({ presenceLevel, isActive, onTouch }: PresenceOrbProps) {
  const [touching, setTouching] = useState(false);
  const [touchStart, setTouchStart] = useState<number>(0);
  const [circleCount, setCircleCount] = useState(0);
  const orbRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouching(true);
    setTouchStart(Date.now());
    setCircleCount(0);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const duration = Date.now() - touchStart;
    setTouching(false);

    if (duration > 3000) {
      onTouch({
        type: 'longPress',
        intention: 'presence_anchor',
        duration,
        pressure: 0.8
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touching) return;

    // Detect circular motion
    const touch = e.touches[0];
    // Simple circle detection logic would go here
  };

  const orbSize = 120 + (presenceLevel * 80); // 120-200px based on presence

  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div
        ref={orbRef}
        className="relative rounded-full transition-all duration-1000 ease-in-out cursor-pointer"
        style={{
          width: orbSize,
          height: orbSize,
          background: `radial-gradient(circle,
            rgba(159, 122, 234, ${presenceLevel * 0.6}) 0%,
            rgba(79, 209, 197, ${presenceLevel * 0.3}) 50%,
            transparent 70%)`
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
      >
        {/* Breathing animation */}
        <div
          className="absolute inset-2 rounded-full animate-pulse"
          style={{
            background: `radial-gradient(circle,
              rgba(255, 255, 255, ${touching ? 0.4 : 0.1}) 0%,
              transparent 60%)`
          }}
        />

        {/* Touch feedback */}
        {touching && (
          <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
        )}

        {/* Presence level indicator */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white/60 text-center">
            <div className="text-2xl font-light">
              {Math.round(presenceLevel * 100)}%
            </div>
            <div className="text-xs uppercase tracking-wide">
              Presence
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MicroWitnessOverlayProps {
  session: MicroWitnessSession | null;
  onComplete: () => void;
}

function MicroWitnessOverlay({ session, onComplete }: MicroWitnessOverlayProps) {
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    if (!session) return;

    setTimeRemaining(session.duration);

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1000) {
          clearInterval(interval);
          setTimeout(onComplete, 100);
          return 0;
        }
        return prev - 100;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [session, onComplete]);

  if (!session) return null;

  const progress = 1 - (timeRemaining / session.duration);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="text-center p-8 max-w-sm">
        {/* Progress ring */}
        <div className="relative w-32 h-32 mx-auto mb-6">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="60"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="4"
            />
            <circle
              cx="64"
              cy="64"
              r="60"
              fill="none"
              stroke="rgba(159,122,234,0.8)"
              strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 60}`}
              strokeDashoffset={`${2 * Math.PI * 60 * (1 - progress)}`}
              className="transition-all duration-100 ease-linear"
            />
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-xs">
              {Math.ceil(timeRemaining / 1000)}s
            </div>
          </div>
        </div>

        {/* Guidance */}
        <h3 className="text-xl font-light text-white mb-2">
          {session.focus.replace('_', ' ')} awareness
        </h3>
        <p className="text-gray-300 leading-relaxed">
          {session.guidance}
        </p>

        {/* Breathing indicator */}
        <div className="mt-8">
          <div className="w-4 h-4 bg-blue-400 rounded-full mx-auto animate-pulse"
               style={{
                 animationDuration: session.focus === 'breath' ? '4s' : '3s'
               }} />
          <p className="text-xs text-gray-400 mt-2">Breathe with the light</p>
        </div>
      </div>
    </div>
  );
}

interface ConsciousTouchGesturesProps {
  onGesture: (touch: ConsciousTouch) => void;
}

function ConsciousTouchGestures({ onGesture }: ConsciousTouchGesturesProps) {
  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {/* Two-finger expand gesture */}
      <div className="bg-gray-800/40 rounded-2xl p-4 text-center">
        <div className="text-2xl mb-2">🤲</div>
        <h4 className="text-sm font-medium text-white">Open</h4>
        <p className="text-xs text-gray-400">Two fingers expand</p>
      </div>

      {/* Circular motion */}
      <div className="bg-gray-800/40 rounded-2xl p-4 text-center">
        <div className="text-2xl mb-2">🌀</div>
        <h4 className="text-sm font-medium text-white">Release</h4>
        <p className="text-xs text-gray-400">Circular motion</p>
      </div>

      {/* Long press */}
      <div className="bg-gray-800/40 rounded-2xl p-4 text-center">
        <div className="text-2xl mb-2">⏳</div>
        <h4 className="text-sm font-medium text-white">Presence</h4>
        <p className="text-xs text-gray-400">Long press</p>
      </div>

      {/* Hold and breathe */}
      <div className="bg-gray-800/40 rounded-2xl p-4 text-center">
        <div className="text-2xl mb-2">🫁</div>
        <h4 className="text-sm font-medium text-white">Breathe</h4>
        <p className="text-xs text-gray-400">Hold and breathe</p>
      </div>
    </div>
  );
}

interface ProximityFieldIndicatorProps {
  nearbyFields: number;
  resonance: number;
  onConnect?: () => void;
}

function ProximityFieldIndicator({ nearbyFields, resonance, onConnect }: ProximityFieldIndicatorProps) {
  if (nearbyFields === 0) return null;

  return (
    <div className="bg-purple-900/30 border border-purple-400/30 rounded-2xl p-4 m-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-medium">Nearby Consciousness</h3>
          <p className="text-purple-200 text-sm">
            {nearbyFields} field{nearbyFields > 1 ? 's' : ''} detected
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-light text-purple-300">
            {Math.round(resonance * 100)}%
          </div>
          <div className="text-xs text-purple-400">resonance</div>
        </div>
      </div>

      {resonance > 0.7 && onConnect && (
        <button
          onClick={onConnect}
          className="w-full mt-3 bg-purple-600/40 hover:bg-purple-600/60 rounded-xl py-2 text-white text-sm font-medium transition-colors"
        >
          Share Presence
        </button>
      )}
    </div>
  );
}

export default function MobileConsciousnessUI() {
  const [companion] = useState(() => new MobileConsciousnessCompanion());
  const [currentState, setCurrentState] = useState(companion.getCurrentState());
  const [microSession, setMicroSession] = useState<MicroWitnessSession | null>(null);
  const [proximityFields, setProximityFields] = useState({ nearbyFields: 0, resonance: 0 });

  useEffect(() => {
    const updateInterval = setInterval(() => {
      setCurrentState(companion.getCurrentState());
    }, 1000);

    const proximityInterval = setInterval(async () => {
      const fields = await companion.detectProximityFields();
      setProximityFields(fields);
    }, 5000);

    return () => {
      clearInterval(updateInterval);
      clearInterval(proximityInterval);
    };
  }, [companion]);

  const handleTouchGesture = async (touch: ConsciousTouch) => {
    const response = await companion.handleConsciousTouch(touch);
    console.log('Touch response:', response);
  };

  const initiateMicroWitness = async (focus?: any) => {
    const session = await companion.initiateMicroWitnessing('user_request', focus);
    setMicroSession(session);
  };

  const completeMicroSession = () => {
    setMicroSession(null);
  };

  const presenceLevel = (
    currentState.sensors.accelerometer.tension * 0.3 +
    currentState.sensors.gyroscope.stability * 0.4 +
    (currentState.sensors.proximity.breathing_detected ? 0.3 : 0)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-gray-900 text-white">
      {/* Header */}
      <div className="p-4 text-center border-b border-white/10">
        <h1 className="text-xl font-light">MAIA Consciousness</h1>
        <p className="text-sm text-gray-400">Feel the presence, not the pixels</p>
      </div>

      {/* Somatic Indicators */}
      <div className="p-4">
        <SomaticIndicator
          tension={currentState.sensors.accelerometer.tension}
          movement={currentState.sensors.accelerometer.movement}
          groundedness={1 - currentState.sensors.accelerometer.tension}
        />
      </div>

      {/* Main Presence Orb */}
      <PresenceOrb
        presenceLevel={presenceLevel}
        isActive={!!currentState.activeSession}
        onTouch={handleTouchGesture}
      />

      {/* Quick Actions */}
      <div className="px-4 pb-4">
        <div className="flex space-x-3 justify-center mb-6">
          <button
            onClick={() => initiateMicroWitness('shoulders')}
            className="bg-teal-600/30 hover:bg-teal-600/50 rounded-xl px-4 py-2 text-sm transition-colors"
          >
            Shoulders
          </button>
          <button
            onClick={() => initiateMicroWitness('breath')}
            className="bg-blue-600/30 hover:bg-blue-600/50 rounded-xl px-4 py-2 text-sm transition-colors"
          >
            Breath
          </button>
          <button
            onClick={() => initiateMicroWitness('heart')}
            className="bg-rose-600/30 hover:bg-rose-600/50 rounded-xl px-4 py-2 text-sm transition-colors"
          >
            Heart
          </button>
        </div>

        {/* Conscious Touch Guide */}
        <div className="mb-6">
          <h3 className="text-center text-white/80 mb-3 text-sm">Conscious Touch</h3>
          <ConsciousTouchGestures onGesture={handleTouchGesture} />
        </div>
      </div>

      {/* Proximity Fields */}
      <ProximityFieldIndicator
        nearbyFields={proximityFields.nearbyFields}
        resonance={proximityFields.resonance}
        onConnect={() => console.log('Connecting to nearby field')}
      />

      {/* Walking Mode Toggle */}
      <div className="p-4">
        <button
          onClick={() => companion.activateWalkingMode()}
          className={`w-full rounded-2xl p-4 text-center transition-all ${
            currentState.walkingMode
              ? 'bg-green-600/30 border border-green-400/30'
              : 'bg-gray-800/30 border border-gray-600/30'
          }`}
        >
          <div className="text-lg mb-1">🚶‍♂️</div>
          <div className="text-sm">
            {currentState.walkingMode ? 'Walking Mode Active' : 'Activate Walking Mode'}
          </div>
        </button>
      </div>

      {/* Micro Witnessing Session Overlay */}
      <MicroWitnessOverlay
        session={microSession}
        onComplete={completeMicroSession}
      />
    </div>
  );
}