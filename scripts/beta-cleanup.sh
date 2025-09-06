#!/bin/bash

# Beta Launch Cleanup Script
# Removes temporary files, test files, and prepares codebase for production

echo "🚀 Starting Beta Launch Cleanup..."

# Set base directory
BASE_DIR="/Volumes/T7 Shield/Projects/SpiralogicOracleSystem"
cd "$BASE_DIR"

# Create backup directory for deleted files (just in case)
BACKUP_DIR="$BASE_DIR/.beta-cleanup-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📦 Backup directory: $BACKUP_DIR"

# Function to safely move files to backup
safe_remove() {
    local file="$1"
    if [ -e "$file" ]; then
        echo "  Moving: $file"
        mkdir -p "$BACKUP_DIR/$(dirname "$file")"
        mv "$file" "$BACKUP_DIR/$file"
    fi
}

# 1. Remove temp-frontend-files directory
echo "🗑️  Removing temporary frontend files..."
if [ -d "backend/temp-frontend-files" ]; then
    echo "  Found temp-frontend-files directory"
    mv "backend/temp-frontend-files" "$BACKUP_DIR/backend/"
fi

# 2. Remove test files from root and backend
echo "🧪 Removing test files from production locations..."
for file in test-*.js test-*.ts test-*.tsx backend/test-*.js backend/test-*.ts; do
    safe_remove "$file"
done

# 3. Remove dev-archive if it exists
echo "📚 Removing dev-archive..."
if [ -d "dev-archive" ]; then
    mv "dev-archive" "$BACKUP_DIR/"
fi

# 4. Clean up nested duplicate directories
echo "🔍 Checking for nested duplicate directories..."
if [ -d "SpiralogicOracleSystem" ]; then
    echo "  Found nested SpiralogicOracleSystem directory"
    mv "SpiralogicOracleSystem" "$BACKUP_DIR/"
fi

# 5. Remove Maya voice test files
echo "🎤 Removing voice test files..."
for file in backend/maya-voice-*.wav backend/maya-demo-*.md; do
    safe_remove "$file"
done

# 6. Remove .port files
echo "🔌 Removing port configuration files..."
safe_remove "backend/.port"

# 7. Clean up logs directory (keep structure but remove old logs)
echo "📝 Cleaning up logs..."
if [ -d "logs" ]; then
    find logs -type f -name "*.log" -mtime +7 -exec rm {} \;
    find logs -type f -name "*.jsonl" -size +10M -exec rm {} \;
fi

# 8. Remove duplicate Sesame directories
echo "🔧 Cleaning Sesame duplicates..."
for dir in csm sesame-csm sesame_csm_openai; do
    if [ -d "$dir" ]; then
        echo "  Found duplicate Sesame directory: $dir"
        mv "$dir" "$BACKUP_DIR/"
    fi
done

# 9. Create .gitignore entries for test files
echo "📋 Updating .gitignore..."
cat >> .gitignore << 'EOF'

# Beta cleanup - test files
test-*.js
test-*.ts
test-*.tsx
backend/test-*.js
backend/test-*.ts
**/temp-frontend-files/
dev-archive/
*.test.tsx
*.test.ts
*.test.js

# Voice test files
backend/maya-voice-*.wav
backend/*.wav
public/audio/test-*.mp3
public/audio/sesame-*.wav

# Port and config files
backend/.port
.port

# Nested duplicates
SpiralogicOracleSystem/

# Sesame duplicates
csm/
sesame-csm/
sesame_csm_openai/

# Large log files
logs/*.log
logs/*.jsonl
EOF

# 10. Check for hardcoded localhost URLs
echo "🌐 Scanning for remaining hardcoded localhost URLs..."
grep -r "localhost:30" --include="*.ts" --include="*.tsx" --include="*.js" --exclude-dir=node_modules --exclude-dir=.next 2>/dev/null | head -20

# 11. Count cleanup results
echo ""
echo "✅ Cleanup Complete!"
echo "📊 Statistics:"
echo "  - Files backed up: $(find "$BACKUP_DIR" -type f 2>/dev/null | wc -l)"
echo "  - Space saved: $(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)"

# 12. Provide restoration command
echo ""
echo "💾 To restore backed up files, run:"
echo "  cp -r \"$BACKUP_DIR\"/* ."
echo ""
echo "🗑️  To permanently delete backup, run:"
echo "  rm -rf \"$BACKUP_DIR\""

echo ""
echo "🎯 Next steps for beta launch:"
echo "  1. Run: npm run build (to verify build succeeds)"
echo "  2. Run: npm run typecheck (to verify TypeScript)"
echo "  3. Deploy to Vercel/production"
echo "  4. Test all critical paths"