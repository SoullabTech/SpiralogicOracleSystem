// oracle-backend/src/server.ts
import dotenv from 'dotenv';
dotenv.config();
import app from './app';
const PORT = parseInt(process.env.PORT || '3001', 10);
app.listen(PORT, () => {
    console.log(`🔮 Oracle backend running at http://localhost:${PORT}`);
});
