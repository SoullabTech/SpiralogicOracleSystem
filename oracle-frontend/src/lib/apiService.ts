// src/apiService.ts
import axios from 'axios';

export const fetchMemoryInsights = async () => {
  try {
    const response = await axios.get('/api/memory/insights');
    return response.data.insights;
  } catch (error) {
    throw new Error('Failed to fetch memory insights');
  }
};

const BACKEND_URL = 'http://localhost:5001'; // Replace with Render URL later

export const generatePrompt = async (query: string, userId: string) => {
  const res = await fetch(`${BACKEND_URL}/api/generate-prompt`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, userId, config: {} }),
  });

  if (!res.ok) {
    throw new Error('Failed to get Oracle response');
  }

  const data = await res.json();
  return data.prompt;
};
