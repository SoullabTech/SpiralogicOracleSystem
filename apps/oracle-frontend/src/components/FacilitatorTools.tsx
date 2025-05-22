// src/components/FacilitatorTools.tsx
import { authenticatedFetch } from '@/lib/apiService'; // A helper function to include the JWT token in requests
import React, { useEffect, useState } from 'react';
const FacilitatorTools: React.FC = () => {
  const [clientSessions, setClientSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch client session data from the backend
  const fetchClientSessions = async () => {
    try {
      // Replace the URL with your actual backend endpoint
      const data = await authenticatedFetch('http://localhost:5001/api/facilitator/sessions');
      setClientSessions(data.sessions);
    } catch (error) {
      console.error('Error fetching client sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientSessions();
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'Lato, sans-serif' }}>
      <h2>Facilitator Tools</h2>
      {loading ? (
        <p>Loading client sessions...</p>
      ) : clientSessions.length === 0 ? (
        <p>No client sessions available.</p>
      ) : (
        <div>
          {clientSessions.map((session, index) => (
            <div
              key={index}
              style={{
                backgroundColor: '#f9f9f9',
                padding: '1rem',
                borderRadius: '5px',
                marginBottom: '1rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              <p>
                <strong>Client ID:</strong> {session.clientId}
              </p>
              <p>
                <strong>Session Start:</strong> {session.sessionStart}
              </p>
              <p>
                <strong>Status:</strong> {session.status}
              </p>
              {/* You can add more details as needed */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FacilitatorTools;
