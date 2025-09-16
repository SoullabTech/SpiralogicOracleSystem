# 🔔 Voice System Monitoring & Alerts

## Overview

Maya's voice system includes automatic monitoring and alerting for production environments. The system watches for voice engine failures, fallbacks, and recoveries.

## Alert Types

### 1. **Fallback Alerts** ⚠️
- **Trigger**: Sesame CSM fails, system falls back to ElevenLabs
- **Frequency**: Rate limited to 1 per 5 minutes per alert type
- **Action Required**: Check Sesame server status, restart if needed

### 2. **Failure Alerts** 🚨
- **Trigger**: Both Sesame and ElevenLabs are unavailable
- **Frequency**: Rate limited to 1 per 5 minutes per alert type  
- **Action Required**: Immediate attention - voice system completely down

### 3. **Recovery Alerts** ✅
- **Trigger**: Sesame comes back online after being in fallback mode
- **Frequency**: Sent once when recovery detected
- **Action Required**: None - informational

## Alert Channels

### Slack Integration
Set up Slack notifications by adding to `.env.local`:

```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

**To create a Slack webhook:**
1. Go to https://api.slack.com/apps
2. Create new app → From scratch
3. Add Incoming Webhooks
4. Create webhook for your channel
5. Copy webhook URL to env var

### Email Integration
Set up email alerts by adding to `.env.local`:

```bash
EMAIL_WEBHOOK_URL=https://api.sendgrid.v3.mail.send  # Or your email service
EMAIL_API_KEY=your_email_api_key
ALERT_EMAIL=alerts@yourcompany.com
```

**Supported Email Services:**
- SendGrid
- Mailgun  
- Postmark
- Any webhook-based email service

## API Endpoints

### Send Alert Manually
```bash
curl -X POST http://localhost:3000/api/voice/alert \
  -H "Content-Type: application/json" \
  -d '{
    "type": "fallback",
    "engine": "sesame", 
    "message": "Manual test alert",
    "details": {"test": true}
  }'
```

### Check Alert Configuration
```bash
curl http://localhost:3000/api/voice/alert
```

### View Recent Alerts
```bash
curl http://localhost:3000/api/voice/alert?recent=true
```

## Debug Panel

Users can see voice system status in real-time:

1. Go to `/oracle` 
2. Click the voice status indicator in the top-right header
3. View detailed metrics, recent events, and fallback reasons

The debug panel shows:
- Current voice engine (Sesame/ElevenLabs/Offline)
- Response times and model status
- Recent events and error messages  
- Fallback reasons and recovery status

## Rate Limiting

Alerts are rate-limited to prevent spam:
- **Slack/Email**: Max 3 alerts per 5-minute window per alert type
- **Different alert types** (fallback, failure, recovery) have separate limits
- Rate limiting applies per engine (sesame vs elevenlabs)

## Production Checklist

- [ ] Set `SLACK_WEBHOOK_URL` for Slack notifications
- [ ] Set email variables if using email alerts
- [ ] Test alerts with manual API call
- [ ] Verify debug panel is accessible to users
- [ ] Monitor alert frequency during first week
- [ ] Set up log aggregation for alert history

## Troubleshooting

### No Alerts Received
1. Check environment variables are set correctly
2. Verify webhook URLs are accessible
3. Check API logs for alert sending errors
4. Test with manual API call

### Too Many Alerts
- Rate limiting should prevent spam
- Check for flapping services
- Consider increasing rate limit windows if needed

### Debug Panel Not Loading
- Ensure `/api/voice/debug-metrics` is accessible
- Check browser console for API errors
- Verify VoiceDebugPanel component is imported

## Example Alert Messages

**Slack Fallback Alert:**
```
🚨 Maya Voice Alert - FALLBACK
Sesame CSM server not responding, using ElevenLabs fallback
Engine: sesame
Time: 2024-01-15T10:30:00.000Z
```

**Email Failure Alert:**
```
Subject: Maya Voice Alert: FAILURE - elevenlabs

Voice System Alert
Type: failure
Engine: elevenlabs
Message: Complete voice system failure - both Sesame and ElevenLabs unavailable
Time: 2024-01-15T10:30:00.000Z
```

## Integration with Start Script

The beta launcher (`start-beta.sh`) automatically:
- Checks for GPU support for faster Sesame inference
- Starts Sesame containers with appropriate configuration  
- Tests voice synthesis with audible confirmation
- Reports engine status and fallback usage

GPU detection adds performance information to voice metrics and can influence alert priorities.