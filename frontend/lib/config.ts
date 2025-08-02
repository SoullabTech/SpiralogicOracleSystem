// Frontend configuration for API endpoints
export const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://soullab-backend.onrender.com' // Replace with your actual backend URL
  : 'http://localhost:3001'; // Local development backend

// API endpoints
export const API_ENDPOINTS = {
  analytics: {
    dashboard: '/api/analytics/dashboard',
  },
  elemental: {
    recommendations: '/api/elemental/recommendations',
  },
  integration: {
    bypassingCheck: '/api/integration/bypassing-check',
    gateCheck: '/api/integration/gate-check',
    commodificationCheck: '/api/integration/commodification-check',
  },
} as const;

// Helper function to create full API URLs
export const createApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

// API client helper
export const apiClient = {
  get: async (endpoint: string) => {
    const response = await fetch(createApiUrl(endpoint));
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    return response.json();
  },

  post: async (endpoint: string, data?: any) => {
    const response = await fetch(createApiUrl(endpoint), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    return response.json();
  },
};