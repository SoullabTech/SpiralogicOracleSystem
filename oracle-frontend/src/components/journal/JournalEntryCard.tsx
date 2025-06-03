// 📁 oracle-frontend/src/components/journal/JournalEntryCard.tsx

'use client';

import React from 'react';
import { Brain, Sparkles } from 'lucide-react';
import { RiveHoloflower } from '@/components/sacred/RiveHoloflower';

interface JournalEntry {
  id: string;
  content: string;
  type: string;
  timestamp: string;
  insights?: string[];
  metadata?: {
    petalSnapshot?: Record<string, number>;
  };
}

interface JournalEntryCardProps {
  entry: JournalEntry;
}

export const JournalEntryCard: React.FC<JournalEntryCardProps> = ({ entry }) => {
  return (
    <div className="soullab-card p-4 border border-soullab-gray/10 bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-soullab-gray">
          {new Date(entry.timestamp).toLocaleDateString()}
        </div>
        <div className="flex items-center gap-1 text-soullab-purple">
          <Brain className="w-4 h-4" />
          <span className="text-xs">{entry.type}</span>
        </div>
      </div>

      <div className="text-soullab-dark text-sm mb-2">{entry.content}</div>

      {entry.insights?.length ? (
        <div className="mt-2 p-2 bg-soullab-purple/5 border border-soullab-purple/20 rounded">
          <div className="flex items-center gap-1 mb-1">
            <Sparkles className="w-3 h-3 text-soullab-purple" />
            <span className="text-xs font-medium text-soullab-purple">AI Insight</span>
          </div>
          <div className="text-xs text-soullab-gray">{entry.insights[0]}</div>
        </div>
      ) : null}

      {entry.metadata?.petalSnapshot && (
        <div className="mt-3">
          <HoloflowerSnapshot petals={entry.metadata.petalSnapshot} />
        </div>
      )}
    </div>
  );
};
