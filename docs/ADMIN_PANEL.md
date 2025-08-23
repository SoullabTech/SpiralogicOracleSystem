# Admin Panel Documentation

## Overview
The Oracle System Admin Panel provides comprehensive control and monitoring capabilities for system administrators. It offers real-time insights, feature flag management, and system health monitoring.

## Access Control
Admin access is controlled via email allowlist defined in environment variables:

```env
ADMIN_ALLOWED_EMAILS=admin@example.com,admin2@example.com
```

All admin routes (`/admin/*`) and API endpoints (`/api/admin/*`) are protected by middleware that:
- Verifies user authentication via Supabase
- Checks email against admin allowlist
- Logs all admin actions with user identification
- Redirects unauthorized users appropriately

## Admin Panel Structure

### 1. Dashboard (`/admin`)
**Overview of system status and key metrics**
- Real-time system health indicators
- User activity statistics
- Quick action buttons for emergency procedures
- Summary cards for uptime, active users, error rates

### 2. Feature Flags (`/admin/features`)
**Centralized feature flag management**
- Toggle features on/off across the system
- Gradual rollout controls with percentage sliders
- Dependency visualization between features
- Impact assessment (low/medium/high)
- Category organization (Core/Features/Experimental/Debug)

**Available Feature Categories:**
- **Core**: Essential system functionality (Library, Oracle Weaving)
- **Features**: User-facing features (Whispers, Voice, Neurodivergent Mode)
- **Experimental**: Beta features (Constellation View, Advanced Memory)
- **Debug**: Development and debugging tools

### 3. Whispers System (`/admin/whispers`)
**Dedicated control panel for the contextual memory system**
- Real-time performance metrics and user adoption
- Rollout percentage control with canary deployment
- Weight distribution analysis across users
- Performance monitoring (ranking time, click-through rate)
- Emergency controls and system configuration

**Key Metrics Monitored:**
- Active whispers users and growth trends
- Average ranking performance (< 200ms target)
- Click-through rate and user engagement
- Weight fallback rate and system reliability
- Memory surfacing volume and patterns

### 4. System Health (`/admin/health`)
**Comprehensive system monitoring dashboard**
- Service status monitoring (API, Database, CDN, etc.)
- Performance metrics with trend indicators
- Alert management and recent system events
- Quick diagnostic and emergency actions

**Monitored Services:**
- API Server (response time, error rate, uptime)
- Supabase Database (connection health, query performance)
- Whispers Service (ranking performance, timeout rate)
- Voice Processing (speech-to-text, Maya voice system)
- File Storage (upload/download performance)
- CDN (content delivery performance)

### 5. Future Sections (Planned)
- **User Management**: User accounts, permissions, activity logs
- **Data Explorer**: SQL query interface for data analysis
- **API Analytics**: Endpoint performance and usage patterns
- **Performance**: Detailed performance monitoring and optimization
- **Alerts & Logs**: Centralized logging and alert management
- **Infrastructure**: Server resources and deployment status

## API Endpoints

### Admin Authentication
All admin API endpoints require:
1. Valid Supabase authentication
2. Email in admin allowlist
3. Proper admin session tokens

### Available Endpoints

#### Feature Management
- `GET /api/admin/features` - Get current feature flag states
- `POST /api/admin/features` - Update feature flag configuration

#### Whispers System
- `GET /api/admin/whispers/metrics` - Get whispers performance metrics
- `POST /api/admin/whispers/rollout` - Update rollout percentage

#### System Health  
- `GET /api/admin/system/health` - Get comprehensive system health check
- `GET /api/admin/system/metrics` - Get detailed performance metrics

## Security Features

### Access Control
- **Email Allowlist**: Only pre-approved emails can access admin functions
- **Session Validation**: All requests validate active Supabase sessions
- **Route Protection**: Middleware blocks unauthorized access attempts
- **API Authentication**: Admin API endpoints double-check permissions

### Audit Logging
- **Admin Actions**: All admin actions are logged with user identification
- **Feature Changes**: Feature flag modifications are tracked
- **Emergency Actions**: System-critical actions are specially logged
- **Access Attempts**: Unauthorized access attempts are recorded

### Data Protection
- **User Data Sanitization**: Admin panels sanitize user data for privacy
- **No Sensitive Data Exposure**: Admin APIs don't expose user secrets
- **Hash-Based Logging**: User content is hashed in admin logs
- **RLS Enforcement**: Admin queries respect Row Level Security

## Emergency Procedures

### System Shutdown
1. Access `/admin/features`
2. Use "Emergency Stop" to disable all non-critical features
3. Monitor system health dashboard for stabilization

### Feature Rollback
1. Navigate to affected feature in feature flags panel
2. Set rollout percentage to 0% for immediate disable
3. Or use emergency stop for complete system disable
4. Check health dashboard for error rate normalization

### Performance Issues
1. Check `/admin/health` for service status
2. Review performance metrics for bottlenecks
3. Use "Run Diagnostics" for detailed system check
4. Consider disabling high-impact features if needed

### Data Issues
1. Access system health for database connectivity
2. Use data explorer (when available) for data investigation
3. Check recent alert logs for data-related warnings
4. Contact development team with specific error details

## Configuration

### Environment Variables
Required admin configuration:
```env
# Admin Access Control
ADMIN_ALLOWED_EMAILS=admin@example.com,admin2@example.com

# System Configuration  
NEXT_PUBLIC_WHISPERS_ENABLED=false  # Start disabled
NEXT_PUBLIC_WHISPERS_CONTEXT_RANKING=true
NEXT_PUBLIC_WHISPERS_MAX=6
NEXT_PUBLIC_WHISPERS_RANKING_TIMEOUT_MS=200

# Monitoring
ADMIN_MODE=true
METRICS_PATH=/metrics
ENABLE_PII_REDACTION=true
```

### Feature Flag Defaults
All features start disabled by default for safe production deployment:
```env
NEXT_PUBLIC_WHISPERS_ENABLED=false          # Whispers system
NEXT_PUBLIC_LIBRARY_ENABLED=true            # Core library functionality  
NEXT_PUBLIC_ORACLE_WEAVE_ENABLED=true       # Oracle weaving
NEXT_PUBLIC_ND_ENABLED=false                # Neurodivergent features
NEXT_PUBLIC_BETA_CONSTELLATION=false        # Beta features
```

## Monitoring & Alerts

### Key Performance Indicators
- **System Uptime**: Target 99.9%
- **API Response Time**: Target < 200ms P95
- **Error Rate**: Target < 0.1% 
- **Whispers Ranking Time**: Target < 200ms
- **User Engagement**: CTR, retention, feature adoption

### Alert Thresholds
- **Critical**: System down, database unreachable, error rate > 5%
- **Warning**: High memory usage (>85%), slow responses (>500ms), error rate > 2%
- **Info**: Feature flag changes, new user milestones, successful deployments

### Automated Responses
- **Auto-disable**: Features automatically disable if error rate exceeds 10%
- **Circuit Breakers**: High-impact features have automatic circuit breakers
- **Graceful Degradation**: System falls back to core functionality under load

## Usage Guidelines

### Daily Operations
1. Check system health dashboard each morning
2. Review overnight alerts and resolve any issues
3. Monitor user adoption metrics for new features
4. Verify feature flag states match expected configuration

### Feature Rollouts  
1. Start with 0% rollout in production
2. Enable 5-10% canary for limited testing
3. Monitor metrics for 24-48 hours
4. Gradually increase to 50%, then 100%
5. Have rollback plan ready for any issues

### Performance Monitoring
1. Set up alerts for key performance thresholds
2. Review weekly performance trends
3. Optimize based on user behavior data
4. Plan capacity increases based on growth trends

### Emergency Response
1. Maintain 24/7 access to admin panel
2. Keep emergency contact list updated
3. Document all emergency actions taken
4. Conduct post-incident reviews for improvements

## Support & Troubleshooting

### Common Issues
- **Admin Access Denied**: Verify email in ADMIN_ALLOWED_EMAILS
- **Feature Not Responding**: Check feature flag state and system health
- **Slow Performance**: Review service status and database performance
- **High Error Rates**: Check recent alerts and consider feature rollback

### Getting Help
- Check system health dashboard first
- Review recent alert logs for clues
- Use diagnostic tools in admin panel
- Contact development team with specific error details

### Maintenance Windows
- Schedule feature flag changes during low-usage periods
- Coordinate with development team for system updates
- Communicate planned maintenance to user base
- Monitor system closely during and after changes