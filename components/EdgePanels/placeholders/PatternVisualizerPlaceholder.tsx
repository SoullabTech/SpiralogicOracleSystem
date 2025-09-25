import React from "react";

export const PatternVisualizerPlaceholder: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="p-6 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-gray-800 dark:to-gray-750 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Elemental Balance
        </h3>

        <div className="space-y-3">
          {[
            { element: "🔥 Fire", value: 25, color: "bg-red-400" },
            { element: "💧 Water", value: 40, color: "bg-blue-400" },
            { element: "🌍 Earth", value: 20, color: "bg-green-400" },
            { element: "🌬️ Air", value: 10, color: "bg-yellow-400" },
            { element: "✨ Aether", value: 5, color: "bg-amber-400" }
          ].map(({ element, value, color }) => (
            <div key={element} className="flex items-center gap-3">
              <span className="w-16 text-sm">{element}</span>
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full ${color} transition-all duration-500`}
                  style={{ width: `${value}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 w-10 text-right">
                {value}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-750 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
          Growth Metrics
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">7</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Active Days</div>
          </div>

          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">23</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Insights</div>
          </div>

          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">4</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Cycles</div>
          </div>

          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">12</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Breakthroughs</div>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-cyan-600 dark:text-cyan-400">
        Phase 2: Advanced analytics coming soon
      </div>
    </div>
  );
};