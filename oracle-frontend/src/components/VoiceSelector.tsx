// frontend/src/components/VoiceSelector.tsx

import React, { useState } from 'react';

const VoiceSelector = ({ voices }: { voices: string[] }) => {
  const [selectedVoice, setSelectedVoice] = useState(voices[0]);

  return (
    <div className="voice-selector">
      <label>Select Voice:</label>
      <select onChange={(e) => setSelectedVoice(e.target.value)} value={selectedVoice}>
        {voices.map((voice, index) => (
          <option key={index} value={voice}>
            {voice}
          </option>
        ))}
      </select>
    </div>
  );
};

export default VoiceSelector;
