#!/bin/bash

# --- CONFIG: edit if your SSD path differs ---
SSD_MOUNT="/Volumes/T7 Shield"
SSD_SUBDIR="DockerData/DockerDesktop"
# ---------------------------------------------

set -euo pipefail

echo "1) Quit Docker Desktop"
osascript -e 'quit app "Docker"' || true
sleep 2

echo "2) Ensure SSD target exists and is writable"
TARGET_DIR="${SSD_MOUNT}/${SSD_SUBDIR}"
[ -d "$SSD_MOUNT" ] || { echo "SSD not mounted at: $SSD_MOUNT"; exit 1; }
mkdir -p "$TARGET_DIR"
touch "$TARGET_DIR/.write-test" && rm -f "$TARGET_DIR/.write-test"

echo "3) Locate current Docker.raw"
DOCKER_RAW=""
for p in \
  "$HOME/Library/Containers/com.docker.docker/Data/vms/0/data/Docker.raw" \
  "$HOME/Library/Containers/com.docker.docker/Data/vms/0/Docker.raw" \
  "$HOME/Library/Containers/com.docker.docker/Data/docker.raw"
do
  if [ -f "$p" ]; then DOCKER_RAW="$p"; break; fi
done
[ -n "$DOCKER_RAW" ] || DOCKER_RAW="$(/usr/bin/find "$HOME/Library/Containers/com.docker.docker" -name Docker.raw -type f 2>/dev/null | head -n1 || true)"
[ -f "$DOCKER_RAW" ] || { echo "Could not find Docker.raw under ~/Library/Containers/com.docker.docker"; exit 1; }
echo "   Found: $DOCKER_RAW"

TARGET_RAW="${TARGET_DIR}/Docker.raw"

echo "4) Move Docker.raw to SSD (copy+verify, then delete original)"
rsync -aP --sparse "$DOCKER_RAW" "$TARGET_RAW"

SRC_SIZE=$(stat -f%z "$DOCKER_RAW")
DST_SIZE=$(stat -f%z "$TARGET_RAW")
echo "   Source bytes: $SRC_SIZE"
echo "   Target bytes: $DST_SIZE"
[ "$SRC_SIZE" = "$DST_SIZE" ] || { echo "Size mismatch after copy; aborting"; exit 1; }

# Remove original to free internal space
mv "$DOCKER_RAW" "${DOCKER_RAW}.bak"
rm -f "${DOCKER_RAW}.bak"

echo "5) Create symlink back at original path"
# Recreate original path directory if needed and link
mkdir -p "$(dirname "$DOCKER_RAW")"
ln -s "$TARGET_RAW" "$DOCKER_RAW"
ls -l "$DOCKER_RAW"

echo "6) Start Docker Desktop"
open -ga "Docker"
# give it a few seconds to boot
for i in {1..20}; do sleep 1; done

echo "7) Verify Docker is using the SSD file"
readlink "$DOCKER_RAW" || true
if lsof | grep -q "$TARGET_RAW"; then
  echo "✓ Confirmed: Docker.raw is open from SSD ($TARGET_RAW)"
else
  echo "⚠ Didn't catch it with lsof yet; Docker may still be initializing."
  echo "   You can re-run:  lsof | grep \"$TARGET_RAW\""
fi