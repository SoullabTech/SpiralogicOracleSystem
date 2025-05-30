'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ===============================================
// ENHANCED ORACLE MODE SELECTOR
// Complete integration with backend AdaptiveWisdomEngine
// ===============================================

interface OracleMode {
  id: 'alchemist' | 'buddha' | 'sage' | 'mystic' | 'guardian' | 'tao';
  icon: string;
  name: string;
  tagline: string;
  description: string;
  color: string;
  wisdomAlignment?: 'jung' | 'buddha' | 'hybrid' | 'adaptive';
}

interface WisdomRouting {
  approach: 'jung' | 'buddha' | 'hybrid';
  confidence: number;
  reasoning: string;
  adjustments?: {
    pace: 'gentle' | 'normal' | 'intensive';
    depth: 'surface' | 'moderate' | 'deep';
    tone: 'nurturing' | 'challenging' | 'neutral';
  };
}

interface ModeSuggestion {
  suggestedMode: string | null;
  confidence: number;
  reason: string;
  currentMode: string;
}

const OracleModeSelector: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<string>('sage');
  const [wisdomRouting, setWisdomRouting] = useState<WisdomRouting | null>(null);
  const [modeSuggestion, setModeSuggestion] = useState<ModeSuggestion | null>(null);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWisdomDetails, setShowWisdomDetails] = useState(false);

  const modes: OracleMode[] = [
    {
      id: 'alchemist',
      icon: '🧪',
      name: 'Alchemist',
      tagline: 'For deep integration',
      description: 'Deep integration work, shadow exploration, becoming whole',
      color: '#8B4513',
      wisdomAlignment: 'jung'
    },
    {
      id: 'buddha',
      icon: '☸️',
      name: 'Buddha',
      tagline: 'For letting go',
      description: 'Non-attachment, letting go, present moment, liberation',
      color: '#4169E1',
      wisdomAlignment: 'buddha'
    },
    {
      id: 'sage',
      icon: '🌀',
      name: 'Sage',
      tagline: 'For complex decisions',
      description: 'Both integration and release, dynamic balance',
      color: '#9370DB',
      wisdomAlignment: 'hybrid'
    },
    {
      id: 'mystic',
      icon: '🔥',
      name: 'Mystic',
      tagline: 'For creative vision',
      description: 'Visions, creativity, divine connection, ecstatic wisdom',
      color: '#FF6347',
      wisdomAlignment: 'hybrid'
    },
    {
      id: 'guardian',
      icon: '🌱',
      name: 'Guardian',
      tagline: 'For gentle support',
      description: 'Gentle support, grounding, protection, trauma-aware',
      color: '#228B22',
      wisdomAlignment: 'adaptive'
    },
    {
      id: 'tao',
      icon: '☯️',
      name: 'Sage of Tao',
      tagline: 'Flow with the Way',
      description: 'Wu wei wisdom, natural harmony, yin-yang balance',
      color: '#4A5568',
      wisdomAlignment: 'hybrid'
    }
  ];

  // Switch oracle mode
  const handleModeSwitch = async (modeId: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/oracle/switch-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modeId })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setCurrentMode(modeId);
        
        // Update wisdom routing if available
        if (result.modeInfo?.wisdomRouting) {
          setWisdomRouting(result.modeInfo.wisdomRouting);
        }
        
        // Show wisdom adjustment notification
        if (result.wisdomApproachAdjustment) {
          console.log('Wisdom approach adjusted:', result.wisdomApproachAdjustment);
        }
      }
    } catch (error) {
      console.error('Failed to switch oracle mode:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get mode suggestion based on user input
  const handleInputAnalysis = async () => {
    if (!userInput.trim()) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/oracle/suggest-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput })
      });
      
      const suggestion = await response.json();
      setModeSuggestion(suggestion);
    } catch (error) {
      console.error('Failed to get mode suggestion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get current wisdom routing status
  const fetchWisdomStatus = async () => {
    try {
      const response = await fetch('/api/oracle/wisdom-status');
      const status = await response.json();
      setWisdomRouting(status.wisdomRouting);
    } catch (error) {
      console.error('Failed to fetch wisdom status:', error);
    }
  };

  useEffect(() => {
    fetchWisdomStatus();
  }, [currentMode]);

  const getWisdomApproachColor = (approach: string) => {
    switch (approach) {
      case 'jung': return '#8B4513'; // Brown for integration
      case 'buddha': return '#4169E1'; // Blue for liberation
      case 'hybrid': return '#9370DB'; // Purple for balance
      default: return '#666';
    }
  };

  const getWisdomApproachIcon = (approach: string) => {
    switch (approach) {
      case 'jung': return '🧿';
      case 'buddha': return '☸️';
      case 'hybrid': return '⚖️';
      default: return '🌟';
    }
  };

  return (
    <div className="oracle-mode-selector">
      {/* Current Status Display */}
      <div className="current-status">
        <h3>🌟 Current Oracle Configuration</h3>
        <div className="status-grid">
          <div className="oracle-mode-status">
            <strong>Oracle Mode:</strong> {modes.find(m => m.id === currentMode)?.name || 'Unknown'}
          </div>
          {wisdomRouting && (
            <div className="wisdom-status">
              <strong>Wisdom Approach:</strong>
              <span 
                className="wisdom-approach"
                style={{ color: getWisdomApproachColor(wisdomRouting.approach) }}
              >
                {getWisdomApproachIcon(wisdomRouting.approach)} {wisdomRouting.approach}
              </span>
              <span className="confidence">({(wisdomRouting.confidence * 100).toFixed(0)}%)</span>
            </div>
          )}
        </div>
        
        <button 
          onClick={() => setShowWisdomDetails(!showWisdomDetails)}
          className="wisdom-details-toggle"
        >
          {showWisdomDetails ? 'Hide' : 'Show'} Wisdom Details
        </button>

        <AnimatePresence>
          {showWisdomDetails && wisdomRouting && (
            <motion.div 
              className="wisdom-details"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="reasoning">
                <strong>Reasoning:</strong> {wisdomRouting.reasoning}
              </div>
              {wisdomRouting.adjustments && (
                <div className="adjustments">
                  <strong>Adjustments:</strong>
                  <ul>
                    <li>Pace: {wisdomRouting.adjustments.pace}</li>
                    <li>Depth: {wisdomRouting.adjustments.depth}</li>
                    <li>Tone: {wisdomRouting.adjustments.tone}</li>
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mode Selection Grid */}
      <div className="modes-grid">
        <h3>🎭 Choose Your Oracle Mode</h3>
        <div className="mode-buttons">
          {modes.map(mode => (
            <motion.button
              key={mode.id}
              onClick={() => handleModeSwitch(mode.id)}
              className={`mode-button ${currentMode === mode.id ? 'active' : ''}`}
              style={{ 
                borderColor: mode.color,
                backgroundColor: currentMode === mode.id ? `${mode.color}20` : 'transparent'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isLoading}
            >
              <div className="mode-icon">{mode.icon}</div>
              <div className="mode-content">
                <div className="mode-name">{mode.name}</div>
                <div className="mode-tagline">{mode.tagline}</div>
                <div className="mode-description">{mode.description}</div>
                {mode.wisdomAlignment && (
                  <div className="wisdom-alignment">
                    <span className="wisdom-label">Wisdom:</span>
                    <span 
                      className="wisdom-type"
                      style={{ color: getWisdomApproachColor(mode.wisdomAlignment) }}
                    >
                      {getWisdomApproachIcon(mode.wisdomAlignment)} {mode.wisdomAlignment}
                    </span>
                  </div>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Intelligent Mode Suggestion */}
      <div className="mode-suggestion">
        <h3>🎯 Intelligent Mode Suggestion</h3>
        <div className="input-section">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Describe what you're experiencing or what you need support with..."
            className="user-input"
            rows={3}
          />
          <button 
            onClick={handleInputAnalysis}
            disabled={isLoading || !userInput.trim()}
            className="analyze-button"
          >
            {isLoading ? '🔍 Analyzing...' : '🔍 Suggest Mode'}
          </button>
        </div>

        <AnimatePresence>
          {modeSuggestion && (
            <motion.div 
              className="suggestion-result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {modeSuggestion.suggestedMode ? (
                <div className="has-suggestion">
                  <div className="suggestion-header">
                    💡 Suggested Mode: <strong>{modeSuggestion.suggestedMode}</strong>
                  </div>
                  <div className="suggestion-reason">
                    <strong>Reason:</strong> {modeSuggestion.reason}
                  </div>
                  <div className="suggestion-confidence">
                    <strong>Confidence:</strong> {(modeSuggestion.confidence * 100).toFixed(0)}%
                  </div>
                  <button 
                    onClick={() => handleModeSwitch(modeSuggestion.suggestedMode!)}
                    className="apply-suggestion"
                  >
                    Switch to {modeSuggestion.suggestedMode}
                  </button>
                </div>
              ) : (
                <div className="no-suggestion">
                  ✅ Current mode ({modeSuggestion.currentMode}) is appropriate for your input
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Jung-Buddha Wisdom Explanation */}
      <div className="wisdom-explanation">
        <h3>🧿☸️ Jung-Buddha Integration</h3>
        <div className="wisdom-modes">
          <div className="wisdom-mode jung">
            <div className="wisdom-header">🧿 Jung Approach</div>
            <div className="wisdom-description">
              Integration • Shadow Work • Becoming Whole
            </div>
            <div className="wisdom-example">
              "What part of yourself needs integration?"
            </div>
          </div>
          
          <div className="wisdom-mode buddha">
            <div className="wisdom-header">☸️ Buddha Approach</div>
            <div className="wisdom-description">
              Liberation • Spaciousness • Letting Go
            </div>
            <div className="wisdom-example">
              "Who is aware of this experience?"
            </div>
          </div>
          
          <div className="wisdom-mode hybrid">
            <div className="wisdom-header">⚖️ Hybrid Approach</div>
            <div className="wisdom-description">
              Both Integration AND Liberation
            </div>
            <div className="wisdom-example">
              "What to embrace? What to release?"
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OracleModeSelector;