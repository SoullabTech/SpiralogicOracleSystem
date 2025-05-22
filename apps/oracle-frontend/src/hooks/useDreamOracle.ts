import { supabase } from '@/lib/supabaseClient';
import { useState } from 'react';

interface DreamQuery {
  userId: string;
  dreamDescription: string;
  symbols?: string[];
  title?: string;
  element?: string;
}

export function useDreamOracle() {
  const [loading, setLoading] = useState(false);
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const queryDream = async ({ userId, dreamDescription, symbols, title, element }: DreamQuery) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/oracle/dream/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, dreamDescription, context: { symbols } }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to interpret dream');

      setInterpretation(data.interpretation);

      // 💾 Store in Supabase
      const { error: dbError } = await supabase.from('journal').insert([
        {
          user_id: userId,
          title: title || 'Untitled Dream',
          content: dreamDescription,
          element: element || 'Unknown',
          oracle_message: data.interpretation,
          oracle_symbols: symbols || [],
          created_at: new Date().toISOString(),
        },
      ]);

      if (dbError) throw dbError;

      return data.interpretation;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { queryDream, interpretation, loading, error };
}
