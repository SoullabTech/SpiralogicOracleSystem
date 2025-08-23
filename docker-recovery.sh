#!/bin/bash
set -e

echo "🩹 Docker Desktop I/O Error Recovery"
echo "Fixing containerd snapshotter input/output errors..."

# Navigate to project directory
cd "/Volumes/T7 Shield/Projects/SpiralogicOracleSystem"

# Stop everything
echo "🛑 Stopping all containers..."
docker compose -f docker-compose.development.yml down -v --remove-orphans 2>/dev/null || true

# Check current disk usage
echo "💾 Current Docker disk usage:"
docker system df 2>/dev/null || echo "Docker daemon not running"

echo "🧹 Cleaning Docker space (removes unused containers, images, networks, volumes)..."
docker system prune -af --volumes 2>/dev/null || echo "Docker daemon not running"

echo "🧹 Cleaning builder cache..."
docker builder prune -af 2>/dev/null || echo "Docker daemon not running"

echo "💽 Checking host disk space:"
df -h "/" | head -2

echo ""
echo "🔍 Docker system info (check for warnings):"
docker info 2>/dev/null || echo "Docker daemon not running - please restart Docker Desktop"

echo ""
echo "✅ Docker cleanup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Restart Docker Desktop (Quit & Reopen)"
echo "2. If I/O errors persist:"
echo "   - Docker Desktop → Settings → Resources → Advanced: increase disk image size"  
echo "   - Docker Desktop → Troubleshoot → Clean/Purge data (last resort)"
echo "3. Run rebuild-production.sh once Docker is healthy"