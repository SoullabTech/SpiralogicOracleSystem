#!/bin/bash

# Docker SSD Migration Script
# Moves Docker.raw to external SSD and creates symlink

set -euo pipefail

# ========= CONFIG =========
SSD_VOLUME_NAME="T7 Shield"
SSD_SUBDIR="DockerData/DockerDesktop"
# =========================

SSD_MOUNT="/Volumes/${SSD_VOLUME_NAME}"
TARGET_DIR="${SSD_MOUNT}/${SSD_SUBDIR}"

echo "=== Docker SSD Migration Starting ==="

# Step 1: Quit Docker Desktop
echo "1) Quit Docker Desktop"
osascript -e 'quit app "Docker"' || true
sleep 2
echo "✓ Docker Desktop quit (or wasn't running)."

# Step 2: Full Disk Access hint
echo "2) Full Disk Access Check"
echo "If you hit permissions errors, grant Full Disk Access to Terminal & Docker:"
echo "System Settings → Privacy & Security → Full Disk Access → enable Terminal, Docker, com.docker.backend"

# Step 3: Prepare SSD target directory
echo "3) Prepare SSD target directory"
if [ ! -d "$SSD_MOUNT" ]; then
  echo "✖ SSD not mounted at: $SSD_MOUNT"
  exit 1
fi
mkdir -p "$TARGET_DIR"
touch "$TARGET_DIR/.write-test" && rm -f "$TARGET_DIR/.write-test"
echo "✓ Target directory: $TARGET_DIR"

# Step 4: Locate the largest Docker.raw
echo "4) Locate the largest Docker.raw in Library"
SEARCH_ROOT="$HOME/Library/Containers/com.docker.docker"
if [ ! -d "$SEARCH_ROOT" ]; then
  echo "✖ Docker Library path not found: $SEARCH_ROOT"
  echo "  Launch Docker once to let it create its files, then rerun."
  exit 1
fi

# Find all Docker.raw files and pick the largest
LARGEST_FILE=""
LARGEST_SIZE=0
while IFS= read -r -d '' file; do
  if [ -f "$file" ]; then
    SIZE=$(stat -f%z "$file")
    if [ "$SIZE" -gt "$LARGEST_SIZE" ]; then
      LARGEST_SIZE="$SIZE"
      LARGEST_FILE="$file"
    fi
  fi
done < <(find "$SEARCH_ROOT" -type f -name Docker.raw -print0)

if [ -z "$LARGEST_FILE" ]; then
  echo "✖ No Docker.raw found under $SEARCH_ROOT"
  exit 1
fi

SRC_PATH="$LARGEST_FILE"
echo "✓ Selected Docker.raw (largest):"
echo "  Size: $LARGEST_SIZE bytes"
echo "  Path: $SRC_PATH"

# Step 5: Skip if already symlinked to SSD
echo "5) Check if already symlinked to SSD"
if [ -L "$SRC_PATH" ] && readlink "$SRC_PATH" | grep -q "/Volumes/${SSD_VOLUME_NAME}/${SSD_SUBDIR}/Docker.raw"; then
  echo "✓ Already symlinked to SSD. Nothing to do."
  exit 0
fi
echo "Proceeding with relocation…"

# Step 6: Copy Docker.raw to SSD
echo "6) Copy Docker.raw to SSD (shows progress)"
TARGET_RAW="${TARGET_DIR}/Docker.raw"

# If a target already exists, back it up
if [ -f "$TARGET_RAW" ]; then
  BKP="${TARGET_RAW}.preexisting.$(date +%Y%m%d%H%M%S)"
  echo "⚠ Target exists; backing up to: $BKP"
  mv "$TARGET_RAW" "$BKP"
fi

echo "→ Copying…"
rsync -aP --sparse "$SRC_PATH" "$TARGET_RAW"

SRC_SIZE=$(stat -f%z "$SRC_PATH")
DST_SIZE=$(stat -f%z "$TARGET_RAW")
echo "Source bytes: $SRC_SIZE"
echo "Target bytes: $DST_SIZE"
if [ "$SRC_SIZE" != "$DST_SIZE" ]; then
  echo "✖ Size mismatch after copy. Aborting to keep data safe."
  exit 1
fi
echo "✓ Copy verified."

# Step 7: Replace original with symlink to SSD
echo "7) Replace original with symlink to SSD"
BACKUP="${SRC_PATH}.bak.$(date +%Y%m%d%H%M%S)"

# Move original out of the way (frees space), then remove backup
mv "$SRC_PATH" "$BACKUP"
rm -f "$BACKUP"

mkdir -p "$(dirname "$SRC_PATH")"
ln -s "$TARGET_RAW" "$SRC_PATH"
echo "✓ Symlink created:"
ls -l "$SRC_PATH"

# Step 8: Start Docker Desktop
echo "8) Start Docker Desktop"
open -ga "Docker"
echo "→ Docker Desktop starting…"
for i in {1..20}; do sleep 1; done
echo "✓ Start requested."

# Step 9: Verify Docker is using SSD file
echo "9) Verify Docker is using SSD file"
echo "Symlink target:"
readlink "$SRC_PATH" || true

if lsof | grep -q "$TARGET_RAW"; then
  echo "✓ Confirmed: Docker.raw is open from SSD → $TARGET_RAW"
else
  echo "⚠ Did not catch it with lsof yet (Docker may still be initializing)."
  echo "  Re-run manually:"
  echo "    lsof | grep \"$TARGET_RAW\""
fi

echo ""
echo "=== MIGRATION COMPLETE ==="
echo "Docker's disk image now lives at:"
echo "/Volumes/${SSD_VOLUME_NAME}/${SSD_SUBDIR}/Docker.raw"
echo "and the original Library path is a symlink to it."
echo ""
echo "Visual checks (Finder):"
echo "- T7 Shield → DockerData → DockerDesktop should contain a large Docker.raw"
echo "- ~/Library/Containers/com.docker.docker/Data/vms/0/data/Docker.raw should show a small arrow (symlink)"
echo ""
echo "Rollback (if ever needed):"
echo "1) Quit Docker"
echo "2) rm -f ~/Library/Containers/com.docker.docker/Data/vms/0/data/Docker.raw"
echo "3) cp \"/Volumes/${SSD_VOLUME_NAME}/${SSD_SUBDIR}/Docker.raw\" ~/Library/Containers/com.docker.docker/Data/vms/0/data/Docker.raw"
echo "4) Start Docker"