// src/pages/OraclePage.tsx
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const OraclePage: React.FC = () => {
  const { guideId } = useParams();
  const [oracle, setOracle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');

  useEffect(() => {
    const fetchOracle = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('oracles')
        .select('*')
        .eq('name', guideId)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching oracle:', error);
        setOracle(null);
      } else {
        setOracle(data);
      }
      setLoading(false);
    };

    fetchOracle();
  }, [guideId]);

  if (loading) {
    return <div data-testid="loading-state" className="p-4 text-center text-gray-500">Loading...</div>;
  }

  if (!oracle) {
    return <div data-testid="no-oracle-found" className="p-4 text-center text-red-500">Oracle not found.</div>;
  }

  return (
    <div className="oracle-page p-6">
      <h1 className="text-2xl font-bold">{oracle.name}</h1>
      <p className="text-sm italic">{oracle.archetype} · {oracle.element}</p>
      <div className="mt-4 text-gray-700">{oracle.description}</div>

      <div className="mt-6">
        <input
          type="text"
          data-testid="oracle-input"
          placeholder="Ask your Oracle"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring"
        />
      </div>
    </div>
  );
};

export default OraclePage;