// Redirect stub - the real Tesla-style interface is in OracleConversation
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const SacredOracleExperience: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    router.push('/oracle-conversation');
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-2 border-gold-divine border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <p className="text-gold-divine text-lg font-light">Loading Sacred Technology...</p>
      </div>
    </div>
  );
};

export default SacredOracleExperience;