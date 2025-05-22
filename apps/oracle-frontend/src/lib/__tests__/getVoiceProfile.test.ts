// src/lib/__tests__/getVoiceProfile.test.ts
import { describe, expect, it } from 'vitest';
import { getVoiceProfile } from '../getVoiceProfile';
import { voiceProfiles } from '../voiceProfiles';

describe('getVoiceProfile', () => {
  it('returns default profile when orgId is undefined', () => {
    const result = getVoiceProfile();
    expect(result).toEqual(voiceProfiles.default);
  });

  it('returns matching voice profile when orgId is known', () => {
    const result = getVoiceProfile('soulfulAcademy');
    expect(result).toEqual(voiceProfiles.soulfulAcademy);
  });

  it('falls back to default profile when orgId is unknown', () => {
    const result = getVoiceProfile('nonexistentOrg');
    expect(result).toEqual(voiceProfiles.default);
  });
});
