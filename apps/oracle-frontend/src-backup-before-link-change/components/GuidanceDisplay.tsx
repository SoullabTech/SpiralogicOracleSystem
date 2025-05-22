import React from 'react';

interface GuidanceDisplayProps {
  guidance: string;
}

export const GuidanceDisplay: React.FC<GuidanceDisplayProps> = ({ guidance }) => {
  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
      <p>{guidance}</p>
    </div>
  );
};
