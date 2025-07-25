// oracle-backend/src/app.ts

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import facetMapRouter from './routes/facetMap.routes';
import memoryRouter from './routes/memory.routes';
import enhancedMemoryRouter from './routes/memory.routes.enhanced';
import soulMemoryRouter from './routes/soulMemory.routes';
import authRouter from './routes/auth';
import oracleRouter from './routes/oracle';
import testRouter from './routes/test.routes';
import { authenticate } from './middleware/authenticate';

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/oracle/facet-map', facetMapRouter);
app.use('/api/oracle/memory', authenticate, enhancedMemoryRouter); // Enhanced with Soul Memory integration
app.use('/api/oracle/memory-legacy', authenticate, memoryRouter); // Legacy routes for backwards compatibility
app.use('/api/soul-memory', soulMemoryRouter);
app.use('/api/oracle', oracleRouter);

// Test routes (development only)
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/test', testRouter);
}

// Root
app.get('/', (_req, res) => {
  res.send('🧠 Spiralogic Oracle Backend is Alive');
});

export default app;
// Trigger Railway deploy
