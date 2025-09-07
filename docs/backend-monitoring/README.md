# 🛡️ Self-Healing Production Monitoring System

## Overview

Automated 72-hour post-launch monitoring with hot patch repairs and emergency rollback capabilities.

## Features

- **Real-time health monitoring** of critical API endpoints
- **Automated repair attempts** for common issues (PM2, Redis, DB)
- **Emergency rollback** to last stable commit if repairs fail
- **Multi-channel alerts** via Slack and Telegram
- **Intelligent monitoring schedule** (15min → 30min → 4hr intervals)

## Quick Start

### 1. Configuration

```bash
cp monitoring/.env.example monitoring/.env
# Edit monitoring/.env with your webhook URLs
```

### 2. Deploy Monitoring

```bash
# Install PM2 globally if not already installed
npm install -g pm2

# Start monitoring
pm2 start monitoring/monitor.js --name "spiralogic-monitor"

# View logs
pm2 logs spiralogic-monitor
```

### 3. Verify Setup

```bash
# Check monitor status
pm2 status

# Test alerts (optional)
node -e "require('./monitoring/alerts').sendAlert('Test alert', 'info')"
```

## Monitoring Schedule

- **Hour 0-6** (Critical): Every 15 minutes
- **Hour 6-24** (Stability): Every 30 minutes
- **Hour 24-72** (Performance): Every 4 hours

## Auto-Repair Capabilities

### Memory Issues

- Restart PM2 processes
- Trigger garbage collection

### Redis Issues

- Flush Redis cache
- Restart API processes

### Database Issues

- Reload PM2 processes (resets connections)

### Rate Limiter Issues

- Clear rate limit counters
- Restart API processes

## Emergency Rollback Triggers

- All API endpoints failing
- Average latency > 10 seconds
- Memory usage critical
- 5+ consecutive health check failures

## File Structure

```
monitoring/
├── monitor.js      # Main monitoring orchestrator
├── repair.js       # Automated repair functions
├── rollback.js     # Emergency rollback system
├── alerts.js       # Slack & Telegram notifications
├── .env.example    # Configuration template
└── README.md       # This file
```

## Alert Configuration

### Slack Setup

1. Create Slack webhook: https://api.slack.com/messaging/webhooks
2. Add `SLACK_WEBHOOK_URL` to `.env`

### Telegram Setup

1. Create bot: Message @BotFather on Telegram
2. Get chat ID: Message @userinfobot
3. Add `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` to `.env`

## Commands

```bash
# Start monitoring
pm2 start monitoring/monitor.js --name "spiralogic-monitor"

# Stop monitoring
pm2 delete spiralogic-monitor

# View real-time logs
pm2 logs spiralogic-monitor --lines 50

# Monitor PM2 processes
pm2 monit

# Manual repair test
node -e "require('./monitoring/repair').repair('general')"

# Manual rollback test (BE CAREFUL!)
node -e "require('./monitoring/rollback').rollback('Manual test')"
```

## Production Deployment Checklist

- [ ] Configure monitoring/.env with production URLs
- [ ] Set up Slack webhook for alerts
- [ ] Configure Telegram bot for alerts
- [ ] Test alert delivery
- [ ] Deploy with PM2
- [ ] Verify monitoring logs
- [ ] Create manual restore point
- [ ] Document rollback procedures

## Safety Notes

⚠️ **IMPORTANT**: The rollback system will automatically revert to the last stable commit if critical issues are detected. Ensure your git tags and commit history are clean before deploying.

🔧 **Repair Logic**: The system attempts automated repairs before rollback. Monitor logs to understand what repairs were attempted.

📊 **Metrics**: Baseline metrics are established on the first healthy check. Performance degradation is measured against this baseline.
