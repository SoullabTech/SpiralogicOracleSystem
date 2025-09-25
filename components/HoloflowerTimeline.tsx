'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, differenceInDays, startOfWeek, startOfMonth } from 'date-fns';

// ============================================
// Types
// ============================================

interface SessionData {
  sessionId: string;
  timestamp: string;
  userCheckin?: Array<{
    petal: string;
    essence: string;
    keywords: string[];
    intensity?: number;
  }>;
  oracleReading?: {
    elementalBalance: {
      fire: number;
      water: number;
      earth: number;
      air: number;
      aether: number;
    };
    spiralStage: {
      element: string;
      stage: number;
    };
    reflection: string;
    practice: string;
    archetype: string;
  };
  mergedInsight?: {
    alignment: string;
    tension: string;
    synthesis: string;
  };
}

interface TimelineProps {
  sessions: SessionData[];
  onSessionClick?: (session: SessionData) => void;
  viewMode?: 'daily' | 'weekly' | 'monthly';
  className?: string;
}

interface MiniFlowerProps {
  session: SessionData;
  size?: number;
  showAetherPulse?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

// ============================================
// Color Constants
// ============================================

const ELEMENT_COLORS = {
  fire: '#FF6B35',
  water: '#4A90E2',
  earth: '#8B7355',
  air: '#A8DADC',
  aether: '#FFFFFF'
};

const PETAL_POSITIONS = [
  { angle: 0, element: 'fire', stage: 1 },    // Fire1
  { angle: 30, element: 'fire', stage: 2 },   // Fire2
  { angle: 60, element: 'fire', stage: 3 },   // Fire3
  { angle: 90, element: 'water', stage: 1 },  // Water1
  { angle: 120, element: 'water', stage: 2 }, // Water2
  { angle: 150, element: 'water', stage: 3 }, // Water3
  { angle: 180, element: 'earth', stage: 1 }, // Earth1
  { angle: 210, element: 'earth', stage: 2 }, // Earth2
  { angle: 240, element: 'earth', stage: 3 }, // Earth3
  { angle: 270, element: 'air', stage: 1 },   // Air1
  { angle: 300, element: 'air', stage: 2 },   // Air2
  { angle: 330, element: 'air', stage: 3 },   // Air3
];

// ============================================
// Mini Holoflower Component
// ============================================

const MiniHoloflower: React.FC<MiniFlowerProps> = ({
  session,
  size = 60,
  showAetherPulse = true,
  isSelected = false,
  onClick
}) => {
  const centerRadius = size / 6;
  const petalLength = size / 3;
  
  // Calculate petal intensities from session data
  const getPetalIntensity = (element: string, stage: number): number => {
    // From user check-in
    if (session.userCheckin) {
      const petal = session.userCheckin.find(p => 
        p.petal === `${element.charAt(0).toUpperCase()}${element.slice(1)}${stage}`
      );
      if (petal?.intensity) return petal.intensity;
    }
    
    // From oracle reading
    if (session.oracleReading?.spiralStage) {
      const { element: oracleElement, stage: oracleStage } = session.oracleReading.spiralStage;
      if (oracleElement === element && oracleStage === stage) {
        return 0.8; // Highlight oracle-selected petal
      }
    }
    
    // From elemental balance
    if (session.oracleReading?.elementalBalance) {
      const balance = session.oracleReading.elementalBalance[element as keyof typeof session.oracleReading.elementalBalance];
      if (balance) return balance * 0.5; // Scale down for subtle effect
    }
    
    return 0.1; // Default minimal visibility
  };
  
  // Check for Aether presence
  const hasAether = session.oracleReading?.spiralStage?.element === 'aether' ||
                    (session.oracleReading?.elementalBalance?.aether || 0) > 0.3;
  const aetherStage = session.oracleReading?.spiralStage?.element === 'aether' 
    ? session.oracleReading.spiralStage.stage 
    : 0;

  return (
    <motion.div
      className={`relative cursor-pointer ${isSelected ? 'ring-2 ring-white ring-opacity-50' : ''}`}
      style={{ width: size, height: size }}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`${-size/2} ${-size/2} ${size} ${size}`}
        className="overflow-visible"
      >
        {/* Background circle */}
        <circle
          r={size/2 - 2}
          fill="black"
          fillOpacity="0.2"
          stroke="white"
          strokeWidth="0.5"
          strokeOpacity="0.3"
        />
        
        {/* Petals */}
        {PETAL_POSITIONS.map((pos, idx) => {
          const intensity = getPetalIntensity(pos.element, pos.stage);
          const petalSize = petalLength * (0.5 + intensity * 0.5);
          
          return (
            <motion.line
              key={idx}
              x1={0}
              y1={0}
              x2={0}
              y2={-petalSize}
              stroke={ELEMENT_COLORS[pos.element as keyof typeof ELEMENT_COLORS]}
              strokeWidth={1 + intensity * 2}
              strokeOpacity={0.3 + intensity * 0.7}
              transform={`rotate(${pos.angle})`}
              initial={{ strokeOpacity: 0 }}
              animate={{ strokeOpacity: 0.3 + intensity * 0.7 }}
              transition={{ duration: 0.5, delay: idx * 0.02 }}
            />
          );
        })}
        
        {/* Aether Center */}
        <motion.circle
          r={centerRadius}
          fill={hasAether ? 'white' : 'transparent'}
          fillOpacity={hasAether ? 0.6 : 0}
          stroke="white"
          strokeWidth={hasAether ? 1 : 0.5}
          strokeOpacity={hasAether ? 1 : 0.2}
          animate={hasAether && showAetherPulse ? {
            r: [centerRadius, centerRadius * 1.3, centerRadius],
            fillOpacity: [0.6, 0.9, 0.6]
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Aether stage indicator */}
        {hasAether && aetherStage > 0 && (
          <text
            y={1}
            textAnchor="middle"
            fill="white"
            fontSize={centerRadius * 0.8}
            fontWeight="bold"
            opacity="0.8"
          >
            {aetherStage}
          </text>
        )}
      </svg>
      
      {/* Timestamp */}
      <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs text-white/60 whitespace-nowrap">
        {format(parseISO(session.timestamp), 'MMM d')}
      </div>
    </motion.div>
  );
};

// ============================================
// Timeline Analytics Component
// ============================================

interface TimelineAnalyticsProps {
  sessions: SessionData[];
}

const TimelineAnalytics: React.FC<TimelineAnalyticsProps> = ({ sessions }) => {
  // Calculate elemental journey
  const elementCounts = sessions.reduce((acc, session) => {
    if (session.oracleReading?.spiralStage) {
      const element = session.oracleReading.spiralStage.element;
      acc[element] = (acc[element] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  
  // Count Aether appearances
  const aetherCount = sessions.filter(s => 
    s.oracleReading?.spiralStage?.element === 'aether' ||
    (s.oracleReading?.elementalBalance?.aether || 0) > 0.3
  ).length;
  
  // Find dominant element
  const dominantElement = Object.entries(elementCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'balanced';
  
  // Calculate evolution phase
  const avgStage = sessions.reduce((sum, s) => {
    return sum + (s.oracleReading?.spiralStage?.stage || 1);
  }, 0) / (sessions.length || 1);
  
  const evolutionPhase = avgStage < 1.5 ? 'Recognition' 
    : avgStage < 2.5 ? 'Exploration'
    : 'Integration';

  return (
    <motion.div
      className="bg-black/30 backdrop-blur-sm rounded-lg p-4 text-white"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="text-sm font-semibold mb-3 opacity-80">Journey Patterns</h3>
      
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div>
          <span className="opacity-60">Dominant Element:</span>
          <div className="font-medium mt-1" style={{ 
            color: ELEMENT_COLORS[dominantElement as keyof typeof ELEMENT_COLORS] || 'white' 
          }}>
            {dominantElement.toUpperCase()}
          </div>
        </div>
        
        <div>
          <span className="opacity-60">Evolution Phase:</span>
          <div className="font-medium mt-1">{evolutionPhase}</div>
        </div>
        
        <div>
          <span className="opacity-60">Aether Moments:</span>
          <div className="font-medium mt-1">
            {aetherCount} / {sessions.length}
            {aetherCount > 0 && (
              <span className="ml-1 opacity-60">
                ({Math.round(aetherCount / sessions.length * 100)}%)
              </span>
            )}
          </div>
        </div>
        
        <div>
          <span className="opacity-60">Sessions:</span>
          <div className="font-medium mt-1">{sessions.length}</div>
        </div>
      </div>
      
      {/* Elemental balance bar */}
      <div className="mt-4">
        <div className="opacity-60 text-xs mb-2">Elemental Distribution</div>
        <div className="flex h-2 rounded overflow-hidden bg-black/20">
          {Object.entries(elementCounts)
            .sort(([a], [b]) => {
              const order = ['fire', 'water', 'earth', 'air', 'aether'];
              return order.indexOf(a) - order.indexOf(b);
            })
            .map(([element, count]) => (
              <motion.div
                key={element}
                className="h-full"
                style={{
                  backgroundColor: ELEMENT_COLORS[element as keyof typeof ELEMENT_COLORS],
                  width: `${(count / sessions.length) * 100}%`
                }}
                initial={{ width: 0 }}
                animate={{ width: `${(count / sessions.length) * 100}%` }}
                transition={{ duration: 0.5, delay: 0.1 }}
              />
            ))}
        </div>
      </div>
      
      {/* Aether indicator */}
      {aetherCount > 0 && (
        <motion.div
          className="mt-3 text-xs opacity-80 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          ✨ {aetherCount} transcendent {aetherCount === 1 ? 'moment' : 'moments'} recorded
        </motion.div>
      )}
    </motion.div>
  );
};

// ============================================
// Session Detail Panel
// ============================================

interface SessionDetailProps {
  session: SessionData;
  onClose: () => void;
}

const SessionDetail: React.FC<SessionDetailProps> = ({ session, onClose }) => {
  return (
    <motion.div
      className="bg-black/40 backdrop-blur-md rounded-lg p-6 text-white max-w-md"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold">Session Details</h3>
          <p className="text-xs opacity-60 mt-1">
            {format(parseISO(session.timestamp), 'MMMM d, yyyy h:mm a')}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
      
      {/* User Check-in */}
      {session.userCheckin && session.userCheckin.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2 opacity-80">Your Check-in</h4>
          <div className="space-y-1">
            {session.userCheckin.map((petal, idx) => (
              <div key={idx} className="text-xs">
                <span className="font-medium">{petal.petal}:</span>{' '}
                <span className="opacity-80">{petal.essence}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Oracle Reading */}
      {session.oracleReading && (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2 opacity-80">Oracle Guidance</h4>
          <div className="space-y-2 text-xs">
            <div>
              <span className="opacity-60">Archetype:</span>{' '}
              <span className="font-medium">{session.oracleReading.archetype}</span>
            </div>
            <div>
              <span className="opacity-60">Reflection:</span>{' '}
              <span className="italic">{session.oracleReading.reflection}</span>
            </div>
            <div>
              <span className="opacity-60">Practice:</span>{' '}
              {session.oracleReading.practice}
            </div>
          </div>
        </div>
      )}
      
      {/* Merged Insight */}
      {session.mergedInsight && (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2 opacity-80">Synthesis</h4>
          <p className="text-xs opacity-90">{session.mergedInsight.synthesis}</p>
        </div>
      )}
    </motion.div>
  );
};

// ============================================
// Main Timeline Component
// ============================================

export const HoloflowerTimeline: React.FC<TimelineProps> = ({
  sessions,
  onSessionClick,
  viewMode = 'weekly',
  className = ''
}) => {
  const [selectedSession, setSelectedSession] = useState<SessionData | null>(null);
  const [hoveredSession, setHoveredSession] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Group sessions by time period
  const groupedSessions = React.useMemo(() => {
    const groups: Record<string, SessionData[]> = {};
    
    sessions.forEach(session => {
      const date = parseISO(session.timestamp);
      let key: string;
      
      switch (viewMode) {
        case 'daily':
          key = format(date, 'yyyy-MM-dd');
          break;
        case 'weekly':
          key = format(startOfWeek(date), 'yyyy-MM-dd');
          break;
        case 'monthly':
          key = format(startOfMonth(date), 'yyyy-MM');
          break;
      }
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(session);
    });
    
    return groups;
  }, [sessions, viewMode]);
  
  // Sort groups by date
  const sortedGroups = Object.entries(groupedSessions)
    .sort(([a], [b]) => a.localeCompare(b));
  
  const handleSessionClick = (session: SessionData) => {
    setSelectedSession(session);
    if (onSessionClick) onSessionClick(session);
  };
  
  // Calculate timeline connections
  const getConnectionPath = (fromIdx: number, toIdx: number, totalWidth: number) => {
    const spacing = 80; // Space between flowers
    const x1 = fromIdx * spacing + 30;
    const x2 = toIdx * spacing + 30;
    const midY = 30;
    
    return `M ${x1} 0 Q ${(x1 + x2) / 2} ${midY}, ${x2} 0`;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Timeline Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-white">Your Journey</h2>
        <div className="flex gap-2">
          {(['daily', 'weekly', 'monthly'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => {/* Add view mode change handler */}}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                viewMode === mode 
                  ? 'bg-white/20 text-white' 
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {/* Analytics Panel */}
      {sessions.length > 0 && (
        <div className="mb-6">
          <TimelineAnalytics sessions={sessions} />
        </div>
      )}
      
      {/* Timeline Scroll Container */}
      <div 
        ref={scrollRef}
        className="overflow-x-auto pb-8"
      >
        <div className="relative min-w-max">
          {/* Connection lines */}
          <svg
            className="absolute top-10 left-0 pointer-events-none"
            style={{ width: '100%', height: '60px' }}
          >
            {sessions.length > 1 && sessions.map((_, idx) => {
              if (idx === 0) return null;
              return (
                <path
                  key={idx}
                  d={getConnectionPath(idx - 1, idx, sessions.length * 80)}
                  stroke="white"
                  strokeWidth="0.5"
                  strokeOpacity="0.2"
                  fill="none"
                />
              );
            })}
          </svg>
          
          {/* Session Flowers */}
          <div className="flex gap-5 relative z-10 pt-6">
            {sessions.map((session, idx) => (
              <div key={session.sessionId} className="relative">
                {/* Aether burst indicator */}
                {session.oracleReading?.spiralStage?.element === 'aether' && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <div className="w-full h-full rounded-full bg-white/30" />
                  </motion.div>
                )}
                
                <MiniHoloflower
                  session={session}
                  size={60}
                  showAetherPulse={true}
                  isSelected={selectedSession?.sessionId === session.sessionId}
                  onClick={() => handleSessionClick(session)}
                />
                
                {/* Session number */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-xs text-white/40">
                  #{sessions.length - idx}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Session Detail Modal */}
      <AnimatePresence>
        {selectedSession && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedSession(null)}
          >
            <div onClick={e => e.stopPropagation()}>
              <SessionDetail
                session={selectedSession}
                onClose={() => setSelectedSession(null)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Journey Insights */}
      {sessions.length > 5 && (
        <motion.div
          className="mt-6 p-4 bg-gradient-to-r from-amber-900/20 to-blue-900/20 rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-sm font-medium text-white mb-2">Journey Insight</h3>
          <p className="text-xs text-white/80">
            {sessions.filter(s => s.oracleReading?.spiralStage?.element === 'aether').length > 0
              ? "You've touched the transcendent realm. The ordinary and sacred are beginning to merge in your awareness."
              : "Your journey weaves through the elements. Each session adds another thread to your tapestry of growth."}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default HoloflowerTimeline;