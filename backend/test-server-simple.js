const express = require('express');
require('dotenv').config({ override: false });

const app = express();
const PORT = parseInt(process.env.APP_PORT || process.env.PORT || "3001", 10);

console.log('[test] Environment check:', { 
  APP_PORT: process.env.APP_PORT, 
  PORT: process.env.PORT 
});
console.log('[test] Chosen port:', PORT);

app.get('/test', (req, res) => {
  res.json({ message: 'Test server working', port: PORT });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[test] Server listening on :${PORT}`);
});