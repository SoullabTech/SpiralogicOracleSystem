// 📁 src/lib/getBranding.ts

export function getBranding(orgId?: string | null) {
  switch (orgId) {
    case 'soulfulAcademy':
      return {
        title: 'Soulful Academy',
        faviconUrl: '/favicons/soulful.png',
      };
    case 'zenMinimalist':
      return {
        title: 'Zen Minimalist',
        faviconUrl: '/favicons/zen.png',
      };
    default:
      return {
        title: 'Oracle Portal',
        faviconUrl: '/favicons/default.png',
      };
  }
}
