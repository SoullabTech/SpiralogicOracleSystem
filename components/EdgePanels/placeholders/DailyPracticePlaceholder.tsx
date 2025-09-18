import React from "react";

export const DailyPracticePlaceholder: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-750 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
          Today's Elemental Check-in
        </h3>

        <div className="space-y-3">
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Morning reflection prompt will appear here
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-400">
              🌊 Water Practice
            </button>
            <button className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-700 dark:text-red-400">
              🔥 Fire Practice
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-750 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
          Integration Experiments
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-400">
          Personalized practices based on your patterns will appear here in Phase 2.
        </p>

        <div className="mt-4 text-xs text-amber-600 dark:text-amber-400">
          Phase 2 Beta Feature
        </div>
      </div>
    </div>
  );
};