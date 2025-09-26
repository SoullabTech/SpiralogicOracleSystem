# Security Implementation Guide
## Critical HIPAA Features - Quick Start

**🚨 BEFORE BETA LAUNCH: Implement ALL items marked CRITICAL**

---

## 1. Database Encryption at Rest

### PostgreSQL Setup (Recommended)
```bash
# Install PostgreSQL with encryption
brew install postgresql@15

# Enable Transparent Data Encryption
psql -d maia_db

-- Create encrypted tablespace
CREATE TABLESPACE encrypted_space
LOCATION '/encrypted/data'
WITH (encryption = 'aes256');

-- Create tables in encrypted space
CREATE TABLE soulprints (
  id UUID PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  encrypted_data BYTEA NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
) TABLESPACE encrypted_space;
```

### Prisma Schema with Encryption
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Soulprint {
  id              String   @id @default(uuid())
  userId          String   @unique
  encryptedData   Bytes    // Encrypted JSON blob
  createdAt       DateTime @default(now())
  lastUpdated     DateTime @updatedAt

  @@map("soulprints")
}

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

  @@index([userId])
  @@index([therapistId])
  @@index([timestamp])
  @@map("audit_logs")
}
```

### Encryption Helper
```typescript
// lib/security/encryption.ts
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'base64'); // 32 bytes
const IV_LENGTH = 16;

export function encrypt(data: any): { encrypted: string; iv: string; tag: string } {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const tag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex')
  };
}

export function decrypt(encryptedData: string, iv: string, tag: string): any {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    KEY,
    Buffer.from(iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(tag, 'hex'));

  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return JSON.parse(decrypted);
}

// Generate encryption key (run once, store in .env)
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('base64');
}
```

---

## 2. Authentication & Authorization

### NextAuth.js Setup
```bash
npm install next-auth @next-auth/prisma-adapter
```

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        mfaCode: { label: "MFA Code", type: "text" }
      },
      async authorize(credentials) {
        // Verify credentials + MFA
        const user = await verifyUserCredentials(credentials);
        if (user) return user;
        return null;
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 60, // 30 minutes
  },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub;
        session.user.role = token.role;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### Role-Based Access Control Middleware
```typescript
// lib/security/rbac.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export type Role = 'user' | 'therapist' | 'admin' | 'auditor';

export async function requireAuth(allowedRoles: Role[] = []) {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error('Unauthorized');
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(session.user.role)) {
    throw new Error('Forbidden');
  }

  return session;
}

// Usage in API routes
export async function GET(request: NextRequest) {
  const session = await requireAuth(['therapist', 'admin']);

  // Log access for HIPAA audit
  await logAudit({
    userId: session.user.id,
    action: 'access',
    resource: 'dashboard',
    result: 'success'
  });

  // ... rest of handler
}
```

---

## 3. Comprehensive Audit Logging

### Audit Service
```typescript
// lib/security/auditLog.ts
import { prisma } from '@/lib/prisma';

export interface AuditLogEntry {
  userId: string;
  therapistId?: string;
  action: 'access' | 'modify' | 'export' | 'delete' | 'login' | 'logout';
  resource: string;
  resourceId: string;
  ipAddress: string;
  userAgent: string;
  result: 'success' | 'failure';
  reason?: string;
  metadata?: Record<string, any>;
}

export async function logAudit(entry: AuditLogEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        timestamp: new Date(),
        userId: entry.userId,
        therapistId: entry.therapistId,
        action: entry.action,
        resource: entry.resource,
        resourceId: entry.resourceId,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        result: entry.result,
        metadata: entry.metadata ? JSON.stringify(entry.metadata) : null
      }
    });

    // Also log to secure external service (e.g., AWS CloudWatch)
    if (process.env.NODE_ENV === 'production') {
      await externalAuditLog(entry);
    }
  } catch (error) {
    // CRITICAL: Audit logging failures must be monitored
    console.error('[AUDIT CRITICAL] Failed to log audit entry:', error);
    // Alert security team
    await alertSecurityTeam('Audit logging failure', entry);
  }
}

// Audit log query helper (for compliance audits)
export async function queryAuditLogs(filters: {
  userId?: string;
  startDate: Date;
  endDate: Date;
  action?: string;
}) {
  return await prisma.auditLog.findMany({
    where: {
      userId: filters.userId,
      timestamp: {
        gte: filters.startDate,
        lte: filters.endDate
      },
      action: filters.action
    },
    orderBy: {
      timestamp: 'desc'
    }
  });
}
```

### Audit Logging Middleware
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logAudit } from '@/lib/security/auditLog';

export async function middleware(request: NextRequest) {
  const session = await getToken({ req: request });

  // Log all PHI access attempts
  if (request.nextUrl.pathname.startsWith('/api/maia')) {
    await logAudit({
      userId: session?.sub || 'anonymous',
      action: 'access',
      resource: 'api',
      resourceId: request.nextUrl.pathname,
      ipAddress: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      result: 'success'
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/maia/:path*'
};
```

---

## 4. Secure File Storage

### Encrypted Obsidian Vault
```bash
# macOS: FileVault (built-in)
sudo fdesetup enable

# Linux: LUKS encryption
sudo cryptsetup luksFormat /dev/sdX
sudo cryptsetup open /dev/sdX encrypted_vault
sudo mkfs.ext4 /dev/mapper/encrypted_vault
sudo mount /dev/mapper/encrypted_vault /mnt/vault
```

### File Encryption Service
```typescript
// lib/security/fileEncryption.ts
import fs from 'fs/promises';
import path from 'path';
import { encrypt, decrypt } from './encryption';

export async function writeEncryptedFile(
  filePath: string,
  content: string
): Promise<void> {
  const { encrypted, iv, tag } = encrypt(content);

  const encryptedContent = JSON.stringify({ encrypted, iv, tag });

  await fs.writeFile(filePath + '.enc', encryptedContent, 'utf-8');

  // Set restrictive permissions (owner read/write only)
  await fs.chmod(filePath + '.enc', 0o600);
}

export async function readEncryptedFile(filePath: string): Promise<string> {
  const encryptedContent = await fs.readFile(filePath + '.enc', 'utf-8');
  const { encrypted, iv, tag } = JSON.parse(encryptedContent);

  return decrypt(encrypted, iv, tag);
}
```

---

## 5. Secure Backups

### Automated Backup Script
```bash
#!/bin/bash
# scripts/backup.sh

# Configuration
BACKUP_DIR="/secure/backups"
DB_NAME="maia_db"
ENCRYPTION_KEY=$(cat /secure/keys/backup.key)
DATE=$(date +%Y%m%d_%H%M%S)

# Create encrypted database backup
pg_dump $DB_NAME | \
  gzip | \
  openssl enc -aes-256-cbc -salt -pass pass:$ENCRYPTION_KEY \
  > "$BACKUP_DIR/db_backup_$DATE.sql.gz.enc"

# Backup Obsidian vault (encrypted)
tar czf - /path/to/vault | \
  openssl enc -aes-256-cbc -salt -pass pass:$ENCRYPTION_KEY \
  > "$BACKUP_DIR/vault_backup_$DATE.tar.gz.enc"

# Upload to secure off-site storage (e.g., AWS S3 with encryption)
aws s3 cp "$BACKUP_DIR/db_backup_$DATE.sql.gz.enc" \
  s3://maia-backups/db/ \
  --server-side-encryption AES256

aws s3 cp "$BACKUP_DIR/vault_backup_$DATE.tar.gz.enc" \
  s3://maia-backups/vault/ \
  --server-side-encryption AES256

# Rotate old backups (keep 90 days)
find $BACKUP_DIR -type f -mtime +90 -delete

# Log backup completion
echo "[$(date)] Backup completed successfully" >> /var/log/maia/backups.log
```

### Backup Cron Job
```bash
# Add to crontab
crontab -e

# Daily backup at 2 AM
0 2 * * * /usr/local/bin/maia-backup.sh

# Weekly backup test (restore to test environment)
0 3 * * 0 /usr/local/bin/maia-backup-test.sh
```

---

## 6. Session Management

### Secure Session Configuration
```typescript
// lib/security/session.ts
import { SessionOptions } from 'next-auth';

export const sessionConfig: SessionOptions = {
  // Session expires after 30 minutes
  maxAge: 30 * 60,

  // Update session activity every 5 minutes
  updateAge: 5 * 60,

  // Use JWT for stateless sessions
  strategy: 'jwt',

  // Secure cookie settings
  cookies: {
    sessionToken: {
      name: '__Secure-next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true // HTTPS only
      }
    }
  }
};

// Auto-logout component
export function SessionTimeout() {
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        // Force logout after 30 minutes of inactivity
        signOut({ callbackUrl: '/login?timeout=true' });
      }, 30 * 60 * 1000);
    };

    // Reset timer on user activity
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);

    resetTimer();

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
    };
  }, []);

  return null;
}
```

---

## 7. Environment Variables (Secrets Management)

### .env.production (ENCRYPTED)
```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/maia_db?sslmode=require"

# Encryption keys (generated with crypto.randomBytes(32).toString('base64'))
ENCRYPTION_KEY="[32-byte base64 key]"
BACKUP_ENCRYPTION_KEY="[32-byte base64 key]"

# Authentication
NEXTAUTH_SECRET="[random 32+ character string]"
NEXTAUTH_URL="https://your-domain.com"

# API Keys (from providers with BAAs)
ANTHROPIC_API_KEY="[key from Anthropic BAA]"

# Obsidian Vault (encrypted volume)
OBSIDIAN_VAULT_PATH="/encrypted/vault"

# Audit Logging
AUDIT_LOG_ENDPOINT="https://logs.your-domain.com"
SECURITY_ALERT_EMAIL="security@your-domain.com"

# Backup
BACKUP_S3_BUCKET="maia-encrypted-backups"
AWS_ACCESS_KEY_ID="[key]"
AWS_SECRET_ACCESS_KEY="[secret]"
```

### AWS Secrets Manager (Recommended for Production)
```typescript
// lib/security/secrets.ts
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({ region: "us-east-1" });

export async function getSecret(secretName: string): Promise<string> {
  const command = new GetSecretValueCommand({ SecretId: secretName });
  const response = await client.send(command);
  return response.SecretString!;
}

// Usage
const encryptionKey = await getSecret('maia/encryption-key');
```

---

## 8. Quick Setup Checklist

### Before Beta Launch

```bash
# 1. Generate encryption keys
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# 2. Set up encrypted database
createdb maia_db
psql maia_db < schema.sql

# 3. Configure authentication
npm install next-auth
# Configure authOptions (see above)

# 4. Set up audit logging
npx prisma migrate dev --name add_audit_logs

# 5. Configure encrypted file storage
# Enable FileVault (macOS) or LUKS (Linux)

# 6. Set up automated backups
chmod +x scripts/backup.sh
crontab -e  # Add backup schedule

# 7. Test security
npm run security:test

# 8. Execute BAAs
# Contact Anthropic, hosting provider, etc.

# 9. Create incident response plan
# Use INCIDENT_RESPONSE_PLAN_TEMPLATE.md

# 10. Train team on HIPAA compliance
# Review HIPAA_COMPLIANCE.md with all staff
```

---

## 🔒 Security Testing Commands

```bash
# Test encryption
npm run test:encryption

# Test authentication
npm run test:auth

# Test audit logging
npm run test:audit

# Test backup/restore
npm run test:backup

# Full security audit
npm run security:audit

# Penetration testing (hire external firm)
# Recommended: HackerOne, Bugcrowd, or specialized HIPAA security firm
```

---

## 📞 Emergency Contacts

**Security Breach:** security@your-domain.com
**HIPAA Officer:** hipaa@your-domain.com
**Legal:** legal@your-domain.com
**Hosting Support:** [provider support]

---

**IMPORTANT:** Review this guide with your security team and legal counsel before implementation.