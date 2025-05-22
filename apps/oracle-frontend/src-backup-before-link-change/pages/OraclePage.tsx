// src/pages/OraclePage.tsx
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useState, useEffect } from 'react';

const OraclePage: React.FC = () => {
  const { guideId } = useParams();
  const [oracle, setOracle] = useState<any>(null);

  useEffect(() => {
    const fetchOracle = async () => {
      const { data, error } = await supabase
        .from('oracles')
        .select('*')
        .eq('oracle_name', guideId)
        .single();

      if (error) {
        console.error('Error fetching oracle:', error);
      } else {
        setOracle(data);
      }
    };

    fetchOracle();
  }, [guideId]);

  if (!oracle) {
    return <div>Loading...</div>;
  }

  return (
    <div className="oracle-page">
      <h2 className="text-xl">{oracle.oracle_name}</h2>
      <p>{oracle.oracle_archetype}</p>
      <p>{oracle.oracle_element}</p>
      <div className="oracle-description">
        {/* Display Oracle information here */}
        <p>{oracle.description}</p>
      </div>
    </div>
  );
};

export default OraclePage;
