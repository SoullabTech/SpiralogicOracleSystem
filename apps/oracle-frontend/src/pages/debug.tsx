import { getJwt } from '@/lib/authHelpers';
import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    getJwt().then(setToken);
  }, []);

  return (
    <div className="p-6 text-white bg-black">
      <h1 className="text-xl font-bold">🧪 JWT Debug</h1>
      <p className="mt-2 break-all text-sm text-green-400">{token || 'Fetching token...'}</p>
    </div>
  );
}
