// src/index.ts

// 🟢 EARLY boot log so we know this file ran first
console.log('🟢 booting index.ts…');

import util from 'node:util';

// 🔍 GLOBAL ERROR TRAPS — deep‑inspect any Rejection/Exception
process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 GLOBAL Unhandled Rejection at:', promise);
  console.error('🔥 REASON:', util.inspect(reason, { depth: null, colors: true }));
});
process.on('uncaughtException', (err) => {
  console.error('💥 GLOBAL Uncaught Exception:', err.stack || err);
});

// now import your app (TS‐Node will resolve .js → .ts)
import './server.js';
