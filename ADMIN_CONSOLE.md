# Owner/Operator Console

Complete admin dashboard for monitoring and managing the Spiralogic Oracle System.

## Features

### 🔒 Admin Gate
- Middleware-protected `/admin/*` routes
- Email-based access control via `ADMIN_ALLOWED_EMAILS`
- Can be enabled/disabled with `ADMIN_MODE`

### 📊 Metrics Dashboard (`/admin/overview`)
- Real-time system health overview
- Oracle turns and user engagement metrics
- Spiritual bypassing alerts and safeguards
- Soul Memory Bridge health monitoring
- Auto-refreshing data (30-second intervals)

### 🎙️ Voice/TTS Panel (`/admin/voice`)
- Global voice synthesis settings
- Support for multiple TTS providers (ElevenLabs, OpenAI, Azure)
- Voice parameter tuning (speed, pitch, stability, clarity)
- Voice testing functionality
- Curated voice library (coming soon)

### 🏥 Health Monitor (`/admin/health`)
- Comprehensive system component monitoring
- Real-time health checks for all services
- Detailed metrics for each component
- Auto-refresh capability

### 🧪 Beta Tuning (`/admin/beta/tuning`)
- Dynamic badge system configuration
- Real-time threshold adjustments (Pathfinder days, Shadow Steward score)
- Starter pack event configuration
- Badge system enable/disable toggle
- One-click invite code generation
- Live configuration preview and validation

### 🎮 Dev Badge Playground (`/dev/badges`)
- One-click event emission for testing
- Real-time badge award verification
- User status and progress monitoring
- Shadow work score testing
- Complete badge flow testing
- Development utility (admin access required)
- Health history tracking (planned)

### 🐤 Canary Check (`/admin/canary`)
- One-click system validation
- Runs comprehensive health tests
- Quick pass/fail status for all components
- Performance timing for each test
- Links to detailed monitoring

## Setup

### Environment Variables

Add to your `.env.local`:

```bash
# Admin Console
ADMIN_MODE=true
ADMIN_ALLOWED_EMAILS=you@yourdomain.com,admin@yourcompany.com

# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# APIs
OPENAI_API_KEY=your_openai_key
ELEVENLABS_API_KEY=your_elevenlabs_key
```

### Database Setup

1. Run the migration to create admin views:
```bash
supabase migration up 20250819120000_owner_console_views
```

2. Ensure your Supabase project has the integration schema from `001_create_integration_schema.sql`

### Access

1. Enable admin mode: `ADMIN_MODE=true`
2. Add your email to `ADMIN_ALLOWED_EMAILS`
3. Sign in to the system with an authorized email
4. Navigate to `/admin/overview`

## Database Views

The console uses these aggregated views (no PII exposure):

- `admin_oracle_turns` - Oracle interaction metrics
- `admin_enrichment_metrics` - Soul Memory enrichment quality
- `admin_bridge_health` - Real-time bridge health indicators
- `admin_safeguards` - Spiritual bypassing detection and intervention
- `admin_archetypes` - Elemental archetype engagement patterns
- `admin_integration_flow` - Integration gate effectiveness
- `admin_reflection_quality` - Reflection gap completion analysis
- `admin_community_health` - Community interaction safety metrics
- `admin_professional_network` - Professional support utilization
- `admin_system_health` - High-level dashboard indicators

## API Endpoints

### `GET /api/admin/metrics`

Query parameters:
- `metric`: Type of metrics to retrieve
  - `overview` - System health summary
  - `oracle-turns` - Oracle interaction data
  - `enrichment` - Soul Memory enrichment metrics
  - `bridge-health` - Bridge health indicators
  - `safeguards` - Bypassing detection data
  - `archetypes` - Archetypal engagement patterns
  - `integration-flow` - Integration gate analysis
  - `reflection-quality` - Reflection processing data
  - `community-health` - Community interaction metrics
  - `professional-network` - Professional connection data
- `timeframe`: Data timeframe (`1d`, `7d`, `30d`, `90d`)

Example:
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "/api/admin/metrics?metric=overview"
```

## Development

### Docker Development Environment

```bash
# Basic development setup
docker-compose -f docker-compose.development.yml up

# With local database
docker-compose -f docker-compose.development.yml --profile local-db up

# With development tools
docker-compose -f docker-compose.development.yml --profile tools up
```

Services:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Redis: localhost:6379
- Supabase (local): localhost:5432

### Local Development

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Run development server
npm run dev

# Admin console will be available at:
# http://localhost:3000/admin/overview
```

## Security

- All admin routes protected by middleware
- Email-based authorization
- No PII in aggregated views
- Row Level Security (RLS) respected
- Session-based authentication
- HTTPS recommended for production

## Monitoring

The console provides monitoring for:

✅ **System Health**
- Database connectivity and performance
- API response times and error rates
- Memory and resource usage

✅ **Functional Health**
- Soul Memory Bridge operations
- Spiralogic knowledge integration
- Archetypal recognition accuracy
- Safeguard effectiveness

✅ **User Experience**
- Oracle turn completion rates
- Integration quality scores
- Reflection gap success rates
- Community interaction health

## Future Enhancements

- **Automated Alerting**: Email/Slack notifications for critical issues
- **Historical Analytics**: Trend analysis and pattern recognition
- **Performance Optimization**: Query optimization recommendations
- **A/B Testing**: Feature flag management and experiment tracking
- **Advanced Voice**: Custom voice training and optimization
- **Mobile Dashboard**: Responsive mobile interface
- **Export/Reporting**: PDF reports and data export functionality