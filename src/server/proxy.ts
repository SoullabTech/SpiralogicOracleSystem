import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-api-key', 'Authorization'],
  credentials: true
}));

app.use(express.json());

const requestSchema = z.object({
  model: z.string(),
  max_tokens: z.number(),
  system: z.string().optional(),
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  }))
});

const oracleRequestSchema = z.object({
  message: z.string(),
  context: z.object({
    clientProfile: z.object({
      element: z.string().nullable(),
      phase: z.string().nullable(),
      archetype: z.string().nullable()
    }),
    element: z.string(),
    conversationHistory: z.array(z.any())
  }).optional(),
  clientId: z.string(),
  clientName: z.string()
});

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.VITE_CLAUDE_API_KEY,
});

function getElementPrompt(element: string): string {
  const prompts = {
    'Fire': 'Focus on transformation, motivation, and inspired action. Use energetic, passionate language that ignites the client\'s purpose.',
    'Water': 'Focus on emotional processing and intuitive flow. Use fluid, empathetic language that helps the client explore their feelings deeply.',
    'Earth': 'Focus on practical implementation and grounding. Use clear, structured language that helps the client take concrete steps.',
    'Air': 'Focus on mental clarity and perspective. Use analytical, thoughtful language that expands the client\'s understanding.',
    'Aether': 'Focus on spiritual integration and higher wisdom. Use holistic language that connects all elements and dimensions.'
  };
  
  return prompts[element as keyof typeof prompts] || prompts['Aether'];
}

function analyzeResponse(content: string, currentElement: string) {
  const result = {
    element: currentElement,
    insightType: 'reflection'
  };
  
  // Detect insight type based on content patterns
  if (content.toLowerCase().includes('challenge') || content.toLowerCase().includes('obstacle')) {
    result.insightType = 'challenge';
  } else if (content.toLowerCase().includes('practice') || content.toLowerCase().includes('action')) {
    result.insightType = 'guidance';
  } else if (content.toLowerCase().includes('integrate') || content.toLowerCase().includes('synthesis')) {
    result.insightType = 'integration';
  }
  
  // Detect potential element shift based on language patterns
  const elementPatterns = {
    'Fire': ['passion', 'transform', 'action', 'energy', 'catalyst'],
    'Water': ['feel', 'flow', 'emotion', 'depth', 'intuition'],
    'Earth': ['ground', 'practical', 'manifest', 'structure', 'form'],
    'Air': ['think', 'clarity', 'perspective', 'understand', 'connect'],
    'Aether': ['spirit', 'whole', 'transcend', 'integrate', 'unity']
  };
  
  // Check for dominant element in response
  let maxMatches = 0;
  Object.entries(elementPatterns).forEach(([element, patterns]) => {
    const matches = patterns.filter(pattern => 
      content.toLowerCase().includes(pattern.toLowerCase())
    ).length;
    
    if (matches > maxMatches && element !== currentElement) {
      maxMatches = matches;
      if (matches >= 3) { // Require strong presence of another element
        result.element = element;
      }
    }
  });
  
  return result;
}

// Claude API proxy
app.post('/api/anthropic/v1/messages', async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
      return res.status(401).json({ error: { message: 'API key is required' } });
    }

    const validatedBody = requestSchema.parse(req.body);

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240307',
      max_tokens: validatedBody.max_tokens,
      system: validatedBody.system,
      messages: validatedBody.messages
    });

    res.json(response);
  } catch (error) {
    console.error('Claude proxy error:', error);
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
});

// Oracle endpoint
app.post('/api/oracle', async (req, res) => {
  try {
    const { message, context, clientId, clientName } = oracleRequestSchema.parse(req.body);

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Build element-specific prompt
    const elementPrompt = getElementPrompt(context?.element || 'Aether');
    
    // Build client context
    const clientContext = `
Client Profile:
- Name: ${clientName}
- Phase: ${context?.clientProfile?.phase || 'Unknown'}
- Archetype: ${context?.clientProfile?.archetype || 'Seeker'}
- Element: ${context?.element || 'Aether'}

Recent conversation context:
${context?.conversationHistory?.slice(-3).map((msg: any) => 
  `${msg.sender}: ${msg.content}`
).join('\n') || 'No recent context'}
`;

    // Get Oracle response
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240307',
      max_tokens: 1000,
      system: `You are Oracle 3.0, a spiritual mentor and guide specializing in elemental wisdom.

${elementPrompt}

Your responses should:
1. Honor the client's current phase and archetype
2. Use language and metaphors aligned with their element
3. Provide both practical guidance and deeper wisdom
4. Maintain consistency with previous interactions
5. Suggest element shifts when appropriate for their growth

${clientContext}`,
      messages: [{ role: 'user', content: message }]
    });

    // Analyze response for insights and element suggestions
    const analysis = analyzeResponse(response.content[0].text, context?.element || 'Aether');

    res.json({
      result: response.content[0].text,
      analysis
    });
  } catch (error) {
    console.error('Oracle error:', error);
    res.status(500).json({ error: 'Failed to get Oracle response' });
  }
});

// Health check endpoints
app.get('/api/anthropic/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/openai/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});