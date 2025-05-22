'use client';

import { useState } from 'react';
import { ReactMic } from 'react-mic';

type ElementType = 'fire' | 'water' | 'earth' | 'air' | 'aether';

type VoiceData = {
  text: string;
  emotion: string;
  element: ElementType;
  phase: number;
};

export default function VoiceRecorder({
  onTranscription,
}: {
  onTranscription: (data: VoiceData) => void;
}) {
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState('🎙️ Click to Start Speaking');
  const [blobURL, setBlobURL] = useState<string | null>(null);

  const handleStart = () => {
    setRecording(true);
    setStatus('🔴 Recording...');
    setBlobURL(null);
  };

  const handleStop = () => {
    setRecording(false);
    setStatus('🎧 Transcribing...');
  };

  const onStop = async (recordedBlob: any) => {
    const formData = new FormData();
    formData.append('audio', recordedBlob.blob, 'recording.webm');
    setBlobURL(recordedBlob.blobURL);

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.text) {
        const detected: VoiceData = {
          text: data.text,
          emotion: guessEmotion(data.text),
          element: guessElement(data.text),
          phase: guessPhase(data.text),
        };

        setStatus('✅ Transcription received');
        onTranscription(detected);
      } else {
        setStatus('⚠️ No text returned from transcription');
      }
    } catch (err) {
      console.error('❌ Transcription error:', err);
      setStatus('❌ Error during transcription');
    }
  };

  const guessEmotion = (text: string): string => {
    const t = text.toLowerCase();
    if (t.includes('sad') || t.includes('grief') || t.includes('loss')) return 'sadness';
    if (t.includes('excited') || t.includes('joy') || t.includes('grateful')) return 'joy';
    if (t.includes('angry') || t.includes('rage') || t.includes('frustrated')) return 'anger';
    if (t.includes('anxious') || t.includes('fear') || t.includes('nervous')) return 'anxiety';
    return 'neutral';
  };

  const guessElement = (text: string): ElementType => {
    const t = text.toLowerCase();
    if (t.includes('ignite') || t.includes('passion') || t.includes('burn')) return 'fire';
    if (t.includes('grief') || t.includes('flow') || t.includes('depth')) return 'water';
    if (t.includes('secure') || t.includes('ground') || t.includes('stable')) return 'earth';
    if (t.includes('idea') || t.includes('thought') || t.includes('breathe')) return 'air';
    return 'aether';
  };

  const guessPhase = (text: string): number => {
    const t = text.toLowerCase();
    if (t.includes('begin') || t.includes('start')) return 0;
    if (t.includes('middle') || t.includes('transform') || t.includes('struggle')) return 1;
    if (t.includes('end') || t.includes('completion') || t.includes('release')) return 2;
    return 0;
  };

  return (
    <div className="p-4 rounded-xl border shadow space-y-4 bg-white text-center">
      <ReactMic
        record={recording}
        className="w-full"
        onStop={onStop}
        mimeType="audio/webm"
        strokeColor="#10b981"
        backgroundColor="#f0fdf4"
      />

      <button
        onClick={recording ? handleStop : handleStart}
        className={`w-full px-4 py-2 rounded font-semibold transition-colors ${
          recording ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
        } text-white`}
      >
        {recording ? '🛑 Stop Recording' : '🎤 Start Recording'}
      </button>

      <p className="text-sm text-gray-500 italic">{status}</p>

      {blobURL && (
        <audio controls className="mx-auto mt-2">
          <source src={blobURL} type="audio/webm" />
          Your browser does not support the audio element.
        </audio>
      )}
    </div>
  );
}
