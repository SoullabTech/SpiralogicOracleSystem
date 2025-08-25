import React from 'react';

interface TonePreferenceProps {
  selectedTone?: 'insight' | 'symbolic';
  onSelect: (tone: 'insight' | 'symbolic') => void;
}

export const TonePreference: React.FC<TonePreferenceProps> = ({
  selectedTone,
  onSelect
}) => {
  const toneOptions = [
    {
      value: 'insight' as const,
      name: 'Insight Mode',
      emoji: '💡',
      description: 'Clear, grounded guidance with practical wisdom',
      characteristics: [
        'Direct and actionable',
        'Grounded in everyday experience', 
        'Practical applications',
        'Clear language'
      ],
      example: '"Focus on creating one small daily ritual that brings you clarity."'
    },
    {
      value: 'symbolic' as const,
      name: 'Symbolic Mode',
      emoji: '🔮',
      description: 'Archetypal, metaphor-rich guidance from the depths',
      characteristics: [
        'Rich in symbolism',
        'Mythic and archetypal',
        'Poetic metaphors',
        'Deep imagery'
      ],
      example: '"What dragon guards the treasure you seek to claim?"'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Choose Your Oracle's Voice
        </h2>
        <p className="text-white/70">
          How would you like the Oracle to speak with you?
        </p>
      </div>

      <div className="grid gap-4">
        {toneOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={`w-full p-6 rounded-xl border-2 text-left transition-all duration-200 hover:scale-[1.01] ${
              selectedTone === option.value
                ? 'border-yellow-400 bg-yellow-400/20 shadow-lg'
                : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className="text-3xl">{option.emoji}</div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-xl font-semibold text-white">
                    {option.name}
                  </h3>
                  {selectedTone === option.value && (
                    <div className="text-yellow-400">✓</div>
                  )}
                </div>
                <p className="text-white/80 mb-3">
                  {option.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {option.characteristics.map((characteristic, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-white/10 rounded-full text-white/70"
                    >
                      {characteristic}
                    </span>
                  ))}
                </div>
                <div className="text-sm text-white/60 italic">
                  Example: {option.example}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="text-center mt-6">
        <p className="text-sm text-white/50">
          You can switch between modes anytime during your sessions
        </p>
      </div>
    </div>
  );
};