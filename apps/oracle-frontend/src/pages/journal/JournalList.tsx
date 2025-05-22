// src/pages/journal/JournalList.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient'; // Import Supabase client
import InsightGeneration from '@/components/InsightGeneration'; // Import Insight Generation Component

interface JournalEntry {
  id: string;
  entry: string;
  created_at: string;
}

const JournalList: React.FC<{ userId: string }> = ({ userId }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [insights, setInsights] = useState<any[]>([]);

  useEffect(() => {
    const fetchEntries = async () => {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('id, entry, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching entries:', error.message);
      } else {
        setEntries(data);
      }
    };

    fetchEntries();
  }, [userId]);

  const fetchInsights = async (journalId: string) => {
    const { data, error } = await supabase
      .from('insights')
      .select('insight_text')
      .eq('journal_entry_id', journalId);

    if (error) {
      console.error('Error fetching insights:', error.message);
    } else {
      setInsights(data);
    }
  };

  return (
    <div>
      <h2>Your Journal Entries</h2>
      {entries.length === 0 ? (
        <p>No journal entries found.</p>
      ) : (
        <ul>
          {entries.map((entry) => (
            <li key={entry.id}>
              <div>{entry.entry}</div>
              <small>{new Date(entry.created_at).toLocaleDateString()}</small>
              <InsightGeneration journalEntryId={entry.id} /> {/* Generate insights for each entry */}
              <div>
                {insights.map((insight) => (
                  <div key={insight.id} className="insight">
                    <p>{insight.insight_text}</p>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default JournalList;
