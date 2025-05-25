// src/pages/MemoryInsightsPage.tsx
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

interface Insight {
  id: string;
  analysis: string;
}

const MemoryInsightsPage: React.FC = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const memoryId = params.get('memoryId');
  const [insights, setInsights] = useState<Insight[]>([]);
  const [error, setError] = useState<string | null>(null); // State to handle errors

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        if (!memoryId) throw new Error('Memory ID is missing.');
        const { data, error } = await supabase
          .from('insights')
          .select('*')
          .eq('memory_id', memoryId);

        if (error) throw error;
        setInsights(data || []);
      } catch (error) {
        console.error('Error fetching insights:', error);
        setError('Failed to fetch insights.');
      }
    };

    fetchInsights();
  }, [memoryId]);

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Insights for Memory {memoryId}</h2>
      {error && <p className="text-red-500">{error}</p>}
      {insights.length > 0 ? (
        insights.map((ins) => (
          <div key={ins.id} className="mb-4 p-4 border rounded">
            {ins.analysis}
          </div>
        ))
      ) : (
        <p className="text-gray-600">No insights found.</p>
      )}
    </div>
  );
};

export default MemoryInsightsPage;
