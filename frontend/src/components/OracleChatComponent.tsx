import React, { useState } from 'react';
import { OracleVoicePlayer } from './OracleVoicePlayer';

interface OracleResponse {
  content: string;
  provider?: string;
  model?: string;
  confidence?: number;
  metadata: {
    audioUrl: string | null;
    voice_synthesis?: boolean;
    voice_profile: string;
    voice_name?: string;
    voice_service?: 'sesame' | 'elevenlabs' | 'error';
    archetypal_presence?: string;
    logos_presence?: boolean;
    error?: string;
  };
}

export const OracleChatComponent: React.FC = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState<OracleResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAskOracle = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/oracle/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: input.trim(),
          includeVoice: true
        }),
      });

      if (!res.ok) {
        throw new Error(`Oracle response failed: ${res.status}`);
      }

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setResponse(data);
      setInput(''); // Clear input after successful response

    } catch (err) {
      console.error('Oracle consultation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to consult Oracle');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskOracle();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🌌 Consult the Oracle
        </h1>
        <p className="text-gray-600">
          Ask Maya, your personal Oracle, for wisdom and guidance
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <label htmlFor="oracle-input" className="block text-sm font-medium text-gray-700 mb-2">
          What wisdom do you seek?
        </label>

        <textarea
          id="oracle-input"
          className="w-full p-4 border border-gray-300 rounded-xl shadow-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          placeholder="Share your question, challenge, or what's on your heart..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          rows={3}
          disabled={loading}
        />

        <div className="flex justify-between items-center mt-4">
          <div className="text-xs text-gray-500">
            Press Enter to send, Shift+Enter for new line
          </div>

          <button
            onClick={handleAskOracle}
            disabled={loading || !input.trim()}
            className={`
              px-6 py-3 rounded-xl font-medium transition-all shadow-md
              ${loading || !input.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transform hover:scale-105'
              }
            `}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Consulting Oracle...</span>
              </div>
            ) : (
              '🔮 Ask Oracle'
            )}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-center">
            <div className="text-red-500 mr-2">⚠️</div>
            <div>
              <h3 className="text-red-800 font-medium">Oracle Consultation Error</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Oracle Response */}
      {response && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>✨ Oracle Response</span>
            {response.metadata.voice_synthesis && (
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                🎧 Voice Available
              </span>
            )}
            {response.confidence && (
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                {Math.round(response.confidence * 100)}% Confidence
              </span>
            )}
          </div>

          <OracleVoicePlayer
            audioUrl={response.metadata.audioUrl}
            text={response.content}
            voiceProfile={response.metadata.voice_profile}
          />

          {/* Additional Metadata */}
          {response.metadata.archetypal_presence && (
            <div className="text-center text-sm text-purple-600 italic">
              Archetypal Presence: {response.metadata.archetypal_presence}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OracleChatComponent;