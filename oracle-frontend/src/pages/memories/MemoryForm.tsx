// src/pages/memories/MemoryForm.tsx
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient'; // Import Supabase client

const MemoryForm: React.FC<{ userId: string }> = ({ userId }) => {
  const [content, setContent] = useState('');
  const [metadata, setMetadata] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { data, error } = await supabase
      .from('memories')
      .insert([{ content, metadata, user_id: userId }]);

    if (error) {
      console.error('Error creating memory:', error.message);
    } else {
      setContent('');
      setMetadata('');
      alert('Memory created successfully!');
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Enter your memory..."
        className="w-full p-4 rounded-md border"
      />
      <input
        type="text"
        value={metadata}
        onChange={(e) => setMetadata(e.target.value)}
        placeholder="Enter metadata"
        className="w-full p-4 mt-4 rounded-md border"
      />
      <Button isLoading={isLoading}>Create Memory</Button>
    </form>
  );
};

export default MemoryForm;
