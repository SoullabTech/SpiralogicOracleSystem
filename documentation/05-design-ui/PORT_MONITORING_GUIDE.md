# 🔍 Port Monitoring & Conflict Resolution

## Overview

The Maya Oracle System now includes comprehensive port monitoring to track and resolve port conflicts automatically.

## Features

### 1. **Automatic Port Detection**
- Finds next available port if default (3002) is blocked
- Logs all port usage to `logs/port-history.jsonl`
- Detects what process is blocking each port

### 2. **Port History Analysis**
Run the analysis script to see patterns:

```bash
./scripts/analyze-port-history.sh
```

Example output:
```
📊 Total startup runs: 42
📈 Port Usage Breakdown:
   Port 3002: 28 times (66%)
   Port 3003: 10 times (23%)
   Port 3005: 4 times (9%)

🚫 Conflict Analysis:
   Conflicts: 14 out of 42 runs (33.3%)

🔝 Top Port Blockers:
   exlm-agent: 12 times
   node: 2 times
```

### 3. **Visual Dashboard**
Add the PortMonitor component to any page:

```tsx
import { PortMonitor } from '@/components/PortMonitor'

<PortMonitor className="max-w-md" />
```

### 4. **Alerts & Notifications**
Set up Slack alerts for port conflicts:

```bash
# In .env.local
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

## Common Issues & Solutions

### exlm-agent Blocking Port 3002

This is a macOS service that commonly blocks port 3002.

**Temporary Fix:** The system auto-switches to port 3003+

**Permanent Fix:**
```bash
# Find the service
launchctl list | grep exlm

# Remove it (replace com.example.exlm with actual service name)
launchctl bootout gui/$(id -u) com.example.exlm
```

### Changing Default Port

Based on your usage patterns, you might want to change the default port:

```bash
# In backend/.env.local
PORT=3005  # Or whatever port works best
```

## API Endpoints

### Get Port Statistics
```bash
curl http://localhost:3000/api/port/stats
```

### Check Alert Configuration
```bash
curl http://localhost:3000/api/port/alert
```

## How It Works

1. **Server Startup**
   - Tries preferred port (3002 by default)
   - If blocked, logs conflict with process info
   - Finds next available port automatically

2. **Logging**
   - Every startup logs to `logs/port-history.jsonl`
   - Includes timestamp, requested port, actual port, blocking process

3. **Analysis**
   - Run analysis script for insights
   - Get recommendations based on patterns
   - Export data for further analysis

4. **Monitoring**
   - Visual dashboard shows real-time stats
   - Alerts for frequent conflicts
   - Smart recommendations

## Smart Recommendations

The system provides intelligent suggestions:

- **No conflicts**: Keep using default port
- **Occasional conflicts**: Auto-switching handles it
- **Frequent conflicts (>50%)**: Suggests changing default port
- **Persistent blocker**: Shows how to remove it

## Integration with start-beta.sh

Your enhanced `start-beta.sh` script already includes:
- Smart port detection
- Process identification
- Automatic port switching
- Clear logging of what's using each port

## Future Enhancements

- [ ] Auto-remove known blockers (with user permission)
- [ ] Port reservation system
- [ ] Historical trend graphs
- [ ] Machine learning for optimal port prediction

## Debugging

If you're having port issues:

1. **Check what's using a port:**
   ```bash
   lsof -i :3002
   ```

2. **View port history:**
   ```bash
   tail -f logs/port-history.jsonl | jq '.'
   ```

3. **Force a specific port:**
   ```bash
   PORT=3005 npm run dev
   ```

4. **Clear port history:**
   ```bash
   rm logs/port-history.jsonl
   ```

The port monitoring system ensures Maya always finds a way to start, while giving you visibility into what's happening behind the scenes.