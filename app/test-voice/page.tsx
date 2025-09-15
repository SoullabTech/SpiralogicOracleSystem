'use client';

import { useState } from 'react';

export default function TestVoicePage() {
  const [status, setStatus] = useState<string>('Ready to test...');
  const [results, setResults] = useState<string[]>([]);

  const addResult = (message: string, isError = false) => {
    const timestamp = new Date().toLocaleTimeString();
    setResults(prev => [...prev, `[${timestamp}] ${isError ? '❌' : '✅'} ${message}`]);
  };

  const testMicrophone = async () => {
    try {
      setStatus('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      addResult('Microphone access granted');
      setStatus('Microphone test successful!');
    } catch (error: any) {
      addResult(`Microphone error: ${error.message}`, true);
      setStatus('Microphone test failed');
    }
  };

  const testSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      addResult('Speech Recognition not supported', true);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setStatus('Listening... Speak now!');
        addResult('Speech Recognition started');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        addResult(`Heard: "${transcript}"`);
      };

      recognition.onerror = (event: any) => {
        addResult(`Recognition error: ${event.error}`, true);
        setStatus(`Error: ${event.error}`);
      };

      recognition.onend = () => {
        setStatus('Speech Recognition test complete');
      };

      recognition.start();
      setTimeout(() => recognition.stop(), 5000);

    } catch (error: any) {
      addResult(`Failed to start recognition: ${error.message}`, true);
    }
  };

  const testElevenLabsAudio = async () => {
    try {
      setStatus('Testing ElevenLabs audio generation...');

      const response = await fetch('/api/test-audio');
      const data = await response.json();

      console.log('Full test response:', data);

      if (data.error) {
        addResult(`API Error: ${data.error}`, true);
        if (data.details) {
          addResult(`Details: ${data.details}`, true);
        }
        return;
      }

      if (data.audioUrl) {
        addResult(`Audio generated: ${data.debug.base64Length} bytes`);

        // Try to play the audio
        try {
          const audio = new Audio(data.audioUrl);

          audio.addEventListener('canplaythrough', () => {
            addResult('Audio loaded successfully');
            audio.play().then(() => {
              addResult('Audio playing!');
              setStatus('Audio test successful!');
            }).catch(e => {
              addResult(`Playback error: ${e.message}`, true);
            });
          });

          audio.addEventListener('error', (e) => {
            const audioElement = e.target as HTMLAudioElement;
            addResult(`Audio error: ${audioElement.error?.message || 'Unknown'}`, true);
            console.error('Audio error details:', {
              error: audioElement.error,
              networkState: audioElement.networkState,
              readyState: audioElement.readyState
            });
          });

        } catch (error: any) {
          addResult(`Failed to create audio: ${error.message}`, true);
        }
      }

    } catch (error: any) {
      addResult(`Test failed: ${error.message}`, true);
      setStatus('Audio test failed');
    }
  };

  const testCustomText = async () => {
    const text = prompt('Enter text to speak:', 'Hello, this is a custom test.');
    if (!text) return;

    try {
      setStatus('Generating custom audio...');

      const response = await fetch('/api/test-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      const data = await response.json();

      if (data.error) {
        addResult(`Error: ${data.error}`, true);
        return;
      }

      if (data.audioUrl) {
        const audio = new Audio(data.audioUrl);
        await audio.play();
        addResult(`Playing custom audio: "${text}"`);
      }

    } catch (error: any) {
      addResult(`Custom audio failed: ${error.message}`, true);
    }
  };

  const clearResults = () => {
    setResults([]);
    setStatus('Ready to test...');
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Voice Chat Test Suite</h1>

      <div className="bg-gray-100 p-4 rounded mb-6">
        <p className="text-lg">{status}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={testMicrophone}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test Microphone
        </button>

        <button
          onClick={testSpeechRecognition}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Test Speech Recognition
        </button>

        <button
          onClick={testElevenLabsAudio}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          Test ElevenLabs Audio
        </button>

        <button
          onClick={testCustomText}
          className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
        >
          Test Custom Text
        </button>

        <button
          onClick={clearResults}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 col-span-2"
        >
          Clear Results
        </button>
      </div>

      <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
        <h3 className="text-white mb-2">Test Results:</h3>
        {results.length === 0 ? (
          <p className="text-gray-500">No tests run yet...</p>
        ) : (
          results.map((result, i) => (
            <div key={i} className={result.includes('❌') ? 'text-red-400' : ''}>
              {result}
            </div>
          ))
        )}
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <h3 className="font-bold mb-2">System Info:</h3>
        <p>Protocol: {typeof window !== 'undefined' ? window.location.protocol : 'unknown'}</p>
        <p>Hostname: {typeof window !== 'undefined' ? window.location.hostname : 'unknown'}</p>
        <p>Secure Context: {typeof window !== 'undefined' ? String(window.isSecureContext) : 'unknown'}</p>
      </div>
    </div>
  );
}