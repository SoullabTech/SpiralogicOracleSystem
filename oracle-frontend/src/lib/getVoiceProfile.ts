// 📁 Frontend: src/lib/getVoiceProfile.ts

import { voiceProfiles } from './voiceProfiles';

export function getVoiceProfile(orgId?: string | null) {
  if (!orgId || !(orgId in voiceProfiles)) {
    return voiceProfiles.default;
  }
  return voiceProfiles[orgId as keyof typeof voiceProfiles];
}
