import React, { useEffect, useState } from 'react';
import { fetchSpiralJourney } from '../services/spiralBreathJourneyService';
import { SpiralBreathMap } from './SpiralBreathMap'; // This is our Canvas/SVG component
import { exportSpiralReflection } from '@/services/spiralReflectionExporterService';

<button
  onClick={() => {
    if (journey) {
      exportSpiralReflection(journey, 'YourUserNameHere');
    }
  }}
  className="spiral-download-button"
>
  📜 Download My Spiral Reflection
</button>;

const SpiralBreathConstellation = ({ userId }: { userId: string }) => {
  const [journey, setJourney] = useState<any>(null);

  useEffect(() => {
    const loadJourney = async () => {
      const data = await fetchSpiralJourney(userId); // API to fetch their Spiral data
      setJourney(data);
    };

    loadJourney();
  }, [userId]);

  return (
    <div className="spiral-constellation-container">
      {journey ? <SpiralBreathMap journey={journey} /> : <p>Loading your Spiral Journey...</p>}
    </div>
  );
};

export default SpiralBreathConstellation;
