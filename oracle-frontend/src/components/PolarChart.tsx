'use client';

import { useEffect, useState } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';

// The Facet interface now accepts 12 facets as a dynamic list of name-value pairs
interface Facet {
  name: string;
  value: number;
}

interface Props {
  data: Facet[];
}

export default function PolarChart({ data }: Props) {
  const [animatedData, setAnimatedData] = useState<Facet[]>([]);

  useEffect(() => {
    let step = 0;
    const maxSteps = data.length; // Number of facets in the data

    const animate = () => {
      const slice = data.slice(0, step + 1); // Animate data slice one by one
      setAnimatedData(slice);
      step++;

      if (step < maxSteps) {
        setTimeout(animate, 300); // Delay between each data point animation
      }
    };

    // Start with all zero values for smooth animation
    setAnimatedData(data.map((d) => ({ ...d, value: 0 })));
    setTimeout(animate, 300); // Trigger the animation
  }, [data]);

  return (
    <div className="w-full h-96 transition-all ease-out duration-1000">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={animatedData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="name" />
          <PolarRadiusAxis angle={30} domain={[0, 10]} />

          {/* Radar for each facet */}
          <Radar
            name="Facet Value"
            dataKey="value"
            stroke="#9333ea"
            fill="#9333ea"
            fillOpacity={0.5}
            isAnimationActive={false} // Handle animation manually
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
