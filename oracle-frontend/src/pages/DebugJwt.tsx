// src/pages/DebugJwt.tsx
import { getJwt } from '@/lib/authHelpers';
import { useEffect, useState } from 'react';

export default function DebugJwt() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    getJwt().then(setToken);
  }, []);

  return (
    <div className="p-6 text-white bg-black min-h-screen">
      <h1 className="text-xl font-bold mb-4">🔐 JWT Debug</h1>
      <p className="text-sm break-all">{token || 'Loading JWT...'}</p>
    </div>
  );
}
