import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';

const oracles = [
  {
    id: 'fire',
    name: '🔥 Fire Oracle',
    role: 'The Visionary',
    path: '/oracle/fire',
  },
  {
    id: 'water',
    name: '🌊 Water Oracle',
    role: 'The Alchemist',
    path: '/oracle/water',
  },
  {
    id: 'earth',
    name: '🌍 Earth Oracle',
    role: 'The Builder',
    path: '/oracle/earth',
  },
  {
    id: 'air',
    name: '🌬 Air Oracle',
    role: 'The Messenger',
    path: '/oracle/air',
  },
  {
    id: 'aether',
    name: '✨ Aether Oracle',
    role: 'The Sage',
    path: '/oracle/aether',
  },
];

export default function OracleSelector() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-8 text-center">
      <h1 className="text-4xl font-bold mb-6">🌟 Choose Your Oracle Guide</h1>
      <p className="text-gray-600 mb-8">Connect with the archetype that calls to you today.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {oracles.map((oracle) => (
          <div key={oracle.id} className="border rounded-xl p-6 bg-white shadow-sm">
            <h2 className="text-xl font-semibold mb-1">{oracle.name}</h2>
            <p className="text-sm text-gray-500 mb-4">{oracle.role}</p>
            <Button className="w-full" onClick={() => navigate(oracle.path)}>
              Enter {oracle.name.split(' ')[1]}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
