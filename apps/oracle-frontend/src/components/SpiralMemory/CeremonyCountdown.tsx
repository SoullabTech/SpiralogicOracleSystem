import { format } from 'date-fns-tz';
import { useEffect, useRef, useState } from 'react';

// 🌀 Ceremonies Array
const ceremonies = [
  {
    title: '🔥 Fire Ceremony',
    date: '2025-06-13T06:00:00Z',
    joinLink: 'https://your-zoom-link-fire.com',
  },
  {
    title: '🌊🌎 Water & Earth Ceremony',
    date: '2025-06-14T06:00:00Z',
    joinLink: 'https://your-zoom-link-water-earth.com',
  },
  {
    title: '🌬️🌀 Air & Aether Ceremony',
    date: '2025-06-15T06:00:00Z',
    joinLink: 'https://your-zoom-link-air-aether.com',
  },
];

const CEREMONY_DURATION_MS = 4 * 60 * 60 * 1000; // 4 hours

function formatCountdown(timeLeft: number) {
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

export default function CeremonyCountdown() {
  const [countdowns, setCountdowns] = useState(
    ceremonies.map((ceremony) => ({
      ...ceremony,
      timeLeft: new Date(ceremony.date).getTime() - new Date().getTime(),
      liveNotified: false,
    })),
  );

  const chimeSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdowns((prev) =>
        ceremonies.map((ceremony, idx) => {
          const now = new Date().getTime();
          const ceremonyStart = new Date(ceremony.date).getTime();
          const isLive = now >= ceremonyStart && now <= ceremonyStart + CEREMONY_DURATION_MS;
          const wasAlreadyLive = prev[idx]?.liveNotified ?? false;

          if (isLive && !wasAlreadyLive && chimeSoundRef.current) {
            chimeSoundRef.current.volume = 0;
            chimeSoundRef.current.play();

            const fadeAudio = setInterval(() => {
              if (chimeSoundRef.current) {
                if (chimeSoundRef.current.volume < 1.0) {
                  chimeSoundRef.current.volume = Math.min(1.0, chimeSoundRef.current.volume + 0.05);
                } else {
                  clearInterval(fadeAudio);
                }
              }
            }, 100);
          }

          return {
            ...ceremony,
            timeLeft: ceremonyStart - now,
            liveNotified: isLive ? true : wasAlreadyLive,
          };
        }),
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <audio ref={chimeSoundRef} src="/sounds/tibetan_bowl.aiff" preload="auto" />

      {countdowns.map((ceremony, idx) => {
        const now = new Date().getTime();
        const ceremonyStart = new Date(ceremony.date).getTime();
        const swissTime = format(new Date(ceremony.date), 'HH:mm', { timeZone: 'Europe/Zurich' });

        const isLive = now >= ceremonyStart && now <= ceremonyStart + CEREMONY_DURATION_MS;
        const hasEnded = now > ceremonyStart + CEREMONY_DURATION_MS;

        return (
          <div
            key={idx}
            className={`p-6 rounded-2xl shadow-lg text-center transition-all duration-500
              ${
                isLive
                  ? 'bg-yellow-300 animate-pulse ring-4 ring-pink-400'
                  : 'bg-gradient-to-r from-purple-300 via-pink-200 to-indigo-300'
              }
            `}
          >
            <h3 className="text-xl font-bold text-indigo-700 mb-2">{ceremony.title}</h3>

            {!hasEnded ? (
              <p className="text-lg font-mono text-purple-800 mb-1">
                {ceremony.timeLeft > 0
                  ? formatCountdown(ceremony.timeLeft)
                  : '🌟 Ceremony is Happening Now!'}
              </p>
            ) : (
              <p className="text-lg text-green-700 font-bold mb-1 animate-bounce">
                🌟 Ceremony Completed! Reflect & Integrate 🌸
              </p>
            )}

            {!hasEnded && (
              <p className="text-sm text-gray-700">🕰️ Starts at {swissTime} Swiss Time</p>
            )}

            {isLive && (
              <div className="mt-4">
                <a
                  href={ceremony.joinLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition animate-pulse"
                >
                  🛕 Join Ceremony Now
                </a>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
