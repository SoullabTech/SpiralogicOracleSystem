// src/server.ts
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import rateLimit from 'express-rate-limit';
import cron from 'node-cron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import { env } from '../src/lib/config';
import memoryRoutes from './routes/memory.routes';
import surveyRoutes from './routes/surveyRoutes.js';
import oracleRoutes from './routes/oracleRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import router from './routes/index.js';

import { initializeScheduledTasks } from '../server/tasks/scheduledTasks';
import { runScheduledAnalysis } from '../server/tasks/scheduledAnalysis';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5001;
const isProduction = process.env.NODE_ENV === 'production';

// Trust proxy
app.enable('trust proxy');

// Rate limiter
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health',
  keyGenerator: (req) => {
    const xForwardedFor = req.headers['x-forwarded-for'];
    return Array.isArray(xForwardedFor)
      ? xForwardedFor[0]
      : typeof xForwardedFor === 'string'
      ? xForwardedFor.split(',')[0].trim()
      : req.ip || req.socket.remoteAddress || 'unknown';
  },
});

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: isProduction,
    crossOriginEmbedderPolicy: isProduction,
    crossOriginOpenerPolicy: isProduction,
    crossOriginResourcePolicy: isProduction,
  })
);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(limiter);
app.use(compression());
app.use(
  morgan(process.env.MORGAN_FORMAT || 'combined', {
    skip: (req) => req.path === '/health',
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Scheduled tasks
initializeScheduledTasks();
cron.schedule('0 */12 * * *', async () => {
  console.log('🔄 Running scheduled feedback analysis...');
  await runScheduledAnalysis();
});

// Static files (prod only)
if (isProduction) {
  app.use(express.static(join(__dirname, '../../dist/client')));
}

// Routes
app.use('/api', router);
app.use('/api/survey', surveyRoutes);
app.use('/api/oracle', oracleRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/memory', memoryRoutes);
console.log('🧠 Memory routes mounted at /api/memory');

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Serve frontend in production
if (isProduction) {
  app.get('*', (_req, res) => {
    res.sendFile(join(__dirname, '../../dist/client/index.html'));
  });
}

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', {
    name: err.name,
    message: err.message,
    stack: isProduction ? undefined : err.stack,
  });
  res.status(500).json({
    error: isProduction ? 'Internal Server Error' : err.message,
  });
});

// Handle system-level exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  if (isProduction) process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  if (isProduction) process.exit(1);
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Performing graceful shutdown...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;