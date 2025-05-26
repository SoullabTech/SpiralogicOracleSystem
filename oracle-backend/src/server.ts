// oracle-backend/src/server.ts

import app from './app';

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Oracle Backend Server running on http://localhost:${PORT}`);
});
