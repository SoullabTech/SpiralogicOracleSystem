// Progression Map - Visual journey through Spiralogic levels
import React, { useState, useMemo } from 'react';
import { SPIRALOGIC_FACETS_COMPLETE } from '@/data/spiralogic-facets-complete';

interface UserProgress {
  totalSessions: number;
  coherenceStreak: number;
  elementalMilestones: Record<string, number>; // element -> highest stage reached
  cycleCompletions: number;
  breakthroughMoments: number;
  currentArchetype: string;
  aetherActivations: number;
}

interface ProgressionMapProps {
  userProgress: UserProgress;
  onMilestoneClick?: (milestone: string) => void;
}

// Archetypal progression levels
const ARCHETYPES = [
  {
    name: 'Novice',
    threshold: { sessions: 0, cycles: 0 },
    color: '#9CA3AF',
    description: 'Beginning the journey of self-discovery',
    icon: '🌱'
  },
  {
    name: 'Explorer',
    threshold: { sessions: 7, cycles: 1 },
    color: '#3B82F6',
    description: 'Curious seeker of elemental wisdom',
    icon: '🧭'
  },
  {
    name: 'Alchemist',
    threshold: { sessions: 21, cycles: 3 },
    color: '#8B5CF6',
    description: 'Transformer of inner patterns',
    icon: '⚗️'
  },
  {
    name: 'Teacher',
    threshold: { sessions: 60, cycles: 8 },
    color: '#10B981',
    description: 'Wisdom keeper sharing insights',
    icon: '🕯️'
  },
  {
    name: 'Sage',
    threshold: { sessions: 120, cycles: 15 },
    color: '#F59E0B',
    description: 'Master of the elemental spiral',
    icon: '🌟'
  }
];

export const ProgressionMap: React.FC<ProgressionMapProps> = ({
  userProgress,
  onMilestoneClick
}) => {
  const [activeView, setActiveView] = useState<'spiral' | 'linear'>('spiral');

  // Calculate current archetype
  const currentArchetype = useMemo(() => {
    for (let i = ARCHETYPES.length - 1; i >= 0; i--) {
      const archetype = ARCHETYPES[i];
      if (
        userProgress.totalSessions >= archetype.threshold.sessions &&
        userProgress.cycleCompletions >= archetype.threshold.cycles
      ) {
        return archetype;
      }
    }
    return ARCHETYPES[0];
  }, [userProgress]);

  // Calculate next milestone
  const nextArchetype = useMemo(() => {
    const currentIndex = ARCHETYPES.findIndex(a => a.name === currentArchetype.name);
    return currentIndex < ARCHETYPES.length - 1 ? ARCHETYPES[currentIndex + 1] : null;
  }, [currentArchetype]);

  const renderSpiralView = () => (
    <div className="spiral-progression relative" style={{ width: 400, height: 400 }}>
      <svg width={400} height={400} viewBox="0 0 400 400">
        <defs>
          <radialGradient id="center-glow">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="50%" stopColor={currentArchetype.color} stopOpacity="0.6" />
            <stop offset="100%" stopColor={currentArchetype.color} stopOpacity="0.1" />
          </radialGradient>
        </defs>

        {/* Background spiral path */}
        <path
          d="M 200,200 
             A 20,20 0 1,1 220,200
             A 40,40 0 1,1 160,200  
             A 60,60 0 1,1 260,200
             A 80,80 0 1,1 120,200
             A 100,100 0 1,1 300,200"
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="2"
          strokeDasharray="5,5"
        />

        {/* Elemental stations around the spiral */}
        {['fire', 'water', 'earth', 'air'].map((element, i) => {
          const angle = (i * Math.PI / 2) - Math.PI / 2;
          const radius = 120 + (i * 15); // Spiral outward
          const x = 200 + Math.cos(angle) * radius;
          const y = 200 + Math.sin(angle) * radius;
          
          const milestone = userProgress.elementalMilestones[element] || 0;
          const maxStage = 3;
          
          return (
            <g key={element}>
              {/* Station background */}
              <circle
                cx={x}
                cy={y}
                r="25"
                fill={milestone > 0 ? `${getElementColor(element)}20` : '#F9FAFB'}
                stroke={getElementColor(element)}
                strokeWidth={milestone > 0 ? "3" : "1"}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => onMilestoneClick?.(element)}
              />
              
              {/* Element symbol */}
              <text
                x={x}
                y={y - 5}
                textAnchor="middle"
                className="text-sm font-semibold"
                fill={milestone > 0 ? getElementColor(element) : '#9CA3AF'}
              >
                {getElementSymbol(element)}
              </text>
              
              {/* Progress indicator */}
              <text
                x={x}
                y={y + 10}
                textAnchor="middle"
                className="text-xs"
                fill="#6B7280"
              >
                {milestone}/{maxStage}
              </text>
              
              {/* Completion glow */}
              {milestone === maxStage && (
                <circle
                  cx={x}
                  cy={y}
                  r="30"
                  fill="none"
                  stroke={getElementColor(element)}
                  strokeWidth="2"
                  opacity="0.5"
                  className="animate-pulse"
                />
              )}
            </g>
          );
        })}

        {/* Center - Current Archetype */}
        <circle
          cx={200}
          cy={200}
          r={40 + (userProgress.aetherActivations * 2)}
          fill="url(#center-glow)"
          className="animate-pulse"
        />
        
        <text
          x={200}
          y={190}
          textAnchor="middle"
          className="text-2xl"
        >
          {currentArchetype.icon}
        </text>
        
        <text
          x={200}
          y={210}
          textAnchor="middle"
          className="text-sm font-semibold"
          fill={currentArchetype.color}
        >
          {currentArchetype.name}
        </text>

        {/* Breakthrough moments as stars */}
        {Array.from({ length: userProgress.breakthroughMoments }).map((_, i) => {
          const starAngle = (i * Math.PI * 2) / Math.max(userProgress.breakthroughMoments, 1);
          const starRadius = 160;
          const starX = 200 + Math.cos(starAngle) * starRadius;
          const starY = 200 + Math.sin(starAngle) * starRadius;
          
          return (
            <text
              key={i}
              x={starX}
              y={starY}
              textAnchor="middle"
              className="text-lg animate-pulse"
              fill="#F59E0B"
            >
              ✦
            </text>
          );
        })}
      </svg>
    </div>
  );

  const renderLinearView = () => (
    <div className="linear-progression space-y-6">
      {/* Archetype progression bar */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Archetypal Journey</h3>
        
        <div className="flex items-center justify-between mb-3">
          {ARCHETYPES.map((archetype, i) => (
            <div key={archetype.name} className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center
                  ${userProgress.totalSessions >= archetype.threshold.sessions 
                    ? `bg-${archetype.color} border-${archetype.color}` 
                    : 'bg-gray-100 border-gray-300'}`}
                style={{
                  backgroundColor: userProgress.totalSessions >= archetype.threshold.sessions 
                    ? archetype.color 
                    : undefined
                }}
              >
                <span className={`text-lg ${
                  userProgress.totalSessions >= archetype.threshold.sessions 
                    ? 'text-white' 
                    : 'text-gray-400'
                }`}>
                  {archetype.icon}
                </span>
              </div>
              
              <span className={`text-xs mt-1 font-medium ${
                archetype.name === currentArchetype.name 
                  ? 'text-purple-600' 
                  : 'text-gray-500'
              }`}>
                {archetype.name}
              </span>
            </div>
          ))}
        </div>
        
        {/* Progress bar */}
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-1000"
            style={{
              width: `${(userProgress.totalSessions / (nextArchetype?.threshold.sessions || userProgress.totalSessions)) * 100}%`
            }}
          />
        </div>
        
        {nextArchetype && (
          <p className="text-sm text-gray-600 mt-2">
            {nextArchetype.threshold.sessions - userProgress.totalSessions} sessions to {nextArchetype.name}
          </p>
        )}
      </div>

      {/* Elemental progress */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['fire', 'water', 'earth', 'air'].map(element => {
          const milestone = userProgress.elementalMilestones[element] || 0;
          const progress = (milestone / 3) * 100;
          
          return (
            <div
              key={element}
              className="bg-white rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onMilestoneClick?.(element)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">{getElementSymbol(element)}</span>
                <span className="text-sm text-gray-500 capitalize">{element}</span>
              </div>
              
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: getElementColor(element)
                  }}
                />
              </div>
              
              <p className="text-xs text-gray-600 mt-1">
                Stage {milestone} / 3
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="progression-map bg-gradient-to-br from-purple-50 to-white rounded-xl shadow-sm p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Sacred Journey</h2>
          <p className="text-gray-600">
            {currentArchetype.description}
          </p>
        </div>
        
        {/* View toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveView('spiral')}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              activeView === 'spiral'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Spiral
          </button>
          <button
            onClick={() => setActiveView('linear')}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              activeView === 'linear'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Linear
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex justify-center">
        {activeView === 'spiral' ? renderSpiralView() : renderLinearView()}
      </div>

      {/* Stats summary */}
      <div className="mt-6 grid grid-cols-4 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-purple-600">
            {userProgress.totalSessions}
          </div>
          <div className="text-xs text-gray-500">Sessions</div>
        </div>
        
        <div>
          <div className="text-2xl font-bold text-blue-600">
            {userProgress.cycleCompletions}
          </div>
          <div className="text-xs text-gray-500">Cycles</div>
        </div>
        
        <div>
          <div className="text-2xl font-bold text-green-600">
            {userProgress.coherenceStreak}
          </div>
          <div className="text-xs text-gray-500">Streak</div>
        </div>
        
        <div>
          <div className="text-2xl font-bold text-yellow-600">
            {userProgress.breakthroughMoments}
          </div>
          <div className="text-xs text-gray-500">Breakthroughs</div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
function getElementColor(element: string): string {
  const colors: Record<string, string> = {
    fire: '#EF4444',
    water: '#3B82F6',
    earth: '#10B981',
    air: '#F59E0B'
  };
  return colors[element] || '#6B7280';
}

function getElementSymbol(element: string): string {
  const symbols: Record<string, string> = {
    fire: '🔥',
    water: '💧',
    earth: '🌍',
    air: '💨'
  };
  return symbols[element] || '⚫';
}

export default ProgressionMap;