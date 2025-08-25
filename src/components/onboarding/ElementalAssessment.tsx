import React from 'react';
import { ElementalChoice } from '../../types/onboarding';
import { ElementalType } from '../../types';

interface ElementalAssessmentProps {
  selectedElement?: ElementalType;
  onSelect: (element: ElementalType) => void;
}

export const ElementalAssessment: React.FC<ElementalAssessmentProps> = ({
  selectedElement,
  onSelect
}) => {
  const elements: ElementalChoice[] = [
    {
      element: 'fire',
      name: 'Fire',
      emoji: '🔥',
      description: 'The spark of creation, passion, and transformation',
      qualities: ['Creative force', 'Vision & inspiration', 'Breakthrough energy', 'Sacred rebellion'],
      insightPrompt: 'Help me initiate a new project with clarity.',
      symbolicPrompt: 'What flame do I need to spark this new creation?'
    },
    {
      element: 'water',
      name: 'Water',
      emoji: '🌊',
      description: 'The flow of emotion, intuition, and healing',
      qualities: ['Emotional wisdom', 'Intuitive guidance', 'Healing & flow', 'Depth navigation'],
      insightPrompt: 'I\'m overwhelmed—help me find emotional balance.',
      symbolicPrompt: 'What waves are asking to be felt and released?'
    },
    {
      element: 'earth',
      name: 'Earth',
      emoji: '🌍',
      description: 'The foundation of stability, growth, and manifestation',
      qualities: ['Grounding force', 'Practical wisdom', 'Steady growth', 'Material mastery'],
      insightPrompt: 'How can I create sustainable habits?',
      symbolicPrompt: 'What roots must I grow to stabilize my path?'
    },
    {
      element: 'air',
      name: 'Air',
      emoji: '🌬️',
      description: 'The clarity of mind, communication, and insight',
      qualities: ['Mental clarity', 'Communication flow', 'Swift insight', 'Inspired thinking'],
      insightPrompt: 'I need clarity on a decision.',
      symbolicPrompt: 'Which winds are whispering truths I haven\'t heard?'
    },
    {
      element: 'aether',
      name: 'Aether',
      emoji: '🌌',
      description: 'The mystery of transcendence and cosmic connection',
      qualities: ['Transcendent view', 'Unity awareness', 'Cosmic consciousness', 'Void wisdom'],
      insightPrompt: 'What unseen patterns should I pay attention to?',
      symbolicPrompt: 'What dream symbol is calling me into alignment?'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Choose Your Elemental Affinity
        </h2>
        <p className="text-white/70">
          Which elemental energy resonates most deeply with your current journey?
        </p>
      </div>

      <div className="grid gap-4">
        {elements.map((element) => (
          <button
            key={element.element}
            onClick={() => onSelect(element.element)}
            className={`w-full p-6 rounded-xl border-2 text-left transition-all duration-200 hover:scale-[1.02] ${
              selectedElement === element.element
                ? 'border-yellow-400 bg-yellow-400/20 shadow-lg'
                : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className="text-4xl">{element.emoji}</div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-xl font-semibold text-white">
                    {element.name}
                  </h3>
                  {selectedElement === element.element && (
                    <div className="text-yellow-400">✓</div>
                  )}
                </div>
                <p className="text-white/80 mb-3">
                  {element.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {element.qualities.map((quality, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-white/10 rounded-full text-white/70"
                    >
                      {quality}
                    </span>
                  ))}
                </div>
                <div className="space-y-1 text-sm">
                  <div className="text-white/60">
                    <strong>Insight:</strong> "{element.insightPrompt}"
                  </div>
                  <div className="text-white/60">
                    <strong>Symbolic:</strong> "{element.symbolicPrompt}"
                  </div>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="text-center mt-6">
        <p className="text-sm text-white/50">
          Don't worry—you can always explore other elements during your journey
        </p>
      </div>
    </div>
  );
};