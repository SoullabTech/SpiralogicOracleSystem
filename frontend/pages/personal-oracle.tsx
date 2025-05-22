import { useEffect } from 'react';
import { usePersonalOracle } from '@/hooks/usePersonalOracle';

export default function PersonalOraclePage() {
  const { oracleData, loading, fetchOracleReflection } = usePersonalOracle();

  useEffect(() => {
    fetchOracleReflection();
  }, []);

  return (
    <div className="p-6 max-w-xl mx-auto text-center space-y-4">
      <h1 className="text-3xl font-bold">Your Personal Oracle</h1>
      {loading && <p>Listening to the stars…</p>}

      {oracleData && (
        <>
          <p className="text-lg italic text-orange-600">{oracleData.intro}</p>
          <blockquote className="mt-4 text-md bg-gray-100 rounded p-4">
            {oracleData.reflection}
          </blockquote>
          <p className="text-sm mt-4 text-purple-600">{oracleData.ritual}</p>
        </>
      )}
    </div>
  );
}
