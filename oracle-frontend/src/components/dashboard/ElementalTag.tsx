// --- File: frontend/src/components/dashboard/ElementalTag.tsx ---

import React from "react";

interface ElementalTagProps {
  element: string;
}

const colorMap: Record<string, string> = {
  fire: "bg-red-100 text-red-800",
  water: "bg-blue-100 text-blue-800",
  earth: "bg-green-100 text-green-800",
  air: "bg-yellow-100 text-yellow-800",
  aether: "bg-purple-100 text-purple-800",
};

const ElementalTag: React.FC<ElementalTagProps> = ({ element }) => {
  const style = colorMap[element.toLowerCase()] || "bg-gray-100 text-gray-700";
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${style}`}>{element}</span>
  );
};

export default ElementalTag;
