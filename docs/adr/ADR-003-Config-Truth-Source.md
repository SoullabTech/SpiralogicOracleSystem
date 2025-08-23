# ADR-003: Configuration Truth Source & Environment Coherence

**Status**: Proposed  
**Date**: 2025-01-20  
**Context**: Standardize environment configuration and ensure coherence across deployment targets

## Decision

Establish a single source of truth for environment configuration with clear hierarchy and validation.

## Environment Variable Audit

### 🔍 Variables Found in Code

| Variable | Used In | Required | Default | Purpose |
|----------|---------|----------|---------|---------|
| `NODE_ENV` | Multiple | Yes | `development` | Runtime environment |
| `DEPLOY_TARGET` | Next.js config | No | `local` | Deployment target |
| `START_SERVER` | Backend | No | `full` | Server startup mode |
| `ADMIN_MODE` | Admin middleware | No | `false` | Enable admin console |
| `ADMIN_ALLOWED_EMAILS` | Admin middleware | Yes (if admin) | - | Admin access control |
| `NEXT_PUBLIC_SUPABASE_URL` | Frontend/Backend | Yes | - | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Frontend | Yes | - | Supabase public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend | Yes | - | Supabase admin key |
| `ELEVENLABS_API_KEY` | Voice synthesis | No | - | TTS service |
| `OPENAI_API_KEY` | Oracle providers | No | - | LLM service |
| `SOUL_MEMORY_ENRICH_SYNC` | Soul Memory Bridge | No | `true` | Enable enrichment |
| `SOUL_MEMORY_ENRICH_BUDGET_MS` | Soul Memory Bridge | No | `350` | Performance budget |
| `USE_SESAME` | Providers | No | `false` | Enable Sesame provider |
| `NEXT_PUBLIC_BACKEND_URL` | Frontend | Yes | `http://localhost:8080` | Backend API URL |

### 🚨 Configuration Drift Issues

#### 1. Multiple .env Files (9 total)
```
.env                        # Base configuration
.env.local                  # Local overrides  
.env.development.local      # Development specific
.env.prod                   # Production base
.env.prod.local            # Production overrides
.env.example               # Template
.env.docker.example        # Docker template
.env.sovereign.template    # Sovereign deployment
.env.vault.template        # Vault integration
```
**Issue**: Inconsistent values, unclear precedence

#### 2. Variable Name Inconsistencies
```
# In .env.local:
NEXT_PUBLIC_BACKEND_URL=http://localhost:3003

# In .env.development.local:  
BACKEND_PORT=8080

# In code:
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
```
**Issue**: Port mismatch between config files

#### 3. Missing Required Variables
- `ADMIN_ALLOWED_EMAILS` empty in some configs
- Missing API keys cause silent failures
- No validation of required vs optional

### 🎯 Proposed Configuration Hierarchy

#### 1. Single Source Template (`.env.template`)
```bash
# =============================================================================
# Spiralogic Oracle System - Environment Configuration
# =============================================================================

# Runtime Environment
NODE_ENV=development                    # development | production | test
DEPLOY_TARGET=local                    # local | vercel | render | ipfs | sovereign

# =============================================================================
# Core Services
# =============================================================================

# Supabase Database (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=              # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=         # Public anon key
SUPABASE_SERVICE_ROLE_KEY=             # Service role key (keep secret)

# Backend API
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
START_SERVER=full                      # full | minimal

# =============================================================================
# Admin Console (Owner/Operator)
# =============================================================================

ADMIN_MODE=false                       # Enable admin console
ADMIN_ALLOWED_EMAILS=                  # Comma-separated admin emails

# =============================================================================
# Soul Memory & Bridge
# =============================================================================

SOUL_MEMORY_ENRICH_SYNC=true          # Enable soul memory enrichment
SOUL_MEMORY_ENRICH_BUDGET_MS=350      # Performance budget (ms)
SOUL_MEMORY_DB_PATH=./backend/soul_memory.db

# =============================================================================
# Oracle Providers
# =============================================================================

USE_SESAME=false                       # Enable Sesame provider
OPENAI_API_KEY=                       # OpenAI API key (optional)
ELEVENLABS_API_KEY=                   # ElevenLabs API key (optional)

# =============================================================================
# Development Features
# =============================================================================

NEXT_PUBLIC_DEV_INLINE_REFLECTIONS=true  # Enable micro-reflections
THREAD_WEAVING_MIN_TURNS=3               # Turns before thread weaving
BRIDGE_METRICS_ENABLED=true             # Enable bridge metrics
```

#### 2. Environment-Specific Overrides

**Development (`.env.development`)**
```bash
NODE_ENV=development
DEPLOY_TARGET=local
ADMIN_MODE=true
ADMIN_ALLOWED_EMAILS=you@yourdomain.com
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=demo-key
```

**Production (`.env.production`)**
```bash
NODE_ENV=production
DEPLOY_TARGET=vercel
ADMIN_MODE=true
# All other values from secure vault
```

### 🛡️ RLS Policy Verification

#### Migration Files Audit
```
supabase/migrations/
├── 001_create_integration_schema.sql     ✅ RLS enabled
├── 20250817180000_rls_hardening.sql      ✅ Comprehensive policies  
├── 20250819120000_owner_console_views.sql ✅ Admin views
└── ... (15 more migration files)
```

#### RLS Policy Checklist
- ✅ **All tables have RLS enabled**
- ✅ **User-scoped policies** (users see only their data)
- ✅ **Admin policies** (admins access aggregated views only)
- ✅ **Professional policies** (controlled sharing with consent)
- ✅ **No PII in admin views** (aggregated metrics only)

#### API Route RLS Alignment
| Route | RLS Requirement | Status |
|-------|----------------|---------|
| `/api/oracle/turn` | User-scoped memory | ✅ Uses auth.uid() |
| `/api/admin/metrics` | Admin-only aggregated | ✅ Middleware protected |
| `/api/soul-memory/*` | User-scoped storage | ✅ RLS enforced |

### 🏗️ Local Development Setup

#### Definitive Start Guide
```bash
# 1. Clone repository
git clone [repo] && cd spiralogic-oracle-system

# 2. Install dependencies  
npm install

# 3. Configure environment
cp .env.template .env.local
# Edit .env.local with your values

# 4. Start development stack
export DCYML=docker-compose.development.yml
docker compose -f "$DCYML" up --build

# 5. Verify services
curl http://localhost:3000/api/health        # Frontend health
curl http://localhost:8080/api/health        # Backend health  
curl http://localhost:8080/api/soul-memory/health  # Soul Memory health

# 6. Access application
open http://localhost:3000                   # Main app
open http://localhost:3000/admin/overview    # Admin console (if enabled)
```

### 🔧 Configuration Validation

#### Environment Checker (`scripts/check-env.js`)
```javascript
#!/usr/bin/env node
const required = {
  development: [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
    'NEXT_PUBLIC_BACKEND_URL'
  ],
  production: [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_BACKEND_URL'
  ]
};

const env = process.env.NODE_ENV || 'development';
const missing = required[env].filter(key => !process.env[key]);

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:');
  missing.forEach(key => console.error(`   ${key}`));
  process.exit(1);
}

console.log('✅ Environment configuration valid');
```

#### Package.json Scripts
```json
{
  "scripts": {
    "check-env": "node scripts/check-env.js",
    "dev": "npm run check-env && next dev",
    "build": "npm run check-env && next build",
    "docker:dev": "npm run check-env && docker compose -f docker-compose.development.yml up --build"
  }
}
```

## Implementation Plan

### Phase 1: Consolidate Templates (Day 1)
1. **Create `.env.template`** with all variables documented
2. **Audit existing .env files** for unique values
3. **Create environment-specific templates**
4. **Remove redundant .env files**

### Phase 2: Add Validation (Day 2)
1. **Create environment checker script**
2. **Add validation to npm scripts**
3. **Update Docker configs** to use templates
4. **Test all deployment paths**

### Phase 3: Update Documentation (Day 3)
1. **Update README** with single setup process
2. **Create deployment guides** per target
3. **Document variable requirements**
4. **Add troubleshooting section**

## Environment Variable Registry

### Core Required (All Environments)
- `NEXT_PUBLIC_SUPABASE_URL` - Database connection
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public access key
- `NEXT_PUBLIC_BACKEND_URL` - API endpoint

### Production Additional  
- `SUPABASE_SERVICE_ROLE_KEY` - Admin database access
- `OPENAI_API_KEY` - LLM provider (if using)
- `ELEVENLABS_API_KEY` - TTS provider (if using)

### Development Optional
- `ADMIN_MODE=true` - Enable admin console
- `ADMIN_ALLOWED_EMAILS` - Admin access list
- `USE_SESAME=false` - Provider configuration

### Performance Tuning
- `SOUL_MEMORY_ENRICH_SYNC=true` - Enable enrichment
- `SOUL_MEMORY_ENRICH_BUDGET_MS=350` - Performance budget

## Success Criteria

### Quantitative
- ✅ **Single .env.template** with all variables
- ✅ **3 environment-specific** files (dev/staging/prod)
- ✅ **Zero configuration drift** between environments
- ✅ **100% variable documentation** with types and defaults

### Qualitative  
- ✅ **Clear setup process** (5 steps max)
- ✅ **Validation prevents** silent failures
- ✅ **Environment-agnostic** deployment
- ✅ **Security best practices** (secrets management)

## Security Considerations

### 1. Secret Management
- Service keys in environment only
- No secrets in git repository
- Vault integration for production

### 2. Access Control
- Admin emails explicitly allowlisted
- RLS policies enforced at database level
- API middleware validates permissions

### 3. Development Safety
- Demo keys for local development
- Test database isolation
- Debug features disabled in production