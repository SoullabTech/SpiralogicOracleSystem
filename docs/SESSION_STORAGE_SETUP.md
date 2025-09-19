# Session Storage Setup for Beta Testing

## Overview
Session storage is now fully configured to collect and persist oracle session data during beta testing. All sessions are automatically stored in Supabase when a userId is provided.

## Components

### 1. Session Storage Service
- **Location**: `/lib/services/sessionStorage.ts`
- **Purpose**: Handles all session persistence and retrieval
- **Features**:
  - Automatic Supabase connection management
  - Session storage with metadata
  - User session history retrieval
  - Analytics data collection
  - Connection health monitoring

### 2. Beta Analytics Service
- **Location**: `/lib/services/betaAnalytics.ts`
- **Purpose**: Provides analytics and insights from collected sessions
- **Features**:
  - User journey tracking
  - Elemental evolution analysis
  - Spiral path visualization
  - Growth pattern insights
  - Beta metrics reporting

### 3. Database Schema
- **Migration**: `/supabase/migrations/20250118_create_oracle_sessions.sql`
- **Table**: `oracle_sessions`
- **Key Fields**:
  - `session_id`: Unique session identifier
  - `user_id`: User identifier for tracking
  - `query`: User's input question
  - `response`: Full oracle response (JSON)
  - `elements`: Elemental balance data
  - `spiral_stage`: Current spiral position
  - `reflection`, `practice`, `archetype`: Oracle outputs
  - `metadata`: Additional session context

## Setup Instructions

### 1. Environment Variables
Ensure the following are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key  # For server-side operations
```

### 2. Database Migration
Run the migration in your Supabase SQL editor:

```bash
# Copy the contents of:
/supabase/migrations/20250118_create_oracle_sessions.sql

# Paste and execute in Supabase SQL editor
```

### 3. Testing Connection
Test the setup using the provided script:

```bash
npm run test:session-storage
# or
npx tsx scripts/testSessionStorage.ts
```

## API Integration

### Oracle Beta Route
The `/api/oracle-beta` route automatically stores sessions when:
1. A `userId` is provided in the request
2. Supabase credentials are configured
3. The connection is successful

Example request:
```javascript
fetch('/api/oracle-beta', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: "How can I find inner peace?",
    userId: "user_123"  // Required for persistence
  })
})
```

Response includes:
```json
{
  "sessionId": "oracle-xxxxx",
  "timestamp": "2025-01-18T...",
  "elementalBalance": {...},
  "spiralStage": {...},
  "reflection": "...",
  "practice": "...",
  "archetype": "...",
  "persisted": true  // Indicates storage success
}
```

## Monitoring & Analytics

### View Session Data
Sessions can be viewed in Supabase:
1. Navigate to Table Editor
2. Select `oracle_sessions` table
3. Sessions are stored with full context

### Analytics Queries
Use the provided view for analytics:
```sql
SELECT * FROM oracle_session_analytics
WHERE user_id = 'user_123';
```

Get user insights:
```sql
SELECT * FROM get_session_insights('user_123');
```

### Beta Metrics
Track beta performance:
- Total sessions collected
- Unique users engaged
- Elemental distribution patterns
- Spiral progression trends
- User activity patterns

## Security

### Row Level Security (RLS)
- Users can only view their own sessions
- Service role has full access for backend operations
- Authentication required for user-specific queries

### Data Privacy
- Sessions are linked to user IDs
- No personally identifiable information in queries
- Secure storage with encryption at rest

## Troubleshooting

### Connection Issues
1. Check environment variables
2. Verify Supabase project is active
3. Test with `npx tsx scripts/testSessionStorage.ts`

### Sessions Not Saving
1. Ensure `userId` is provided in requests
2. Check Supabase connection logs
3. Verify table exists with migration

### Performance
- Indexes are created for common queries
- Analytics views are pre-computed
- Consider archiving old sessions periodically

## Next Steps

1. **Monitor Beta Usage**: Track session volumes and patterns
2. **Analyze User Journeys**: Use analytics to understand user engagement
3. **Optimize Prompts**: Use collected data to improve oracle responses
4. **Generate Reports**: Regular beta progress reports
5. **Scale Infrastructure**: Adjust based on usage patterns

## Support

For issues or questions:
- Check logs in console for connection status
- Review Supabase logs for database errors
- Test individual components with provided scripts
- Contact dev team with session IDs for debugging