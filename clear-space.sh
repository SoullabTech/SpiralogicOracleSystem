#!/bin/bash

echo "🧹 Clearing space for build recovery..."
echo "========================================="

echo "📊 Current disk space:"
df -h /

echo ""
echo "🗑️ Cleaning npm cache..."
npm cache clean --force

echo ""
echo "🐳 Cleaning Docker system..."
docker system prune -af --volumes
docker builder prune -af

echo ""
echo "📊 Disk space after cleanup:"
df -h /

echo ""
echo "✅ Space cleanup complete!"
echo "Now run: npm install lucide-react class-variance-authority tailwind-merge"