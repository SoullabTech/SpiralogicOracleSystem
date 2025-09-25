// UI Confidence Components for ARIA
// Visual indicators that make uncertainty transparent and trustworthy

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Main confidence indicator component
export const ConfidenceIndicator = ({ mode, confidence, sources = [], onSourceClick }) => {
  const [expanded, setExpanded] = useState(false);

  const modeConfig = {
    VERIFIED: {
      icon: '✓',
      label: 'Verified',
      color: '#10b981',
      borderStyle: 'solid',
      animation: null,
      description: 'High confidence with multiple sources'
    },
    LIKELY: {
      icon: '~',
      label: 'Likely',
      color: '#84cc16',
      borderStyle: 'dashed',
      animation: null,
      description: 'Good confidence with evidence'
    },
    HYPOTHESIS: {
      icon: '?',
      label: 'Hypothesis',
      color: '#eab308',
      borderStyle: 'dotted',
      animation: 'pulse',
      description: 'Moderate confidence, verification recommended'
    },
    EXPLORATORY: {
      icon: '...',
      label: 'Exploring',
      color: '#f97316',
      borderStyle: 'none',
      animation: 'float',
      description: "Let's discover this together"
    },
    RITUAL_SAFE: {
      icon: '🕊',
      label: 'Sacred Space',
      color: '#a855f7',
      borderStyle: 'double',
      animation: 'glow',
      description: 'Approaching with reverence'
    },
    BLOCKED: {
      icon: '⚠',
      label: 'Blocked',
      color: '#ef4444',
      borderStyle: 'solid',
      animation: 'shake',
      description: 'This query pattern has been flagged'
    }
  };

  const config = modeConfig[mode] || modeConfig.EXPLORATORY;

  return (
    <div className="confidence-indicator-container">
      {/* Main indicator badge */}
      <motion.div
        className="confidence-badge"
        style={{
          borderStyle: config.borderStyle,
          borderColor: config.color,
          borderWidth: config.borderStyle === 'double' ? '3px' : '2px',
          background: mode === 'RITUAL_SAFE'
            ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.05), rgba(236, 72, 153, 0.05))'
            : `${config.color}10`
        }}
        animate={config.animation}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setExpanded(!expanded)}
      >
        <span className="confidence-icon" style={{ color: config.color }}>
          {config.icon}
        </span>
        <span className="confidence-label" style={{ color: config.color }}>
          {config.label}
        </span>
        {confidence && (
          <span className="confidence-value" style={{ color: config.color, opacity: 0.8 }}>
            {(confidence * 100).toFixed(0)}%
          </span>
        )}
      </motion.div>

      {/* Expandable details panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="confidence-details"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <p className="confidence-description">{config.description}</p>

            {sources.length > 0 && (
              <div className="confidence-sources">
                <h4>Sources ({sources.length})</h4>
                {sources.slice(0, 3).map((source, idx) => (
                  <SourceChip
                    key={idx}
                    source={source}
                    onClick={() => onSourceClick(source)}
                  />
                ))}
                {sources.length > 3 && (
                  <span className="more-sources">+{sources.length - 3} more</span>
                )}
              </div>
            )}

            {mode === 'HYPOTHESIS' && (
              <div className="confidence-caveat">
                💡 This is based on available patterns but may need verification
              </div>
            )}

            {mode === 'EXPLORATORY' && (
              <div className="confidence-invitation">
                🤝 Your insights could help me understand this better
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Source citation chip
const SourceChip = ({ source, onClick }) => {
  const getFreshnessColor = (timestamp) => {
    const ageInDays = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
    if (ageInDays < 7) return '#10b981'; // Fresh - green
    if (ageInDays < 30) return '#eab308'; // Recent - yellow
    return '#ef4444'; // Stale - red
  };

  return (
    <motion.div
      className="source-chip"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{
        borderLeft: `3px solid ${getFreshnessColor(source.timestamp)}`
      }}
    >
      <span className="source-type">{source.type}</span>
      <span className="source-trust">Trust: {(source.trust * 100).toFixed(0)}%</span>
      {source.domain && <span className="source-domain">{source.domain}</span>}
    </motion.div>
  );
};

// Mode transition indicator
export const ModeTransition = ({ fromMode, toMode, reason }) => {
  return (
    <motion.div
      className="mode-transition"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <span className="transition-from">{fromMode}</span>
      <span className="transition-arrow">→</span>
      <span className="transition-to">{toMode}</span>
      {reason && <span className="transition-reason">({reason})</span>}
    </motion.div>
  );
};

// Inline response styling based on mode
export const StyledResponse = ({ content, mode }) => {
  const getTextStyle = (mode) => {
    switch (mode) {
      case 'HYPOTHESIS':
        return { fontStyle: 'italic', opacity: 0.9 };
      case 'EXPLORATORY':
        return { fontWeight: '300', letterSpacing: '0.5px' };
      case 'RITUAL_SAFE':
        return { fontFamily: 'serif', lineHeight: '1.8' };
      default:
        return {};
    }
  };

  return (
    <div
      className="styled-response"
      style={getTextStyle(mode)}
    >
      {content}
    </div>
  );
};

// Confidence meter for real-time feedback
export const ConfidenceMeter = ({ current, threshold, riskLevel }) => {
  const getZoneColor = (value) => {
    if (value >= 0.9) return '#10b981';
    if (value >= 0.7) return '#84cc16';
    if (value >= 0.5) return '#eab308';
    if (value >= 0.3) return '#f97316';
    return '#ef4444';
  };

  return (
    <div className="confidence-meter">
      <div className="meter-bar">
        <motion.div
          className="meter-fill"
          style={{
            width: `${current * 100}%`,
            background: getZoneColor(current)
          }}
          animate={{ width: `${current * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
        <div
          className="meter-threshold"
          style={{ left: `${threshold * 100}%` }}
          title={`${riskLevel} threshold`}
        />
      </div>
      <div className="meter-labels">
        <span>Exploratory</span>
        <span>Hypothesis</span>
        <span>Likely</span>
        <span>Verified</span>
      </div>
    </div>
  );
};

// CSS animations
const styles = `
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.02); opacity: 0.8; }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-3px); }
  }

  @keyframes glow {
    0%, 100% { box-shadow: 0 0 5px rgba(168, 85, 247, 0.3); }
    50% { box-shadow: 0 0 15px rgba(168, 85, 247, 0.5); }
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-2px); }
    75% { transform: translateX(2px); }
  }

  .confidence-indicator-container {
    position: relative;
    display: inline-block;
    margin: 8px 0;
  }

  .confidence-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    border-radius: 20px;
    cursor: pointer;
    user-select: none;
    transition: all 0.2s ease;
  }

  .confidence-icon {
    font-size: 18px;
  }

  .confidence-label {
    font-weight: 500;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .confidence-value {
    font-size: 12px;
    font-weight: 600;
  }

  .confidence-details {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 8px;
    padding: 12px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    min-width: 280px;
    z-index: 1000;
  }

  .confidence-description {
    margin: 0 0 8px 0;
    font-size: 13px;
    color: #666;
  }

  .confidence-sources h4 {
    margin: 8px 0 4px 0;
    font-size: 12px;
    text-transform: uppercase;
    color: #999;
  }

  .source-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    margin: 2px;
    background: #f5f5f5;
    border-radius: 4px;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .source-chip:hover {
    background: #e0e0e0;
  }

  .confidence-caveat,
  .confidence-invitation {
    margin-top: 8px;
    padding: 8px;
    background: #fff9dc;
    border-radius: 4px;
    font-size: 13px;
  }

  .confidence-invitation {
    background: #f0f9ff;
  }

  .mode-transition {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 4px 8px;
    background: #f5f5f5;
    border-radius: 4px;
    font-size: 12px;
    margin: 4px 0;
  }

  .transition-arrow {
    color: #999;
  }

  .transition-reason {
    color: #666;
    font-style: italic;
  }

  .confidence-meter {
    width: 100%;
    margin: 12px 0;
  }

  .meter-bar {
    position: relative;
    height: 8px;
    background: #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
  }

  .meter-fill {
    height: 100%;
    border-radius: 4px;
  }

  .meter-threshold {
    position: absolute;
    top: -2px;
    width: 2px;
    height: 12px;
    background: #333;
  }

  .meter-labels {
    display: flex;
    justify-content: space-between;
    margin-top: 4px;
    font-size: 10px;
    color: #999;
  }
`;

export default { ConfidenceIndicator, ModeTransition, StyledResponse, ConfidenceMeter, styles };