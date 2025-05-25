import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import routes from './routes/routes';
import dreamQueryRouter from './routes/oracle/dreamQuery';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

// Warn on missing env vars
if (!process.env.OPENAI_API_KEY) {
  console.warn('⚠️ Missing OPENAI_API_KEY in .env');
}

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api', routes);
app.use('/api/oracle', dreamQueryRouter);

app.get('/', (_req, res) => {
  res.send('🔮 Soullab Oracle API is live');
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV });
});

app.listen(PORT, () => {
  console.log(`🚀 Oracle backend is running at http://localhost:${PORT}`);
});
