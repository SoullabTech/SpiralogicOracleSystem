// AvatarOracle.tsx – Visual + audio embodiment of the oracle
import { useEffect, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';

export default function AvatarOracle({ message }: { message: string }) {
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (!message) return;
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.voice = window.speechSynthesis.getVoices().find((v) => v.name.includes('Serena') || v.name.includes('Google UK English Female')) || null;
    utterance.rate = 1;
    utterance.pitch = 1.1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [message]);

  return (
    <div className="flex items-center gap-4 p-4 bg-background border rounded-xl">
      <div className="animate-pulse text-aether-500 text-3xl">
        <Sparkles />
      </div>
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">Oracle speaks:</p>
        <p className="text-lg font-medium italic">{isSpeaking ? message : '...listening'}</p>
      </div>
    </div>
  );
}
