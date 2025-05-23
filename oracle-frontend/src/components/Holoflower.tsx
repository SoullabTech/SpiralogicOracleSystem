// 📁 File: src/components/HoloflowerSvg.tsx


const PHASES = [
  'Fire 1', 'Fire 2', 'Fire 3',
  'Earth 1', 'Earth 2', 'Earth 3',
  'Air 1', 'Air 2', 'Air 3',
  'Water 1', 'Water 2', 'Water 3',
  'Aether',
];

const elementColors: Record<string, string> = {
  Fire: '#E25822',
  Earth: '#8B5E3C',
  Air: '#3B82F6',
  Water: '#2563EB',
  Aether: '#A78BFA',
};

function getElement(phase: string) {
  if (phase.startsWith('Fire')) return 'Fire';
  if (phase.startsWith('Earth')) return 'Earth';
  if (phase.startsWith('Air')) return 'Air';
  if (phase.startsWith('Water')) return 'Water';
  return 'Aether';
}

interface HoloflowerSvgProps {
  activePhase: string;
  onSelectPhase: (phase: string) => void;
  stats?: Record<string, number>; // Optional: Journal entry count or similar stats
}

export default function HoloflowerSvg({ activePhase, onSelectPhase, stats = {} }: HoloflowerSvgProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      className="w-full max-w-md mx-auto hover:cursor-pointer"
    >
      {PHASES.map((phase, index) => {
        const angle = (360 / PHASES.length) * index;
        const radians = (angle * Math.PI) / 180;
        const cx = 100 + Math.cos(radians) * 60;
        const cy = 100 + Math.sin(radians) * 60;
        const isActive = activePhase === phase;
        const element = getElement(phase);
        const color = elementColors[element];

        return (
          <g key={phase} onClick={() => onSelectPhase(phase)}>
            <circle
              cx={cx}
              cy={cy}
              r={isActive ? 12 : 8}
              fill={color}
              opacity={isActive ? 0.9 : 0.6}
              stroke={isActive ? '#000' : 'none'}
              strokeWidth={isActive ? 2 : 0}
              className={isActive ? 'animate-pulse' : ''}
            >
              <title>
                {phase}
                {stats[phase] ? `\nEntries: ${stats[phase]}` : ''}
              </title>
            </circle>
            <text
              x={cx}
              y={cy - 14}
              textAnchor="middle"
              fontSize="10"
              fill="#444"
            >
              {phase}
            </text>
          </g>
        );
      })}

      {/* Center guide core */}
      <circle cx={100} cy={100} r={10} fill="#333" />
    </svg>
  );
}
