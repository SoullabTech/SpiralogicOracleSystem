import { useState } from 'react';
import type { CrystalFocus } from '../types/survey';
import { CRYSTAL_FOCUS_OPTIONS } from '../types/survey';

interface CrystalFocusMenuProps {
  onComplete: (focus: CrystalFocus) => void;
}

export function CrystalFocusMenu({ onComplete }: CrystalFocusMenuProps) {
  const [selectedType, setSelectedType] = useState<CrystalFocus['type'] | null>(null);
  const [customDescription, setCustomDescription] = useState('');
  const [challenges, setChallenges] = useState('');
  const [aspirations, setAspirations] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) return;

    const focus: CrystalFocus = {
      type: selectedType,
      challenges,
      aspirations,
    };

    if (selectedType === 'other') {
      focus.customDescription = customDescription;
    }

    onComplete(focus);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-4">Choose Your Crystal Focus</h2>
        <p className="text-gray-600">
          Every aspect of life follows a unique spiral of growth. What is most important to you right now?
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CRYSTAL_FOCUS_OPTIONS.map((option) => (
            <button
              key={option.type}
              type="button"
              onClick={() => setSelectedType(option.type)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                selectedType === option.type
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-200'
              }`}
            >
              <h3 className="font-semibold mb-2">{option.title}</h3>
              <p className="text-sm text-gray-600">{option.description}</p>
              {option.elements.length > 0 && (
                <div className="mt-2 text-sm text-gray-500">
                  Elements: {option.elements.join(', ')}
                </div>
              )}
            </button>
          ))}
        </div>

        {selectedType && (
          <div className="space-y-4 mt-8">
            {selectedType === 'other' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Describe your focus area
                </label>
                <input
                  type="text"
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What challenges are you currently facing in this area?
              </label>
              <textarea
                value={challenges}
                onChange={(e) => setChallenges(e.target.value)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What do you hope to achieve or experience?
              </label>
              <textarea
                value={aspirations}
                onChange={(e) => setAspirations(e.target.value)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                required
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Continue to Survey
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}