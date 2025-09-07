#!/bin/bash

# SpiralogicOracleSystem Space Cleanup Script
# This script safely removes temporary files and caches to free up disk space

echo "🧹 SpiralogicOracleSystem Cleanup Script"
echo "======================================="
echo ""

# Function to safely remove directories
safe_remove() {
    if [ -d "$1" ]; then
        size=$(du -sh "$1" 2>/dev/null | cut -f1)
        echo "Removing $1 (Size: $size)..."
        rm -rf "$1"
        echo "✓ Removed"
    else
        echo "⚠️  $1 not found, skipping..."
    fi
    echo ""
}

# Project cleanup
echo "📁 Project Cleanup:"
echo "-------------------"

# Remove all node_modules directories
echo "🗑️  Removing node_modules directories..."
safe_remove "node_modules"
safe_remove "backend/node_modules"
safe_remove "sacred-mirror-mvp/node_modules"
safe_remove "spiralogic-northflank/node_modules"
safe_remove ".npm-cache"

# Remove coverage directories
echo "📊 Removing coverage reports..."
safe_remove "backend/coverage"
safe_remove "coverage"
safe_remove "htmlcov"

# Remove Python caches
echo "🐍 Removing Python caches..."
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null
find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null
echo "✓ Python caches cleaned"
echo ""

# Remove build artifacts
echo "🏗️  Removing build artifacts..."
safe_remove "backend/dist"
safe_remove "backend/dist-minimal"
safe_remove "dist"
safe_remove "build"
safe_remove ".next"
safe_remove ".turbo"

# Mac system cleanup (optional)
echo ""
echo "💻 Mac System Cleanup (Optional):"
echo "---------------------------------"
echo "The following will clean system caches:"
echo "  • npm cache: ~/.npm (1.0G)"
echo "  • VSCode cache: ~/Library/Application Support/Code (588M)"
echo ""
read -p "Do you want to clean Mac system caches? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️  Cleaning npm cache..."
    npm cache clean --force
    echo "✓ npm cache cleaned"
    
    echo ""
    echo "🗑️  Cleaning VSCode cache..."
    rm -rf ~/Library/Application\ Support/Code/Cache/*
    rm -rf ~/Library/Application\ Support/Code/CachedData/*
    echo "✓ VSCode cache cleaned"
fi

echo ""
echo "✨ Cleanup complete!"
echo ""
echo "To reinstall dependencies, run:"
echo "  npm install"
echo "  cd backend && npm install"
echo ""