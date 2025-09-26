# HIPAA Audit Logging System
## Comprehensive Guide for MAIA Soul System

**Version:** 1.0.0
**Last Updated:** September 26, 2025
**Status:** ✅ IMPLEMENTED

---

## Overview

This document describes the tamper-proof audit logging system implemented for HIPAA compliance in the MAIA Soul System. The system automatically logs all access to Protected Health Information (PHI) and provides tools for querying, exporting, and verifying audit trails.

---

## Features

### ✅ Core Capabilities

1. **Tamper-Proof Logging**
   - SHA-256 hash chaining prevents log tampering
   - Each entry contains hash of previous entry
   - Integrity verification detects any modifications

2. **Persistent Storage**
   - File-based storage with daily rotation
   - JSON Lines (JSONL) format for efficient querying
   - Configurable directory location

3. **Automatic Replication**
   - Optional external service replication (production)
   - Supports AWS CloudWatch, Splunk, custom endpoints
   - Non-blocking async writes

4. **Security Team Alerting**
   - Automatic alerts on audit logging failures
   - Email notifications for critical events
   - Console warnings for monitoring

5. **Query and Export**
   - Filter by user, therapist, date range, action, result
   - Export as JSON or CSV for compliance reports
   - API endpoints for programmatic access

6. **Integrity Verification**
   - Verify hash chain integrity
   - Detect tampered entries
   - Report on log file validity

---

## Architecture

### File Structure

```
audit-logs/
├── audit-2025-09-26.jsonl    # Today's log
├── audit-2025-09-25.jsonl    # Previous days
├── audit-2025-09-24.jsonl
└── ...                       # Retained for 6+ years
```

### Log Entry Format

```json
{
  "id": "uuid-v4",
  "timestamp": "2025-09-26T14:30:00.000Z",
  "userId": "user-123",
  "therapistId": "therapist-456",
  "action": "access",
  "resource": "soulprint",
  "resourceId": "user-123",
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "result": "success",
  "reason": null,
  "metadata": {
    "symbolCount": 5,
    "milestoneCount": 3
  },
  "hash": "sha256-hash-of-entry",
  "previousHash": "sha256-hash-of-previous-entry"
}
```

### Hash Chain

```
Entry 1: hash(data1 + null)
Entry 2: hash(data2 + hash1)
Entry 3: hash(data3 + hash2)
...
```

If any entry is modified, all subsequent hashes become invalid.

---

## Usage

### Logging an Audit Event

```typescript
import { logAudit } from '@/lib/security/auditLog';

await logAudit({
  timestamp: new Date(),
  userId: 'user-123',
  therapistId: 'therapist-456', // Optional
  action: 'access',             // access | modify | export | delete | login | logout
  resource: 'soulprint',
  resourceId: 'user-123',
  ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
  userAgent: request.headers.get('user-agent') || 'unknown',
  result: 'success',            // success | failure
  reason: 'Optional failure reason',
  metadata: {
    // Any additional context
    symbolCount: 5,
    responseTime: 150
  }
});
```

### Querying Audit Logs

#### API Endpoint

```bash
# Query logs for specific user
GET /api/maia/audit/logs?userId=user-123&startDate=2025-09-01&endDate=2025-09-26

# Query logs by therapist
GET /api/maia/audit/logs?therapistId=therapist-456&startDate=2025-09-01&endDate=2025-09-26

# Query specific action type
GET /api/maia/audit/logs?action=export&startDate=2025-09-01&endDate=2025-09-26

# Query failures only
GET /api/maia/audit/logs?result=failure&startDate=2025-09-01&endDate=2025-09-26

# Export as CSV
GET /api/maia/audit/logs?startDate=2025-09-01&endDate=2025-09-26&format=csv

# Verify integrity while querying
GET /api/maia/audit/logs?startDate=2025-09-01&endDate=2025-09-26&verify=true
```

#### Programmatic Query

```typescript
import { queryAuditLogs } from '@/lib/security/auditLog';

const logs = await queryAuditLogs({
  userId: 'user-123',
  startDate: new Date('2025-09-01'),
  endDate: new Date('2025-09-26'),
  action: 'access',
  result: 'success'
});

console.log(`Found ${logs.length} matching entries`);
```

### Verifying Log Integrity

```typescript
import { verifyAuditIntegrity } from '@/lib/security/auditLog';

const integrity = await verifyAuditIntegrity();

if (integrity.valid) {
  console.log(`✅ All ${integrity.totalEntries} entries are valid`);
} else {
  console.error(`❌ ${integrity.invalidEntries.length} tampered entries detected`);
  console.error('Invalid entry IDs:', integrity.invalidEntries);
  // Alert security team immediately
}
```

### Exporting Compliance Reports

```typescript
import { exportAuditReport } from '@/lib/security/auditLog';

// JSON export
const jsonReport = await exportAuditReport({
  startDate: new Date('2025-09-01'),
  endDate: new Date('2025-09-26')
}, 'json');

// CSV export (for spreadsheet analysis)
const csvReport = await exportAuditReport({
  userId: 'user-123',
  startDate: new Date('2025-09-01'),
  endDate: new Date('2025-09-26')
}, 'csv');
```

---

## Configuration

### Environment Variables

Add to `.env.local`:

```bash
# Required: Directory for audit logs
AUDIT_LOG_DIR=./audit-logs

# Optional: External replication endpoint (production)
AUDIT_LOG_ENDPOINT=https://logs.your-domain.com/api/audit

# Optional: Security team email for alerts
SECURITY_ALERT_EMAIL=security@your-domain.com
```

### File Permissions

Ensure audit log directory has restricted permissions:

```bash
# Create audit log directory
mkdir -p audit-logs

# Set owner-only read/write permissions
chmod 700 audit-logs

# Verify permissions
ls -la | grep audit-logs
# Should show: drwx------ (700)
```

---

## Integration Points

### Existing Integrations

The audit logging system is already integrated into:

1. **Dashboard API** (`/api/maia/dashboard/aggregate/route.ts`)
   - Logs all therapist dashboard access
   - Tracks client count and response time
   - Records failures with error details

2. **Soulprint Export API** (`/api/maia/soulprint/export/route.ts`)
   - Logs individual exports
   - Logs batch exports
   - Tracks export size and content metadata

3. **Audit Query API** (`/api/maia/audit/logs/route.ts`)
   - Logs audit log queries (meta-auditing)
   - Logs integrity verification attempts

### Adding to New Endpoints

When creating new API routes that access PHI:

```typescript
import { logAudit } from '@/lib/security/auditLog';

export async function GET(request: NextRequest) {
  const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  try {
    // Log successful access
    await logAudit({
      timestamp: new Date(),
      userId: 'user-id',
      action: 'access',
      resource: 'your-resource',
      resourceId: 'resource-id',
      ipAddress,
      userAgent,
      result: 'success',
      metadata: { /* context */ }
    });

    // Your API logic here
    return NextResponse.json({ success: true });

  } catch (error) {
    // Log failure
    await logAudit({
      timestamp: new Date(),
      userId: 'user-id',
      action: 'access',
      resource: 'your-resource',
      resourceId: 'resource-id',
      ipAddress,
      userAgent,
      result: 'failure',
      reason: (error as Error).message
    });

    return NextResponse.json({ success: false }, { status: 500 });
  }
}
```

---

## Compliance Requirements

### HIPAA Requirements

✅ **Access Logging** - All PHI access is logged
✅ **Tamper Protection** - Hash chaining prevents tampering
✅ **6-Year Retention** - Logs are retained (manual archival required)
✅ **Audit Trail** - Complete who/what/when/where/why/how
✅ **Integrity Verification** - Can prove logs are unaltered

### Retention Policy

Per HIPAA requirements:
- **Minimum retention:** 6 years from date of creation or last active use
- **Automatic rotation:** Daily log files
- **Archive procedure:** Manual archival recommended after 90 days
- **Backup requirement:** Include audit logs in encrypted backups

### What to Log

✅ **Always Log:**
- PHI access (read, view, display)
- PHI modification (create, update, delete)
- PHI export (download, email, print)
- Authentication events (login, logout, MFA)
- Authorization failures (denied access attempts)
- System configuration changes

❌ **Never Log:**
- Actual PHI content (log metadata only)
- Passwords or credentials
- Encryption keys
- Social Security Numbers

---

## Monitoring and Alerting

### Daily Monitoring

Recommended daily checks:

```bash
# Check today's log size (should grow continuously)
ls -lh audit-logs/audit-$(date +%Y-%m-%d).jsonl

# Count entries
wc -l audit-logs/audit-$(date +%Y-%m-%d).jsonl

# Check for failures
grep '"result":"failure"' audit-logs/audit-$(date +%Y-%m-%d).jsonl
```

### Weekly Verification

Run integrity check weekly:

```bash
curl http://localhost:3000/api/maia/audit/logs \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"action":"verify-integrity"}'
```

### Monthly Reports

Generate monthly compliance report:

```bash
# Get current month's logs
START_DATE=$(date -d "$(date +%Y-%m-01)" +%Y-%m-%d)
END_DATE=$(date +%Y-%m-%d)

curl "http://localhost:3000/api/maia/audit/logs?startDate=${START_DATE}&endDate=${END_DATE}&format=csv" \
  > monthly-audit-$(date +%Y-%m).csv
```

---

## Troubleshooting

### Audit Logging Failures

If audit logging fails, the system will:
1. Log error to console with `[AUDIT CRITICAL]` prefix
2. Attempt to send email alert to security team
3. Continue operation (non-blocking)

**Action:** Monitor console for `[AUDIT CRITICAL]` messages and investigate immediately.

### Integrity Verification Failures

If integrity check fails:
1. Identify the compromised entry IDs
2. Determine when tampering occurred
3. Check for unauthorized system access
4. Follow incident response plan
5. Restore from backup if available

### Log File Rotation Issues

If logs grow too large:
- Consider daily rotation (already implemented)
- Archive old logs to cold storage
- Compress archived logs with encryption

### Permission Errors

If seeing permission errors:
```bash
# Fix directory permissions
chmod 700 audit-logs

# Fix file permissions
chmod 600 audit-logs/*.jsonl

# Check ownership
chown -R $USER:$USER audit-logs
```

---

## Testing

### Unit Tests

```typescript
// test/security/auditLog.test.ts
import { logAudit, queryAuditLogs, verifyAuditIntegrity } from '@/lib/security/auditLog';

describe('Audit Logging', () => {
  it('should log an audit entry', async () => {
    await logAudit({
      timestamp: new Date(),
      userId: 'test-user',
      action: 'access',
      resource: 'test',
      resourceId: 'test-1',
      ipAddress: '127.0.0.1',
      userAgent: 'test-agent',
      result: 'success'
    });

    const logs = await queryAuditLogs({
      userId: 'test-user',
      startDate: new Date(Date.now() - 60000),
      endDate: new Date()
    });

    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].userId).toBe('test-user');
  });

  it('should detect tampered logs', async () => {
    // Attempt to tamper with log file
    // ...

    const integrity = await verifyAuditIntegrity();
    expect(integrity.valid).toBe(false);
  });
});
```

### Integration Tests

```bash
# Test audit logging API
npm run test:audit

# Test with real requests
./scripts/test-audit-logging.sh
```

---

## Best Practices

### 1. Log Early, Log Often

```typescript
// ✅ Good: Log at the start of operation
await logAudit({ action: 'access', ... });
const data = await fetchPHI();

// ❌ Bad: Log after operation (might not log if error)
const data = await fetchPHI();
await logAudit({ action: 'access', ... });
```

### 2. Include Rich Metadata

```typescript
// ✅ Good: Detailed metadata
await logAudit({
  // ...
  metadata: {
    endpoint: '/api/maia/export',
    responseTime: 150,
    recordCount: 10,
    exportFormat: 'csv'
  }
});

// ❌ Bad: No context
await logAudit({
  // ...
  metadata: {}
});
```

### 3. Always Log Failures

```typescript
try {
  // Operation
  await logAudit({ result: 'success', ... });
} catch (error) {
  // ✅ Always log the failure
  await logAudit({
    result: 'failure',
    reason: error.message,
    ...
  });
}
```

### 4. Use Specific Resource IDs

```typescript
// ✅ Good: Specific resource
await logAudit({
  resource: 'soulprint',
  resourceId: 'user-123',
  ...
});

// ❌ Bad: Generic resource
await logAudit({
  resource: 'data',
  resourceId: 'unknown',
  ...
});
```

---

## Migration to Database

Currently using file-based storage. For production, consider migrating to PostgreSQL:

### Prisma Schema

```prisma
model AuditLog {
  id            String   @id @default(uuid())
  timestamp     DateTime @default(now())
  userId        String
  therapistId   String?
  action        String
  resource      String
  resourceId    String
  ipAddress     String
  userAgent     String
  result        String
  reason        String?
  metadata      Json?
  hash          String
  previousHash  String?

  @@index([userId])
  @@index([therapistId])
  @@index([timestamp])
  @@index([action])
  @@map("audit_logs")
}
```

### Migration Steps

1. Create Prisma schema
2. Run migration: `npx prisma migrate dev`
3. Update `auditLog.ts` to use Prisma client
4. Keep file-based backup as fallback
5. Test thoroughly before deploying

---

## Security Considerations

### Protect Audit Logs

- **File permissions:** 700 (owner only)
- **Encryption at rest:** Use encrypted filesystem
- **Network isolation:** Restrict network access to log directory
- **No public access:** Never expose audit logs via public API without authentication

### Secure the API

```typescript
// TODO: Add authentication to audit query API
export async function GET(request: NextRequest) {
  // Verify user is auditor or admin
  const session = await getServerSession(authOptions);
  if (!session || !['auditor', 'admin'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // ... rest of query logic
}
```

### Monitor for Anomalies

Set up alerts for:
- Unusual access patterns (excessive queries, off-hours access)
- Multiple failures in short time
- Integrity verification failures
- Audit logging service downtime

---

## Support and Contact

**Security Issues:** security@your-domain.com
**HIPAA Questions:** compliance@your-domain.com
**Technical Support:** dev@your-domain.com

---

**Last Reviewed:** September 26, 2025
**Next Review:** March 26, 2026
**Version:** 1.0.0