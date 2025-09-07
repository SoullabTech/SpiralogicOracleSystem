#!/bin/bash

# Sacred Asset Guardrails System
# Ensures all media assets are properly organized and previews are generated

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🔮 Sacred Asset Guardrails System${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Define allowed asset directories
DOCS_DIR="docs"
ASSET_BASE="$DOCS_DIR/assets"
AUDIO_DIR="$ASSET_BASE/audio"
VIDEO_DIR="$ASSET_BASE/video"
IMAGE_DIR="$ASSET_BASE/images"
PREVIEW_DIR="$ASSET_BASE/previews"

# Find misplaced media files
MISPLACED_AUDIO=$(find . -type f \( -name "*.mp3" -o -name "*.wav" -o -name "*.m4a" -o -name "*.flac" \) \
    ! -path "./node_modules/*" \
    ! -path "./.git/*" \
    ! -path "./$AUDIO_DIR/*" \
    ! -path "./public/audio/*" 2>/dev/null || true)

MISPLACED_VIDEO=$(find . -type f \( -name "*.mp4" -o -name "*.mov" -o -name "*.webm" -o -name "*.avi" \) \
    ! -path "./node_modules/*" \
    ! -path "./.git/*" \
    ! -path "./$VIDEO_DIR/*" \
    ! -path "./public/video/*" 2>/dev/null || true)

MISPLACED_IMAGES=$(find . -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.gif" -o -name "*.svg" \) \
    ! -path "./node_modules/*" \
    ! -path "./.git/*" \
    ! -path "./$IMAGE_DIR/*" \
    ! -path "./$PREVIEW_DIR/*" \
    ! -path "./public/*" \
    ! -path "./src/assets/*" 2>/dev/null || true)

# Process misplaced audio files
if [ ! -z "$MISPLACED_AUDIO" ]; then
    echo -e "${YELLOW}🎵 Found misplaced audio files:${NC}"
    echo "$MISPLACED_AUDIO"
    
    while IFS= read -r file; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            # Determine subdirectory based on content
            if [[ "$filename" == *"Hz"* ]]; then
                target_dir="$AUDIO_DIR/tones"
            elif [[ "$filename" == *"voice"* ]] || [[ "$filename" == *"speak"* ]]; then
                target_dir="$AUDIO_DIR/voice"
            else
                target_dir="$AUDIO_DIR/music"
            fi
            
            mkdir -p "$target_dir"
            echo -e "${GREEN}  Moving $file → $target_dir/$filename${NC}"
            mv "$file" "$target_dir/$filename"
            
            # Update references in markdown files
            find . -name "*.md" -type f -exec sed -i '' "s|$file|$target_dir/$filename|g" {} \;
        fi
    done <<< "$MISPLACED_AUDIO"
fi

# Process misplaced video files
if [ ! -z "$MISPLACED_VIDEO" ]; then
    echo -e "${YELLOW}🎥 Found misplaced video files:${NC}"
    echo "$MISPLACED_VIDEO"
    
    while IFS= read -r file; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            # Determine subdirectory based on content
            if [[ "$filename" == *"demo"* ]]; then
                target_dir="$VIDEO_DIR/demos"
            elif [[ "$filename" == *"holoflower"* ]] || [[ "$filename" == *"animation"* ]]; then
                target_dir="$VIDEO_DIR/motion"
            else
                target_dir="$VIDEO_DIR/talks"
            fi
            
            mkdir -p "$target_dir"
            echo -e "${GREEN}  Moving $file → $target_dir/$filename${NC}"
            mv "$file" "$target_dir/$filename"
            
            # Update references in markdown files
            find . -name "*.md" -type f -exec sed -i '' "s|$file|$target_dir/$filename|g" {} \;
        fi
    done <<< "$MISPLACED_VIDEO"
fi

# Process misplaced images
if [ ! -z "$MISPLACED_IMAGES" ]; then
    echo -e "${YELLOW}🖼️ Found misplaced image files:${NC}"
    echo "$MISPLACED_IMAGES"
    
    while IFS= read -r file; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            target_dir="$IMAGE_DIR"
            
            mkdir -p "$target_dir"
            echo -e "${GREEN}  Moving $file → $target_dir/$filename${NC}"
            mv "$file" "$target_dir/$filename"
            
            # Update references in markdown files
            find . -name "*.md" -type f -exec sed -i '' "s|$file|$target_dir/$filename|g" {} \;
        fi
    done <<< "$MISPLACED_IMAGES"
fi

# Check for large media files
echo -e "\n${PURPLE}📊 Checking media file sizes...${NC}"
LARGE_FILES=$(find "$ASSET_BASE" -type f -size +20M 2>/dev/null || true)
if [ ! -z "$LARGE_FILES" ]; then
    echo -e "${YELLOW}⚠️  Found large media files (>20MB):${NC}"
    while IFS= read -r file; do
        size=$(du -h "$file" | cut -f1)
        echo -e "  $file ($size)"
    done <<< "$LARGE_FILES"
    echo -e "${YELLOW}Consider optimizing these files for web delivery${NC}"
fi

# Check for broken references
echo -e "\n${PURPLE}🔍 Checking for broken asset references...${NC}"
BROKEN_REFS=0
for md_file in $(find . -name "*.md" -type f ! -path "./node_modules/*"); do
    # Extract asset references
    refs=$(grep -oE '\[.*\]\(.*\.(mp3|wav|mp4|mov|png|jpg|jpeg|gif|svg)\)' "$md_file" 2>/dev/null || true)
    if [ ! -z "$refs" ]; then
        while IFS= read -r ref; do
            # Extract path from markdown link
            path=$(echo "$ref" | sed -E 's/.*\((.*)\).*/\1/')
            # Remove any anchors or query params
            path=$(echo "$path" | cut -d'#' -f1 | cut -d'?' -f1)
            # Check if file exists
            if [[ ! "$path" =~ ^https?:// ]] && [ ! -f "$path" ]; then
                echo -e "${RED}  ✗ Broken reference in $md_file: $path${NC}"
                BROKEN_REFS=$((BROKEN_REFS + 1))
            fi
        done <<< "$refs"
    fi
done

if [ $BROKEN_REFS -eq 0 ]; then
    echo -e "${GREEN}  ✓ All asset references valid${NC}"
else
    echo -e "${RED}  Found $BROKEN_REFS broken references${NC}"
    exit 1
fi

echo -e "\n${GREEN}✨ Asset guardrails check complete${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"