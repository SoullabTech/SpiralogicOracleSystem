'use client';

import { exportRitualLog } from '@/lib/exportRituals';
import { useState } from 'react';
import AetherPulse from './AetherPulse';
import ElementProgress from './ElementProgress';
import WhisperAgent from './WhisperAgent';

interface SoulSyncPanelProps {
  elementsTouched: Set<string>;
  lastQuote?: string;
  whisperActive?: boolean;
  ritualHistory?: { date: string; element: string; ritual: string }[];
}

export default function SoulSyncPanel({
  elementsTouched,
  lastQuote,
  whisperActive = true,
  ritualHistory = [],
}: SoulSyncPanelProps) {
  const [showExported, setShowExported] = useState(false);

  const handleExport = () => {
    exportRitualLog(ritualHistory);
    setShowExported(true);
    setTimeout(() => setShowExported(false), 2000);
  };

  return (
    <div className="mt-10 text-center space-y-6">
      {lastQuote && whisperActive && (
        <WhisperAgent quote={lastQuote} active={true} />
      )}

      <ElementProgress elementsTouched={elementsTouched} />

      <AetherPulse elementsTouched={elementsTouched} />

      <button
        onClick={handleExport}
        className="mt-4 bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700 transition"
      >
        📥 Export Ritual Log
      </button>

      {showExported && (
        <p className="text-xs text-green-600 mt-2">Log exported!</p>
      )}
    </div>
  );
}
