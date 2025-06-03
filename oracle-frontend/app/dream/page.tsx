'use client';
import { useEffect, useState } from 'react';

export default function DreamPage() {
  const [dream, setDream] = useState('');
  const [dreams, setDreams] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('dreamNodes');
    if (stored) setDreams(JSON.parse(stored));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = [dream, ...dreams];
    setDreams(updated);
    localStorage.setItem('dreamNodes', JSON.stringify(updated));
    setDream('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-200 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-6 space-y-6">
        <h1 className="text-3xl font-oracle text-center text-deep-purple">🌙 Dream Stream</h1>
        <p className="text-center text-gray-600">Weave memory and meaning through your inner visions.</p>

        <form onSubmit={handleSubmit}>
          <textarea
            className="w-full h-40 p-4 border rounded resize-none text-gray-800"
            placeholder="Write your dream or vision here..."
            value={dream}
            onChange={(e) => setDream(e.target.value)}
          />
          <button
            type="submit"
            className="mt-4 px-6 py-2 bg-gold text-deep-purple font-bold rounded hover:bg-yellow-400"
          >
            🌌 Save Dream Node
          </button>
        </form>

        <div className="mt-6 space-y-4">
          {dreams.map((entry, i) => (
            <div key={i} className="border p-4 rounded shadow">
              <p className="text-sm text-gray-700">{entry}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
