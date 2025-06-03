import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { analyzeElementalTrend, dominantElement } from '@/lib/elemental-tracker';

interface ForecastData {
  phase: string;
  dominantElement: string;
  focusTheme: string;
  guidance: string;
}

const elementalPhaseThemes: Record<string, ForecastData> = {
  Fire: {
    phase: 'Fire 1 – Vision Activation',
    dominantElement: 'Fire',
    focusTheme: 'Initiation & Creative Spark',
    guidance: 'Take bold action. Channel your vision into form.'
  },
  Water: {
    phase: 'Water 2 – Emotional Alchemy',
    dominantElement: 'Water',
    focusTheme: 'Transformation & Integration',
    guidance: 'Honor grief, embrace fluidity, and surrender old identities.'
  },
  Earth: {
    phase: 'Earth 1 – Embodied Foundations',
    dominantElement: 'Earth',
    focusTheme: 'Stability & Practical Growth',
    guidance: 'Ground your goals in daily ritual and care.'
  },
  Air: {
    phase: 'Air 1 – Clarity & Communication',
    dominantElement: 'Air',
    focusTheme: 'Expression & Thought Leadership',
    guidance: 'Speak with truth. Align with shared ideas.'
  },
  Aether: {
    phase: 'Aether – Transcendence & Unity',
    dominantElement: 'Aether',
    focusTheme: 'Purpose & Meta-Coherence',
    guidance: 'Trust your soul’s calling. Become the bridge.'
  }
};

export default function SpiralogicForecast() {
  const [forecast, setForecast] = useState<ForecastData | null>(null);

  useEffect(() => {
    const summary = localStorage.getItem('lastJournalSummary') || '';
    const trend = analyzeElementalTrend(summary);
    const dominant = dominantElement(trend);
    setForecast(elementalPhaseThemes[dominant]);
  }, []);

  if (!forecast) return <p className="text-muted-foreground text-sm">Loading Spiralogic Forecast...</p>;

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="p-6 space-y-2">
        <h3 className="text-xl font-semibold">🌀 Spiralogic Phase Forecast</h3>
        <p><strong>Phase:</strong> {forecast.phase}</p>
        <p><strong>Dominant Element:</strong> {forecast.dominantElement}</p>
        <p><strong>Focus Theme:</strong> {forecast.focusTheme}</p>
        <p className="italic">"{forecast.guidance}"</p>
      </CardContent>
    </Card>
  );
}
