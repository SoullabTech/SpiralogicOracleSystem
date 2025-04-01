import { z } from 'zod';

const ResponseSchema = z.object({
  result: z.string(),
  analysis: z.object({
    element: z.string().nullable(),
    insightType: z.string().nullable()
  })
});

export async function callAPI(endpoint: string, data: any) {
  try {
    const response = await fetch(`/api/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_CLAUDE_API_KEY
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const responseData = await response.json();
    return ResponseSchema.parse(responseData);
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

export async function getHealth(): Promise<boolean> {
  try {
    const [claudeHealth, openaiHealth] = await Promise.all([
      fetch('/api/anthropic/health'),
      fetch('/api/openai/health')
    ]);
    
    return claudeHealth.ok && openaiHealth.ok;
  } catch {
    return false;
  }
}