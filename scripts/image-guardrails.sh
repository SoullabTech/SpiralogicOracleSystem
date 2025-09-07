#!/bin/bash

# 🌸 Sacred Image Guardrails
# Ensures all images live in /docs/assets/ with proper categorization

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get all staged image files
IMAGE_EXTENSIONS="png jpg jpeg gif svg webp ico"
STAGED_IMAGES=""

for ext in $IMAGE_EXTENSIONS; do
    FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -i "\.${ext}$" || true)
    if [ -n "$FILES" ]; then
        STAGED_IMAGES="$STAGED_IMAGES$FILES"$'\n'
    fi
done

# Remove empty lines
STAGED_IMAGES=$(echo "$STAGED_IMAGES" | sed '/^$/d')

if [ -z "$STAGED_IMAGES" ]; then
    exit 0
fi

echo -e "${BLUE}🖼️  Checking image placement...${NC}"

MISPLACED_IMAGES=""
MOVED_FILES=""

# Function to determine category based on filename and path
get_category() {
    local filename=$(basename "$1")
    local filepath="$1"
    
    # Check filename prefixes
    if [[ "$filename" =~ ^ui[-_] ]] || [[ "$filepath" =~ screenshot ]] || [[ "$filepath" =~ interface ]]; then
        echo "ui"
    elif [[ "$filename" =~ ^holoflower[-_] ]] || [[ "$filename" =~ sacred ]] || [[ "$filename" =~ geometry ]] || [[ "$filename" =~ aether ]]; then
        echo "holoflower"
    elif [[ "$filename" =~ ^storyboard[-_] ]] || [[ "$filename" =~ flow ]] || [[ "$filename" =~ wireframe ]]; then
        echo "storyboards"
    elif [[ "$filename" =~ ^(logo|brand|icon)[-_] ]] || [[ "$filename" =~ logo ]] || [[ "$filename" =~ brand ]]; then
        echo "branding"
    elif [[ "$filename" =~ ^diagram[-_] ]] || [[ "$filename" =~ architecture ]] || [[ "$filename" =~ schema ]]; then
        echo "diagrams"
    else
        echo "misc"
    fi
}

# Check each staged image
while IFS= read -r file; do
    if [ -z "$file" ]; then
        continue
    fi
    
    # Skip if already in /docs/assets/
    if [[ "$file" == docs/assets/* ]]; then
        echo -e "${GREEN}✅ $file (correctly placed)${NC}"
        continue
    fi
    
    # Image is misplaced
    MISPLACED_IMAGES="$MISPLACED_IMAGES$file"$'\n'
    
    # Determine category
    category=$(get_category "$file")
    filename=$(basename "$file")
    
    # Create target directory if needed
    target_dir="docs/assets/$category"
    mkdir -p "$target_dir"
    
    # Move the file
    target_path="$target_dir/$filename"
    
    # Check if target exists
    if [ -f "$target_path" ]; then
        # Add timestamp to avoid conflicts
        timestamp=$(date +%s)
        base="${filename%.*}"
        ext="${filename##*.}"
        target_path="$target_dir/${base}_${timestamp}.${ext}"
    fi
    
    echo -e "${YELLOW}📦 Moving: $file → $target_path${NC}"
    
    # Move the file
    mv "$file" "$target_path"
    
    # Update git
    git rm --cached "$file" 2>/dev/null || true
    git add "$target_path"
    
    MOVED_FILES="$MOVED_FILES  $file → $target_path"$'\n'
    
    # Update any markdown files that reference this image
    find . -name "*.md" -type f | while read -r md_file; do
        if grep -q "$file" "$md_file"; then
            # Update the reference
            sed -i '' "s|$file|$target_path|g" "$md_file"
            git add "$md_file"
            echo -e "${BLUE}  📝 Updated reference in: $md_file${NC}"
        fi
    done
    
done <<< "$STAGED_IMAGES"

# Report results
if [ -n "$MOVED_FILES" ]; then
    echo ""
    echo -e "${GREEN}✨ Image Guardrails Applied:${NC}"
    echo "$MOVED_FILES"
    echo ""
    echo -e "${YELLOW}Images have been auto-moved to /docs/assets/${NC}"
    echo -e "${YELLOW}References in markdown files have been updated${NC}"
    echo ""
    echo "Categories used:"
    echo "  • ui/ → UI screenshots"
    echo "  • holoflower/ → Sacred symbols & geometry"
    echo "  • storyboards/ → UX flows & wireframes"
    echo "  • branding/ → Logos & brand assets"
    echo "  • diagrams/ → Architecture & schemas"
    echo "  • misc/ → Uncategorized"
    echo ""
    echo -e "${GREEN}Commit will proceed with corrected paths${NC}"
fi

exit 0