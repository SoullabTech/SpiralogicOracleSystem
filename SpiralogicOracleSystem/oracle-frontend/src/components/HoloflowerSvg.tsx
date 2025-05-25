// 🌸 Holoflower SVG Prototype with Interactive Petals
// File: src/components/HoloflowerSvg.tsx

import React from 'react';

interface HoloflowerSvgProps {
  activePhase?: string;
  onSelectPhase?: (phase: string) => void;
}

const phaseToPetalIndex: Record<string, number> = {
  'Fire 1': 0,
  'Fire 2': 1,
  'Earth 1': 2,
  'Earth 2': 3,
  'Air 1': 4,
  'Air 2': 5,
  'Water 1': 6,
  'Water 2': 7,
  'Aether 1': 8,
  'Aether 2': 9,
  'Integration': 10,
  'Completion': 11,
};

const indexToPhase = Object.fromEntries(
  Object.entries(phaseToPetalIndex).map(([k, v]) => [v, k])
);

const phaseColorMap: Record<string, string> = {
  'Fire 1': '#a94724',
  'Fire 2': '#a94724',
  'Earth 1': '#6d7934',
  'Earth 2': '#6d7934',
  'Air 1': '#236586',
  'Air 2': '#236586',
  'Water 1': '#236586',
  'Water 2': '#236586',
  'Aether 1': '#cea22c',
  'Aether 2': '#cea22c',
  'Integration': '#cea22c',
  'Completion': '#ffffff',
};

const HoloflowerSvg: React.FC<HoloflowerSvgProps> = ({ activePhase, onSelectPhase }) => {
  const radius = 90;
  const center = 100;
  const petalCount = 12;
  const activeIndex = activePhase ? phaseToPetalIndex[activePhase] : -1;

  const petals = Array.from({ length: petalCount }).map((_, i) => {
    const angle = (i * 360) / petalCount;
    const transform = `rotate(${angle} ${center} ${center})`;
    const phase = indexToPhase[i];
    const fill = i === activeIndex ? phaseColorMap[phase] : '#e0e0e0';

    return (
      <ellipse
        key={i}
        cx={center}
        cy={center - radius}
        rx="15"
        ry="40"
        fill={fill}
        transform={transform}
        opacity="0.9"
        stroke="#999"
        strokeWidth="0.5"
        style={{ cursor: onSelectPhase ? 'pointer' : 'default' }}
        onClick={() => onSelectPhase?.(phase)}
      />
    );
  });

  return (
    <div className="w-full flex justify-center">
      <svg width="200" height="200" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="25" fill="#fff" stroke="#ccc" strokeWidth="2" />
        {petals}
      </svg>
    </div>
  );
};

export default HoloflowerSvg;
