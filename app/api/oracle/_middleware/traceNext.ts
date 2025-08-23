// Stub middleware for tracing - disabled for build
import { NextRequest, NextResponse } from 'next/server';

export function withTraceNext(handler: any) {
  return async function(req: NextRequest, context?: any) {
    // Simple passthrough for build compatibility
    return handler(req, context);
  };
}

export default withTraceNext;