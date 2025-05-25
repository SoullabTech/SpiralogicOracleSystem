// oracle-frontend/src/components/TransformControls.tsx
'use client';

import React, { useState } from 'react';
import axios from 'axios';

const MODES = [
  { key: 'poetic', label: 'Poetic Reflection' },
  { key: 'tarot', label: 'Tarot Insight' },
  { key: 'bullets', label: 'Bullet Summary' },
];

export function TransformControls({ memoryId }: { memoryId: string }) {
  const [mode, setMode] = useState('poetic');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  async function handleTransform() {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('/api/transform', { memoryId, mode });
      setResult(res.data.transformed);
    } catch (err: any) {
      setError(err.message || 'Transform failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 p-3 border-t">
      <div className="flex items-center space-x-2">
        <select
          value={mode}
          onChange={e => setMode(e.target.value)}
          className="flex-1 p-1 border rounded"
        >
          {MODES.map(m => (
            <option key={m.key} value={m.key}>{m.label}</option>
          ))}
        </select>
        <button
          onClick={handleTransform}
          disabled={loading}
          className="px-3 py-1 bg-indigo-600 text-white rounded"
        >
          {loading ? 'Working…' : 'Transform'}
        </button>
      </div>

      {error && <p className="mt-2 text-red-500">{error}</p>}
      {result && (
        <div className="mt-3 p-3 bg-gray-50 rounded border">
          <h4 className="font-semibold mb-1">Result</h4>
          <p className="whitespace-pre-wrap">{result}</p>
        </div>
      )}
    </div>
  );
}
