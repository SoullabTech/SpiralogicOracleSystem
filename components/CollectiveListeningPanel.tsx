// components/CollectiveListeningPanel.tsx
// Demo component showing collective listening integration

'use client';

import React, { useState, useEffect } from 'react';
import { useCollectiveListening } from '@/lib/voice/useCollectiveListening';
import { PersonalUtterance, OrchestratorInsight, PresenceMode } from '@/lib/voice/types';

interface CollectiveListeningPanelProps {
  teamId: string;
  userId?: string;
  initialMode?: PresenceMode;
}

export function CollectiveListeningPanel({
  teamId,
  userId,
  initialMode = 'conversation'
}: CollectiveListeningPanelProps) {
  const [personalHistory, setPersonalHistory] = useState<PersonalUtterance[]>([]);
  const [collectiveInsights, setCollectiveInsights] = useState<OrchestratorInsight[]>([]);
  const [error, setError] = useState<string | null>(null);

  const {
    isListening,
    isConnected,
    mode,
    activeUsers,
    lastInsight,
    startListening,
    stopListening,
    changeMode,
    requestSnapshot
  } = useCollectiveListening({
    teamId,
    userId,
    mode: initialMode,
    wakeWord: 'maya',
    alwaysOn: initialMode !== 'guided',
    onPersonalUtterance: (utterance) => {
      console.log('Personal utterance:', utterance);
      setPersonalHistory(prev => [...prev.slice(-4), utterance]);
    },
    onCollectiveInsight: (insight) => {
      console.log('Collective insight:', insight);
      setCollectiveInsights(prev => [...prev.slice(-4), insight]);
    },
    onError: (err) => {
      console.error('Collective listening error:', err);
      setError(err.message);
    }
  });

  // Request snapshot periodically
  useEffect(() => {
    const interval = setInterval(async () => {
      if (isConnected) {
        const snapshot = await requestSnapshot();
        if (snapshot) {
          console.log('Collective snapshot:', snapshot);
        }
      }
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, [isConnected, requestSnapshot]);

  return (
    <div className="collective-listening-panel p-6 space-y-6">
      {/* Status Bar */}
      <div className="status-bar flex items-center justify-between bg-gray-900/50 rounded-lg p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-500'}`} />
            <span className="text-sm text-gray-300">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-blue-500 animate-pulse' : 'bg-gray-500'}`} />
            <span className="text-sm text-gray-300">
              {isListening ? 'Listening' : 'Silent'}
            </span>
          </div>

          {activeUsers > 0 && (
            <div className="text-sm text-purple-400">
              {activeUsers} {activeUsers === 1 ? 'presence' : 'presences'} active
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isListening
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isListening ? 'Stop Listening' : 'Start Listening'}
          </button>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="mode-selector bg-gray-900/30 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-400 mb-3">Presence Mode</h3>
        <div className="flex gap-2">
          {(['conversation', 'meditation', 'guided'] as PresenceMode[]).map(m => (
            <button
              key={m}
              onClick={() => changeMode(m)}
              className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                mode === m
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-6">
        {/* Personal Stream */}
        <div className="personal-stream bg-gray-900/30 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">
            Personal Stream (Private)
          </h3>
          <div className="space-y-2">
            {personalHistory.length === 0 ? (
              <p className="text-gray-500 text-sm italic">
                Speak to begin... {mode === 'conversation' && "Say 'Hello Maya' to activate"}
              </p>
            ) : (
              personalHistory.map((utterance, idx) => (
                <div key={utterance.id} className="bg-gray-800/50 rounded p-3">
                  <p className="text-gray-300 text-sm">{utterance.text}</p>
                  <div className="flex gap-2 mt-2">
                    {utterance.elementBlend && Object.entries(utterance.elementBlend)
                      .filter(([_, intensity]) => intensity > 0.3)
                      .map(([element, intensity]) => (
                        <span
                          key={element}
                          className="text-xs px-2 py-1 bg-gray-700 rounded"
                          style={{ opacity: 0.5 + intensity * 0.5 }}
                        >
                          {element}
                        </span>
                      ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Collective Insights */}
        <div className="collective-insights bg-gray-900/30 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">
            Collective Insights (Mythic)
          </h3>
          <div className="space-y-2">
            {collectiveInsights.length === 0 ? (
              <p className="text-gray-500 text-sm italic">
                Waiting for collective patterns to emerge...
              </p>
            ) : (
              collectiveInsights.map((insight, idx) => (
                <div key={idx} className="bg-purple-900/20 rounded p-3 border border-purple-700/30">
                  <p className="text-purple-200 text-sm mb-2">{insight.message}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {insight.elements.map(element => (
                        <span key={element} className="text-xs text-purple-400">
                          {element}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-purple-500">
                      {(insight.strength * 100).toFixed(0)}% resonance
                    </div>
                  </div>
                  {insight.personalMirror && (
                    <p className="text-xs text-gray-400 mt-2 italic">
                      {insight.personalMirror}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Last Insight Banner */}
      {lastInsight && (
        <div className="last-insight bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-lg p-4 border border-purple-700/30">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-purple-100 font-medium">{lastInsight.message}</p>
              {lastInsight.personalMirror && (
                <p className="text-purple-300 text-sm mt-1">{lastInsight.personalMirror}</p>
              )}
            </div>
            <div className="text-xs text-purple-400">
              {lastInsight.type}
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="error bg-red-900/30 border border-red-700 rounded-lg p-3">
          <p className="text-red-300 text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-xs text-red-400 hover:text-red-300 mt-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Privacy Note */}
      <div className="privacy-note text-xs text-gray-500 text-center">
        🔒 Your voice stays private. Only patterns are shared collectively.
      </div>
    </div>
  );
}