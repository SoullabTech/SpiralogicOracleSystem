// 📁 File: src/config/orgConfig.ts

export interface OrgConfig {
  id: string;
  name: string;
  theme: {
    primaryColor: string;
    backgroundGradient: string;
    fontFamily: string;
  };
  voiceProfileId: string;
  baseUrl: string;
  ttsModel?: string;
}

export const orgConfigs: OrgConfig[] = [
  {
    id: 'soulfulAcademy',
    name: 'Soulful Academy',
    theme: {
      primaryColor: '#A78BFA',
      backgroundGradient: 'from-purple-50 via-indigo-50 to-white',
      fontFamily: 'Cormorant Garamond, serif',
    },
    voiceProfileId: 'soulfulAcademy',
    baseUrl: 'https://spiralogic.app/preview/soulfulAcademy',
    ttsModel: 'soulful-v1',
  },
  {
    id: 'zenMinimalist',
    name: 'Zen Minimalist',
    theme: {
      primaryColor: '#64748B',
      backgroundGradient: 'from-gray-100 via-slate-100 to-white',
      fontFamily: 'Inter, sans-serif',
    },
    voiceProfileId: 'zenMinimalist',
    baseUrl: 'https://spiralogic.app/preview/zenMinimalist',
    ttsModel: 'zen-v1',
  },
  {
    id: 'default',
    name: 'Spiralogic Core',
    theme: {
      primaryColor: '#E25822',
      backgroundGradient: 'from-indigo-50 via-purple-50 to-yellow-50',
      fontFamily: 'ui-serif, Georgia',
    },
    voiceProfileId: 'default',
    baseUrl: 'https://spiralogic.app/preview/default',
    ttsModel: 'core-oracle',
  },
];

export function getOrgConfig(id?: string): OrgConfig {
  return orgConfigs.find((org) => org.id === id) || orgConfigs[2];
}
