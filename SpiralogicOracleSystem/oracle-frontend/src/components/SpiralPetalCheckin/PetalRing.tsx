import { motion } from 'framer-motion';
import { useState } from 'react';
import Petal from './Petal';

const petals = [
  { id: 'fire', color: '#ff6b6b', label: 'Fire' },
  { id: 'water', color: '#4ecdc4', label: 'Water' },
  { id: 'earth', color: '#1a535c', label: 'Earth' },
  { id: 'air', color: '#b5ead7', label: 'Air' },
  { id: 'aether', color: '#9d4edd', label: 'Aether' },
];

export default function PetalRing() {
  const [positions, setPositions] = useState(
    petals.reduce((acc, petal) => ({ ...acc, [petal.id]: 100 }), {}),
  );

  const handleDrag = (id: string, event: any, info: any) => {
    const distance = Math.sqrt(info.point.x ** 2 + info.point.y ** 2);
    setPositions((prev) => ({ ...prev, [id]: Math.min(Math.max(distance, 50), 200) }));
  };

  return (
    <div className="relative w-full h-[500px] flex items-center justify-center">
      {petals.map((petal, idx) => (
        <Petal
          key={petal.id}
          id={petal.id}
          color={petal.color}
          label={petal.label}
          angle={(idx * 360) / petals.length}
          distance={positions[petal.id]}
          onDrag={handleDrag}
        />
      ))}
    </div>
  );
}
