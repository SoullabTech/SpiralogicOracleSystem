// 📁 File: src/components/FaviconSetter.tsx

import { useAuth } from '@/context/AuthContext';
import { getBranding } from '@/lib/getBranding';
import { Helmet } from 'react-helmet';

export default function FaviconSetter() {
  const { orgId } = useAuth();
  const branding = getBranding(orgId);

  return (
    <Helmet>
      <link rel="icon" type="image/png" href={branding.faviconUrl} />
      <title>{branding.title}</title>
    </Helmet>
  );
}
