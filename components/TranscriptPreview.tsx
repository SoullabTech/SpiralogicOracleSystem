'use client';

import React from 'react';

interface TranscriptPreviewProps {
  interimTranscript: string;
  finalTranscript: string;
  isListening: boolean;
}

export const TranscriptPreview: React.FC<TranscriptPreviewProps> = ({
  interimTranscript,
  finalTranscript,
  isListening
}) => {
  return (
    <div className="relative w-full max-w-md mx-auto p-6 bg-slate-900/90 backdrop-blur-sm rounded-xl border border-amber-500/20">
      {/* Pulsing Torus Animation */}
      {isListening && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 mb-4">
          <div className="relative w-16 h-16">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-4 border-amber-500/30 animate-pulse-ring-outer"></div>
            {/* Middle ring */}
            <div className="absolute inset-2 rounded-full border-2 border-amber-400/50 animate-pulse-ring-middle"></div>
            {/* Inner core */}
            <div className="absolute inset-4 rounded-full bg-gradient-radial from-amber-300 to-amber-600 animate-pulse-core shadow-lg shadow-amber-500/50"></div>
            {/* Tesla-style energy arcs */}
            <div className="absolute inset-1 rounded-full border border-amber-300/40 animate-spin-slow"></div>
          </div>
        </div>
      )}

      {/* Transcript Content */}
      <div className="mt-8 space-y-3">
        {/* Live Interim Transcript */}
        {interimTranscript && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-amber-300/80 font-mono">LISTENING</span>
            </div>
            <p className="text-amber-100/90 text-sm italic">
              {interimTranscript}
            </p>
          </div>
        )}

        {/* Final Transcript */}
        {finalTranscript && (
          <div className="p-3 bg-slate-800/60 border border-slate-600/40 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-xs text-slate-300 font-mono">CAPTURED</span>
            </div>
            <p className="text-white text-sm">
              {finalTranscript}
            </p>
          </div>
        )}

        {/* Listening State Indicator */}
        {isListening && !interimTranscript && (
          <div className="text-center py-4">
            <p className="text-amber-300/60 text-sm animate-pulse">
              Speak now... Maya is listening
            </p>
          </div>
        )}
      </div>
    </div>
  );
};