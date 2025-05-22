import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import routes from './routes/routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Mount all routes
app.use('/api', routes);

// Root test endpoint
app.get('/', (req, res) => {
  res.send('🔮 Soullab Oracle API is live');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Oracle backend is running on http://localhost:${PORT}`);
});
