// frontend/src/pages/agents.tsx

import React, { useState, useEffect } from 'react';
import AgentCard from '../components/AgentCard';

const AgentsPage = () => {
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    // Simulate fetching feedback from the backend
    setFeedback("Your ritual feedback: Transformed energy awaits.");
  }, []);

  return (
    <div className="agents-page">
      <h1>Your Agents</h1>
      <AgentCard feedback={feedback} />
    </div>
  );
};

export default AgentsPage;
