// index.js - Water Agent Express Server
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import Joi from 'joi';
import winston from 'winston';
import dotenv from 'dotenv';
import { waterAgent } from '../waterAgent.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: 10,
  duration: 60,
});

// Logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'water-agent.log' })
  ]
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    res.status(429).json({ error: 'Too many requests' });
  }
});

// Validation schemas
const oracleResponseSchema = Joi.object({
  input: Joi.string().min(1).max(1000).required(),
  userContext: Joi.object({
    userId: Joi.string(),
    sessionId: Joi.string(),
    spiralPhase: Joi.string(),
    previousInteractions: Joi.array(),
    emotionalHistory: Joi.array()
  }).optional()
});

// Routes
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    archetype: 'Water',
    capabilities: [
      'Emotional Intelligence',
      'Flow State Detection', 
      'Trauma-Informed Processing',
      'Shadow Work Integration'
    ],
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

app.post('/emotional-prompt', async (req, res) => {
  try {
    const { userContext } = req.body;
    const result = await waterAgent.getEmotionalPrompt(userContext);
    
    logger.info('Emotional prompt generated', { userContext });
    res.json(result);
  } catch (error) {
    logger.error('Emotional prompt error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/oracle-response', async (req, res) => {
  try {
    const { error, value } = oracleResponseSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    const { input, userContext } = value;
    const result = await waterAgent.getOracleResponse(input, userContext);
    
    logger.info('Water oracle response generated', { 
      input: input.substring(0, 50), 
      emotionalState: result.emotionalState?.primary,
      flowState: result.flowState?.present 
    });
    res.json(result);
  } catch (error) {
    logger.error('Water oracle response error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  logger.info(`🌊 Water Agent active on port ${PORT}`);
  logger.info('Environment:', process.env.NODE_ENV || 'development');
});