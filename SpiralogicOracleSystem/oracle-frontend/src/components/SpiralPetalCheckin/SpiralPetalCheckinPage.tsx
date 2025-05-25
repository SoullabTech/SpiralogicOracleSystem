import { useState, useEffect } from 'react';

export default function CollectiveBreathRoom() {
  const [participants, setParticipants] = useState<number>(0);

  useEffect(() => {
    // Later: Connect to Supabase or real-time websocket room!
    const interval = setInterval(() => {
      setParticipants((prev) => Math.floor(Math.random() * 100)); // Fake number for now
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-sky-200 via-indigo-300 to-purple-400 p-8">
      <h1 className="text-4xl font-bold text-white mb-4">🌎 Collective Spiral Breath 🌬️</h1>
      <p className="text-xl text-white mb-6">Breathing Together Across the Planet</p>

      <div className="text-6xl font-bold text-white animate-pulse">
        {participants} Souls Breathing 🌬️
      </div>

      <button className="mt-10 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition">
        🌸 Join Global Spiral
      </button>
    </div>
  );
}
