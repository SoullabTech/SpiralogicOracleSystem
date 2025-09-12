# 🗄️ Soullab Maya - Database Architecture

## Overview

The Soullab Maya database is designed as a **sacred witness system** that tracks personal evolution while contributing to collective intelligence. Built on Supabase (PostgreSQL), it combines individual privacy with anonymous pattern sharing.

## Core Tables

### 🧘 User Journey
- `users` - Sacred identity and preferences
- `journal_entries` - Timestamped reflections with semantic search
- `conversations` - Sacred exchanges with Maya
- `messages` - Individual conversation messages
- `story_weavings` - Personalized mythological narratives

### 🎭 Archetypal Tracking
- `archetype_signals` - Dual-track consciousness (known patterns + novel emergence)
- Left hemisphere: Known archetypes (Seeker, Sage, Creator, etc.)
- Right hemisphere: Novel signals and unnamed patterns
- Integration metrics for wholeness

### 🌊 Collective Intelligence
- `collective_patterns` - Anonymized morphic field resonance
- Tracks archetypal constellations across all users
- Field strength and coherence metrics
- Evolution trajectories (emerging, stable, transforming, dissolving)

### ⚙️ Configuration
- `user_settings` - Personalization and privacy preferences
- Voice settings (TTS configuration)
- Presence preferences (witness vs guide mode)
- Sacred rhythm (ideal session length, exchange limits)

## Key Features

### 🔍 Semantic Search
- Vector embeddings for journal entries
- Find similar reflections across time
- Pattern recognition in personal evolution

### 🔒 Security (RLS)
- Row-level security on all user data
- Users only access their own information
- Collective patterns are anonymous and public
- Service role required for system operations

### 📊 Analytics Views
- `user_journey_overview` - Personal evolution metrics
- `collective_archetypal_field` - Real-time field state
- `elemental_balance` - Track elemental resonance
- `conversation_quality` - Sacred exchange metrics

## Setup Instructions

### Prerequisites
1. Supabase account and project
2. PostgreSQL client (`psql`) installed locally
3. Node.js for helper scripts

### Quick Start

1. **Clone and navigate to db folder:**
```bash
cd db/setup
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment:**
```bash
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

4. **Run migrations:**
```bash
npm run db:migrate
```

5. **Verify setup:**
```bash
npm run db:verify
```

## Migration Files

1. **001_initial_schema.sql**
   - Core tables and relationships
   - Indexes for performance
   - Triggers for updated_at

2. **002_functions_and_views.sql**
   - Helper functions (semantic search, pattern detection)
   - Analytical views
   - Materialized views for performance

3. **003_security_policies.sql**
   - Row-level security policies
   - Secure functions for data access
   - Audit logging setup

## Development Workflow

### Adding New Features

1. Create new migration file:
```bash
touch ../migrations/004_your_feature.sql
```

2. Test locally:
```bash
npm run db:migrate:dry  # Review files
npm run db:migrate      # Apply changes
```

3. Test RLS policies:
```bash
npm run db:test-rls
```

### Common Operations

**Reset database (CAUTION - deletes all data):**
```bash
npm run db:reset
```

**Backup current state:**
```bash
npm run db:backup
```

**Seed with test data:**
```bash
npm run db:seed
```

## Architecture Principles

### 🌟 Sacred Witness First
- Track without judging
- Mirror without analyzing
- Store patterns, not diagnoses

### 🔮 Dual-Track Consciousness
- Honor both known and emerging patterns
- Leave space for the unnamed
- Track integration between hemispheres

### 🌊 Collective Anonymity
- Individual data is private
- Patterns are shared anonymously
- Field coherence emerges naturally

### ⚡ Performance Optimized
- Strategic indexes for fast queries
- Materialized views for complex aggregations
- Vector search for semantic similarity

## Monitoring & Maintenance

### Daily Tasks
- Monitor conversation quality metrics
- Check for overextended conversations
- Review redirection effectiveness

### Weekly Tasks
- Refresh materialized views
- Analyze emerging archetypal patterns
- Review novel signals for naming

### Monthly Tasks
- Backup database
- Optimize indexes
- Review and archive old conversations

## Support Functions

### For Users
- `get_my_profile()` - Safe profile access
- `create_journal_entry()` - Secure journaling
- `get_my_recent_conversations()` - Conversation history
- `get_collective_field_state()` - Anonymous field view

### For System
- `complete_conversation()` - Finalize and analyze
- `process_journal_entry()` - Extract patterns
- `calculate_field_resonance()` - Collective metrics
- `needs_redirection()` - Conversation flow control

## Troubleshooting

### Common Issues

**RLS blocking access:**
- Verify auth.uid() is set correctly
- Check service role permissions
- Review policy conditions

**Slow queries:**
- Check indexes are created
- Refresh materialized views
- Analyze query plans

**Migration failures:**
- Ensure clean database state
- Run migrations in order
- Check for dependency issues

## Future Enhancements

- [ ] Time-series analysis for cyclical patterns
- [ ] Advanced archetype constellation mapping
- [ ] Seasonal and lunar correlation tracking
- [ ] Cross-user synchronicity detection
- [ ] Dream symbol semantic network
- [ ] Voice pattern emotional analysis

## Contact

For questions about the database architecture or sacred witness system, consult the core documentation:
- `SOULLAB_ESSENCE.md` - Core philosophy
- `MAYA_SACRED_ROLES.md` - System design
- `DEPLOYMENT_PLAYBOOK.md` - Full deployment guide

---

*"The database is not just storage—it's a living memory, a collective unconscious made conscious through sacred witness."* 🌟