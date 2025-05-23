// 📁 File: src/lib/brandingConfig.ts

export const brandingConfig = {
  default: {
    name: 'Spiralogic Oracle',
    primaryColor: '#6D28D9',
    secondaryColor: '#E0E7FF',
    font: 'Inter, sans-serif',
    logo: '/logo-default.svg',
    favicon: '/favicon.ico',
  },

  soulfulAcademy: {
    name: 'Soulful Academy',
    primaryColor: '#9F1239',
    secondaryColor: '#FDF2F8',
    font: 'Playfair Display, serif',
    logo: '/logo-soulful.svg',
    favicon: '/favicon-soulful.ico',
  },

  zenMinimalist: {
    name: 'Zen Minimalist',
    primaryColor: '#0F766E',
    secondaryColor: '#ECFDF5',
    font: 'Noto Sans JP, sans-serif',
    logo: '/logo-zen.svg',
    favicon: '/favicon-zen.ico',
  },
};

// 📁 File: src/lib/getBranding.ts
import { brandingConfig } from './brandingConfig';

export function getBranding(orgId?: string | null) {
  if (!orgId) return brandingConfig.default;
  return brandingConfig[orgId] || brandingConfig.default;
}
