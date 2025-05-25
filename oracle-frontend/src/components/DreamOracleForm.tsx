import React, { useState } from 'react';

const DreamOracleForm: React.FC = () => {
  const [title, setTitle] = useState('');
  const [dream, setDream] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to agent/journal logic
    console.log('Dream submitted:', { title, dream });
    setSubmitted(true);
  };

  return (
    <div className="p-6 bg-white rounded shadow-md max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">Share Your Dream</h2>
      {submitted ? (
        <div className="text-green-600 font-semibold">Thank you for your submission!</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <label className="block mb-4">
            <span className="text-gray-700">Title</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full border p-2 rounded"
              required
            />
          </label>
          <label className="block mb-4">
            <span className="text-gray-700">Your Dream</span>
            <textarea
              value={dream}
              onChange={(e) => setDream(e.target.value)}
              className="mt-1 block w-full border p-2 rounded"
              rows={5}
              required
            />
          </label>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
          >
            Submit
          </button>
        </form>
      )}
    </div>
  );
};

export default DreamOracleForm;
