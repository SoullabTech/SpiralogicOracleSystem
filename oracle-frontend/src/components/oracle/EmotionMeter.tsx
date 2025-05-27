// EmotionMeter.tsx – Display real-time emotional tone detected
import { useState } from 'react';
import { Flame, Droplet, Wind, Mountain, Sparkles } from 'lucide-react';

const mockEmotion = {
  tone: 'reflective',
  element: 'Water',
  color: 'text-blue-500',
  icon: <Droplet />,
  message: 'Emotions are flowing inward. You’re in a receptive state of inner listening.',
};

export default function EmotionMeter() {
  const [emotion] = useState(mockEmotion);

  return (
    <div className="p-4 border rounded-xl bg-muted shadow-md">
      <div className="flex items-center gap-2 text-lg font-medium">
        <div className={emotion.color}>{emotion.icon}</div>
        Emotional Tone: <span className={emotion.color}>{emotion.tone}</span>
      </div>
      <p className="text-sm mt-1 text-muted-foreground">{emotion.message}</p>
    </div>
  );
}
