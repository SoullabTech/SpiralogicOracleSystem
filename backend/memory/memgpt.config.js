"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memoryConfig = void 0;
// /oracle-backend/memory/memgpt.config.ts
exports.memoryConfig = {
    store: 'sqlite', // change to 'redis' when ready to scale
    sqlitePath: './db/memory.db',
    redisUrl: process.env.REDIS_URL || '',
};
