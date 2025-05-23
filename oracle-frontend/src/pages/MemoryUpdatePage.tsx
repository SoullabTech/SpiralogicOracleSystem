import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAllMemories, updateMemory } from '../services/memoryService'; // Importing the functions to get and update memory

const MemoryUpdatePage = () => {
  const { id } = useParams(); // Get memory ID from the URL
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [metadata, setMetadata] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMemory = async () => {
      try {
        const memories = await getAllMemories('your-client-id'); // Replace with dynamic clientId if necessary
        const memory = memories.find((m) => m.id === id);
        if (memory) {
          setContent(memory.content);
          setMetadata(memory.metadata?.tags || '');
        } else {
          setError('Memory not found');
        }
      } catch (err) {
        setError('Failed to fetch memory');
      }
    };

    fetchMemory();
  }, [id]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!content) {
      setError('Content is required');
      return;
    }

    try {
      const success = await updateMemory(id, content, 'your-client-id'); // Replace with dynamic clientId if necessary
      if (success) {
        navigate('/memories'); // Redirect to the memories page
      } else {
        setError('Failed to update memory');
      }
    } catch (err) {
      setError('Failed to update memory');
    }
  };

  return (
    <div>
      <h1>Update Memory</h1>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="content">Memory Content:</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="metadata">Metadata (optional):</label>
          <input
            type="text"
            id="metadata"
            value={metadata}
            onChange={(e) => setMetadata(e.target.value)}
          />
        </div>
        <button type="submit">Update Memory</button>
      </form>
    </div>
  );
};

export default MemoryUpdatePage;
