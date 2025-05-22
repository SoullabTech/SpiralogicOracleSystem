// src/components/InsightGeneration.tsx

import { supabase } from '@/lib/supabaseClient'; // Import Supabase client

// Function to generate insights based on journal content
const generateInsight = (entry: string) => {
  if (entry.includes('growth')) {
    return 'You are on the right path to personal growth. Keep going!';
  } else if (entry.includes('challenge')) {
    return 'Challenges are stepping stones for your development. Embrace them!';
  } else {
    return 'Keep reflecting, your path is unfolding beautifully.';
  }
};

interface InsightGenerationProps {
  journalEntryId: string;
}

const InsightGeneration: React.FC<InsightGenerationProps> = ({ journalEntryId }) => {
  const handleGenerateInsight = async () => {
    const entry = await supabase
      .from('journal_entries')
      .select('entry')
      .eq('id', journalEntryId)
      .single();

    if (entry.data) {
      const insight = generateInsight(entry.data.entry);

      const { error } = await supabase.from('insights').insert([
        {
          journal_entry_id: journalEntryId,
          insight_text: insight,
        },
      ]);

      if (error) {
        console.error('Error generating insight:', error);
      } else {
        alert('Insight generated successfully!');
      }
    }
  };

  return (
    <div>
      <button onClick={handleGenerateInsight} className="btn">
        Generate Insight
      </button>
    </div>
  );
};

export default InsightGeneration;
