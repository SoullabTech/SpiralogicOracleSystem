import { ensureTraceId, now, durationMs } from '@/lib/shared/observability/trace';
import { logInfo } from '@/lib/shared/observability/logger';

export function withTraceNext<T extends (...args:any[])=>any>(route: string, handler: T) {
  return async (req: Request, ...rest: any[]) => {
    const start = now();
    const traceId = ensureTraceId(req.headers as any);
    try {
      const res = await handler(req, ...rest);
      logInfo({ traceId, route, latencyMs: durationMs(start) }, 'route_ok');
      return res;
    } catch (err: any) {
      logInfo({ traceId, route, latencyMs: durationMs(start) }, 'route_error');
      throw err;
    }
  };
}