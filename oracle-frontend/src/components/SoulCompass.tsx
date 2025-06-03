import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SpeakerIcon } from 'lucide-react';

interface SoulCompassProps {
  response: string;
  metadata?: any;
}

export default function SoulCompass({ response, metadata }: SoulCompassProps) {
  const [speaking, setSpeaking] = useState(false);

  const speak = () => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(response);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    utterance.lang = 'en-US';
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    // Optionally auto-read new response
    return () => window.speechSynthesis.cancel();
  }, [response]);

  return (
    <Card className="p-4 shadow-xl rounded-2xl">
      <CardContent className="space-y-4">
        <div className="text-lg font-semibold">🧭 Soul Compass</div>
        <p className="text-base whitespace-pre-line">{response}</p>

        {metadata && (
          <div className="text-sm opacity-80">
            <p><strong>Element:</strong> {metadata.sacred_routing?.element}</p>
            <p><strong>Archetype:</strong> {metadata.archetypal_support}</p>
            <p><strong>Evolutionary Phase:</strong> {metadata.evolutionary_phase}</p>
            <p><strong>Harmonic Field:</strong> {metadata.field_coherence}</p>
          </div>
        )}

        <Button onClick={speak} disabled={speaking} variant="outline">
          <SpeakerIcon className="mr-2 h-4 w-4" />
          {speaking ? 'Speaking...' : 'Listen to Oracle'}
        </Button>
      </CardContent>
    </Card>
  );
}