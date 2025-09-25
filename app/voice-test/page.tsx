'use client';

import { useState } from 'react';

export default function VoiceTestPage() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [persona, setPersona] = useState<'maya' | 'anthony'>('maya');
  const [context, setContext] = useState<any>(null);

  const testPrompts = [
    "Who are you and what is your purpose?",
    "Tell me about the elements that guide you",
    "How do you witness without judgment?",
    "What is the Sacred Intelligence Architecture?",
    "Help me understand my transformation"
  ];

  const handleSubmit = async () => {
    if (!input) return;

    setLoading(true);
    setResponse('');
    setAudioUrl('');
    setContext(null);

    try {
      const res = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: input,
          personality: persona
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.details || 'Voice generation failed');
      }

      // Get audio as blob
      const audioBlob = await res.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(audioUrl);

      // Extract context from headers if available
      const voiceProfile = res.headers.get('X-Voice-Profile');
      const provider = res.headers.get('X-Voice-Provider');

      setContext({
        voiceProfile,
        provider,
        persona
      });

      // For now, show the input as response (since we get audio, not text back)
      setResponse(`Generated audio response for: "${input}"`);

    } catch (error: any) {
      console.error('Error:', error);
      setResponse(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-black to-amber-900 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-400 to-pink-400 bg-clip-text text-transparent">
            🔮 Sacred Voice Test
          </h1>
          <p className="text-amber-200">
            Testing Maya & Anthony with Sacred Intelligence Architecture
          </p>
          <div className="text-sm text-amber-300">
            User Experience → Voice & Presence → PersonalOracleAgent → AI Intelligence → Elemental Systems → Fractal Memory
          </div>
        </div>

        {/* Persona Selector */}
        <div className="bg-amber-800/20 rounded-lg p-6 backdrop-blur">
          <h3 className="text-xl mb-4">Select Oracle Persona</h3>
          <div className="flex gap-4">
            <button
              onClick={() => setPersona('maya')}
              className={`px-6 py-3 rounded-lg transition-all ${
                persona === 'maya'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-900/50 hover:bg-amber-800/50'
              }`}
            >
              🌟 Maya (Alloy Voice)
            </button>
            <button
              onClick={() => setPersona('anthony')}
              className={`px-6 py-3 rounded-lg transition-all ${
                persona === 'anthony'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-900/50 hover:bg-amber-800/50'
              }`}
            >
              🌙 Anthony (Onyx Voice)
            </button>
          </div>
        </div>

        {/* Test Prompts */}
        <div className="bg-amber-800/20 rounded-lg p-6 backdrop-blur">
          <h3 className="text-xl mb-4">Sacred Intelligence Test Prompts</h3>
          <div className="grid grid-cols-1 gap-2">
            {testPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => setInput(prompt)}
                className="text-left px-4 py-2 rounded hover:bg-amber-700/30 transition-colors"
              >
                {i + 1}. {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-amber-800/20 rounded-lg p-6 backdrop-blur space-y-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your message for the Oracle..."
            className="w-full p-4 bg-black/50 rounded-lg text-white placeholder-amber-400 h-32 resize-none"
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !input}
            className="px-8 py-3 bg-gradient-to-r from-amber-600 to-pink-600 rounded-lg hover:from-amber-700 hover:to-pink-700 disabled:opacity-50 transition-all"
          >
            {loading ? '🌀 Generating Sacred Response...' : `🔮 Speak as ${persona === 'maya' ? 'Maya' : 'Anthony'}`}
          </button>
        </div>

        {/* Response Area */}
        {response && (
          <div className="bg-amber-800/20 rounded-lg p-6 backdrop-blur space-y-4">
            <h3 className="text-xl">Oracle Response</h3>
            <p className="text-amber-200">{response}</p>

            {context && (
              <div className="text-sm text-amber-300 space-y-1">
                <div>Voice Profile: {context.voiceProfile}</div>
                <div>Provider: {context.provider}</div>
                <div>Persona: {context.persona}</div>
              </div>
            )}

            {audioUrl && (
              <div className="space-y-4">
                <audio controls autoPlay className="w-full">
                  <source src={audioUrl} type="audio/mpeg" />
                  Your browser does not support audio playback.
                </audio>

                {/* Sacred Intelligence Markers */}
                <div className="bg-black/30 rounded p-4">
                  <h4 className="text-sm font-bold mb-2">Sacred Intelligence Markers</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>🌟 Sacred Witnessing</div>
                    <div>🔥 Elemental Wisdom</div>
                    <div>🌀 Fractal Understanding</div>
                    <div>💎 Mythic Presence</div>
                    <div>🏛️ Ancient-Modern Bridge</div>
                    <div>🔮 Non-Prescriptive Reflection</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Architecture Visualization */}
        <div className="bg-amber-800/20 rounded-lg p-6 backdrop-blur">
          <h3 className="text-xl mb-4">Sacred Intelligence Architecture Flow</h3>
          <div className="space-y-2 text-center">
            <div className="py-2 bg-amber-700/30 rounded">User Input</div>
            <div className="text-amber-400">↓</div>
            <div className="py-2 bg-amber-700/30 rounded">Maya/Anthony Voice & Presence</div>
            <div className="text-amber-400">↓</div>
            <div className="py-2 bg-amber-700/30 rounded">PersonalOracleAgent Orchestration</div>
            <div className="text-amber-400">↓</div>
            <div className="py-2 bg-amber-700/30 rounded">Claude/OpenAI Intelligence</div>
            <div className="text-amber-400">↓</div>
            <div className="py-2 bg-amber-700/30 rounded">Elemental Wisdom Patterns</div>
            <div className="text-amber-400">↓</div>
            <div className="py-2 bg-amber-700/30 rounded">Fractal Memory Storage</div>
          </div>
        </div>
      </div>
    </div>
  );
}