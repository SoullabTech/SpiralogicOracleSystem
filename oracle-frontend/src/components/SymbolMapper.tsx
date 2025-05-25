// /components/SymbolMapper.tsx
import React from 'react';

interface SymbolMapperProps {
  tags: string[]; // emotion or journal keywords
}

const symbolMap: Record<string, { symbol: string; element: string; oracleTag: string }> = {
  courage: { symbol: '🔥 Phoenix', element: 'Fire', oracleTag: 'Fire 1' },
  grief: { symbol: '💧 Chalice', element: 'Water', oracleTag: 'Water 1' },
  structure: { symbol: '🌿 Stone', element: 'Earth', oracleTag: 'Earth 1' },
  clarity: { symbol: '🌬️ Feather', element: 'Air', oracleTag: 'Air 1' },
  completion: { symbol: '✨ Spiral', element: 'Aether', oracleTag: 'Aether 1' }
};

export const SymbolMapper: React.FC<SymbolMapperProps> = ({ tags }) => {
  const matched = tags.map(tag => symbolMap[tag.toLowerCase()]).filter(Boolean);

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {matched.map((m, index) => (
        <div key={index} className="p-4 bg-white rounded-xl shadow">
          <div className="text-2xl">{m.symbol}</div>
          <div className="text-sm text-gray-600">{m.element} – {m.oracleTag}</div>
        </div>
      ))}
    </div>
  );
};
