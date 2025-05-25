// /pages/feedback.tsx
import { supabase } from '@/lib/supabase';
import { useState } from 'react';

export default function FeedbackPage() {
  const [form, setForm] = useState({
    message: '',
    element: '',
    archetype: '',
    agent: '',
    file: null as File | null,
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [name]: files?.[0] ?? value,
    }));
  };

  const submitFeedback = async () => {
    setStatus('submitting');

    let fileUrl: string | null = null;

    if (form.file) {
      const { data, error: uploadError } = await supabase.storage
        .from('feedback_files')
        .upload(`uploads/${Date.now()}_${form.file.name}`, form.file);

      if (uploadError) {
        setStatus('error');
        return;
      }

      fileUrl = supabase.storage.from('feedback_files').getPublicUrl(data.path).data.publicUrl;
    }

    const { error } = await supabase.from('feedback_log').insert([
      {
        message: form.message,
        element: form.element,
        archetype: form.archetype,
        agent: form.agent,
        file_url: fileUrl,
      },
    ]);

    setStatus(error ? 'error' : 'success');
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Spiralogic Feedback Portal</h1>

      <textarea
        name="message"
        onChange={handleChange}
        value={form.message}
        className="w-full border p-2 rounded mb-4"
        placeholder="What do you want to share?"
      />

      <input
        type="text"
        name="element"
        value={form.element}
        onChange={handleChange}
        placeholder="Element (e.g., Fire)"
        className="w-full border p-2 rounded mb-2"
      />

      <input
        type="text"
        name="archetype"
        value={form.archetype}
        onChange={handleChange}
        placeholder="Archetype (e.g., Healer)"
        className="w-full border p-2 rounded mb-2"
      />

      <input
        type="text"
        name="agent"
        value={form.agent}
        onChange={handleChange}
        placeholder="Agent name (if known)"
        className="w-full border p-2 rounded mb-2"
      />

      <input
        type="file"
        name="file"
        onChange={handleChange}
        className="mb-4"
      />

      <button
        onClick={submitFeedback}
        className="bg-blue-600 text-white px-4 py-2 rounded"
        disabled={status === 'submitting'}
      >
        {status === 'submitting' ? 'Submitting...' : 'Submit Feedback'}
      </button>

      {status === 'success' && (
        <p className="text-green-600 mt-2">Thank you for your feedback 🌱</p>
      )}
      {status === 'error' && (
        <p className="text-red-600 mt-2">Something went wrong. Please try again.</p>
      )}
    </div>
  );
}