// 📁 File: src/components/VoiceProfileSelector.tsx

import { useVoiceProfile } from '@/hooks/useVoiceProfile';
import { updateVoiceProfile } from '@/lib/updateVoiceProfile';
import { voiceProfiles } from '@/lib/voiceProfiles';
import { useSession } from '@supabase/auth-helpers-react';
import React from 'react';

const VoiceProfileSelector: React.FC = () => {
  const session = useSession();
  const userId = session?.user?.id;
  const { currentKey, setProfileKey } = useVoiceProfile();

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setProfileKey(selected);
    if (userId) {
      await updateVoiceProfile(userId, selected);
    }
  };

  return (
    <div className="mb-4">
      <label className="block mb-1 text-sm font-medium">🎙️ Voice Style</label>
      <select
        value={currentKey}
        onChange={handleChange}
        className="border rounded px-3 py-1 w-full"
      >
        {Object.keys(voiceProfiles).map((key) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </select>
    </div>
  );
};

export default VoiceProfileSelector;
