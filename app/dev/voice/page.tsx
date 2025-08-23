'use client';

import React, { useState, useRef, useEffect } from 'react';
import { logger } from '@/lib/shared/observability/logger';
import { MayaWelcome } from "@/components/voice/MayaWelcome";
import { VoiceSelector } from "@/components/settings/VoiceSelector";

interface VoiceSession {
  sessionId: string;
  conversationId: string;
  voiceProfile: any;
  preferences: any;
}

interface VoiceResponse {
  text: string;
  audioUrl?: string;
  confidence: number;
  consciousnessState: {
    archetypes: any[];
    dominantElement: string;
    micropsiConfidence: number;
    spiralogicPhase: string;
  };
  insights: string[];
  memoryStored: boolean;
}

export default function VoiceTestPage() {
  const [session, setSession] = useState<VoiceSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [responses, setResponses] = useState<VoiceResponse[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const speechRecognition = new (window as any).webkitSpeechRecognition();
      speechRecognition.continuous = false;
      speechRecognition.interimResults = false;
      speechRecognition.lang = 'en-US';

      speechRecognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      speechRecognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setError(`Speech recognition error: ${event.error}`);
      };

      speechRecognition.onend = () => {
        setIsListening(false);
      };

      setRecognition(speechRecognition);
    }
  }, []);

  const initializeSession = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/oracle/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'initialize',
          conversationId: `voice_test_${Date.now()}`
        })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const result = await response.json();
      setSession(result.session);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const processVoiceInput = async () => {
    if (!session || !input.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/oracle/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'process',
          text: input,
          conversationId: session.conversationId,
          audioMetadata: {
            emotionalTone: detectEmotionalTone(input),
            energyLevel: detectEnergyLevel(input),
            confidence: 0.9,
            duration: input.length * 50 // rough estimate
          },
          sessionContext: {
            spiralogicPhase: 'integration',
            elementalResonance: 'aether'
          }
        })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const result = await response.json();
      setResponses(prev => [...prev, result.response]);
      setInput('');

      // Play audio if available
      if (result.response.audioUrl && audioRef.current) {
        audioRef.current.src = result.response.audioUrl;
        audioRef.current.play().catch(console.error);
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startListening = () => {
    if (recognition && !isListening) {
      setIsListening(true);
      setError(null);
      recognition.start();
    }
  };

  const endSession = async () => {
    if (!session) return;

    try {
      await fetch('/api/oracle/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'end',
          conversationId: session.conversationId
        })
      });

      setSession(null);
      setResponses([]);
      setInput('');
      
    } catch (err: any) {
      setError(err.message);
    }
  };

  const detectEmotionalTone = (text: string): string => {
    const tones = {
      'happy': /\b(happy|joy|excited|wonderful|amazing|great|love|fantastic)\b/i,
      'sad': /\b(sad|depressed|down|hurt|pain|sorrow|grief)\b/i,
      'anxious': /\b(anxious|worried|nervous|stress|fear|scared)\b/i,
      'angry': /\b(angry|mad|furious|irritated|annoyed|frustrated)\b/i,
      'calm': /\b(calm|peaceful|serene|relaxed|centered|balanced)\b/i,
      'curious': /\b(wonder|curious|question|explore|understand|learn)\b/i
    };

    for (const [tone, pattern] of Object.entries(tones)) {
      if (pattern.test(text)) return tone;
    }
    return 'neutral';
  };

  const detectEnergyLevel = (text: string): number => {
    const highEnergy = /\b(excited|amazing|incredible|awesome|fantastic|energy)\b/i;
    const lowEnergy = /\b(tired|exhausted|drained|low|quiet|still)\b/i;
    
    if (highEnergy.test(text)) return 0.8;
    if (lowEnergy.test(text)) return 0.3;
    return 0.5;
  };

  return (
    <div className="min-h-screen bg-bg-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-ink-100 text-2xl font-bold mb-6">
          Maya Voice Interface Test
        </h1>

        {/* Voice Selector (Hidden in Beta) */}
        <div className="mb-8">
          <h2 className="text-ink-100 text-xl mb-4">Voice Settings</h2>
          <VoiceSelector onChange={(voice) => console.log('Voice changed:', voice)} />
          {!process.env.NEXT_PUBLIC_VOICE_SELECTION_ENABLED && (
            <p className="text-ink-400 text-sm mt-2">
              Voice selector hidden in beta. Set <code>NEXT_PUBLIC_VOICE_SELECTION_ENABLED=true</code> to enable.
            </p>
          )}
        </div>

        {/* Maya Greeting Tests */}
        <div className="space-y-6 mb-8">
          <h2 className="text-ink-100 text-xl">Maya Greeting Tests</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-ink-200 font-medium mb-2">First Time</h3>
              <MayaWelcome mode="first_time" />
            </div>
            
            <div>
              <h3 className="text-ink-200 font-medium mb-2">Returning Short</h3>
              <MayaWelcome mode="returning_short" />
            </div>
            
            <div>
              <h3 className="text-ink-200 font-medium mb-2">Returning Reflect</h3>
              <MayaWelcome mode="returning_reflect" />
            </div>
            
            <div>
              <h3 className="text-ink-200 font-medium mb-2">Auto Mode</h3>
              <MayaWelcome mode="auto" />
            </div>
          </div>
        </div>

        <hr className="border-edge-700 mb-8" />

        {error && (
          <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6 text-red-100">
            {error}
          </div>
        )}

        {!session ? (
          <div className="text-center">
            <button
              onClick={initializeSession}
              disabled={loading}
              className="px-6 py-3 bg-gold-500 text-ink-900 rounded-lg hover:bg-gold-400 disabled:opacity-50"
            >
              {loading ? 'Initializing...' : 'Initialize Voice Session'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Session Info */}
            <div className="bg-bg-800 border border-edge-700 rounded-lg p-4">
              <h2 className="text-ink-100 font-semibold mb-2">Session Active</h2>
              <div className="text-ink-300 text-sm space-y-1">
                <div>Session ID: {session.sessionId}</div>
                <div>Voice Profile: {session.voiceProfile?.archeType}</div>
                <div>Elemental Resonance: {session.voiceProfile?.elementalResonance}</div>
              </div>
            </div>

            {/* Input Section */}
            <div className="bg-bg-800 border border-edge-700 rounded-lg p-4">
              <h2 className="text-ink-100 font-semibold mb-4">Voice Input</h2>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message or use speech recognition..."
                  className="flex-1 bg-bg-700 border border-edge-600 rounded-lg p-3 text-ink-100 placeholder-ink-400 resize-none"
                  rows={3}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                {recognition && (
                  <button
                    onClick={startListening}
                    disabled={isListening || loading}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      isListening 
                        ? 'bg-red-600 border-red-500 text-white animate-pulse' 
                        : 'bg-blue-600 border-blue-500 text-white hover:bg-blue-500'
                    } disabled:opacity-50`}
                  >
                    {isListening ? '🎤 Listening...' : '🎤 Start Voice'}
                  </button>
                )}

                <button
                  onClick={processVoiceInput}
                  disabled={loading || !input.trim()}
                  className="px-4 py-2 bg-gold-500 text-ink-900 rounded-lg hover:bg-gold-400 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Send to Maya'}
                </button>

                <button
                  onClick={endSession}
                  className="px-4 py-2 bg-red-600 border border-red-500 text-white rounded-lg hover:bg-red-500"
                >
                  End Session
                </button>
              </div>
            </div>

            {/* Conversation History */}
            <div className="bg-bg-800 border border-edge-700 rounded-lg p-4">
              <h2 className="text-ink-100 font-semibold mb-4">
                Conversation ({responses.length} responses)
              </h2>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {responses.map((response, index) => (
                  <div key={index} className="border border-edge-600 rounded-lg p-4">
                    <div className="text-ink-100 mb-2">{response.text}</div>
                    
                    <div className="text-xs text-ink-400 space-y-1">
                      <div>Confidence: {(response.confidence * 100).toFixed(1)}%</div>
                      <div>Dominant Element: {response.consciousnessState.dominantElement}</div>
                      <div>Spiralogic Phase: {response.consciousnessState.spiralogicPhase}</div>
                      <div>Memory Stored: {response.memoryStored ? '✓' : '✗'}</div>
                      
                      {response.consciousnessState.archetypes.length > 0 && (
                        <div>
                          Archetypes: {response.consciousnessState.archetypes
                            .map(a => a.name).join(', ')}
                        </div>
                      )}
                      
                      {response.insights.length > 0 && (
                        <div>Insights: {response.insights.join('; ')}</div>
                      )}
                    </div>

                    {response.audioUrl && (
                      <button
                        onClick={() => {
                          if (audioRef.current) {
                            audioRef.current.src = response.audioUrl!;
                            audioRef.current.play();
                          }
                        }}
                        className="mt-2 px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-500"
                      >
                        🔊 Play Audio
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <audio ref={audioRef} className="hidden" />
        
        {/* Instructions */}
        <div className="mt-8 text-ink-400 text-sm">
          <h3 className="font-semibold text-ink-200 mb-2">Test Instructions:</h3>
          <ul className="space-y-1">
            <li>1. Initialize a voice session to connect with Maya</li>
            <li>2. Use speech recognition or type messages to test voice processing</li>
            <li>3. Watch for archetypal patterns, elemental resonance, and consciousness insights</li>
            <li>4. Listen to generated audio responses (when available)</li>
            <li>5. End session to cleanup and test reinitialization</li>
          </ul>
        </div>
      </div>
    </div>
  );
}