'use client';

import { useState } from 'react';
import { EnhancedVoiceMicButton } from '@/components/ui/EnhancedVoiceMicButton';

export default function TestVoicePage() {
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTranscript = async (text: string) => {
    console.log('Received transcript:', text);
    setTranscript(text);
    setIsLoading(true);
    
    try {
      // Test the API
      const res = await fetch('/api/oracle/unified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: text,
          type: 'voice',
          userId: 'test-user',
          sessionId: 'test-session'
        })
      });
      
      const data = await res.json();
      console.log('API Response:', data);
      setResponse(data.message || data.error || 'No response');
    } catch (error) {
      console.error('API Error:', error);
      setResponse('Error: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Voice System Test</h1>
      
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Instructions:</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li>Click the gold microphone button below</li>
            <li>Allow microphone permissions if prompted</li>
            <li>Speak clearly into your microphone</li>
            <li>Wait 3 seconds of silence for Maya to respond</li>
          </ol>
        </div>

        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Your Words:</h3>
          <p className="text-gray-300 min-h-[60px]">
            {transcript || 'Waiting for speech...'}
          </p>
        </div>

        {isLoading && (
          <div className="bg-slate-800 rounded-lg p-6">
            <p className="text-yellow-400 animate-pulse">Processing...</p>
          </div>
        )}

        {response && (
          <div className="bg-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Maya's Response:</h3>
            <p className="text-gray-300">{response}</p>
          </div>
        )}

        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Debug Info:</h3>
          <pre className="text-xs text-gray-400 overflow-auto">
            {JSON.stringify({
              hasWebkitSpeech: typeof window !== 'undefined' && 'webkitSpeechRecognition' in window,
              hasGetUserMedia: typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia,
              protocol: typeof window !== 'undefined' ? window.location.protocol : 'unknown'
            }, null, 2)}
          </pre>
        </div>
      </div>

      <EnhancedVoiceMicButton
        onTranscript={handleTranscript}
        position="bottom-center"
        silenceThreshold={3000}
      />
    </div>
  );
}