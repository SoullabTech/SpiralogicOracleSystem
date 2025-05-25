// src/lib/middleware.ts
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

const limiter = rateLimit({ /* same options */ });
export function withSecurity(fn: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    await new Promise((resolve, reject) =>
      cors({ origin: process.env.CORS_ORIGIN?.split(',') })(req as any, res as any, (err) =>
        err ? reject(err) : resolve(null)
      )
    );
    await new Promise((resolve, reject) =>
      limiter(req as any, res as any, (err) => (err ? reject(err) : resolve(null)))
    );
    helmet()(req as any, res as any, () => {});
    return fn(req, res);
  };
}
