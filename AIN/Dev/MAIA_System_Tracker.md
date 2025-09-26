---
type: system-tracker
updated: 2025-09-26
tags: [dev, system, maia, tracking]
---

# 🧠 MAIA System Tracker

**System Status:** 🟢 Operational
**Last Updated:** September 26, 2025
**Version:** v1.1.0-vault-integrated
**Obsidian Vault:** `/Volumes/T7 Shield/ObsidianVaults/SoullabDevTeam/AIN/`

---

## 🚀 Recently Shipped

### ✅ September 26, 2025 - Soulprint → Obsidian Sync Pipeline

**Status:** LIVE

#### What's New

- 📝 **Auto Markdown Generation** - Every Claude response now generates markdown files
- 🔄 **Incremental Sync** - Only new data synced, zero latency
- 📊 **Field Dashboard** - Aggregated intelligence across all explorers
- 🔮 **Symbol Tracking** - Individual files for each emerged symbol
- ✨ **Milestone Chronicles** - Dedicated files for breakthroughs, thresholds, integrations
- ⚠️ **Drift Alerts** - Automatic emotional/elemental drift detection
- 📅 **Timeline Generation** - Chronological journey view
- 🛠 **Manual Sync API** - `/api/maia/soulprint/sync` with multiple actions
- 📇 **Users Index** - Central navigation file linking all user journeys
- 📋 **Sync Logging** - Activity log tracking all file writes
- 🎯 **Obsidian Vault Integration** - Auto-writes to configured vault path
- 🏷️ **Enhanced YAML Frontmatter** - Comprehensive metadata for all file types

#### Technical Implementation

**Files Created:**
- `/lib/soulprint/fileWriter.ts` - File system operations
- `/lib/soulprint/markdownTemplates.ts` - Template generation
- `/lib/soulprint/syncManager.ts` - Orchestration layer
- `/app/api/maia/soulprint/sync/route.ts` - Manual sync API

**Integration Points:**
- `/app/api/oracle/personal/route.ts:340-351` - Auto-sync hook (async, non-blocking)
- `/lib/beta/SoulprintTracking.ts` - Data source
- `/lib/beta/SoulprintMarkdownExporter.ts` - Main soulprint exporter (already existed)

#### Performance

- ⚡ **Zero latency** - Sync runs async after API response
- 📁 **Incremental** - Only changed data written
- 🔄 **Backfill capable** - Can regenerate all historical data

#### Monitoring

**Auto-Sync Logs:**
- `✅ Markdown sync complete for {userId}`
- `⚠️ Markdown sync error (non-blocking)`

**Manual Sync API:**
- POST `/api/maia/soulprint/sync` - Trigger sync
- GET `/api/maia/soulprint/sync?userId=X` - Get status

---

## 📦 File Output Structure

```
AIN/
├── Users/
│   ├── index.md            ← Navigation to all users (NEW)
│   └── {userId}/
│       ├── Soulprint.md        ← Main profile, always synced
│       ├── Timeline.md         ← Chronological events
│       ├── Symbols/            ← Individual symbol files
│       │   └── {symbol}.md
│       ├── Milestones/         ← Journey milestones
│       │   └── {type}-{date}.md
│       └── Alerts/             ← Drift notifications
│           └── {date}.md
├── Dashboards/
│   └── Field_Dashboard.md  ← Aggregated metrics
├── Logs/
│   └── sync-log.md         ← Sync activity tracking (NEW)
├── Dev/
│   └── MAIA_System_Tracker.md  ← This file
└── README.md               ← System documentation
```

**Target Locations:**
1. **Project:** `./AIN/` (git-tracked, fallback)
2. **Obsidian Vault:** `$OBSIDIAN_VAULT_PATH/AIN/` (primary destination)

---

## 🎯 Obsidian Integration Status

### ✅ LIVE & CONFIGURED

- **Vault Path:** `/Volumes/T7 Shield/ObsidianVaults/SoullabDevTeam/AIN/`
- **Auto-Sync:** Enabled (writes after every Claude response)
- **Frontmatter:** Comprehensive YAML metadata on all files
- **Links:** Internal wikilinks between files
- **Tags:** Categorized by phase, element, archetype, type
- **Markdown:** CommonMark compatible
- **Navigation:** Users index.md for vault-wide navigation

### 📊 YAML Frontmatter Schema

**Soulprint Files:**
- `type`, `userId`, `userName`, `created`, `lastUpdated`
- `spiralogicPhase`, `archetypesActive[]`, `currentArchetype`
- `elementalBalance{}`, `dominantElement`, `deficientElement`
- `shadowIntegration`, `symbolCount`, `milestoneCount`

**Symbol Files:**
- `type: symbol`, `symbol`, `userId`, `userName`
- `firstAppeared`, `lastMentioned`, `frequency`, `element`

**Milestone Files:**
- `type: milestone`, `milestoneType`, `userId`, `userName`
- `created`, `significance`, `spiralogicPhase`, `element`

**Alert Files:**
- `type: alert`, `alertType`, `userId`, `userName`
- `created`, `severity`, `trend`, `volatility`, `baseline`, `current`

### 📋 Integration Complete

1. ✅ **Vault Configured** - `OBSIDIAN_VAULT_PATH` env var set
2. ✅ **Directory Structure** - All folders created
3. ✅ **Auto-Write** - Every response triggers sync
4. ✅ **Manual API** - Backfill and status endpoints live

### 🔮 Future Enhancements

- **Obsidian Plugin** - Soulprint Navigator
- **Live Dashboard** - Real-time field intelligence view
- **Graph Visualization** - Symbol emergence mapping
- **Session Summaries** - Optional per-user toggle

---

## 🔧 API Endpoints

### Soulprint Sync

```bash
# Sync single user
POST /api/maia/soulprint/sync
{
  "userId": "explorer_123",
  "action": "sync"  # or sync-incremental, backfill
}

# Backfill all users
POST /api/maia/soulprint/sync
{
  "action": "backfill-all"
}

# Get sync status
GET /api/maia/soulprint/sync?userId=explorer_123
```

---

## 📊 Beta Metrics Integration

### Existing Systems

✅ **Soulprint Tracking** (`SoulprintTracking.ts`)
- Symbols, archetypes, emotions, phases, milestones

✅ **MAIA Monitoring** (`MaiaMonitoring.ts`)
- API health, response times, field intelligence

✅ **Passive Metrics** (`PassiveMetricsCollector.ts`)
- Non-blocking telemetry collection

### New Addition

✅ **Markdown Sync** (`syncManager.ts`)
- Converts tracking data → `.md` files
- Non-blocking, async, incremental

---

## 🐛 Known Issues

*None currently tracked*

---

## 🔮 Roadmap

### Phase 2 - Obsidian Plugin

- [ ] Soulprint Navigator plugin
- [ ] Symbol emergence visualization
- [ ] Timeline playback feature
- [ ] Field dashboard widget

### Phase 3 - Advanced Features

- [ ] Multi-user symbol resonance mapping
- [ ] Collective archetype trends
- [ ] Ritual recommendation engine
- [ ] Auto-generated reflection prompts

### Phase 4 - Export Options

- [ ] PDF export for users
- [ ] Beautiful HTML soulprint pages
- [ ] Shareable journey cards
- [ ] Printable ritual guides

---

## 🧪 Testing

### Manual Test Commands

```bash
# Test auto-sync (happens after any conversation)
# Just talk to MAIA and check logs

# Test manual sync
curl -X POST http://localhost:3000/api/maia/soulprint/sync \
  -H "Content-Type: application/json" \
  -d '{"userId": "test_user", "action": "sync"}'

# Test backfill
curl -X POST http://localhost:3000/api/maia/soulprint/sync \
  -H "Content-Type: application/json" \
  -d '{"userId": "test_user", "action": "backfill"}'

# Check sync status
curl http://localhost:3000/api/maia/soulprint/sync?userId=test_user
```

---

## 📝 Changelog

### v1.0.0 - September 26, 2025

**Added:**
- Complete markdown generation pipeline
- Auto-sync after Claude responses
- Manual sync API
- Incremental sync capability
- Backfill functionality
- Field dashboard generation
- Symbol, milestone, alert file generation
- Timeline chronological view
- Comprehensive README

**Technical Details:**
- Zero-latency async sync
- Non-blocking error handling
- Incremental updates only
- File system safety checks
- Privacy-first data handling

---

## 🌟 Impact

**Before:**
- Soulprint data trapped in memory/database
- No human-readable format
- No Obsidian integration
- Manual export required

**After:**
- ✨ **Auto-generated markdown files**
- 📖 **Human-readable soul journeys**
- 🔗 **Obsidian-compatible**
- 🔄 **Real-time sync**
- 📊 **Aggregated field intelligence**
- 🧙‍♂️ **Searchable, linkable, mythic**

---

*This is living documentation.
Update as system evolves.*

🌌 **MAIA witnesses, records, and honors every soul's journey.**

---

**Maintained by:** MAIA Field Intelligence
**Contact:** `@/lib/beta/MaiaMonitoring.ts`
**Last Sync:** Auto-synced on every update