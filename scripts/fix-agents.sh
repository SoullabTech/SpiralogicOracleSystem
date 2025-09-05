#!/bin/bash
# fix-agents.sh - Fix type issues in agent files

set -e

echo "🔧 Fixing agent files..."

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
        
        # Backup
        cp "$file" "$file.bak"
        
        # Fix 1: storeMemoryItem calls - change from object to parameters
        sed -i.tmp 's/await storeMemoryItem({[[:space:]]*clientId: userId,[[:space:]]*content,[[:space:]]*\([^}]*\)});/await storeMemoryItem(userId, content, { \1 });/g' "$file"
        
        # Fix 2: logOracleInsight - change anon_id to userId in function call
        sed -i.tmp 's/logOracleInsight({[[:space:]]*anon_id: userId,/logOracleInsight({ userId: userId,/g' "$file"
        
        # Fix 3: ModelService.getResponse - ensure it returns proper format
        sed -i.tmp '/const modelResponse = await ModelService\.getResponse/,/});/{
            /});/a\
    const enhancedResponse = typeof modelResponse === "string" ? { response: modelResponse, content: modelResponse, confidence: 0.8 } : { ...modelResponse, content: modelResponse.response || modelResponse.content };
        }' "$file"
        
        # Fix 4: Replace modelResponse usage with enhancedResponse where needed
        sed -i.tmp 's/modelResponse\.response/enhancedResponse.content/g' "$file"
        sed -i.tmp 's/response: modelResponse,/response: enhancedResponse.content,/g' "$file"
        
        # Fix 5: Change agentType to provider
        sed -i.tmp 's/agentType: "fire-agent"/provider: "fire-agent"/g' "$file"
        sed -i.tmp 's/agentType: "water-agent"/provider: "water-agent"/g' "$file"
        sed -i.tmp 's/agentType: "earth-agent"/provider: "earth-agent"/g' "$file"
        sed -i.tmp 's/agentType: "air-agent"/provider: "air-agent"/g' "$file"
        sed -i.tmp 's/agentType: "aether-agent"/provider: "aether-agent"/g' "$file"
        
        # Fix 6: memory.response to memory.content
        sed -i.tmp 's/memory\.response/memory.content/g' "$file"
        
        rm -f "$file.tmp"
        echo "✓ Fixed $file"
    fi
done

echo "✅ Agent fixes complete!"