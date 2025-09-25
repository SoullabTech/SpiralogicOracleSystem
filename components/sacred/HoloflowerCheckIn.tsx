// Holoflower Check-In Component - Interactive divination interface
import React, { useState } from 'react';
import { SacredHoloflower } from './SacredHoloflower';
import { SPIRALOGIC_FACETS, getFacetById, calculateJourneyArc } from '@/data/spiralogic-facets';

interface CheckInData {
  facetId: string;
  intensity: number; // 0-1
  timestamp: string;
  note?: string;
}

export const HoloflowerCheckIn: React.FC = () => {
  const [checkIns, setCheckIns] = useState<Record<string, number>>({});
  const [selectedFacet, setSelectedFacet] = useState<string | null>(null);
  const [journeyHistory, setJourneyHistory] = useState<CheckInData[]>([]);
  const [showGuidance, setShowGuidance] = useState(false);

  const handlePetalClick = (facetId: string) => {
    setSelectedFacet(facetId);
    
    // Toggle check-in intensity (0 -> 0.5 -> 1 -> 0)
    const currentIntensity = checkIns[facetId] || 0;
    const newIntensity = currentIntensity === 0 ? 0.5 : 
                         currentIntensity === 0.5 ? 1 : 0;
    
    setCheckIns(prev => ({
      ...prev,
      [facetId]: newIntensity
    }));

    // Add to journey history
    if (newIntensity > 0) {
      setJourneyHistory(prev => [...prev, {
        facetId,
        intensity: newIntensity,
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const generateGuidance = () => {
    // Find the most activated petals
    const activePetals = Object.entries(checkIns)
      .filter(([_, intensity]) => intensity > 0)
      .sort(([_, a], [_, b]) => b - a)
      .slice(0, 3)
      .map(([facetId]) => getFacetById(facetId));

    if (activePetals.length === 0) {
      return {
        primary: 'Begin by checking in with a petal that calls to you.',
        practice: 'Close your eyes and sense which element feels most present.',
        arc: 'Journey not yet begun'
      };
    }

    // Analyze elemental balance
    const elementCounts: Record<string, number> = {};
    activePetals.forEach(facet => {
      elementCounts[facet.element] = (elementCounts[facet.element] || 0) + 1;
    });

    const dominantElement = Object.entries(elementCounts)
      .sort(([_, a], [_, b]) => b - a)[0][0];

    // Generate contextual guidance
    const primaryFacet = activePetals[0];
    const guidance = {
      primary: primaryFacet.essence,
      practice: primaryFacet.practice,
      arc: calculateJourneyArc(activePetals.map(f => f.id)),
      keywords: primaryFacet.keywords,
      archetype: primaryFacet.archetype,
      dominantElement
    };

    return guidance;
  };

  const clearCheckIns = () => {
    setCheckIns({});
    setSelectedFacet(null);
    setJourneyHistory([]);
  };

  const guidance = generateGuidance();

  return (
    <div className="holoflower-checkin-container max-w-6xl mx-auto p-6">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Left: Sacred Holoflower */}
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-light text-gray-800 mb-4">
            Elemental Check-In
          </h2>
          
          <SacredHoloflower
            activeFacetId={selectedFacet || undefined}
            userCheckIns={checkIns}
            onPetalClick={handlePetalClick}
            size={450}
            showLabels={true}
            interactive={true}
          />

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-3">
              Click petals to mark your current state
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={clearCheckIns}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 
                         rounded-lg transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowGuidance(!showGuidance)}
                className="px-4 py-2 text-sm bg-amber-100 hover:bg-amber-200 
                         text-amber-700 rounded-lg transition-colors"
              >
                {showGuidance ? 'Hide' : 'Show'} Guidance
              </button>
            </div>
          </div>
        </div>

        {/* Right: Guidance & Journey */}
        <div className="space-y-6">
          {/* Current Facet Detail */}
          {selectedFacet && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="mb-4">
                <span className={`inline-block px-3 py-1 rounded-full text-sm text-white
                  ${getFacetById(selectedFacet).element === 'fire' ? 'bg-red-400' :
                    getFacetById(selectedFacet).element === 'water' ? 'bg-blue-400' :
                    getFacetById(selectedFacet).element === 'earth' ? 'bg-green-400' :
                    'bg-yellow-500'}`}>
                  {getFacetById(selectedFacet).element.toUpperCase()} • 
                  Stage {getFacetById(selectedFacet).stage}
                </span>
              </div>

              <h3 className="text-xl font-medium text-gray-800 mb-2">
                {getFacetById(selectedFacet).essence}
              </h3>

              <p className="text-gray-600 mb-4">
                {getFacetById(selectedFacet).archetype}
              </p>

              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Keywords:</p>
                <div className="flex flex-wrap gap-2">
                  {getFacetById(selectedFacet).keywords.map(keyword => (
                    <span key={keyword} className="px-2 py-1 bg-gray-100 
                                                   rounded text-xs text-gray-600">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 p-4 bg-amber-50 rounded-lg">
                <p className="text-sm font-medium text-amber-900 mb-1">Practice:</p>
                <p className="text-amber-700 italic">
                  {getFacetById(selectedFacet).practice}
                </p>
              </div>
            </div>
          )}

          {/* Oracle Guidance */}
          {showGuidance && (
            <div className="bg-gradient-to-br from-amber-50 to-white rounded-xl 
                          shadow-sm border border-amber-100 p-6">
              <h3 className="text-lg font-medium text-amber-900 mb-4">
                Oracle Guidance
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Your Journey Arc:</p>
                  <p className="font-medium text-gray-800">{guidance.arc}</p>
                </div>

                {guidance.dominantElement && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Dominant Element:</p>
                    <p className="font-medium text-gray-800 capitalize">
                      {guidance.dominantElement}
                    </p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <p className="text-amber-900 font-medium mb-2">
                    {guidance.primary}
                  </p>
                  <p className="text-amber-700 italic">
                    Practice: {guidance.practice}
                  </p>
                </div>

                {guidance.archetype && (
                  <div className="mt-4 p-3 bg-white/50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      Archetype: {guidance.archetype}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Journey History */}
          {journeyHistory.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Today's Journey
              </h3>
              
              <div className="space-y-2">
                {journeyHistory.slice(-5).reverse().map((checkIn, index) => {
                  const facet = getFacetById(checkIn.facetId);
                  return (
                    <div key={index} className="flex items-center justify-between 
                                               p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full
                          ${facet.element === 'fire' ? 'bg-red-400' :
                            facet.element === 'water' ? 'bg-blue-400' :
                            facet.element === 'earth' ? 'bg-green-400' :
                            'bg-yellow-500'}`} 
                        />
                        <span className="text-sm text-gray-700">
                          {facet.essence}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(checkIn.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HoloflowerCheckIn;