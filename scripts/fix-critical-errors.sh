#!/bin/bash
# fix-critical-errors.sh - Fix critical errors preventing server startup

set -e

echo "🔧 Fixing critical errors..."

# 1. Remove all bad imports from ./types/agentResponse
echo "Removing bad imports..."
find backend/src -name "*.ts" -type f | while read file; do
    if grep -q "from './types/agentResponse'" "$file" 2>/dev/null; then
        sed -i.tmp '/import.*from.*\.\/types\/agentResponse/d' "$file"
        rm -f "$file.tmp"
        echo "Fixed import in $file"
    fi
done

# 2. Fix the response variable issue in agent files
echo "Fixing response variable in agents..."
AGENT_FILES=(
    "backend/src/agents/AetherAgent.ts"
    "backend/src/agents/AirAgent.ts"
    "backend/src/agents/EarthAgent.ts"
    "backend/src/agents/WaterAgent.ts"
    "backend/src/agents/FireAgent.ts"
)

for file in "${AGENT_FILES[@]}"; do
    if [ -f "$file" ]; then
        # Fix the typo: response.push should be reflections.push
        sed -i.tmp 's/response\.push/reflections.push/g' "$file"
        rm -f "$file.tmp"
    fi
done

# 3. Remove duplicate AgentResponse declarations
echo "Removing duplicate declarations..."
for file in backend/src/agents/*.ts backend/src/types/*.ts backend/src/utils/*.ts backend/src/spiralogic/*.ts; do
    if [ -f "$file" ]; then
        # Remove lines that declare AgentResponse interface if it's already in types/agent.ts
        if [[ "$file" != "backend/src/types/agent.ts" ]] && grep -q "interface AgentResponse {" "$file"; then
            perl -i -pe 'BEGIN{undef $/;} s/export interface AgentResponse \{[^}]+\}//smg' "$file"
        fi
    fi
done

echo "✅ Critical fixes complete!"