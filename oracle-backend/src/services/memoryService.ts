emoryService.tsimport { extractSymbolicTags } from './symbolService';

...

store: async (
  userId: string,
  content: string,
  element?: string,
  sourceAgent?: string,
  confidence?: number,
  metadata?: any
): Promise<MemoryItem | null> => {
  const symbols = extractSymbolicTags(content, sourceAgent || 'oracle');

  const { data, error } = await supabase
    .from('memories')
    .insert([
      {
        user_id: userId,
        content,
        element,
        source_agent: sourceAgent,
        confidence,
        metadata: {
          ...metadata,
          symbols,
        },
        timestamp: new Date().toISOString(),
      },
    ])
    .single();

  if (error) {
    console.error('Error storing memory:', error.message);
    return null;
  }

  return data as MemoryItem;
},
