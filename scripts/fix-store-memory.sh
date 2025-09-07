#!/bin/bash
# fix-store-memory.sh - Fix storeMemoryItem calls in agent files

set -e

echo "🔧 Fixing storeMemoryItem calls..."

AGENT_FILES=(
    "backend/src/agents/AetherAgent.ts"
    "backend/src/agents/AirAgent.ts"
    "backend/src/agents/EarthAgent.ts"
    "backend/src/agents/WaterAgent.ts"
    "backend/src/agents/FireAgent.ts"
    "backend/src/agents/EnhancedAirAgent.ts"
)

for file in "${AGENT_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "Fixing storeMemoryItem in $file..."
        
        # Create a temporary Python script for complex replacements
        cat > /tmp/fix_store_memory_$$.py << 'EOF'
import re
import sys

file_path = sys.argv[1]

with open(file_path, 'r') as f:
    content = f.read()

# Pattern to match storeMemoryItem calls with object syntax
# This will convert:
# await storeMemoryItem({
#   clientId: userId,
#   content,
#   element: "...",
#   ...
# });
# To:
# await storeMemoryItem(userId, content, {
#   element: "...",
#   ...
# });

# Find all storeMemoryItem calls with object syntax
pattern = r'await storeMemoryItem\({[\s\n]*clientId:\s*userId,[\s\n]*content,[\s\n]*'
replacement = r'await storeMemoryItem(userId, content, {\n      '
content = re.sub(pattern, replacement, content, flags=re.MULTILINE)

# Also handle cases where content might have a different variable name
pattern2 = r'await storeMemoryItem\({[\s\n]*clientId:\s*userId,[\s\n]*content:\s*([^,\n]+),[\s\n]*'
replacement2 = r'await storeMemoryItem(userId, \1, {\n      '
content = re.sub(pattern2, replacement2, content, flags=re.MULTILINE)

with open(file_path, 'w') as f:
    f.write(content)
EOF

        python3 /tmp/fix_store_memory_$$.py "$file"
        echo "✓ Fixed $file"
    fi
done

rm -f /tmp/fix_store_memory_$$.py

echo "✅ storeMemoryItem fixes complete!"