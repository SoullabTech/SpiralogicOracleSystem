# Gap Analysis & Technical Debt
_Generated: 2025-08-23_

## Schema & Data Issues

### Duplicate/Inconsistent Schemas
❌ **Multiple user tables**:
- `users` (legacy auth)
- `user_profiles` (current active)
- `oracle_preferences` (settings subset)

**Impact**: Data sync issues, query complexity
**Fix**: Migrate all data to `user_profiles`, deprecate others
**Timeline**: 2 weeks

❌ **Telemetry fragmentation**:
- `telemetry` (general events)
- `api_telemetry` (API-specific)
- Inline logging in various routes

**Impact**: Analytics gaps, performance overhead
**Fix**: Unified telemetry pipeline with structured events
**Timeline**: 1 week

❌ **Memory storage duplication**:
- `soul_memories` (Oracle weaving)
- `oracle_memories` (legacy?)
- `memory_items` (file uploads)

**Impact**: Confusion, storage bloat
**Fix**: Audit and merge related tables
**Timeline**: 1 week

### Missing Database Constraints

❌ **No foreign key constraints**:
```sql
-- Missing constraints
ALTER TABLE micro_memories 
ADD CONSTRAINT fk_user_id 
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

ALTER TABLE dreams 
ADD CONSTRAINT fk_user_id 
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

ALTER TABLE whisper_weights 
ADD CONSTRAINT fk_user_id 
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
```

❌ **Missing NOT NULL constraints**:
```sql
ALTER TABLE micro_memories ALTER COLUMN content SET NOT NULL;
ALTER TABLE dreams ALTER COLUMN title SET NOT NULL;
ALTER TABLE whisper_weights ALTER COLUMN weights SET NOT NULL;
```

❌ **Missing unique constraints**:
```sql
ALTER TABLE whisper_weights 
ADD CONSTRAINT unique_user_weights 
UNIQUE (user_id);
```

### Incomplete RLS Policies

❌ **Tables missing RLS**:
- `telemetry` - Should restrict to own events for privacy
- `api_telemetry` - Admin-only access needed
- `oracle_preferences` - User isolation missing

```sql
-- Add missing RLS
ALTER TABLE telemetry ENABLE ROW LEVEL SECURITY;
CREATE POLICY telemetry_user_isolation ON telemetry 
USING (user_id = auth.uid());

ALTER TABLE api_telemetry ENABLE ROW LEVEL SECURITY;  
CREATE POLICY api_telemetry_admin_only ON api_telemetry
USING (auth.jwt() ->> 'email' IN (SELECT unnest(string_to_array(current_setting('app.admin_emails'), ','))));
```

❌ **Overly permissive policies**:
- `soul_memories` allows all reads - should be user-scoped
- `beta_participants` doesn't restrict admin actions

## API & Validation Gaps

### Missing Request Validation

❌ **Zod schemas incomplete**:
```typescript
// Missing validations
const MicroMemorySchema = z.object({
  content: z.string().min(1).max(500), // No length limit currently
  nd_tags: z.array(z.string()).max(10), // No tag limit
  element: z.enum(['fire', 'water', 'earth', 'air', 'aether']).optional(), // Not validated
  energy_level: z.number().min(1).max(10).optional() // Missing validation
})
```

❌ **File upload validation**:
```typescript
// Missing in upload routes
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

if (!ALLOWED_TYPES.includes(file.type)) {
  throw new Error('File type not allowed')
}
if (file.size > MAX_FILE_SIZE) {
  throw new Error('File too large')
}
```

### Missing Error Handling

❌ **Database connection failures**:
```typescript
// Add to all API routes
try {
  const result = await supabase.from('table').select()
  if (result.error) throw result.error
} catch (error) {
  if (error.code === 'PGRST116') {
    // Table doesn't exist
    return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 })
  }
  throw error
}
```

❌ **Rate limiting bypass**:
- Admin routes lack rate limiting
- Webhook endpoints exposed
- File upload routes unlimited

```typescript
// Add rate limiting
import { rateLimit } from '@/lib/rateLimit'

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown'
  const rateLimitResult = await rateLimit(ip, {
    window: 60 * 1000, // 1 minute
    max: 10 // 10 requests per minute
  })
  
  if (!rateLimitResult.success) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }
}
```

### Missing Response Types

❌ **Inconsistent API responses**:
```typescript
// Standardize all API responses
interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    message: string
    code: string
    details?: any
  }
  meta?: {
    timestamp: string
    version: string
    requestId: string
  }
}
```

## Frontend Issues

### Missing Error Boundaries

❌ **Component-level error handling**:
```typescript
// Add to critical components
class WhispersErrorBoundary extends Component {
  state = { hasError: false }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true }
  }
  
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Whispers component error:', error, info)
    // Send to telemetry
  }
  
  render() {
    if (this.state.hasError) {
      return <WhispersFallback />
    }
    return this.props.children
  }
}
```

### Missing Loading States

❌ **Skeleton screens needed**:
- Dreams timeline
- Whispers list
- Admin dashboards
- Upload progress

```typescript
// Example skeleton component
function DreamTimelineSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      ))}
    </div>
  )
}
```

### Missing Empty States

❌ **Empty state components needed**:
- No dreams recorded
- No whispers available
- Admin panel first visit
- Search results empty

```typescript
function EmptyDreams() {
  return (
    <div className="text-center py-12">
      <MoonIcon className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">No dreams yet</h3>
      <p className="mt-1 text-sm text-gray-500">Record your first dream to start your journey</p>
      <div className="mt-6">
        <button className="...">Record Dream</button>
      </div>
    </div>
  )
}
```

## Performance Issues

### Missing Optimizations

❌ **Database query optimization**:
```sql
-- Missing indexes
CREATE INDEX idx_micro_memories_user_created ON micro_memories(user_id, created_at DESC);
CREATE INDEX idx_dreams_user_created ON dreams(user_id, created_at DESC);
CREATE INDEX idx_whisper_weights_user ON whisper_weights(user_id);
CREATE INDEX idx_soul_memories_tags ON soul_memories USING GIN(tags);
```

❌ **React rendering optimization**:
```typescript
// Missing memoization
const WhispersList = memo(({ whispers, onInteraction }) => {
  const sortedWhispers = useMemo(() => 
    whispers.sort((a, b) => b.score - a.score), 
    [whispers]
  )
  
  return (
    <div>
      {sortedWhispers.map(whisper => (
        <WhisperCard key={whisper.id} whisper={whisper} onInteraction={onInteraction} />
      ))}
    </div>
  )
})
```

❌ **Bundle optimization**:
- No dynamic imports for admin panel
- Heavy libraries loaded upfront
- Missing tree-shaking configuration

```typescript
// Add dynamic imports
const AdminPanel = lazy(() => import('@/components/admin/AdminLayout'))
const DreamEditor = lazy(() => import('@/components/dreams/DreamEditor'))

// In component
<Suspense fallback={<LoadingSkeleton />}>
  <AdminPanel />
</Suspense>
```

### Missing Caching

❌ **API response caching**:
```typescript
// Add cache headers to stable endpoints
export async function GET(req: Request) {
  const response = NextResponse.json(data)
  
  // Cache for 5 minutes
  response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600')
  
  return response
}
```

❌ **Client-side caching**:
```typescript
// Add React Query/SWR for data caching
const { data: whispers, error, mutate } = useSWR(
  `/api/whispers?userId=${userId}`,
  fetcher,
  {
    revalidateOnFocus: false,
    dedupingInterval: 60000 // 1 minute
  }
)
```

## Security Gaps

### Missing Input Sanitization

❌ **XSS prevention**:
```typescript
import DOMPurify from 'isomorphic-dompurify'

// Sanitize user content
function sanitizeContent(content: string): string {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
    ALLOWED_ATTR: []
  })
}
```

❌ **SQL injection prevention**:
```typescript
// Use parameterized queries everywhere
const { data, error } = await supabase
  .from('micro_memories')
  .select('*')
  .eq('user_id', userId) // ✅ Parameterized
  .ilike('content', `%${searchTerm}%`) // ❌ Could be vulnerable

// Better:
const { data, error } = await supabase
  .from('micro_memories') 
  .select('*')
  .eq('user_id', userId)
  .textSearch('content', searchTerm.replace(/[^\w\s]/g, ''))
```

### Missing Authentication Checks

❌ **Middleware gaps**:
```typescript
// Add to all protected routes
export async function middleware(req: NextRequest) {
  const token = req.cookies.get('sb-access-token')
  
  if (!token && req.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Verify token is valid
  const { data, error } = await supabase.auth.getUser(token.value)
  if (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
}
```

## Monitoring & Observability

### Missing Metrics

❌ **Performance monitoring**:
```typescript
// Add performance tracking
import { performance } from 'perf_hooks'

export async function POST(req: Request) {
  const start = performance.now()
  
  try {
    const result = await processRequest(req)
    const duration = performance.now() - start
    
    // Track successful requests
    metrics.histogram('api.request.duration', duration, {
      route: '/api/whispers/context',
      status: 'success'
    })
    
    return NextResponse.json(result)
  } catch (error) {
    const duration = performance.now() - start
    
    // Track failed requests
    metrics.histogram('api.request.duration', duration, {
      route: '/api/whispers/context', 
      status: 'error'
    })
    
    throw error
  }
}
```

❌ **User behavior tracking**:
```typescript
// Add user interaction tracking
function trackUserAction(action: string, properties: Record<string, any>) {
  if (process.env.NODE_ENV === 'production') {
    analytics.track(action, {
      userId: user.id,
      timestamp: new Date().toISOString(),
      ...properties
    })
  }
}

// Usage in components
const handleWhisperClick = (whisperId: string) => {
  trackUserAction('whisper_clicked', { whisperId, source: 'recap' })
  onWhisperSelect(whisperId)
}
```

### Missing Alerts

❌ **Error rate alerts**:
```typescript
// Set up error threshold monitoring
const ERROR_THRESHOLD = 0.05 // 5%
const WINDOW_MINUTES = 5

setInterval(async () => {
  const errorRate = await getErrorRate(WINDOW_MINUTES)
  if (errorRate > ERROR_THRESHOLD) {
    await sendAlert('High error rate', {
      rate: errorRate,
      threshold: ERROR_THRESHOLD,
      window: WINDOW_MINUTES
    })
  }
}, 60000) // Check every minute
```

## Priority Matrix

### Critical (Fix immediately)
1. ❌ Missing RLS on telemetry tables
2. ❌ No foreign key constraints
3. ❌ Rate limiting bypass on uploads
4. ❌ XSS vulnerabilities in user content

### High (Fix within 2 weeks)  
1. ❌ Duplicate user tables consolidation
2. ❌ Missing error boundaries
3. ❌ Database query optimization
4. ❌ API response standardization

### Medium (Fix within month)
1. ❌ Empty state components
2. ❌ Client-side caching
3. ❌ Bundle optimization
4. ❌ Performance monitoring

### Low (Backlog)
1. ❌ Advanced analytics
2. ❌ Automated testing
3. ❌ Documentation updates
4. ❌ Code cleanup