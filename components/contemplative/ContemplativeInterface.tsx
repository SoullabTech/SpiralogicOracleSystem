/**
 * 🕊️ Contemplative Interface Component
 * 
 * React implementation of contemplative space features
 * Creating sacred pauses and breathing room in conversations
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ContemplativeInterfaceProps {
  onDepthChange?: (depth: 'surface' | 'exploring' | 'deep' | 'mystery') => void;
  onSilenceRequest?: () => void;
  onDensityChange?: (density: 'haiku' | 'minimal' | 'balanced' | 'flowing') => void;
  currentMode?: 'daylight' | 'candlelight' | 'moonlight' | 'starlight';
  isProcessing?: boolean;
}

/**
 * 🌬️ Breathing Presence Indicator
 */
const BreathingPresence: React.FC<{ 
  state: 'listening' | 'witnessing' | 'holding' | 'resting' 
}> = ({ state }) => {
  const states = {
    listening: { symbol: '...', color: '#6B7280', duration: 2 },
    witnessing: { symbol: '· · ·', color: '#8B5CF6', duration: 3 },
    holding: { symbol: '◦ ◦ ◦', color: '#10B981', duration: 4 },
    resting: { symbol: ' ', color: '#1F2937', duration: 6 }
  };

  const config = states[state];

  return (
    <motion.div
      className="maya-breathing-presence"
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: [0.4, 0.8, 0.4],
        scale: [1, 1.05, 1]
      }}
      transition={{
        duration: config.duration,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      style={{ color: config.color }}
    >
      <span className="text-2xl font-light">{config.symbol}</span>
    </motion.div>
  );
};

/**
 * 🎚️ Depth Controller Slider
 */
const DepthController: React.FC<{
  onDepthChange: (depth: 'surface' | 'exploring' | 'deep' | 'mystery') => void;
}> = ({ onDepthChange }) => {
  const [depth, setDepth] = useState(1);
  const depths = ['surface', 'exploring', 'deep', 'mystery'] as const;
  
  const handleChange = (value: number) => {
    setDepth(value);
    onDepthChange(depths[value]);
  };

  return (
    <div className="depth-controller p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">Depth:</span>
        <input
          type="range"
          min="0"
          max="3"
          value={depth}
          onChange={(e) => handleChange(parseInt(e.target.value))}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          style={{
            background: `linear-gradient(to right, 
              #E5E7EB 0%, 
              #8B5CF6 ${(depth / 3) * 100}%, 
              #E5E7EB ${(depth / 3) * 100}%)`
          }}
        />
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span className={depth === 0 ? 'text-purple-600 font-medium' : ''}>Surface</span>
        <span className={depth === 1 ? 'text-purple-600 font-medium' : ''}>Exploring</span>
        <span className={depth === 2 ? 'text-purple-600 font-medium' : ''}>Deep</span>
        <span className={depth === 3 ? 'text-purple-600 font-medium' : ''}>Mystery</span>
      </div>
    </div>
  );
};

/**
 * 🤫 Silence Controls
 */
const SilenceControls: React.FC<{
  onSilenceRequest: () => void;
}> = ({ onSilenceRequest }) => {
  const [isHolding, setIsHolding] = useState(false);
  
  return (
    <div className="silence-controls flex gap-2">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onMouseDown={() => setIsHolding(true)}
        onMouseUp={() => setIsHolding(false)}
        onMouseLeave={() => setIsHolding(false)}
        onClick={onSilenceRequest}
        className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full 
                   hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <span className="text-sm">
          {isHolding ? '🤫 Holding space...' : '🤲 Need space'}
        </span>
      </motion.button>
      
      <motion.button
        whileTap={{ scale: 0.95 }}
        className="px-4 py-2 bg-purple-100 dark:bg-purple-900 rounded-full 
                   hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
      >
        <span className="text-sm">✨ Sit with this</span>
      </motion.button>
    </div>
  );
};

/**
 * 📝 Response Density Selector
 */
const DensitySelector: React.FC<{
  onDensityChange: (density: 'haiku' | 'minimal' | 'balanced' | 'flowing') => void;
}> = ({ onDensityChange }) => {
  const [selected, setSelected] = useState<'haiku' | 'minimal' | 'balanced' | 'flowing'>('balanced');
  
  const densities = [
    { value: 'haiku', label: '俳句', description: 'Essential only' },
    { value: 'minimal', label: '◦', description: 'Few words' },
    { value: 'balanced', label: '≈', description: 'Natural flow' },
    { value: 'flowing', label: '∿', description: 'Spacious prose' }
  ] as const;

  const handleSelect = (density: typeof densities[number]['value']) => {
    setSelected(density);
    onDensityChange(density);
  };

  return (
    <div className="density-selector flex gap-1 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
      {densities.map((density) => (
        <motion.button
          key={density.value}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleSelect(density.value)}
          className={`
            px-3 py-2 rounded-md transition-all
            ${selected === density.value 
              ? 'bg-purple-500 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
            }
          `}
          title={density.description}
        >
          <span className="text-lg">{density.label}</span>
        </motion.button>
      ))}
    </div>
  );
};

/**
 * 🕯️ Ambient Mode Indicator
 */
const AmbientModeIndicator: React.FC<{
  mode: 'daylight' | 'candlelight' | 'moonlight' | 'starlight';
}> = ({ mode }) => {
  const modes = {
    daylight: { icon: '☀️', bg: '#FEF3C7', text: '#78350F' },
    candlelight: { icon: '🕯️', bg: '#FED7AA', text: '#7C2D12' },
    moonlight: { icon: '🌙', bg: '#DBEAFE', text: '#1E3A8A' },
    starlight: { icon: '✨', bg: '#E0E7FF', text: '#312E81' }
  };

  const config = modes[mode];

  return (
    <motion.div
      className="ambient-indicator px-3 py-1 rounded-full flex items-center gap-2"
      style={{ backgroundColor: config.bg, color: config.text }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
    >
      <span>{config.icon}</span>
      <span className="text-sm font-medium">{mode}</span>
    </motion.div>
  );
};

/**
 * 🎭 Non-Verbal Response Display
 */
const NonVerbalResponse: React.FC<{
  gesture: 'shimmer' | 'pulse' | 'glow' | 'bloom' | 'star' | 'moon';
}> = ({ gesture }) => {
  const gestures = {
    shimmer: { animation: 'shimmer 2s infinite', symbol: '∿' },
    pulse: { animation: 'pulse 3s infinite', symbol: '◉' },
    glow: { animation: 'glow 2.5s infinite', symbol: '✦' },
    bloom: { animation: 'bloom 3s ease-out', symbol: '✿' },
    star: { animation: 'twinkle 2s infinite', symbol: '✦' },
    moon: { animation: 'fade 4s infinite', symbol: '◗' }
  };

  const config = gestures[gesture];

  return (
    <motion.div
      className="non-verbal-response text-4xl"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      style={{ animation: config.animation }}
    >
      {config.symbol}
    </motion.div>
  );
};

/**
 * 🌊 Main Contemplative Interface
 */
export const ContemplativeInterface: React.FC<ContemplativeInterfaceProps> = ({
  onDepthChange = () => {},
  onSilenceRequest = () => {},
  onDensityChange = () => {},
  currentMode = 'daylight',
  isProcessing = false
}) => {
  const [presenceState, setPresenceState] = useState<'listening' | 'witnessing' | 'holding' | 'resting'>('listening');
  const [showNonVerbal, setShowNonVerbal] = useState(false);
  const [currentGesture, setCurrentGesture] = useState<'shimmer' | 'pulse' | 'glow' | 'bloom' | 'star' | 'moon'>('pulse');
  
  // Breathing rhythm effect
  useEffect(() => {
    const interval = setInterval(() => {
      setPresenceState(prev => {
        const states = ['listening', 'witnessing', 'holding', 'resting'] as const;
        const currentIndex = states.indexOf(prev);
        return states[(currentIndex + 1) % states.length];
      });
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  // Handle silence request
  const handleSilenceRequest = useCallback(() => {
    onSilenceRequest();
    setShowNonVerbal(true);
    setCurrentGesture('moon');
    setTimeout(() => setShowNonVerbal(false), 3000);
  }, [onSilenceRequest]);

  return (
    <div className={`contemplative-interface transition-all duration-1000 mode-${currentMode}`}>
      {/* Top Controls Bar */}
      <div className="controls-bar flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <AmbientModeIndicator mode={currentMode} />
        <DensitySelector onDensityChange={onDensityChange} />
      </div>

      {/* Main Presence Area */}
      <div className="presence-area min-h-[100px] flex items-center justify-center p-8">
        <AnimatePresence mode="wait">
          {isProcessing ? (
            <BreathingPresence state={presenceState} />
          ) : showNonVerbal ? (
            <NonVerbalResponse gesture={currentGesture} />
          ) : null}
        </AnimatePresence>
      </div>

      {/* Bottom Controls */}
      <div className="bottom-controls p-4 space-y-4">
        <DepthController onDepthChange={onDepthChange} />
        <SilenceControls onSilenceRequest={handleSilenceRequest} />
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes shimmer {
          0%, 100% { filter: hue-rotate(0deg); }
          50% { filter: hue-rotate(30deg); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px rgba(139, 92, 246, 0.5); }
          50% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.8); }
        }
        
        @keyframes bloom {
          0% { transform: scale(0.8) rotate(0deg); }
          100% { transform: scale(1) rotate(360deg); }
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        
        @keyframes fade {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        
        .mode-candlelight {
          background: linear-gradient(180deg, #FEF3C7 0%, #FED7AA 100%);
        }
        
        .mode-moonlight {
          background: linear-gradient(180deg, #1E293B 0%, #334155 100%);
        }
        
        .mode-starlight {
          background: linear-gradient(180deg, #0F172A 0%, #1E293B 100%);
        }
      `}</style>
    </div>
  );
};

export default ContemplativeInterface;