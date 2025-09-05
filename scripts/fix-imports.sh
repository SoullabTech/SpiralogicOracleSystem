#!/bin/bash
# fix-imports.sh - Fix import paths in agent and type files

set -e

echo "🔧 Fixing import paths..."

# Fix imports in type files
echo "Fixing imports in type files..."
if [ -f "backend/src/types/index.ts" ]; then
    sed -i.tmp 's|import { AgentResponse } from "./types/agentResponse";|// import { AgentResponse } from "./types/agentResponse"; // Fixed below|' "backend/src/types/index.ts"
    rm -f "backend/src/types/index.ts.tmp"
fi

if [ -f "backend/src/types/agent.ts" ]; then
    sed -i.tmp 's|import { AgentResponse } from "./types/agentResponse";|// import { AgentResponse } from "./types/agentResponse"; // Defined in this file|' "backend/src/types/agent.ts"
    rm -f "backend/src/types/agent.ts.tmp"
fi

# Fix imports in agent files
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
        echo "Fixing imports in $file..."
        # Remove bad import
        sed -i.tmp '/^import { AgentResponse } from "\.\/types\/agentResponse";/d' "$file"
        rm -f "$file.tmp"
    fi
done

# Also fix duplicate properties in agents
echo "Fixing duplicate properties..."
for file in "${AGENT_FILES[@]}"; do
    if [ -f "$file" ]; then
        # Fix duplicate content properties
        perl -i -pe 's/{ content: (\w+), content: \1,/{ content: \1,/g' "$file"
        perl -i -pe 's/{ response: (\w+), content: \1,/{ response: \1, content: \1,/g' "$file"
        
        # Fix wrong property name in logOracleInsight
        perl -i -pe 's/content: content,/response: content,/g if /logOracleInsight\(/ .. /}\);/' "$file"
    fi
done

echo "✅ Import fixes complete!"