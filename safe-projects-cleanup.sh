#!/bin/bash

# Safe Projects Cleanup Script
# Archives before deletion to prevent accidental data loss

echo "🗄️  Safe Projects Cleanup Script"
echo "==============================="
echo ""

# Set archive location
ARCHIVE_DIR="$HOME/Desktop/ProjectsArchive_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$ARCHIVE_DIR"

echo "📁 Archive location: $ARCHIVE_DIR"
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to safely archive and remove
safe_cleanup() {
    local path="$1"
    local name=$(basename "$path")
    
    if [ -e "$path" ]; then
        size=$(du -sh "$path" 2>/dev/null | cut -f1)
        echo "Processing: $name (Size: $size)"
        
        # Archive first
        echo "  → Archiving to $ARCHIVE_DIR/$name.tar.gz..."
        tar -czf "$ARCHIVE_DIR/$name.tar.gz" -C "$(dirname "$path")" "$name" 2>/dev/null
        
        if [ $? -eq 0 ]; then
            echo -e "  ${GREEN}✓ Archived successfully${NC}"
            
            # Now remove
            rm -rf "$path"
            echo -e "  ${GREEN}✓ Removed original${NC}"
        else
            echo -e "  ${YELLOW}⚠ Archive failed, skipping removal${NC}"
        fi
        echo ""
    else
        echo -e "${YELLOW}⚠ $name not found, skipping...${NC}"
        echo ""
    fi
}

# Confirm before proceeding
echo "This script will archive then remove:"
echo "  • ~/Projects/SpiralogicOracleSystem (2GB)"
echo "  • ~/Projects/Spiralogic-backup (937MB)"
echo "  • ~/Projects/oracle-backend 2 (134MB)"
echo "  • ~/Projects/node_modules (47MB)"
echo ""
echo "Archives will be saved to: $ARCHIVE_DIR"
echo ""
read -p "Continue with safe cleanup? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🧹 Starting safe cleanup..."
    echo "-------------------------"
    
    # Clean each item
    safe_cleanup "$HOME/Projects/SpiralogicOracleSystem"
    safe_cleanup "$HOME/Projects/Spiralogic-backup"
    safe_cleanup "$HOME/Projects/oracle-backend 2"
    safe_cleanup "$HOME/Projects/node_modules"
    
    # Summary
    ARCHIVE_SIZE=$(du -sh "$ARCHIVE_DIR" 2>/dev/null | cut -f1)
    echo "✨ Cleanup complete!"
    echo ""
    echo "📊 Summary:"
    echo "  • Archives created in: $ARCHIVE_DIR"
    echo "  • Archive size: $ARCHIVE_SIZE"
    echo "  • Space freed: ~3GB"
    echo ""
    echo "💡 Tip: You can safely delete the archive folder after verifying everything works:"
    echo "  rm -rf $ARCHIVE_DIR"
else
    echo ""
    echo "❌ Cleanup cancelled. No changes made."
fi