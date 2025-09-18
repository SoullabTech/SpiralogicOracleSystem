import React from "react";

export const DivinationPlaceholder: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-gray-800 dark:to-gray-750 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Divination Tools
        </h3>

        <div className="grid grid-cols-1 gap-3">
          <button className="p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow text-left">
            <div className="flex items-center justify-between">
              <span className="font-medium">🎴 Pull a Tarot Card</span>
              <span className="text-xs text-gray-500">Daily Draw</span>
            </div>
          </button>

          <button className="p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow text-left">
            <div className="flex items-center justify-between">
              <span className="font-medium">☯️ I Ching Consultation</span>
              <span className="text-xs text-gray-500">Cast Hexagram</span>
            </div>
          </button>

          <button className="p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow text-left">
            <div className="flex items-center justify-between">
              <span className="font-medium">🌙 Lunar Phase Ritual</span>
              <span className="text-xs text-gray-500">Current Phase</span>
            </div>
          </button>

          <button className="p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow text-left">
            <div className="flex items-center justify-between">
              <span className="font-medium">✨ Synchronicity Oracle</span>
              <span className="text-xs text-gray-500">Pattern Reading</span>
            </div>
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-violet-600 dark:text-violet-400">
            Phase 2: Interactive divination coming soon
          </p>
        </div>
      </div>

      <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-gray-750 rounded-xl">
        <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
          Ritual Library
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Access guided rituals and ceremonial practices aligned with your current elemental phase.
        </p>
      </div>
    </div>
  );
};