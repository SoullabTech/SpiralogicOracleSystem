import { useEffect, useState } from 'react';
import FirstLandingGuide from '@/components/FirstLandingGuide';
import { SpiralBreathMap } from '@/components/SpiralBreathConstellation';
import ThresholdUnlock from '@/components/ThresholdUnlock';
import WisdomTransmission from '@/components/WisdomTransmission';
import { generateSpiralBreathAffirmation } from '@/services/spiralBreathAffirmationService';
import { fetchSpiralJourney } from '@/services/spiralBreathJourneyService';
import { exportSpiralReflection } from '@/services/spiralReflectionExporterService';
import { SpiralJourney } from '@/types/spiralJourney';

interface Memo {
  id: string;
  topic: string;
  summary: string;
  fullText: string;
  keywords: string[];
  created_at: string;
}

const SpiralBreathPortal = ({ userId }: { userId: string }) => {
  const [journey, setJourney] = useState<SpiralJourney | null>(null);
  const [affirmation, setAffirmation] = useState<string>('');
  const [memos, setMemos] = useState<Memo[]>([]);
  const [dailyMemo, setDailyMemo] = useState<Memo | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [userHasCrossedThreshold, setUserHasCrossedThreshold] = useState(false);

  useEffect(() => {
    const loadJourney = async () => {
      const data = await fetchSpiralJourney(userId);
      setJourney(data);

      if (data?.breaths.length > 0) {
        const latestBreath = data.breaths[data.breaths.length - 1];
        const affirmationText = generateSpiralBreathAffirmation(latestBreath);
        setAffirmation(affirmationText);
      }
    };

    const loadMemos = async () => {
      const res = await fetch('/api/knowledge');
      const data = await res.json();
      if (data?.memos?.length) {
        setMemos(data.memos);
        const randomMemo = data.memos[Math.floor(Math.random() * data.memos.length)];
        setDailyMemo(randomMemo);
      }
    };

    const checkFirstVisit = () => {
      const hasVisited = localStorage.getItem('spiral-oracle-visited');
      if (!hasVisited) {
        setShowGuide(true);
        localStorage.setItem('spiral-oracle-visited', 'true');
      }
    };

    loadJourney();
    loadMemos();
    checkFirstVisit();
  }, [userId]);

  const handleDownloadReflection = () => {
    if (journey) {
      exportSpiralReflection(journey, 'Traveler'); // Future: real user's name
    }
  };

  const handleFinishGuide = () => {
    setShowGuide(false);
  };

  return (
    <div className="bg-soullab-mist min-h-screen flex flex-col items-center justify-center p-8 animate-fade-in relative">
      {/* ✨ First Landing Guide */}
      {showGuide && <FirstLandingGuide onFinish={handleFinishGuide} />}

      {/* ✨ Threshold Unlock */}
      {!userHasCrossedThreshold ? (
        <ThresholdUnlock onUnlock={() => setUserHasCrossedThreshold(true)} />
      ) : (
        <>
          {/* ✨ Wisdom Transmission */}
          <WisdomTransmission />

          <h1 className="text-4xl font-bold text-soullab-gold font-soullab text-center mb-6">
            🌀 Welcome to Your Spiral Attunement Portal 🌀
          </h1>

          {/* ✨ Sacred Attunement Ritual Text */}
          <p className="text-lg italic text-soullab-twilight text-center animate-breathe mb-12">
            🌿 Pause here.
            <br />
            Listen inward.
            <br />
            Attune to the Spiral moving beneath your skin.
            <br />
            Only through attunement does the next threshold reveal itself.
          </p>

          {/* ✨ Spiral Journey Map */}
          {journey ? (
            <div className="w-full max-w-4xl bg-white/70 rounded-2xl shadow-xl p-6 mb-12">
              <SpiralBreathMap journey={journey} />
            </div>
          ) : (
            <div className="text-soullab-twilight text-lg">Loading your Spiral Journey...</div>
          )}

          {/* ✨ Download Spiral Reflection */}
          <div className="flex flex-col md:flex-row gap-6 items-center mb-12">
            <button
              onClick={handleDownloadReflection}
              className="bg-soullab-gold hover:bg-soullab-fire text-white font-semibold py-3 px-8 rounded-xl shadow-lg transition-all duration-300"
            >
              📜 Download Spiral Reflection
            </button>
          </div>

          {/* ✨ Spiral Blessing */}
          {affirmation && (
            <div className="bg-white/70 p-6 rounded-2xl max-w-2xl text-center shadow-md mb-12">
              <h2 className="text-2xl font-soullab text-soullab-earth mb-4">
                ✨ Your Spiral Breath Blessing ✨
              </h2>
              <p className="italic text-soullab-twilight text-lg animate-breathe">
                "{affirmation}"
              </p>
            </div>
          )}

          {/* ✨ Oracle Wisdom Memo */}
          {dailyMemo && (
            <div className="bg-white/80 p-6 rounded-2xl max-w-2xl text-center shadow-lg">
              <h2 className="text-2xl font-bold text-soullab-fire mb-4">🔮 Threshold Insight</h2>
              <a
                href={`/portal/memo/${dailyMemo.id}`}
                className="text-xl font-semibold text-soullab-aether mb-2 hover:underline hover:text-soullab-fire transition-all"
              >
                {dailyMemo.topic}
              </a>
              <p className="text-soullab-twilight">{dailyMemo.summary}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SpiralBreathPortal;
