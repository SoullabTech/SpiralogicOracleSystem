#!/bin/bash
# Sync MD documentation to Obsidian Vault - Soullab Dev Team
# AIN Consciousness Intelligence System folder

PROJECT_ROOT="/Volumes/T7 Shield/Projects/SpiralogicOracleSystem"
OBSIDIAN_VAULT="/Volumes/T7 Shield/Soullab Dev Team Vault/AIN Consciousness Intelligence System"
DOCS_DIR="$PROJECT_ROOT/docs"

# Check if vault exists
if [ ! -d "$OBSIDIAN_VAULT" ]; then
  echo "Error: Obsidian vault not found at: $OBSIDIAN_VAULT"
  exit 1
fi

# Create project subfolder in vault to organize synced files
SYNC_TARGET="$OBSIDIAN_VAULT/SpiralogicOracleSystem"
mkdir -p "$SYNC_TARGET"

echo "Syncing MD files from $DOCS_DIR to $SYNC_TARGET..."

# Sync all markdown files, preserving directory structure
# -a: archive mode (recursive, preserve permissions, times, etc.)
# -v: verbose
# -u: update only (skip files that are newer on receiver)
# --include: only sync .md files
# --exclude: exclude everything else initially, then include directories
rsync -avu \
  --include='*/' \
  --include='*.md' \
  --exclude='*' \
  --exclude='node_modules/' \
  --exclude='.git/' \
  "$DOCS_DIR/" "$SYNC_TARGET/"

echo "✓ Sync complete"
echo "Synced to: $SYNC_TARGET"