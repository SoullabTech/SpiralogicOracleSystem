// oracle-backend/src/app.ts

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import facetMapRouter from './routes/facetMap.routes';
import memoryRouter from './routes/memory.routes';
import authRouter from './routes/auth';
import oracleRouter from './routes/oracle';
import { authenticate } from './middleware/authenticate';

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/oracle/facet-map', facetMapRouter);
app.use('/api/oracle/memory', authenticate, memoryRouter);
app.use('/api/oracle', oracleRouter);

// Root
app.get('/', (_req, res) => {
  res.send('🧠 Spiralogic Oracle Backend is Alive');
});

export default app;
