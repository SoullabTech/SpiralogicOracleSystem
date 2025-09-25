// Oracle Dashboard - Main interface for the cascade system
import React, { useState } from 'react';
import { useOracleSession, useOracleJourney, useElementalAnimation } from '@/hooks/useOracleSession';
import { Holoflower } from './Holoflower';
import { ElementalWheel } from './ElementalWheel';
import { SpiralStage } from './SpiralStage';

export const OracleDashboard: React.FC = () => {
  const [inputQuery, setInputQuery] = useState('');
  const [viewMode, setViewMode] = useState<'holoflower' | 'wheel' | 'spiral'>('holoflower');
  
  const { session, loading, error, runCascade } = useOracleSession();
  const { journey, sessions } = useOracleJourney();
  
  const animatedBalance = useElementalAnimation(
    session?.elementalBalance || {
      fire: 0.2,
      water: 0.2,
      earth: 0.2,
      air: 0.2,
      aether: 0.2
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;
    
    await runCascade(inputQuery);
    setInputQuery('');
  };

  return (
    <div className="oracle-dashboard min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-amber-900 mb-2">
          Spiralogic Oracle
        </h1>
        <p className="text-gray-600">Journey through the elemental cascade</p>
      </div>

      {/* Input Section */}
      <div className="max-w-2xl mx-auto px-4 mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Share your question, reflection, or what's on your heart..."
            className="w-full p-4 rounded-lg border border-amber-200 focus:border-amber-400 
                     focus:outline-none resize-none h-32"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !inputQuery.trim()}
            className="w-full py-3 bg-gradient-to-r from-amber-600 to-indigo-600 
                     text-white rounded-lg font-semibold hover:from-amber-700 
                     hover:to-indigo-700 disabled:opacity-50 transition-all"
          >
            {loading ? 'Processing cascade...' : 'Begin Oracle Journey'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Visualization Section */}
      {session && (
        <div className="max-w-6xl mx-auto px-4">
          {/* View Mode Selector */}
          <div className="flex justify-center mb-6 space-x-2">
            <button
              onClick={() => setViewMode('holoflower')}
              className={`px-4 py-2 rounded-lg transition-all ${
                viewMode === 'holoflower' 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Holoflower
            </button>
            <button
              onClick={() => setViewMode('wheel')}
              className={`px-4 py-2 rounded-lg transition-all ${
                viewMode === 'wheel' 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Elemental Wheel
            </button>
            <button
              onClick={() => setViewMode('spiral')}
              className={`px-4 py-2 rounded-lg transition-all ${
                viewMode === 'spiral' 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Spiral Stage
            </button>
          </div>

          {/* Visualization */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            {viewMode === 'holoflower' && (
              <Holoflower 
                elementalBalance={animatedBalance}
                spiralStage={session.spiralStage}
                size={500}
                animated={true}
              />
            )}
            {viewMode === 'wheel' && (
              <ElementalWheel
                balance={animatedBalance}
                size={400}
                animated={true}
                showLabels={true}
              />
            )}
            {viewMode === 'spiral' && (
              <SpiralStage
                element={session.spiralStage.element}
                stage={session.spiralStage.stage}
                size={400}
                animated={true}
                showPath={true}
                previousStages={journey?.evolutionPath || []}
              />
            )}
          </div>

          {/* Oracle Response */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Reflection */}
            <div className="bg-gradient-to-br from-amber-50 to-white rounded-xl p-6 shadow-md">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-2">🔮</span>
                <h3 className="font-semibold text-amber-900">Reflection</h3>
              </div>
              <p className="text-gray-700 italic">{session.reflection}</p>
            </div>

            {/* Practice */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 shadow-md">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-2">🌟</span>
                <h3 className="font-semibold text-blue-900">Practice</h3>
              </div>
              <p className="text-gray-700">{session.practice}</p>
            </div>

            {/* Archetype */}
            <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-6 shadow-md">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-2">🌿</span>
                <h3 className="font-semibold text-green-900">Archetype</h3>
              </div>
              <p className="text-gray-700">{session.archetype}</p>
            </div>
          </div>

          {/* Elemental Balance Details */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Elemental Balance</h3>
            <div className="grid grid-cols-5 gap-4">
              {Object.entries(animatedBalance).map(([element, value]) => (
                <div key={element} className="text-center">
                  <div className="text-3xl mb-2">
                    {element === 'fire' && '🔥'}
                    {element === 'water' && '💧'}
                    {element === 'earth' && '🌍'}
                    {element === 'air' && '💨'}
                    {element === 'aether' && '✨'}
                  </div>
                  <div className="font-semibold capitalize">{element}</div>
                  <div className="text-2xl font-bold text-amber-600">
                    {(value * 100).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Journey Overview */}
      {journey && sessions.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 pb-12">
          <div className="bg-gradient-to-r from-amber-100 to-indigo-100 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-amber-900 mb-4">Your Oracle Journey</h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <span className="text-sm text-gray-600">Total Sessions</span>
                <p className="text-2xl font-bold text-amber-700">{journey.totalSessions}</p>
              </div>
              
              <div>
                <span className="text-sm text-gray-600">Dominant Element</span>
                <p className="text-2xl font-bold text-amber-700 capitalize">
                  {journey.dominantElement}
                </p>
              </div>
              
              <div>
                <span className="text-sm text-gray-600">Current Stage</span>
                <p className="text-2xl font-bold text-amber-700 capitalize">
                  {journey.currentStage.element} - {journey.currentStage.stage}
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-white/50 rounded-lg">
              <p className="text-gray-700 italic">{journey.nextGuidance}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OracleDashboard;