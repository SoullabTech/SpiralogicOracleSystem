// pages/astro/wheel-test.tsx

import AstroWheel from '@/components/AstroWheel';

const WheelTestPage = () => {
  // Temporary mock planetary data for testing
  const planets = [
    { name: '☉', degree: 15 },   // Sun
    { name: '☽', degree: 123 },  // Moon
    { name: '♂', degree: 210 },  // Mars
    { name: '♃', degree: 305 },  // Jupiter
    { name: '♄', degree: 80 },   // Saturn
  ];

  return (
    <div style={{ padding: 40 }}>
      <h1>Spiralogic Astro Wheel Test</h1>
      <AstroWheel planets={planets} />
    </div>
  );
};

export default WheelTestPage;
