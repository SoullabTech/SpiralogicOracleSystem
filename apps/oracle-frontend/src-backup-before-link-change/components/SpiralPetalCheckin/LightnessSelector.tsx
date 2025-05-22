import { useState } from 'react';

export default function LightnessSelector() {
  const [lightness, setLightness] = useState('Emerging');

  return (
    <div className="flex flex-col items-center mt-4">
      <label className="text-lg font-semibold">Lightness Level</label>
      <select
        value={lightness}
        onChange={(e) => setLightness(e.target.value)}
        className="mt-2 p-2 rounded border"
      >
        <option value="Dense">🌑 Dense</option>
        <option value="Emerging">🌘 Emerging</option>
        <option value="Awakening">🌔 Awakening</option>
        <option value="Radiant">🌕 Radiant</option>
      </select>
    </div>
  );
}
