import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-api-key', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Initialize Supabase admin client
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Request validation schemas
const memorySchema = z.object({
  userId: z.string().uuid(),
  content: z.string().min(1),
  type: z.enum(['insight', 'pattern', 'reflection']),
  metadata: z.record(z.any()).optional(),
  strength: z.number().min(0).max(1)
});

const clientSchema = z.object({
  clientId: z.string().uuid(),
  element: z.enum(['fire', 'water', 'earth', 'air', 'aether']),
  archetype: z.string().min(1)
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err instanceof z.ZodError) {
    return res.status(400).json({
      error: 'Validation error',
      details: err.errors
    });
  }
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Memory endpoints
app.post('/api/memories', async (req, res, next) => {
  try {
    const memory = memorySchema.parse(req.body);
    
    const { data, error } = await supabase
      .from('memories')
      .insert(memory)
      .select()
      .single();
      
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    next(error);
  }
});

app.get('/api/memories/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { type, limit } = req.query;
    
    let query = supabase
      .from('memories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (type) {
      query = query.eq('type', type);
    }
    
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Client endpoints
app.post('/api/clients/seed', async (req, res, next) => {
  try {
    const clientData = clientSchema.parse(req.body);
    
    // Create initial memory blocks
    const blocks = [
      {
        user_id: clientData.clientId,
        label: 'profile',
        value: JSON.stringify({
          element: clientData.element,
          archetype: clientData.archetype,
          created_at: new Date().toISOString()
        }),
        importance: 10,
        type: 'profile'
      },
      {
        user_id: clientData.clientId,
        label: 'element_affinity',
        value: `Primary elemental affinity: ${clientData.element}`,
        importance: 8,
        type: 'insight'
      },
      {
        user_id: clientData.clientId,
        label: 'archetype_insight',
        value: `Core archetype expression: ${clientData.archetype}`,
        importance: 8,
        type: 'insight'
      }
    ];
    
    const { error: blockError } = await supabase
      .from('memory_blocks')
      .insert(blocks);
      
    if (blockError) throw blockError;
    
    res.json({
      status: 'success',
      message: 'Client memory seeded successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});