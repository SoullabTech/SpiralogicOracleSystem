// src/app.ts

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

import { authenticate } from './middleware/authenticate';
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

const app = express();
app.use(cors());
app.use(express.json());

// Public routes
app.use('/', userProfileRouter);
app.use('/api/oracle', oracleRouter);
app.use('/api/oracle/facet-lookup', facetRouter);
app.use('/api/oracle/facet-map', facetMapRouter);
app.use('/api/oracle/story-generator', storyGeneratorRouter);
app.use('/api/feedback', feedbackRouter);

// Ingestion
app.use('/api/notion/ingest', notionIngestRoutes);

// Protected routes
app.use('/api/oracle/insight-history', authenticate, insightHistoryRouter);
app.use('/api/survey', authenticate, surveyRouter);
app.use('/api/oracle/memory', authenticate, memoryRouter);

// Health check
app.get('/', (_req, res) => {
  res.send('🧠 Spiralogic Oracle API is running');
});

// Swagger docs (optional)
try {
  const swaggerDocument = YAML.load(path.join(__dirname, 'docs', 'oracle.openapi.yaml'));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (err) {
  console.warn('⚠️ Swagger load failed:', err);
}

export { app };
