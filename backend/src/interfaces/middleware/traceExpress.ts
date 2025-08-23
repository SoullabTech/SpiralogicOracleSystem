import type { Request, Response, NextFunction } from 'express';
import { ensureTraceId } from '../../../../../lib/shared/observability/trace';

export function traceExpress(req: Request, res: Response, next: NextFunction) {
  const id = ensureTraceId(req.headers as any);
  res.setHeader('x-trace-id', id);
  (req as any).traceId = id;
  next();
}