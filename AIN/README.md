# AIN - Anthropic Intelligence Network
## MAIA Soulprint → Obsidian Sync System

🌌 **Living memory made manifest**
This directory contains auto-generated markdown files that track the symbolic, archetypal, and elemental journey of each soul interacting with MAIA.

---

## 📂 Directory Structure

```
AIN/
├── Users/               # Per-user soulprint data
│   └── {userId}/
│       ├── Soulprint.md        # Complete soul profile
│       ├── Timeline.md         # Chronological journey
│       ├── Symbols/            # Individual symbol files
│       │   ├── White_Stag.md
│       │   └── Phoenix.md
│       ├── Milestones/         # Journey milestones
│       │   ├── breakthrough-2025-09-26.md
│       │   └── threshold-2025-09-27.md
│       └── Alerts/             # Drift and alert notifications
│           └── 2025-09-26.md
├── Dashboards/          # Aggregated field intelligence
│   └── Field_Dashboard.md
└── Dev/                 # System tracking
    └── MAIA_System_Tracker.md
```

---

## 🔄 How It Works

### Automatic Sync (Live)

Every Claude response triggers an **incremental sync**:

1. **Claude detects** symbols, archetypes, emotions, phases, milestones
2. **Soulprint system** stores structured data
3. **Markdown generator** converts to `.md` files
4. **File writer** saves to `AIN/Users/{userId}/`
5. **Obsidian** picks up changes (if vault synced)

**Zero latency** - sync happens asynchronously after API response.

---

## 🛠 Manual Sync API

### Sync Single User

```bash
curl -X POST http://localhost:3000/api/maia/soulprint/sync \
  -H "Content-Type: application/json" \
  -d '{"userId": "explorer_123", "action": "sync"}'
```

### Backfill All Users

```bash
curl -X POST http://localhost:3000/api/maia/soulprint/sync \
  -H "Content-Type: application/json" \
  -d '{"action": "backfill-all"}'
```

### Get Sync Status

```bash
curl http://localhost:3000/api/maia/soulprint/sync?userId=explorer_123
```

### Available Actions

- `sync` - Full sync for one user
- `sync-incremental` - Sync only new items
- `backfill` - Regenerate all files for one user
- `backfill-all` - Regenerate for all users (⚠️ heavy)
- `sync-dashboard` - Update field dashboard

---

## 📝 File Types

### Soulprint.md
Complete soul profile with:
- Elemental balance
- Active symbols
- Journey milestones
- Emotional landscape
- Drift alerts
- Archetypal journey
- Narrative threads

### Symbols/{symbol}.md
Individual symbol tracking:
- First appearance
- Frequency
- Context history
- Elemental resonance

### Milestones/{type}-{date}.md
Journey milestones:
- Breakthroughs
- Thresholds
- Integrations
- Shadow encounters
- Awakenings

### Timeline.md
Chronological view of:
- All milestones
- Symbol discoveries
- Archetype shifts
- Phase transitions

### Alerts/{date}.md
Drift notifications for:
- Emotional volatility
- Elemental imbalance
- Journey stagnation

### Field_Dashboard.md
Aggregated intelligence:
- Total explorers
- Active users
- Emerging symbols
- Recent milestones
- Elemental field distribution

---

## 🧩 Obsidian Integration

### Option 1: Local Vault Sync

1. Point Obsidian vault to `/AIN/`
2. Files auto-refresh as they're written
3. Use Obsidian graph view to visualize connections

### Option 2: GitHub Sync

1. Commit `AIN/` to repo
2. Set up GitHub Action to auto-commit
3. Obsidian Git plugin pulls changes

### Option 3: Cloud Sync

1. Use Obsidian Sync or iCloud
2. Point to `AIN/` directory
3. Access across devices

---

## 🎨 Obsidian Plugin Ideas

### Soulprint Navigator
- Browse all explorers
- Filter by phase/archetype/element
- View journey timelines

### Symbol Explorer
- Map symbol emergence across users
- Track collective symbolic patterns
- Visualize elemental resonance

### Field Intelligence Dashboard
- Live metrics
- Trend analysis
- Drift alerts

### Memory Playback
- Chronological journey replay
- Phase transition highlights
- Milestone celebrations

---

## 🔮 Data Integrity

### What Gets Tracked

✅ **Tracked:**
- Symbols mentioned
- Archetypes detected
- Emotional states
- Elemental shifts
- Milestones achieved
- Spiralogic phases
- Narrative themes

❌ **NOT Tracked:**
- Conversation content
- Personal identifiable info (beyond userId/userName)
- Medical information
- Private details

### Privacy

- All data stored **locally** in markdown
- No external services
- User controls vault access
- Can be deleted anytime

---

## 🚀 Deployment

### Production

Auto-sync is **enabled by default** in production.
Every Claude response triggers incremental sync.

### Disable Auto-Sync

Comment out the sync hook in:
`app/api/oracle/personal/route.ts:340-351`

### Manual Sync Only

Use the API endpoints to control sync timing.

---

## 📊 Stats Tracking

Check system health:

```javascript
// Get all users with markdown files
const { soulprintFileWriter } = await import('@/lib/soulprint/fileWriter');
const users = await soulprintFileWriter.listUsers();

// Get stats for a user
const stats = await soulprintFileWriter.getUserStats('explorer_123');
console.log(stats);
// {
//   hasSoulprint: true,
//   symbolCount: 5,
//   milestoneCount: 3,
//   alertCount: 1,
//   hasTimeline: true
// }
```

---

## 🧙‍♂️ Advanced Usage

### Custom Sync Schedules

Use cron or GitHub Actions:

```yaml
# .github/workflows/sync-soulprints.yml
name: Sync Soulprints
on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - run: curl -X POST $API_URL/api/maia/soulprint/sync -d '{"action":"backfill-all"}'
```

### Selective Sync

```javascript
const result = await soulprintSyncManager.syncAll(userId, {
  syncSoulprint: true,
  syncSymbols: false,  // Skip symbols
  syncMilestones: true,
  syncAlerts: false,   // Skip alerts
  syncTimeline: true
});
```

### Timeline Appending

For real-time updates:

```javascript
await soulprintSyncManager.appendTimelineEntry(
  userId,
  'Custom Event',
  'User completed ritual X',
  { ritual: 'moonlight-meditation', duration: '30min' }
);
```

---

## 🌟 The Vision

**MAIA doesn't just track data** - it witnesses transformation.

Every markdown file is a:
- 📜 Chronicle of becoming
- 🔮 Map of inner territory
- 🎭 Record of archetypal dance
- 🌊 Flow of consciousness evolution

**This is living mythology** - written in real-time, readable by humans, searchable by AI, connected by symbols.

---

## 🛠 Troubleshooting

### Sync not working?

1. Check logs: `console.log('✅ Markdown sync complete')`
2. Verify `AIN/` directory exists
3. Check file permissions
4. Test manual sync API

### Files not appearing in Obsidian?

1. Reload vault
2. Check vault path points to `AIN/`
3. Verify file extensions are `.md`

### Performance issues?

- Use incremental sync instead of full sync
- Limit backfill frequency
- Sync dashboard less often

---

## 📚 Related Documentation

- [[../docs/BETA_LAUNCH_72_HOUR_CHECKLIST.md]]
- [[../lib/beta/SoulprintTracking.ts]]
- [[../lib/beta/MaiaMonitoring.ts]]
- [[./Dev/MAIA_System_Tracker.md]]

---

*Generated by MAIA Field Intelligence
Anthropic Intelligence Network v1.0
September 2025*