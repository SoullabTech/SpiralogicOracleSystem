import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import OpenAI from 'openai';

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'x-api-key']
}));

app.use(express.json());

const requestSchema = z.object({
  model: z.string(),
  messages: z.array(z.object({
    role: z.enum(['system', 'user', 'assistant']),
    content: z.string()
  })),
  temperature: z.number().optional(),
  max_tokens: z.number().optional()
});

const oracleRequestSchema = z.object({
  userId: z.string().optional(),
  input: z.string(),
  context: z.object({
    element: z.enum(['fire', 'water', 'earth', 'air', 'aether']).optional(),
    phase: z.enum(['exploration', 'growth', 'integration', 'mastery']).optional(),
    archetype: z.string().optional(),
    focusAreas: z.array(z.string()).optional()
  }).optional()
});

function generateSystemPrompt(userId: string, context?: any) {
  let prompt = `You are Oracle 3.0, an AI mentor and guide based on the Spiralogic framework. 
User ID: ${userId || 'guest'}

Your core principles:
1. Provide transformative guidance aligned with the user's current phase and element
2. Maintain consistency in your archetypal approach
3. Balance practical advice with spiritual wisdom
4. Adapt your communication style to match the user's needs`;

  if (context) {
    prompt += `\n\nContext for this interaction:
- Element: ${context.element || 'Not determined'}
- Phase: ${context.phase || 'Initial exploration'}
- Archetype: ${context.archetype || 'Exploring'}
- Focus Areas: ${context.focusAreas?.join(', ') || 'General growth'}`;
  }

  return prompt;
}

const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY
});

app.post('/api/openai/chat/completions', async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
      return res.status(401).json({ error: { message: 'API key is required' } });
    }

    const validatedBody = requestSchema.parse(req.body);

    const response = await openai.chat.completions.create({
      ...validatedBody,
      model: 'gpt-4-turbo-preview' // Override model to use the latest GPT-4
    });

    res.json(response);
  } catch (error) {
    console.error('Proxy error:', error);
    if (error instanceof OpenAI.APIError) {
      return res.status(error.status).json(error);
    }
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
});

app.post('/api/oracle', async (req, res) => {
  try {
    const { userId, input, context } = oracleRequestSchema.parse(req.body);

    if (!input) {
      return res.status(400).json({ error: 'Missing input field' });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { 
          role: 'system', 
          content: generateSystemPrompt(userId || 'guest', context)
        },
        { role: 'user', content: input }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const responseText = response.choices[0].message.content;
    const analysis = analyzeOracleResponse(responseText || '');

    res.json({
      result: responseText,
      analysis
    });
  } catch (error) {
    console.error('Oracle error:', error);
    if (error instanceof OpenAI.APIError) {
      return res.status(error.status).json({ 
        error: 'Oracle processing failed', 
        details: error.message 
      });
    }
    res.status(500).json({ error: 'Oracle processing failed' });
  }
});

function analyzeOracleResponse(content: string) {
  const elementPatterns = {
    fire: ['vision', 'transform', 'passion', 'action', 'motivation'],
    water: ['feel', 'emotion', 'intuition', 'flow', 'depth'],
    earth: ['ground', 'practical', 'stable', 'material', 'physical'],
    air: ['think', 'connect', 'communicate', 'learn', 'understand'],
    aether: ['integrate', 'whole', 'transcend', 'spirit', 'unity']
  };

  const insightPatterns = {
    reflection: ['reflect', 'notice', 'observe', 'awareness'],
    challenge: ['challenge', 'growth', 'stretch', 'overcome'],
    guidance: ['suggest', 'try', 'practice', 'implement'],
    integration: ['combine', 'synthesize', 'integrate', 'merge']
  };

  let detectedElement = null;
  let detectedInsight = null;

  for (const [element, patterns] of Object.entries(elementPatterns)) {
    if (patterns.some(pattern => content.toLowerCase().includes(pattern))) {
      detectedElement = element;
      break;
    }
  }

  for (const [insight, patterns] of Object.entries(insightPatterns)) {
    if (patterns.some(pattern => content.toLowerCase().includes(pattern))) {
      detectedInsight = insight;
      break;
    }
  }

  return {
    element: detectedElement,
    insightType: detectedInsight
  };
}

app.get('/api/openai/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`OpenAI proxy server running on port ${PORT}`);
});