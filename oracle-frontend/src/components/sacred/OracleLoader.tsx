// OracleLoader.tsx - Sacred loading animation

import { useEffect, useState } from 'react';

interface OracleLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export default function OracleLoader({ size = 'md', text = 'Channeling cosmic wisdom...' }: OracleLoaderProps) {
  const [phase, setPhase] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((prev) => (prev + 1) % 5);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const elements = ['fire', 'water', 'earth', 'air', 'aether'];
  const colors = ['bg-fire-500', 'bg-water-500', 'bg-earth-500', 'bg-air-500', 'bg-aether-500'];

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-gold/20 animate-spiral" />
        
        {/* Elemental orbs */}
        <div className="absolute inset-0">
          {elements.map((element, index) => {
            const angle = (index * 72) - 90; // 5 elements = 72 degrees apart
            const isActive = phase === index;
            const x = 50 + 40 * Math.cos(angle * Math.PI / 180);
            const y = 50 + 40 * Math.sin(angle * Math.PI / 180);
            
            return (
              <div
                key={element}
                className={`
                  absolute w-3 h-3 rounded-full transition-all duration-500
                  ${colors[index]} ${isActive ? 'scale-150 animate-pulse' : 'scale-100 opacity-60'}
                `}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                  boxShadow: isActive ? `0 0 20px var(--tw-shadow-color)` : 'none'
                }}
                data-element={element}
              />
            );
          })}
        </div>
        
        {/* Center glyph */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1/3 h-1/3 rounded-full bg-gradient-oracle animate-glow shadow-glow-md" />
        </div>
      </div>
      
      {text && (
        <p className="text-gold/70 font-oracle text-sm animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}