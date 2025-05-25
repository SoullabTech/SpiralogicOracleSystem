import React from "react";

type Props = {
  title: string;
  description: string;
  phase: string;
};

const RitualCard = ({ title, description, phase }: Props) => {
  return (
    <div className="bg-indigo-100 p-4 rounded-lg shadow-md border-l-4 border-indigo-500">
      <h3 className="text-lg font-semibold text-indigo-800">🔮 Ritual for {phase}</h3>
      <p className="text-sm text-gray-700 mt-1">{title}</p>
      <p className="text-xs text-gray-600 italic mt-2">{description}</p>
    </div>
  );
};

export default RitualCard;
