// oracle-backend/server.ts

import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import util from 'node:util';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

// === Local Imports ===
import { supabase } from './lib/supabaseClient';
import { authenticate } from './middleware/authenticate';
import logger from './utils/logger';

// === Route Modules ===
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

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = Number(process.env.PORT) || 5001;

// === Middleware ===
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// === Root Health Check ===
app.get('/', (_req: Request, res: Response) => {
  res.send('🧠 Spiralogic Oracle backend is alive.');
});

// === Supabase Connection Test ===
app.get('/test-supabase', async (_req: Request, res: Response) => {
  const { data, error } = await supabase.from('insight_history').select('*').limit(1);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ sampleRow: data });
});

// === Main API Routes ===
app.use('/api/oracle', oracleRouter);
app.use('/api/oracle/personal', personalRouter);
app.use('/api/oracle/facet-lookup', facetRouter);
app.use('/api/oracle/facet-map', facetMapRouter);
app.use('/api/oracle/story-generator', storyGeneratorRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/user', userProfileRouter);
app.use('/api/notion/ingest', notionIngestRoutes);
app.use('/api/oracle/insight-history', authenticate, insightHistoryRouter);
app.use('/api/survey', authenticate, surveyRouter);
app.use('/api/oracle/memory', authenticate, memoryRouter);
app.use('/api/fieldpulse', fieldpulseRouter);

// === Swagger UI ===
try {
  const swaggerDocument = YAML.load(path.join(__dirname, 'docs', 'oracle.openapi.yaml'));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  logger.info(`📘 Swagger available at http://localhost:${PORT}/docs`);
} catch (e) {
  logger.warn('⚠️ Swagger docs could not be loaded.');
}

// === Fallback 404 ===
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// === Global Error Handling ===
process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 Unhandled Rejection at:', promise);
  console.error('Reason:', reason instanceof Error ? reason.stack : util.inspect(reason));
});

process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err instanceof Error ? err.stack : util.inspect(err));
});

process.on('SIGINT', () => {
  console.log('🛑 Gracefully shutting down...');
  process.exit();
});

// === Start Server ===
app.listen(PORT, () => {
  logger.info(`🚀 Oracle backend running at http://localhost:${PORT}`);
});
