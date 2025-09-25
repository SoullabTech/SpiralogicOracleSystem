// Journey Timeline - Shows progression through elemental and Aetheric states
import React, { useState, useMemo } from 'react';
import { MiniHoloflower } from './MiniHoloflower';
import { SPIRALOGIC_FACETS_COMPLETE, AETHER_DYNAMICS, getFacetById } from '@/data/spiralogic-facets-complete';

interface SessionSnapshot {
  sessionId: string;
  timestamp: string;
  primaryFacetId: string;
  aetherState?: 'synthesis' | 'void' | 'transcendence' | null;
  checkIns: Record<string, number>;
  keyInsight?: string;
  practice?: string;
}

interface JourneyTimelineProps {
  sessions: SessionSnapshot[];
  onSessionClick?: (session: SessionSnapshot) => void;
  maxDisplay?: number;
  showAnalysis?: boolean;
}

export const JourneyTimeline: React.FC<JourneyTimelineProps> = ({
  sessions,
  onSessionClick,
  maxDisplay = 10,
  showAnalysis = true
}) => {
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'linear' | 'spiral'>('linear');

  // Calculate journey arc
  const journeyArc = useMemo(() => {
    if (sessions.length < 2) return null;

    const elements = sessions.map(s => {
      const facet = getFacetById(s.primaryFacetId);
      return facet && 'element' in facet ? facet.element : 'unknown';
    });

    const stages = sessions.map(s => {
      const facet = getFacetById(s.primaryFacetId);
      return facet && 'stage' in facet ? facet.stage : 0;
    });

    const aetherCount = sessions.filter(s => s.aetherState).length;
    
    // Detect patterns
    const uniqueElements = [...new Set(elements)];
    const isDeepening = stages[stages.length - 1] > stages[0];
    const isSpiraling = uniqueElements.length >= 3;
    const hasTranscended = aetherCount > 0;

    return {
      elements,
      stages,
      uniqueElements,
      isDeepening,
      isSpiraling,
      hasTranscended,
      aetherRatio: aetherCount / sessions.length,
      dominantElement: getMostFrequent(elements),
      narrative: generateNarrative(elements, stages, aetherCount)
    };
  }, [sessions]);

  const handleSessionClick = (session: SessionSnapshot) => {
    setSelectedSession(session.sessionId);
    onSessionClick?.(session);
  };

  const displaySessions = sessions.slice(0, maxDisplay);

  return (
    <div className="journey-timeline bg-white/90 backdrop-blur rounded-xl shadow-sm p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-800">
          Journey Timeline
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('linear')}
            className={`px-3 py-1 text-xs rounded-lg transition-colors
              ${viewMode === 'linear' 
                ? 'bg-amber-100 text-amber-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Linear
          </button>
          <button
            onClick={() => setViewMode('spiral')}
            className={`px-3 py-1 text-xs rounded-lg transition-colors
              ${viewMode === 'spiral' 
                ? 'bg-amber-100 text-amber-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Spiral
          </button>
        </div>
      </div>

      {/* Timeline Display */}
      {viewMode === 'linear' ? (
        <div className="relative">
          {/* Connection line */}
          <div className="absolute top-8 left-8 right-8 h-0.5 bg-gradient-to-r 
                        from-amber-200 via-blue-200 to-green-200" />
          
          {/* Sessions */}
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
            {displaySessions.map((session, index) => (
              <div
                key={session.sessionId}
                className="flex-shrink-0 relative"
              >
                {/* Connection dot */}
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 
                              w-2 h-2 bg-white border-2 border-amber-400 rounded-full z-10" />
                
                {/* Mini Holoflower */}
                <div className="pt-12">
                  <MiniHoloflower
                    activeFacetId={session.primaryFacetId}
                    aetherState={session.aetherState}
                    checkIns={session.checkIns}
                    size={64}
                    showLabel={true}
                    timestamp={session.timestamp}
                    onClick={() => handleSessionClick(session)}
                    isHighlighted={selectedSession === session.sessionId}
                  />
                </div>

                {/* Session number */}
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2
                              text-xs font-medium text-amber-600">
                  #{sessions.length - index}
                </div>
              </div>
            ))}
          </div>

          {/* Scroll indicator */}
          {sessions.length > maxDisplay && (
            <div className="text-center mt-2">
              <span className="text-xs text-gray-500">
                Showing {maxDisplay} of {sessions.length} sessions
              </span>
            </div>
          )}
        </div>
      ) : (
        // Spiral View
        <div className="relative h-64 flex items-center justify-center">
          {displaySessions.map((session, index) => {
            const angle = (index / displaySessions.length) * Math.PI * 2 - Math.PI / 2;
            const radius = 80 + (index * 5);
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            return (
              <div
                key={session.sessionId}
                className="absolute"
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                  zIndex: displaySessions.length - index
                }}
              >
                <MiniHoloflower
                  activeFacetId={session.primaryFacetId}
                  aetherState={session.aetherState}
                  checkIns={session.checkIns}
                  size={48 + (index * 2)}
                  onClick={() => handleSessionClick(session)}
                  isHighlighted={selectedSession === session.sessionId}
                />
              </div>
            );
          })}
          
          {/* Center text */}
          <div className="absolute text-center">
            <p className="text-xs text-gray-500">Spiral Journey</p>
            <p className="text-sm font-medium text-amber-700">
              {sessions.length} sessions
            </p>
          </div>
        </div>
      )}

      {/* Journey Analysis */}
      {showAnalysis && journeyArc && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Journey Analysis
          </h4>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            {/* Dominant Element */}
            <div>
              <span className="text-gray-500">Dominant:</span>
              <span className={`ml-2 px-2 py-1 rounded-full text-xs text-white
                ${journeyArc.dominantElement === 'fire' ? 'bg-red-400' :
                  journeyArc.dominantElement === 'water' ? 'bg-blue-400' :
                  journeyArc.dominantElement === 'earth' ? 'bg-green-400' :
                  journeyArc.dominantElement === 'air' ? 'bg-yellow-500' :
                  'bg-gray-400'}`}>
                {journeyArc.dominantElement}
              </span>
            </div>

            {/* Pattern */}
            <div>
              <span className="text-gray-500">Pattern:</span>
              <span className="ml-2 text-gray-700">
                {journeyArc.isSpiraling ? 'Spiraling' : 
                 journeyArc.isDeepening ? 'Deepening' : 'Exploring'}
              </span>
            </div>

            {/* Aether Presence */}
            {journeyArc.hasTranscended && (
              <div className="col-span-2">
                <span className="text-gray-500">Transcendent:</span>
                <span className="ml-2 text-amber-700">
                  {Math.round(journeyArc.aetherRatio * 100)}% Aetheric
                </span>
              </div>
            )}
          </div>

          {/* Narrative */}
          <div className="mt-4 p-3 bg-amber-50 rounded-lg">
            <p className="text-sm text-amber-800 italic">
              {journeyArc.narrative}
            </p>
          </div>

          {/* Element Progression */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-gray-500">Path:</span>
            <div className="flex items-center gap-1">
              {journeyArc.uniqueElements.map((element, i) => (
                <React.Fragment key={i}>
                  <span className={`px-2 py-1 rounded text-xs text-white
                    ${element === 'fire' ? 'bg-red-400' :
                      element === 'water' ? 'bg-blue-400' :
                      element === 'earth' ? 'bg-green-400' :
                      element === 'air' ? 'bg-yellow-500' :
                      'bg-gray-400'}`}>
                    {element[0].toUpperCase()}
                  </span>
                  {i < journeyArc.uniqueElements.length - 1 && (
                    <span className="text-gray-400">→</span>
                  )}
                </React.Fragment>
              ))}
              {journeyArc.hasTranscended && (
                <>
                  <span className="text-gray-400">→</span>
                  <span className="px-2 py-1 rounded text-xs bg-gradient-to-r 
                                 from-amber-400 to-pink-400 text-white">
                    ✦
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Selected Session Details */}
      {selectedSession && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-700">
                Session Details
              </p>
              {(() => {
                const session = sessions.find(s => s.sessionId === selectedSession);
                const facet = session ? getFacetById(session.primaryFacetId) : null;
                return facet && 'essence' in facet ? (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Facet:</span> {facet.facet}
                    </p>
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Essence:</span> {facet.essence}
                    </p>
                    {session?.practice && (
                      <p className="text-xs text-amber-700 italic mt-2">
                        {session.practice}
                      </p>
                    )}
                  </div>
                ) : null;
              })()}
            </div>
            <button
              onClick={() => setSelectedSession(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions
function getMostFrequent<T>(arr: T[]): T {
  const counts = arr.reduce((acc, val) => {
    acc.set(val, (acc.get(val) || 0) + 1);
    return acc;
  }, new Map<T, number>());

  return Array.from(counts.entries())
    .sort(([,a], [,b]) => b - a)[0][0];
}

function generateNarrative(
  elements: string[],
  stages: number[],
  aetherCount: number
): string {
  const startElement = elements[0];
  const endElement = elements[elements.length - 1];
  const startStage = stages[0];
  const endStage = stages[stages.length - 1];

  if (aetherCount > elements.length / 2) {
    return 'Your journey transcends the wheel, touching the liminal spaces between elements.';
  }

  if (startElement === endElement && endStage > startStage) {
    return `Deepening within ${startElement}, moving from stage ${startStage} to ${endStage}.`;
  }

  if (new Set(elements).size >= 4) {
    return 'A complete elemental cycle, touching all aspects of being.';
  }

  if (new Set(elements).size === 1) {
    return `Focused exploration within the ${startElement} element.`;
  }

  return `Journeying from ${startElement} to ${endElement}, weaving through ${new Set(elements).size} elements.`;
}

export default JourneyTimeline;