#!/bin/bash
# fix-final-types.sh - Fix remaining type issues

set -e

echo "🔧 Fixing final type issues..."

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
        
        # Fix 1: getRelevantMemories expects string, not number
        sed -i.tmp 's/getRelevantMemories(userId, 3)/getRelevantMemories(userId, "3")/' "$file"
        
        # Fix 2: Change archetype to archetypes in metadata
        sed -i.tmp 's/archetype: "Fire"/archetypes: ["Fire"]/' "$file"
        sed -i.tmp 's/archetype: "Water"/archetypes: ["Water"]/' "$file"
        sed -i.tmp 's/archetype: "Earth"/archetypes: ["Earth"]/' "$file"
        sed -i.tmp 's/archetype: "Air"/archetypes: ["Air"]/' "$file"
        sed -i.tmp 's/archetype: "Aether"/archetypes: ["Aether"]/' "$file"
        
        rm -f "$file.tmp"
        echo "✓ Fixed $file"
    fi
done

echo "✅ Final type fixes complete!"