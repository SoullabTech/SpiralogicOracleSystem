// src/pages/memories/InsightGeneration.tsx
const generateMemoryInsight = (content: string) => {
  if (content.includes('growth')) {
    return 'Your memories are a powerful source of personal growth. Reflect on them!';
  } else if (content.includes('challenge')) {
    return 'Memories tied to challenges offer valuable lessons for your future.';
  } else {
    return 'Your memory is a beautiful part of your journey. Cherish it!';
  }
};

const MemoryInsight: React.FC<{ memoryId: string }> = ({ memoryId }) => {
  const [insight, setInsight] = useState<string | null>(null);

  const handleGenerateInsight = async () => {
    const memoryData = await supabase
      .from('memories')
      .select('content')
      .eq('id', memoryId)
      .single();

    if (memoryData.data) {
      const insight = generateMemoryInsight(memoryData.data.content);

      const { error } = await supabase.from('insights').insert([
        {
          journal_entry_id: memoryId,
          insight_text: insight,
        },
      ]);

      if (error) {
        console.error('Error generating memory insight:', error);
      } else {
        setInsight(insight);
      }
    }
  };

  return (
    <div>
      <button onClick={handleGenerateInsight} className="btn">
        Generate Memory Insight
      </button>
      {insight && <p>{insight}</p>}
    </div>
  );
};

export default MemoryInsight;
