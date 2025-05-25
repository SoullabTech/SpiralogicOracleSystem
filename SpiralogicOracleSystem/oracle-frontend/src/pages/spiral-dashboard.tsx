import { useEffect, useRef, useState } from 'react';
import { getCompletedRituals, getCurrentSpiralPhase } from '@/lib/spiralLogic';
import { getRitualForPhase, getTarotCardForPhase } from '@/lib/ritualEngine'; // ✅ group ritual logic here
import RitualCard from '@/components/RitualCard';
import TarotCard from '@/components/TarotCard';


const tarot = modalContent ? getTarotCardForPhase(modalContent.label) : null;

const SpiralDashboard = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);
  const [currentPhase, setCurrentPhase] = useState('');

  const [modalContent, setModalContent] = useState<null | { label: string, prompt: string }>(null);
  const [oracleInsight, setOracleInsight] = useState<string | null>(null);
  const [reflectionText, setReflectionText] = useState('');

  useEffect(() => {
    setCompleted(getCompletedRituals());
    setCurrentPhase(getCurrentSpiralPhase());
  }, []);

  const phases = [
    { phase: 'Fire 1', label: '🔥 Fire – Vision', reflectionPrompt: 'What vision is trying to ignite within you?' },
    { phase: 'Water 1', label: '🌊 Water – Meaning', reflectionPrompt: 'What emotional truth supports your journey?' },
    { phase: 'Earth 1', label: '🌿 Earth – Grounding', reflectionPrompt: 'What step anchors this into form?' },
    { phase: 'Air 1', label: '🌬️ Air – Expression', reflectionPrompt: 'What truth must be voiced to create alignment?' },
    { phase: 'Aether 1', label: '✨ Aether – Integration', reflectionPrompt: 'What is the thread that weaves it all together?' }
  ];

  const ritual = modalContent ? getRitualForPhase(modalContent.label) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-indigo-950 text-white p-8">
      <h1 className="text-4xl font-bold mb-10 text-center animate-fade-in">🌀 Spiralogic Dashboard</h1>
      <div className="relative grid grid-cols-1 md:grid-cols-5 gap-6 animate-spiral-glow">
        {phases.map(({ phase, label, reflectionPrompt }) => (
          <div
            key={phase}
            className={`rounded-xl p-6 shadow-xl text-center border-2 transition-all duration-500 transform hover:scale-105 hover:ring-4 hover:ring-indigo-400 ${
              completed.includes(phase)
                ? 'border-green-400 bg-green-900 animate-pulse ring-4 ring-emerald-500 shadow-lg shadow-green-500/50'
                : phase === currentPhase
                ? 'border-yellow-400 bg-yellow-800 animate-bounce ring-4 ring-amber-400 shadow-lg shadow-yellow-500/50'
                : 'border-gray-700 bg-gray-800'
            }`}
          >
            <h2 className="text-xl font-semibold mb-2">{label}</h2>
            <p className="text-sm mb-4">
              {completed.includes(phase)
                ? 'Completed'
                : phase === currentPhase
                ? 'In Progress'
                : 'Upcoming'}
            </p>
            <button
              onClick={() => setModalContent({ label, prompt: reflectionPrompt })}
              className="mt-2 bg-indigo-700 hover:bg-indigo-600 py-2 px-4 rounded-lg text-sm"
            >
              Oracle Reflection
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white text-black rounded-lg p-6 max-w-md w-full relative">
            <h3 className="text-xl font-bold mb-4">{modalContent.label} 🌕</h3>
            <p className="mb-4 italic">{modalContent.prompt}</p>
            <div className="mb-4">
              <img src={`/public/invocation-cards/${modalContent.label.toLowerCase().split(' ')[0]}-card.png`} alt="Oracle Card" className="w-24 mx-auto mb-2" />
              <p className="text-xs text-gray-600">Lunar phase: Full Moon • Archetype: {modalContent.label.split(' – ')[1]}</p>
              <p className="text-xs text-indigo-800 italic">Symbolic meaning: “{modalContent.prompt}”</p>
            </div>

            {/* 🌀 Ritual Card */}
            {ritual && (
              <div className="my-4">
                <RitualCard title={ritual.title} description={ritual.description} phase={ritual.phase} />
              </div>
            )}

            <textarea
              className="w-full p-2 border border-gray-300 rounded mb-4"
              placeholder="Type your reflection..."
              rows={4}
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setModalContent(null);
                  if (audioRef.current) audioRef.current.pause();
                }}
                className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
              >
                Close
              </button>
              <button
                onClick={() => {
                  fetch('/api/journal/entry', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      title: modalContent?.label,
                      content: reflectionText,
                      tags: ['oracle-reflection', modalContent?.label.toLowerCase().split(' – ')[0]]
                    })
                  });
                  setTimeout(() => {
                    fetch('/api/oracle-agent/insight', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ phase: modalContent?.label, reflection: reflectionText })
                    })
                      .then(res => res.json())
                      .then(data => {
                        setOracleInsight(data.message);
                        if (audioRef.current) audioRef.current.play();
                      });
                  }, 500);
                  setReflectionText('');
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Insight Popup */}
      {oracleInsight && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white text-black rounded-lg p-6 max-w-lg w-full relative">
            <h3 className="text-xl font-bold mb-4">Oracle Insight</h3>
            <p className="mb-4 italic">{oracleInsight}</p>
            <button
              onClick={() => setOracleInsight(null)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <audio ref={audioRef} src="/audio/oracle-whisper.mp3" preload="auto" />
    </div>
  );
};

export default SpiralDashboard;
