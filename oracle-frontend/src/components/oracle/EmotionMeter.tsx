/**
 * EmotionMeter displays the elemental emotional state of the user
 * based on recent interactions with the Oracle interface.
 */
import { useState } from 'react';
import { Droplet } from 'lucide-react';

interface EmotionState {
  tone: string;
  element: string;
  color: string;
  icon: React.ReactNode;
  message: string;
}

const mockEmotion: EmotionState = {
  tone: 'reflective',
  element: 'Water',
  color: 'text-blue-500',
  icon: <Droplet />,
  message: 'Emotions are flowing inward. You’re in a receptive state of inner listening.',
};

/**
 * Displays the current emotional tone detected from user interactions
 * @returns EmotionMeter component showing elemental emotional state
 */
export default function EmotionMeter() {
  const [emotion] = useState<EmotionState>(mockEmotion);

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
