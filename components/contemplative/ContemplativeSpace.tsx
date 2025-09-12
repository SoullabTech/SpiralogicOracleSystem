'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type PresenceQuality = 'listening' | 'witnessing' | 'holding' | 'reflecting';
export type ConversationDepth = 'surface' | 'middle' | 'deep';
export type ResponseDensity = 'haiku' | 'flowing' | 'spacious';

interface ContemplativeSpaceProps {
  isActive: boolean;
  presenceQuality: PresenceQuality;
  depth: ConversationDepth;
  density: ResponseDensity;
  onDepthChange?: (depth: ConversationDepth) => void;
  onDensityChange?: (density: ResponseDensity) => void;
  onPresenceRequest?: (type: 'space' | 'continue' | 'witness') => void;
  children: React.ReactNode;
}

const presenceIndicators = {
  listening: { symbol: '...', pulse: 2.0, opacity: 0.6 },
  witnessing: { symbol: '· · ·', pulse: 3.0, opacity: 0.7 },
  holding: { symbol: '◦ ◦ ◦', pulse: 4.0, opacity: 0.5 },
  reflecting: { symbol: '∞', pulse: 5.0, opacity: 0.4 }
};

const depthSettings = {
  surface: {
    responseDelay: 800,
    breathingRate: 1.5,
    interfaceOpacity: 1.0,
    spaceBetween: 'normal'
  },
  middle: {
    responseDelay: 1500,
    breathingRate: 2.5,
    interfaceOpacity: 0.95,
    spaceBetween: 'relaxed'
  },
  deep: {
    responseDelay: 2500,
    breathingRate: 4.0,
    interfaceOpacity: 0.85,
    spaceBetween: 'spacious'
  }
};

export function ContemplativeSpace({
  isActive,
  presenceQuality,
  depth,
  density,
  onDepthChange,
  onDensityChange,
  onPresenceRequest,
  children
}: ContemplativeSpaceProps) {
  const [candlelightMode, setCandlelightMode] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'exhale'>('inhale');
  const [showPresence, setShowPresence] = useState(false);
  const touchStartY = useRef(0);

  const settings = depthSettings[depth];
  const presence = presenceIndicators[presenceQuality];

  // Breathing rhythm
  useEffect(() => {
    if (!isActive) return;
    
    const interval = setInterval(() => {
      setBreathPhase(prev => prev === 'inhale' ? 'exhale' : 'inhale');
    }, settings.breathingRate * 1000);
    
    return () => clearInterval(interval);
  }, [isActive, settings.breathingRate]);

  // Auto-spacing after deep shares
  useEffect(() => {
    if (isActive && depth === 'deep') {
      const timer = setTimeout(() => {
        setShowPresence(true);
        setTimeout(() => setShowPresence(false), 3000);
      }, settings.responseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [isActive, depth, settings.responseDelay]);

  // Touch gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    
    if (Math.abs(deltaY) > 50) {
      if (deltaY > 0) {
        onPresenceRequest?.('space');
      } else {
        onPresenceRequest?.('continue');
      }
    }
  };

  const handleLongPress = () => {
    onPresenceRequest?.('witness');
  };

  return (
    <div 
      className={`contemplative-container ${candlelightMode ? 'candlelight' : ''}`}
      style={{
        opacity: settings.interfaceOpacity,
        transition: 'all 1.5s ease-in-out'
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Breathing Interface */}
      <motion.div
        className="breathing-indicator"
        animate={{
          scale: breathPhase === 'inhale' ? 1.05 : 0.95,
          opacity: breathPhase === 'inhale' ? 0.8 : 0.6
        }}
        transition={{
          duration: settings.breathingRate,
          ease: "easeInOut"
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)'
        }}
      />

      {/* Presence Indicator */}
      <AnimatePresence>
        {showPresence && (
          <motion.div
            className="presence-indicator"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: presence.opacity,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: presence.pulse }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '24px',
              color: 'rgba(139,92,246,0.6)',
              letterSpacing: '0.5em'
            }}
          >
            {presence.symbol}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Depth Control */}
      <div className="depth-control">
        <button
          onClick={() => onDepthChange?.('surface')}
          className={`depth-btn ${depth === 'surface' ? 'active' : ''}`}
          title="Quick reflection"
        >
          <span className="depth-indicator">○</span>
        </button>
        <button
          onClick={() => onDepthChange?.('middle')}
          className={`depth-btn ${depth === 'middle' ? 'active' : ''}`}
          title="Gentle exploration"
        >
          <span className="depth-indicator">◐</span>
        </button>
        <button
          onClick={() => onDepthChange?.('deep')}
          className={`depth-btn ${depth === 'deep' ? 'active' : ''}`}
          title="Spacious wondering"
        >
          <span className="depth-indicator">●</span>
        </button>
      </div>

      {/* Density Control */}
      <div className="density-control">
        <input
          type="range"
          min="0"
          max="2"
          value={density === 'haiku' ? 0 : density === 'flowing' ? 1 : 2}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            onDensityChange?.(
              val === 0 ? 'haiku' : 
              val === 1 ? 'flowing' : 
              'spacious'
            );
          }}
          className="density-slider"
        />
        <div className="density-labels">
          <span>Minimal</span>
          <span>Natural</span>
          <span>Spacious</span>
        </div>
      </div>

      {/* Sit With This Button */}
      <button
        className="sit-with-this"
        onClick={() => onPresenceRequest?.('space')}
        onMouseDown={() => {
          const timer = setTimeout(handleLongPress, 1000);
          return () => clearTimeout(timer);
        }}
      >
        Sit with this
      </button>

      {/* Candlelight Toggle */}
      <button
        className="candlelight-toggle"
        onClick={() => setCandlelightMode(!candlelightMode)}
        aria-label="Toggle candlelight mode"
      >
        🕯️
      </button>

      {/* Main Content */}
      <div 
        className="contemplative-content"
        style={{
          padding: settings.spaceBetween === 'normal' ? '1rem' :
                   settings.spaceBetween === 'relaxed' ? '2rem' :
                   '3rem'
        }}
      >
        {children}
      </div>

      <style jsx>{`
        .contemplative-container {
          position: relative;
          min-height: 100vh;
          transition: all 1s ease;
        }

        .contemplative-container.candlelight {
          background: linear-gradient(180deg, 
            rgba(20,10,5,1) 0%, 
            rgba(40,20,10,1) 50%, 
            rgba(20,10,5,1) 100%);
          filter: brightness(0.7) saturate(1.2);
        }

        .depth-control {
          position: fixed;
          top: 20px;
          right: 20px;
          display: flex;
          gap: 10px;
          z-index: 100;
        }

        .depth-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid rgba(139,92,246,0.3);
          background: transparent;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .depth-btn.active {
          background: rgba(139,92,246,0.1);
          border-color: rgba(139,92,246,0.6);
        }

        .depth-indicator {
          font-size: 20px;
          color: rgba(139,92,246,0.8);
        }

        .density-control {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          width: 200px;
          z-index: 100;
        }

        .density-slider {
          width: 100%;
          height: 4px;
          background: rgba(139,92,246,0.2);
          outline: none;
          -webkit-appearance: none;
        }

        .density-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: rgba(139,92,246,0.8);
          cursor: pointer;
        }

        .density-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 5px;
          font-size: 10px;
          color: rgba(139,92,246,0.6);
        }

        .sit-with-this {
          position: fixed;
          bottom: 80px;
          right: 20px;
          padding: 10px 20px;
          background: rgba(139,92,246,0.1);
          border: 1px solid rgba(139,92,246,0.3);
          border-radius: 20px;
          color: rgba(139,92,246,0.8);
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 100;
        }

        .sit-with-this:hover {
          background: rgba(139,92,246,0.2);
        }

        .candlelight-toggle {
          position: fixed;
          top: 20px;
          left: 20px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid rgba(255,200,100,0.3);
          background: transparent;
          cursor: pointer;
          font-size: 20px;
          transition: all 0.3s ease;
          z-index: 100;
        }

        .candlelight-toggle:hover {
          background: rgba(255,200,100,0.1);
        }
      `}</style>
    </div>
  );
}