// frontend/src/components/AgentCard.tsx

import React from 'react';

const AgentCard = ({ feedback }: { feedback: string }) => {
  return (
    <div className="agent-card">
      <h3>Your Personalized Insight:</h3>
      <p>{feedback}</p>
    </div>
  );
};

export default AgentCard;
