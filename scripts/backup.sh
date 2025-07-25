#!/bin/bash
# AIN Sovereign Backup Script
# Creates encrypted backups of all critical system data

set -euo pipefail

# Configuration
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="ain_sovereign_${DATE}"
TEMP_DIR="/tmp/ain_backup_${DATE}"
LOG_FILE="/var/log/ain-backup.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

# Error handling
error_exit() {
    log "ERROR: $1"
    echo -e "${RED}❌ Backup failed: $1${NC}"
    cleanup
    exit 1
}

# Cleanup function
cleanup() {
    if [[ -d "${TEMP_DIR}" ]]; then
        rm -rf "${TEMP_DIR}"
    fi
}

# Trap for cleanup on exit
trap cleanup EXIT

echo -e "${BLUE}🗄️  AIN Sovereign Backup System${NC}"
echo "=================================="

# Check if running as root or with proper permissions
if [[ $EUID -eq 0 ]]; then
    log "Running as root"
elif [[ $(groups | grep -c docker) -eq 0 ]]; then
    error_exit "This script requires root privileges or docker group membership"
fi

# Verify required environment variables
if [[ -z "${BACKUP_ENCRYPTION_KEY:-}" ]]; then
    error_exit "BACKUP_ENCRYPTION_KEY environment variable is required"
fi

# Create backup directories
log "Creating backup directories"
mkdir -p "${BACKUP_DIR}" "${TEMP_DIR}"

echo -e "${YELLOW}📦 Starting backup process...${NC}"

# 1. Backup application data
log "Backing up application data"
echo -e "${YELLOW}📁 Backing up application data...${NC}"

if docker volume ls | grep -q ain_data; then
    docker run --rm \
        -v ain_data:/source:ro \
        -v "${TEMP_DIR}:/backup" \
        alpine:latest \
        tar czf /backup/ain_data.tar.gz -C /source .
    log "Application data backed up successfully"
else
    log "WARNING: ain_data volume not found, skipping"
fi

# 2. Backup elemental agent data
log "Backing up elemental agent data"
echo -e "${YELLOW}🔥 Backing up elemental agent data...${NC}"

for element in fire water earth air aether; do
    volume_name="${element}_data"
    if docker volume ls | grep -q "${volume_name}"; then
        docker run --rm \
            -v "${volume_name}:/source:ro" \
            -v "${TEMP_DIR}:/backup" \
            alpine:latest \
            tar czf "/backup/${volume_name}.tar.gz" -C /source .
        log "${element} agent data backed up successfully"
    else
        log "WARNING: ${volume_name} volume not found, skipping"
    fi
done

# 3. Backup PostgreSQL database
log "Backing up PostgreSQL database"
echo -e "${YELLOW}🗃️  Backing up PostgreSQL database...${NC}"

if docker ps | grep -q postgres; then
    docker exec postgres pg_dumpall -U ain | gzip > "${TEMP_DIR}/postgres_backup.sql.gz"
    log "PostgreSQL database backed up successfully"
else
    log "WARNING: PostgreSQL container not running, skipping database backup"
fi

# 4. Backup Redis data
log "Backing up Redis data"
echo -e "${YELLOW}💾 Backing up Redis data...${NC}"

if docker volume ls | grep -q redis_data; then
    docker run --rm \
        -v redis_data:/source:ro \
        -v "${TEMP_DIR}:/backup" \
        alpine:latest \
        tar czf /backup/redis_data.tar.gz -C /source .
    log "Redis data backed up successfully"
else
    log "WARNING: redis_data volume not found, skipping"
fi

# 5. Backup configuration files
log "Backing up configuration files"
echo -e "${YELLOW}⚙️  Backing up configuration files...${NC}"

config_files=(
    ".env.sovereign"
    "docker-compose.sovereign.yml"
    "config/"
    "scripts/"
)

for file in "${config_files[@]}"; do
    if [[ -e "$file" ]]; then
        cp -r "$file" "${TEMP_DIR}/"
        log "Backed up: $file"
    else
        log "WARNING: Configuration file not found: $file"
    fi
done

# 6. Backup logs
log "Backing up logs"
echo -e "${YELLOW}📋 Backing up logs...${NC}"

if [[ -d "/app/logs" ]]; then
    tar czf "${TEMP_DIR}/logs.tar.gz" -C "/app" logs/
    log "Application logs backed up successfully"
fi

if [[ -d "/var/log" ]]; then
    tar czf "${TEMP_DIR}/system_logs.tar.gz" \
        --exclude="/var/log/journal" \
        --exclude="/var/log/wtmp" \
        --exclude="/var/log/btmp" \
        -C "/var" log/
    log "System logs backed up successfully"
fi

# 7. Backup Docker images (optional)
if [[ "${BACKUP_DOCKER_IMAGES:-false}" == "true" ]]; then
    log "Backing up Docker images"
    echo -e "${YELLOW}🐳 Backing up Docker images...${NC}"
    
    # Get list of AIN-related images
    ain_images=$(docker images --format "{{.Repository}}:{{.Tag}}" | grep -E "(ain|sovereign|fire|water|earth|air|aether)" | head -10)
    
    if [[ -n "$ain_images" ]]; then
        echo "$ain_images" | while read -r image; do
            safe_name=$(echo "$image" | tr '/:' '_')
            docker save "$image" | gzip > "${TEMP_DIR}/image_${safe_name}.tar.gz"
            log "Backed up Docker image: $image"
        done
    fi
fi

# 8. Create metadata file
log "Creating backup metadata"
echo -e "${YELLOW}📝 Creating backup metadata...${NC}"

cat > "${TEMP_DIR}/backup_metadata.json" << EOF
{
    "backup_name": "${BACKUP_NAME}",
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "hostname": "$(hostname)",
    "backup_version": "1.0",
    "system_info": {
        "os": "$(uname -s)",
        "kernel": "$(uname -r)",
        "architecture": "$(uname -m)"
    },
    "docker_info": {
        "version": "$(docker --version 2>/dev/null || echo 'not available')",
        "containers": $(docker ps --format "{{.Names}}" | jq -R . | jq -s . 2>/dev/null || echo '[]')
    },
    "backup_contents": [
        "application_data",
        "elemental_agent_data", 
        "postgresql_database",
        "redis_data",
        "configuration_files",
        "logs"
    ]
}
EOF

# 9. Create the final archive
log "Creating final backup archive"
echo -e "${YELLOW}📦 Creating final backup archive...${NC}"

cd "${TEMP_DIR}"
tar czf "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" .
cd - > /dev/null

# 10. Encrypt the backup
log "Encrypting backup"
echo -e "${YELLOW}🔐 Encrypting backup...${NC}"

gpg --batch --yes --symmetric --cipher-algo AES256 \
    --passphrase "${BACKUP_ENCRYPTION_KEY}" \
    --output "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz.gpg" \
    "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"

# Remove unencrypted archive
rm "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"

# 11. Verify backup integrity
log "Verifying backup integrity"
echo -e "${YELLOW}✅ Verifying backup integrity...${NC}"

if gpg --batch --yes --decrypt --passphrase "${BACKUP_ENCRYPTION_KEY}" \
    "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz.gpg" | tar tzf - > /dev/null; then
    log "Backup integrity verification successful"
else
    error_exit "Backup integrity verification failed"
fi

# 12. Calculate backup size and checksum
backup_size=$(du -h "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz.gpg" | cut -f1)
backup_checksum=$(sha256sum "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz.gpg" | cut -d' ' -f1)

log "Backup size: ${backup_size}"
log "Backup checksum (SHA256): ${backup_checksum}"

# 13. Clean up old backups
if [[ -n "${BACKUP_RETENTION_DAYS:-}" ]]; then
    log "Cleaning up old backups (older than ${BACKUP_RETENTION_DAYS} days)"
    echo -e "${YELLOW}🧹 Cleaning up old backups...${NC}"
    
    find "${BACKUP_DIR}" -name "ain_sovereign_*.tar.gz.gpg" \
        -mtime "+${BACKUP_RETENTION_DAYS}" -delete
    
    log "Old backup cleanup completed"
fi

# 14. Send backup to remote location (if configured)
if [[ "${BACKUP_REMOTE_ENABLED:-false}" == "true" ]] && [[ -n "${BACKUP_S3_BUCKET:-}" ]]; then
    log "Uploading backup to remote storage"
    echo -e "${YELLOW}☁️  Uploading to remote storage...${NC}"
    
    if command -v aws > /dev/null; then
        aws s3 cp "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz.gpg" \
            "s3://${BACKUP_S3_BUCKET}/ain-backups/"
        log "Backup uploaded to S3 successfully"
    else
        log "WARNING: AWS CLI not found, skipping remote upload"
    fi
fi

# 15. Generate backup report
echo -e "${YELLOW}📊 Generating backup report...${NC}"

cat > "${BACKUP_DIR}/${BACKUP_NAME}_report.txt" << EOF
AIN Sovereign Backup Report
===========================

Backup Details:
- Name: ${BACKUP_NAME}
- Date: $(date)
- Size: ${backup_size}
- Checksum: ${backup_checksum}
- Location: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz.gpg

System Information:
- Hostname: $(hostname)
- OS: $(uname -s) $(uname -r)
- Docker Version: $(docker --version 2>/dev/null || echo 'not available')

Backup Contents:
$(cat "${TEMP_DIR}/backup_metadata.json" | jq -r '.backup_contents[]' 2>/dev/null || echo 'metadata not available')

Docker Containers at Backup Time:
$(docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}" 2>/dev/null || echo 'docker not available')

Storage Volumes:
$(docker volume ls 2>/dev/null || echo 'docker not available')

Backup Verification: PASSED
Encryption: AES256 with GPG

Notes:
- This backup is encrypted and requires the BACKUP_ENCRYPTION_KEY to restore
- To restore, use the ain-restore.sh script with this backup file
- Verify backup integrity regularly with automated tests
- Store encryption key securely and separately from backup files

EOF

# Final success message
echo -e "${GREEN}✅ Backup completed successfully!${NC}"
echo -e "${GREEN}📁 Backup file: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz.gpg${NC}"
echo -e "${GREEN}📊 Report file: ${BACKUP_DIR}/${BACKUP_NAME}_report.txt${NC}"
echo -e "${GREEN}💾 Backup size: ${backup_size}${NC}"

log "Backup process completed successfully"
log "Backup file: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz.gpg"
log "Backup size: ${backup_size}"
log "Backup checksum: ${backup_checksum}"

# Health check notification (if webhook configured)
if [[ -n "${BACKUP_WEBHOOK_URL:-}" ]]; then
    curl -X POST "${BACKUP_WEBHOOK_URL}" \
        -H "Content-Type: application/json" \
        -d "{
            \"status\": \"success\",
            \"backup_name\": \"${BACKUP_NAME}\",
            \"size\": \"${backup_size}\",
            \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
        }" 2>/dev/null || log "WARNING: Failed to send webhook notification"
fi

echo -e "${BLUE}🚀 Your AIN system data is now safely backed up and encrypted!${NC}"