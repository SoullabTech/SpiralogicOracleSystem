import React, { useState } from 'react';

const OracleQuery: React.FC = () => {
  const [userInput, setUserInput] = useState('');
  const [response, setResponse] = useState<string | null>(null);

  const handleQuerySubmit = async () => {
    try {
      const res = await fetch('/api/oracle/personal/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: '1234', // Replace with actual userId
          input: userInput,
        }),
      });
      const data = await res.json();
      setResponse(data.content); // Display the response content
    } catch (err) {
      console.error('Error querying Oracle:', err);
    }
  };

  return (
    <div>
      <h2>Ask Your Personal Oracle</h2>
      <input
        type="text"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Ask a question..."
      />
      <button onClick={handleQuerySubmit}>Ask</button>

      {response && <p>Oracle's Answer: {response}</p>}
    </div>
  );
};

export default OracleQuery;
