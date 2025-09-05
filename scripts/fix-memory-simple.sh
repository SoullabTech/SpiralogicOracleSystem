#!/bin/bash
# fix-memory-simple.sh - Simple fix for getRelevantMemories calls

set -e

echo "🔧 Fixing getRelevantMemories calls (simple)..."

AGENT_FILES=(
    "backend/src/agents/AetherAgent.ts"
    "backend/src/agents/AirAgent.ts"
    "backend/src/agents/EarthAgent.ts"
    "backend/src/agents/WaterAgent.ts"
    "backend/src/agents/FireAgent.ts"
)

for file in "${AGENT_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "Fixing $file..."
        
        # Simple replacements
        sed -i.tmp 's/getRelevantMemories(userId, "3")/getRelevantMemories(userId, undefined, 3)/' "$file"
        sed -i.tmp 's/getRelevantMemories(userId, "recent", 3)/getRelevantMemories(userId, undefined, 3)/' "$file"
        
        rm -f "$file.tmp"
        echo "✓ Fixed $file"
    fi
done

# Also fix the duplicate property issue in FireAgent.ts manually
if [ -f "backend/src/agents/FireAgent.ts" ]; then
    echo "Fixing duplicate property in FireAgent.ts..."
    # Use perl for more complex replacement
    perl -i -pe 's/element: "Fire",\s*element: "fire",/element: "fire",/g' "backend/src/agents/FireAgent.ts"
fi

echo "✅ Memory call fixes complete!"