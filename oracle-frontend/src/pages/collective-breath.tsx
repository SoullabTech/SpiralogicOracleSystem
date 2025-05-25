import CollectiveBreathRoom from '@/components/CollectiveBreath/CollectiveBreathRoom';
import { useEffect, useState } from 'react';

export default function CollectiveBreathPage() {
  const [timeLeft, setTimeLeft] = useState('');
  const [breathStarted, setBreathStarted] = useState(false);

  useEffect(() => {
    const eventDate = new Date('2025-05-21T18:00:00Z'); // 🌸 Set your next Breath Event

    const updateCountdown = () => {
      const now = new Date();
      const distance = eventDate.getTime() - now.getTime();

      if (distance < 0) {
        setTimeLeft('🌬️ The Spiral Breath has begun!');
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft(`${days}d ${hours}h ${minutes}m`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  if (breathStarted) {
    return <CollectiveBreathRoom />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-sky-200 to-indigo-200 p-8">
      <h1 className="text-4xl font-bold mb-8">🌎 Collective Spiral Breath 🌬️</h1>
      <p className="text-lg mb-6">Next global breath synchronization in:</p>
      <div className="text-5xl font-bold text-indigo-600">{timeLeft}</div>
      <button
        onClick={() => setBreathStarted(true)}
        className="mt-8 px-6 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition"
      >
        Join the Spiral 🌸
      </button>
    </div>
  );
}
