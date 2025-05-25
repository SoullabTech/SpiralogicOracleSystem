'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createAudioMemory } from '@/api/memory';

interface RecorderOverlayProps {
  onClose: () => void;
}

export function RecorderOverlay({ onClose }: RecorderOverlayProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const [elementTag, setElementTag] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // initialize MediaRecorder
  useEffect(() => {
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      setError('Audio recording not supported in this browser.');
      return;
    }
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = e => audioChunks.current.push(e.data);
        recorder.onstop = handleStop;
        setMediaRecorder(recorder);
      })
      .catch(() => setError('Microphone access denied.'));
  }, []);

  function handleStart() {
    if (mediaRecorder && mediaRecorder.state === 'inactive') {
      audioChunks.current = [];
      mediaRecorder.start();
      setIsRecording(true);
    }
  }

  async function handleStop() {
    setIsRecording(false);
    setLoading(true);
    const blob = new Blob(audioChunks.current, { type: 'audio/webm' });

    try {
      // use our API helper (will return the stored memory)
      await createAudioMemory(blob, elementTag || undefined);
      onClose();           // close overlay on success
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 space-y-4 w-80">
        <h2 className="text-lg font-semibold">Voice Check-In</h2>
        {error && <p className="text-red-500">{error}</p>}

        {/* Element override input */}
        <input
          type="text"
          placeholder="Optional tag (e.g. Water2)"
          value={elementTag}
          onChange={e => setElementTag(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />

        <button
          onClick={isRecording ? () => mediaRecorder?.stop() : handleStart}
          disabled={loading}
          className={`w-full py-2 rounded-lg text-white ${
            isRecording ? 'bg-red-600' : 'bg-green-600'
          } ${loading ? 'opacity-50' : ''}`}
        >
          { loading
              ? 'Processing…'
              : isRecording
                ? 'Stop & Upload'
                : 'Start Recording'
          }
        </button>

        <button
          onClick={onClose}
          disabled={loading}
          className="w-full py-2 rounded-lg border"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
