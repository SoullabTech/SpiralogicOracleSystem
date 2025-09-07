#!/bin/bash
# fix-memory-calls.sh - Fix getRelevantMemories calls

set -e

echo "🔧 Fixing getRelevantMemories calls..."

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
        echo "Fixing $file..."
        
        # Fix getRelevantMemories calls - correct the signature
        # From: getRelevantMemories(userId, "3")
        # To: getRelevantMemories(userId, undefined, 3)
        sed -i.tmp 's/getRelevantMemories(userId, "3")/getRelevantMemories(userId, undefined, 3)/' "$file"
        
        # Also fix any other patterns
        sed -i.tmp 's/getRelevantMemories(userId, "recent", 3)/getRelevantMemories(userId, undefined, 3)/' "$file"
        
        # Fix duplicate properties in metadata
        sed -i.tmp '/element: "Fire",/{N;s/element: "Fire",\n[[:space:]]*element: "fire",/element: "fire",/}' "$file"
        
        rm -f "$file.tmp"
        echo "✓ Fixed $file"
    fi
done

echo "✅ Memory call fixes complete!"