// oracle-backend/src/server.ts
import oracleRoutes from './routes/oracle.routes';
import dotenv from 'dotenv';
dotenv.config();

import app from './app';

const PORT = parseInt(process.env.PORT || '3001', 10);
app.use('/api/oracle', oracleRoutes); // exposes POST /api/oracle/respond

app.listen(PORT, () => {
  console.log(`🔮 Oracle backend running at http://localhost:${PORT}`);
});
