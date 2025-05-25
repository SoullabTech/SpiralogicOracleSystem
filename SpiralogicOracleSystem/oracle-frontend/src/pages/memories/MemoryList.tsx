// src/pages/memories/MemoryList.tsx
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';

const MemoryList: React.FC<{ userId: string }> = ({ userId }) => {
  const [memories, setMemories] = useState<any[]>([]);

  useEffect(() => {
    const fetchMemories = async () => {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching memories:', error.message);
      } else {
        setMemories(data);
      }
    };

    fetchMemories();
  }, [userId]);

  return (
    <div>
      <h2>Your Memories</h2>
      {memories.length === 0 ? (
        <p>No memories found.</p>
      ) : (
        <ul>
          {memories.map((memory) => (
            <li key={memory.id}>
              <div>{memory.content}</div>
              <small>{new Date(memory.created_at).toLocaleDateString()}</small>
              <div>
                {/* Link to insights or generate insights here */}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MemoryList;
