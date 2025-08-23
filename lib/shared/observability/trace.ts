import { randomUUID } from 'node:crypto';

export function ensureTraceId(headers: Headers | Record<string,string>) {
  const get = (k: string) => (headers instanceof Headers ? headers.get(k) : headers[k]);
  const set = (k: string, v: string) => {
    if (headers instanceof Headers) headers.set(k, v);
    else headers[k] = v;
  };
  let id = get('x-trace-id') || get('x-request-id');
  if (!id) { id = randomUUID(); set('x-trace-id', id); }
  return id;
}

export function now() { return performance.now ? performance.now() : Date.now(); }
export function durationMs(start: number) { return Math.round((now() - start) * 1000) / 1000; }