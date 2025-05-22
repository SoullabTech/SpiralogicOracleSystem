// backend/src/server.ts

import express, { Request, Response } from 'express';
import 'tsconfig-paths/register';
import 'dotenv/config';
import cors from 'cors';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import util from 'node:util';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

import { supabase } from './lib/supabaseClient';
import { authenticate } from './middleware/authenticate';
import logger from './utils/logger';

// Route imports
import userProfileRouter from './routes/userProfile.routes';
import oracleRouter from './routes/oracle.routes';
import facetRouter from './routes/facet.routes';
import facetMapRouter from './routes/facetMap.routes';
import insightHistoryRouter from './routes/insightHistory.routes';
import storyGeneratorRouter from './routes/storyGenerator.routes';
import surveyRouter from './routes/survey.routes';
import memoryRouter from './routes/memory.routes';
import feedbackRouter from './routes/feedback.routes';
import notionIngestRoutes from './routes/notionIngest.routes';
import personalRouter from './routes/oracle/personal.routes';
import fieldpulseRouter from './routes/fieldpulse.routes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 5001;

// Global Middleware
app.use(cors());
app.use(express.json());

// Public Endpoints
app.get('/', (_req: Request, res: Response) => res.send('🧠 Spiralogic Oracle backend is alive.'));
app.get('/health', (_req: Request, res: Response) => res.status(200).send({ status: 'ok' }));
app.get('/test-supabase', async (_req: Request, res: Response) => {
  const { data, error } = await supabase.from('insight_history').select('*').limit(1);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ sampleRow: data });
});

// Mount Routers
app.use('/api/user', userProfileRouter);
app.use('/api/profile', userProfileRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/notion/ingest', notionIngestRoutes);
app.use('/api/fieldpulse', fieldpulseRouter);

// Oracle + Protected Routes
app.use('/api/oracle', oracleRouter);
app.use('/api/oracle/personal', personalRouter);
app.use('/api/oracle/facet-lookup', facetRouter);
app.use('/api/oracle/facet-map', facetMapRouter);
app.use('/api/oracle/story-generator', storyGeneratorRouter);
app.use('/api/oracle/insight-history', authenticate, insightHistoryRouter);
app.use('/api/survey', authenticate, surveyRouter);
app.use('/api/oracle/memory', authenticate, memoryRouter);

// Swagger UI (optional)
try {
  const swaggerDocument = YAML.load(path.join(__dirname, 'docs', 'oracle.openapi.yaml'));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  logger.info(`📘 Swagger UI available at http://localhost:${PORT}/docs`);
} catch (err) {
  logger.warn('⚠️ Swagger YAML could not be loaded. Skipping /docs.');
}

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global Error Handlers
process.on('unhandledRejection', (reason, promise) => {
  logger.error('🔥 Unhandled Rejection at:', promise, 'reason:', util.inspect(reason));
  process.exit(1);
});

process.on('uncaughtException', (err: Error) => {
  logger.error('💥 Uncaught Exception:', err.stack || err.message);
  process.exit(1);
});

process.on('SIGINT', () => {
  logger.info('🛑 Gracefully shutting down...');
  process.exit(0);
});

// Start Server
app.listen(PORT, () => {
  logger.info(`🚀 Oracle backend running at http://localhost:${PORT}`);
});
