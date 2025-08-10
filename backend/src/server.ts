// Spiralogic Oracle Backend Server - Production Ready
import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import apiRouter from './api';
import { logger } from './utils/logger';
import { validateEnvironmentVariables } from './utils/sharedUtilities';

// Validate required environment variables
validateEnvironmentVariables([
  'JWT_SECRET',
  'SUPABASE_URL', 
  'SUPABASE_ANON_KEY',
  'REDIS_URL'
]);

const PORT = parseInt(process.env.PORT || '3001', 10);

// Mount unified API router
app.use('/api', apiRouter);

// Legacy route redirect for backward compatibility
app.use('/api/oracle', (req, res) => {
  res.status(301).json({
    success: false,
    errors: ['This endpoint has moved. Please use /api/v1/personal-oracle instead'],
    redirect: '/api/v1/personal-oracle'
  });
});

// Start server
app.listen(PORT, () => {
  logger.info('🔮 Spiralogic Oracle Backend Server Started', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    version: process.env.APP_VERSION || '1.0.0',
    apiVersion: 'v1'
  });
  
  console.log(`🔮 Spiralogic Oracle running at http://localhost:${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api/v1`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/v1/health`);
});
