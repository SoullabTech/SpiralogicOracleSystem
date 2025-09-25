import React from "react";

export const WeeklySpiralPlaceholder: React.FC = () => {
  return (
    <div className="p-6 bg-gradient-to-br from-amber-50 to-indigo-50 dark:from-gray-800 dark:to-gray-750 rounded-xl">
      <div className="text-center space-y-4">
        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-amber-200 to-indigo-200 dark:from-amber-800 dark:to-indigo-800 rounded-full animate-pulse" />

        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Weekly Insights Coming Soon
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Your weekly spiral will track elemental balance, shadow work, and growth patterns across your journey.
        </p>

        <div className="grid grid-cols-5 gap-2 mt-6">
          {["Fire", "Water", "Earth", "Air", "Aether"].map((element) => (
            <div key={element} className="text-center">
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-1" />
              <span className="text-xs text-gray-500 dark:text-gray-400">{element}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 text-xs text-amber-600 dark:text-amber-400">
          Phase 2 Beta Feature
        </div>
      </div>
    </div>
  );
};