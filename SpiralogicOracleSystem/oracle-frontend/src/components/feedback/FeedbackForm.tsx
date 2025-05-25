import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient'; // Import Supabase client

const FeedbackForm = () => {
  const [message, setMessage] = useState('');
  const [element, setElement] = useState('');
  const [archetype, setArchetype] = useState('');
  const [agent, setAgent] = useState('');
  const [fileUrl, setFileUrl] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const user = supabase.auth.user(); // Get the logged-in user
    if (!user) {
      alert('Please log in before submitting feedback.');
      return;
    }

    const { data, error } = await supabase.from('feedback_log').insert([
      {
        user_id: user.id,
        message,
        element,
        archetype,
        agent,
        file_url: fileUrl,
      },
    ]);

    if (error) {
      console.error('Error inserting feedback:', error.message);
    } else {
      alert('Feedback submitted successfully!');
      console.log(data);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Your feedback"
      />
      <input
        type="text"
        value={element}
        onChange={(e) => setElement(e.target.value)}
        placeholder="Element"
      />
      <input
        type="text"
        value={archetype}
        onChange={(e) => setArchetype(e.target.value)}
        placeholder="Archetype"
      />
      <input
        type="text"
        value={agent}
        onChange={(e) => setAgent(e.target.value)}
        placeholder="Agent"
      />
      <input
        type="text"
        value={fileUrl}
        onChange={(e) => setFileUrl(e.target.value)}
        placeholder="File URL"
      />
      <button type="submit">Submit Feedback</button>
    </form>
  );
};

export default FeedbackForm;
