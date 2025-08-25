import React from 'react';
import { SpiralPhaseChoice } from '../../types/onboarding';
import { SpiralPhase } from '../../types';

interface SpiralPhaseCheckProps {
  selectedPhase?: SpiralPhase;
  onSelect: (phase: SpiralPhase) => void;
}

export const SpiralPhaseCheck: React.FC<SpiralPhaseCheckProps> = ({
  selectedPhase,
  onSelect
}) => {
  const phases: SpiralPhaseChoice[] = [
    {
      phase: 'initiation',
      name: 'Initiation',
      description: 'Beginning a new chapter, seeking clarity on your path',
      characteristics: ['New beginnings', 'Curious exploration', 'Seeking direction', 'Open to guidance']
    },
    {
      phase: 'expansion',
      name: 'Expansion',
      description: 'Growing and stretching beyond your current limits',
      characteristics: ['Active growth', 'Taking risks', 'Expanding comfort zone', 'Building momentum']
    },
    {
      phase: 'integration',
      name: 'Integration',
      description: 'Bringing together your experiences into wisdom',
      characteristics: ['Consolidating learning', 'Finding balance', 'Practical application', 'Deepening understanding']
    },
    {
      phase: 'mastery',
      name: 'Mastery',
      description: 'Embodying your path and potentially guiding others',
      characteristics: ['Confident embodiment', 'Teaching others', 'Deep integration', 'Wisdom in action']
    }
  ];

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Where Are You on Your Spiral Journey?
        </h2>
        <p className="text-white/70">
          Every journey has phases. Which one feels most true for you right now?
        </p>
      </div>

      <div className="grid gap-4">
        {phases.map((phase) => (
          <button
            key={phase.phase}
            onClick={() => onSelect(phase.phase)}
            className={`w-full p-5 rounded-xl border-2 text-left transition-all duration-200 hover:scale-[1.01] ${
              selectedPhase === phase.phase
                ? 'border-yellow-400 bg-yellow-400/20 shadow-lg'
                : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-white">
                    {phase.name}
                  </h3>
                  {selectedPhase === phase.phase && (
                    <div className="text-yellow-400">✓</div>
                  )}
                </div>
                <p className="text-white/80 mb-3">
                  {phase.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {phase.characteristics.map((characteristic, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-white/10 rounded-full text-white/70"
                    >
                      {characteristic}
                    </span>
                  ))}
                </div>
              </div>
              <div className="ml-4 text-2xl opacity-50">
                {phase.phase === 'initiation' && '🌱'}
                {phase.phase === 'expansion' && '🌿'}
                {phase.phase === 'integration' && '🌳'}
                {phase.phase === 'mastery' && '🏔️'}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="text-center mt-6">
        <p className="text-sm text-white/50">
          Your phase may evolve as you progress through your journey
        </p>
      </div>
    </div>
  );
};