// src/pages/journal/JournalForm.tsx
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabaseClient'; // Import Supabase client
import { useState } from 'react';

interface JournalFormProps {
  userId: string;
}

const JournalForm: React.FC<JournalFormProps> = ({ userId }) => {
  const [entry, setEntry] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entry) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from('journal_entries')
      .insert([{ user_id: userId, entry }]);

    if (error) {
      setError(error.message);
    } else {
      setEntry('');
      alert('Entry added successfully!');
    }
    setIsLoading(false);
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-md">
      <textarea
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        placeholder="Write your journal entry..."
        className="w-full p-4 rounded-md border"
      />
      {error && <p className="text-red-500">{error}</p>}
      <Button onClick={handleSubmit} isLoading={isLoading} className="mt-4">
        Submit Entry
      </Button>
    </div>
  );
};

export default JournalForm;
