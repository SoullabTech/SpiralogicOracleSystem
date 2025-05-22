// src/components/MemoryUpload.tsx
import React, { useState } from 'react';

const MemoryUpload: React.FC = () => {
  const [textEntry, setTextEntry] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState('');

  // Function to handle text memory upload
  const handleTextUpload = async () => {
    if (!textEntry.trim()) return;
    try {
      const response = await fetch('http://localhost:3000/api/memory/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'text', content: textEntry }),
      });
      const data = await response.json();
      setUploadStatus('Text uploaded successfully!');
      setTextEntry('');
    } catch (error) {
      console.error('Error uploading text:', error);
      setUploadStatus('Error uploading text.');
    }
  };

  // Function to handle audio memory upload
  const handleAudioUpload = async () => {
    if (!audioFile) return;
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('type', 'audio');

    try {
      const response = await fetch('http://localhost:3000/api/memory/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setUploadStatus('Audio uploaded successfully!');
      setAudioFile(null);
    } catch (error) {
      console.error('Error uploading audio:', error);
      setUploadStatus('Error uploading audio.');
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Lato, sans-serif' }}>
      <h2>Upload Memory</h2>

      <div style={{ marginBottom: '1rem' }}>
        <h3>Upload Text Memory</h3>
        <textarea
          value={textEntry}
          onChange={(e) => setTextEntry(e.target.value)}
          placeholder="Enter your session note, journal entry, dream journal, etc..."
          rows={4}
          style={{
            width: '100%',
            padding: '1rem',
            border: '1px solid #ccc',
            borderRadius: '5px',
            marginBottom: '0.5rem',
          }}
        />
        <button
          onClick={handleTextUpload}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#236586',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Upload Text
        </button>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <h3>Upload Audio Memory</h3>
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              setAudioFile(e.target.files[0]);
            }
          }}
          style={{ marginBottom: '0.5rem' }}
        />
        <button
          onClick={handleAudioUpload}
          disabled={!audioFile}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#236586',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Upload Audio
        </button>
      </div>

      {uploadStatus && <p>{uploadStatus}</p>}
    </div>
  );
};

export default MemoryUpload;
