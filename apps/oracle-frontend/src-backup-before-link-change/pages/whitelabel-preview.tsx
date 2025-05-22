import HoloflowerSvg from '@/components/HoloflowerSvg';
import { getVoiceProfile } from '@/lib/getVoiceProfile';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BRANDS = [
  {
    id: 'soulfulAcademy',
    name: 'Soulful Academy',
    color: '#A78BFA',
    intro: 'Explore your spiritual journey with depth and clarity.',
    qrLink: 'https://spiralogic.app/preview/soulfulAcademy',
  },
  {
    id: 'zenMinimalist',
    name: 'Zen Minimalist',
    color: '#94A3B8',
    intro: 'A calm interface for focused minds.',
    qrLink: 'https://spiralogic.app/preview/zenMinimalist',
  },
  {
    id: 'default',
    name: 'Default Spiralogic',
    color: '#E25822',
    intro: 'The core Spiralogic Oracle experience.',
    qrLink: 'https://spiralogic.app/preview/default',
  },
];

export default function WhiteLabelPreview() {
  const [activeBrand, setActiveBrand] = useState('soulfulAcademy');
  const navigate = useNavigate();
  const voice = getVoiceProfile(activeBrand);
  const currentBrand = BRANDS.find((b) => b.id === activeBrand);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-8">
      <h1 className="text-3xl font-bold text-center mb-6">White Label Preview</h1>

      <div className="flex justify-center gap-4 mb-10">
        {BRANDS.map((brand) => (
          <button
            key={brand.id}
            onClick={() => setActiveBrand(brand.id)}
            className={`px-4 py-2 rounded shadow ${
              activeBrand === brand.id ? 'bg-black text-white' : 'bg-gray-200'
            }`}
          >
            {brand.name}
          </button>
        ))}
      </div>

      <div className="max-w-3xl mx-auto text-center mb-10">
        <p className="text-lg font-medium" style={{ color: currentBrand?.color }}>
          {voice.uiLabels.chatHeader}
        </p>
        <p className="text-sm text-gray-500 mt-2 italic">{currentBrand?.intro}</p>
        <div className="mt-4">
          <a
            href={currentBrand?.qrLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700"
          >
            Open Preview
          </a>
        </div>
      </div>

      <HoloflowerSvg
        activePhase="Fire 1"
        onSelectPhase={(phase) => navigate(`/journal-timeline?phase=${encodeURIComponent(phase)}`)}
        stats={{ 'Fire 1': 3, 'Earth 2': 4 }}
      />
    </div>
  );
}
