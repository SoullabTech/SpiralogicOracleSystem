// Oracle Beta UI - Clean, minimal interface
import React, { useState } from 'react';
import { HoloflowerViz } from './HoloflowerViz';
import { SessionHistory } from './SessionHistory';
import { useOracleSession } from '@/hooks/useOracleSession';

interface OracleSession {
  sessionId: string;
  timestamp: string;
  elementalBalance: {
    fire: number;
    water: number;
    earth: number;
    air: number;
    aether: number;
  };
  spiralStage: {
    element: 'fire' | 'water' | 'earth' | 'air';
    stage: 1 | 2 | 3;
  };
  reflection: string;
  practice: string;
  archetype: string;
}

export const OracleBetaUI: React.FC = () => {
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const { session, loading, error, runCascade } = useOracleSession();
  const [recentSessions, setRecentSessions] = useState<OracleSession[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const result = await runCascade(input);
    if (result) {
      setRecentSessions(prev => [result, ...prev].slice(0, 5));
      setInput('');
      setIsExpanded(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-light text-gray-800">
            Spiralogic Oracle
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Journey through elemental wisdom
          </p>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Input & Response */}
          <div className="space-y-6">
            {/* Input Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <form onSubmit={handleSubmit}>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="What's on your heart today?"
                  className="w-full p-4 border border-gray-200 rounded-lg 
                           focus:border-purple-400 focus:outline-none 
                           resize-none h-32 text-gray-700"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="mt-4 w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 
                           text-white rounded-lg font-medium hover:from-purple-600 
                           hover:to-indigo-600 disabled:opacity-50 transition-all"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" 
                                stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" 
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Begin Oracle Journey'
                  )}
                </button>
              </form>
            </div>

            {/* Oracle Response */}
            {session && (
              <div className={`bg-white rounded-xl shadow-sm border border-gray-100 
                             overflow-hidden transition-all duration-500 
                             ${isExpanded ? 'max-h-[600px]' : 'max-h-0'}`}>
                <div className="p-6 space-y-6">
                  {/* Reflection */}
                  <div className="border-l-4 border-purple-400 pl-4">
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">
                      REFLECTION
                    </h3>
                    <p className="text-gray-800 italic">
                      {session.reflection}
                    </p>
                  </div>

                  {/* Practice */}
                  <div className="border-l-4 border-blue-400 pl-4">
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">
                      PRACTICE
                    </h3>
                    <p className="text-gray-800">
                      {session.practice}
                    </p>
                  </div>

                  {/* Archetype */}
                  <div className="border-l-4 border-green-400 pl-4">
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">
                      ARCHETYPE
                    </h3>
                    <p className="text-gray-800">
                      {session.archetype}
                    </p>
                  </div>

                  {/* Elemental Balance Bar */}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      {Object.entries(session.elementalBalance).map(([element, value]) => (
                        <div key={element} className="text-center flex-1">
                          <div className="text-xs text-gray-500 capitalize mb-1">
                            {element}
                          </div>
                          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-1000 ${
                                element === 'fire' ? 'bg-red-400' :
                                element === 'water' ? 'bg-blue-400' :
                                element === 'earth' ? 'bg-green-400' :
                                element === 'air' ? 'bg-yellow-400' :
                                'bg-purple-400'
                              }`}
                              style={{ width: `${value * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {error}
              </div>
            )}
          </div>

          {/* Right Column: Visualization */}
          <div className="flex flex-col items-center space-y-6">
            {/* Holoflower Visualization */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              {session ? (
                <HoloflowerViz
                  balance={session.elementalBalance}
                  current={session.spiralStage}
                  size={320}
                  minimal={false}
                />
              ) : (
                <div className="w-[320px] h-[320px] flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-30" 
                         viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
                      <path d="M12 2 L12 12 L18 8" strokeWidth="1.5" />
                    </svg>
                    <p className="text-sm">Your journey awaits</p>
                  </div>
                </div>
              )}
            </div>

            {/* Current Position */}
            {session && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 w-full">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500">Current Position</p>
                    <p className="text-lg font-medium text-gray-800 capitalize">
                      {session.spiralStage.element} • Stage {session.spiralStage.stage}
                    </p>
                  </div>
                  <div className="text-2xl">
                    {session.spiralStage.element === 'fire' && '🔥'}
                    {session.spiralStage.element === 'water' && '💧'}
                    {session.spiralStage.element === 'earth' && '🌍'}
                    {session.spiralStage.element === 'air' && '💨'}
                  </div>
                </div>
              </div>
            )}

            {/* Session History */}
            {recentSessions.length > 0 && (
              <SessionHistory sessions={recentSessions} />
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-gray-400">
          <p>Elemental wisdom through iterative reflection</p>
        </footer>
      </div>
    </div>
  );
};

export default OracleBetaUI;