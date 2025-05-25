'use client';

import { useWhisperRecorder } from '@/lib/hooks/useWhisperRecorder';

export default function WhisperCheckIn() {
  const { transcript, isRecording, startRecording, stopRecording } = useWhisperRecorder();

  return (
    <div className="text-center space-y-2 mt-6">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className="bg-purple-600 px-4 py-2 text-white rounded shadow hover:bg-purple-700"
      >
        {isRecording ? '🛑 Stop Recording' : '🎙 Start Dream Whisper'}
      </button>
      {transcript && (
        <div className="bg-white/10 p-4 rounded mt-2 text-sm text-soullab-moon">{transcript}</div>
      )}
    </div>
  );
}
