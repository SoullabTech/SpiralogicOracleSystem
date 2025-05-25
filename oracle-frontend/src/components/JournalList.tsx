'use client';

import React, { useEffect, useState } from 'react';
import { fetchMemories, Memory } from '@/api/memory';
import { TransformControls } from '@/components/TransformControls';  // ← add this

export function JournalList() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemories()
      .then(data => setMemories(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading your journal…</p>;
  if (!memories.length) return <p>No entries yet.</p>;

  return (
    <div className="space-y-6">
      {memories.map(m => (
        <div key={m.id} className="p-4 border rounded-lg shadow-sm">
          {/* Element badge */}
          {m.element && (
            <span className="inline-block px-2 py-1 text-xs font-semibold bg-indigo-100 text-indigo-800 rounded">
              {m.element}
            </span>
          )}

          {/* Audio playback */}
          {m.audio_url && (
            <audio controls src={m.audio_url} className="mt-2 w-full" />
          )}

          {/* Transcript */}
          <p className="mt-2 whitespace-pre-wrap">
            {m.transcript || m.content}
          </p>

          {/* Timestamp */}
          <small className="block mt-2 text-gray-500">
            {new Date(m.timestamp || m.created_at).toLocaleString()}
          </small>

          {/* — Alchemy-Mode Transforms — */}
          <TransformControls memoryId={m.id} />
        </div>
      ))}
    </div>
  );
}
