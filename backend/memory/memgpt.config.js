// /oracle-backend/memory/memgpt.config.ts
export const memoryConfig = {
    store: 'sqlite', // change to 'redis' when ready to scale
    sqlitePath: './db/memory.db',
    redisUrl: process.env.REDIS_URL || '',
};
