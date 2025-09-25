"use client";

import { motion } from "framer-motion";

interface MaiaInsightCardProps {
  insight: string;
  type: "user" | "oracle";
  timestamp?: Date;
  elements?: {
    fire?: number;
    water?: number;
    earth?: number;
    air?: number;
  };
}

export function MaiaInsightCard({ 
  insight, 
  type, 
  timestamp,
  elements 
}: MaiaInsightCardProps) {
  const getElementColor = (element: string) => {
    const colors = {
      fire: "from-red-400 to-orange-400",
      water: "from-blue-400 to-cyan-400",
      earth: "from-green-400 to-emerald-400",
      air: "from-gray-300 to-blue-300"
    };
    return colors[element as keyof typeof colors];
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: type === "user" ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-4 rounded-2xl ${
        type === "user" 
          ? "bg-amber-100 dark:bg-amber-900/30 ml-8" 
          : "bg-gradient-to-br from-amber-50 to-pink-50 dark:from-black/50 dark:to-pink-950/50 mr-8"
      } backdrop-blur`}
    >
      {/* Elements indicator */}
      {elements && (
        <div className="flex space-x-1 mb-2">
          {Object.entries(elements).map(([element, value]) => 
            value && value > 0 ? (
              <motion.div
                key={element}
                className={`w-2 h-2 rounded-full bg-gradient-to-r ${getElementColor(element)}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
              />
            ) : null
          )}
        </div>
      )}

      <p className={`text-sm ${
        type === "oracle" 
          ? "text-gray-700 dark:text-gray-300 italic" 
          : "text-gray-600 dark:text-gray-400"
      }`}>
        {insight}
      </p>

      {timestamp && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          {new Date(timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
      )}
    </motion.div>
  );
}