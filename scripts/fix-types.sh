#!/bin/bash
# fix-types.sh - Automatically patch TypeScript type mismatches in the SpiraLogic Oracle System
# Run from project root: bash scripts/fix-types.sh

set -e

echo "🔧 Starting TypeScript type alignment fixes..."

# Color output for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track changes
CHANGES_MADE=0

# Function to safely backup and patch files
patch_file() {
    local file=$1
    local description=$2
    
    if [ -f "$file" ]; then
        echo -e "${YELLOW}Patching:${NC} $file - $description"
        # Create backup
        cp "$file" "$file.bak.$(date +%s)"
        ((CHANGES_MADE++))
    else
        echo "⚠️  Warning: $file not found, skipping..."
    fi
}

# 1. Fix AIProvider type to include element agents
echo -e "\n${GREEN}1. Extending AIProvider type in backend/src/types/ai.ts...${NC}"
AI_FILE="backend/src/types/ai.ts"
if [ -f "$AI_FILE" ]; then
    patch_file "$AI_FILE" "Adding element agents to AIProvider"
    # Check if element agents already exist
    if ! grep -q "fire-agent" "$AI_FILE"; then
        # Add element agents to AIProvider union type
        sed -i.tmp -E "s/(export type AIProvider = [^;]+)(;)/\1 | 'fire-agent' | 'water-agent' | 'earth-agent' | 'air-agent' | 'aether-agent'\2/" "$AI_FILE"
        rm -f "$AI_FILE.tmp"
    fi
else
    echo "⚠️  $AI_FILE not found"
fi

# 2. Fix MemoryItem type to include response property
echo -e "\n${GREEN}2. Adding response property to MemoryItem...${NC}"
# Check both possible locations
for file in backend/src/types/memory.ts backend/src/types/index.ts; do
    if [ -f "$file" ] && grep -q "interface MemoryItem" "$file"; then
        patch_file "$file" "Adding response property to MemoryItem"
        # Add response property if not exists
        if ! grep -q "response\?:" "$file"; then
            # Add response as optional property before the closing brace
            perl -i -pe 's/(interface MemoryItem[^}]+)(})/\1  response?: string;\n\2/s' "$file"
        fi
    fi
done

# 3. Fix OracleInsight type to include anon_id
echo -e "\n${GREEN}3. Adding anon_id to OracleInsight in backend/src/utils/oracleLogger.ts...${NC}"
ORACLE_FILE="backend/src/utils/oracleLogger.ts"
if [ -f "$ORACLE_FILE" ] && grep -q "interface OracleInsight" "$ORACLE_FILE"; then
    patch_file "$ORACLE_FILE" "Adding anon_id property to OracleInsight"
    # Add anon_id property if not exists
    if ! grep -q "anon_id\?:" "$ORACLE_FILE"; then
        perl -i -pe 's/(interface OracleInsight[^}]+)(})/\1  anon_id?: string;\n\2/s' "$ORACLE_FILE"
    fi
else
    echo "⚠️  OracleInsight interface not found in $ORACLE_FILE"
fi

# 4. Fix AgentResponse to ensure content property
echo -e "\n${GREEN}4. Ensuring AgentResponse includes both response and content...${NC}"
# Check both possible locations
for file in backend/src/types/agent.ts backend/src/types/index.ts; do
    if [ -f "$file" ] && grep -q "interface AgentResponse" "$file"; then
        patch_file "$file" "Ensuring AgentResponse has response property"
        # Add response property if not exists (since content is already there)
        if ! grep -q "response\?:" "$file"; then
            perl -i -pe 's/(interface AgentResponse[^}]+)(})/\1  response?: string;\n\2/s' "$file"
        fi
    fi
done

# 5. Fix modelService implementations
echo -e "\n${GREEN}5. Patching model service implementations...${NC}"
MODEL_SERVICE_FILES=(
    "backend/src/services/modelService.ts"
    "backend/src/services/ModelService.ts"
    "backend/src/services/model.service.ts"
    "backend/src/server/services/modelService.ts"
)

for file in "${MODEL_SERVICE_FILES[@]}"; do
    if [ -f "$file" ]; then
        patch_file "$file" "Ensuring responses include both content and response fields"
        # Pattern 1: Add content field where response exists
        perl -i -pe 's/return\s*{\s*response:\s*([^,}]+),/return {\n    response: \1,\n    content: \1,/g' "$file"
        # Pattern 2: Add response field where content exists
        perl -i -pe 's/return\s*{\s*content:\s*([^,}]+),/return {\n    content: \1,\n    response: \1,/g' "$file"
    fi
done

# 6. Fix agent files - number to string conversions and function signatures
echo -e "\n${GREEN}6. Fixing agents...${NC}"
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
        patch_file "$file" "Fixing type issues"
        
        # Fix numeric IDs - wrap in toString()
        sed -i.tmp -E 's/storeInsight\(([0-9]+)/storeInsight(\1.toString()/' "$file"
        sed -i.tmp -E 's/logInsight\(([0-9]+)/logInsight(\1.toString()/' "$file"
        
        # Fix memory.response references
        sed -i.tmp 's/memory\.response/memory.content || memory.response/g' "$file"
        
        # Fix agent type strings in metadata
        sed -i.tmp -E "s/agentType: '(fire|water|earth|air|aether)-agent'/provider: '\1-agent'/" "$file"
        
        rm -f "$file.tmp"
    fi
done

# 7. Create type augmentation file for backward compatibility
echo -e "\n${GREEN}7. Creating type augmentation file...${NC}"
mkdir -p backend/src/types
cat > backend/src/types/augmentations.d.ts << 'EOF'
// Type augmentations for backward compatibility during migration
// This file provides temporary fixes for type mismatches

import { MemoryItem as BaseMemoryItem } from './memory';
import { OracleInsight as BaseOracleInsight } from '../utils/oracleLogger';
import { AgentResponse as BaseAgentResponse } from './agent';

declare module './memory' {
  interface MemoryItem extends BaseMemoryItem {
    response?: string; // Added for backward compatibility
  }
}

declare module '../utils/oracleLogger' {
  interface OracleInsight extends BaseOracleInsight {
    anon_id?: string; // Added for backward compatibility
  }
}

declare module './agent' {
  interface AgentResponse extends BaseAgentResponse {
    response?: string; // Mirror of content for backward compatibility
  }
}

export {};
EOF

echo -e "\n${GREEN}✅ Type fixes complete!${NC}"
echo -e "Total files modified: ${CHANGES_MADE}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Run 'cd backend && npm run dev' to check if compilation errors are resolved"
echo "2. The script created backups with .bak.<timestamp> extension"
echo "3. Review the changes and remove backups once verified"
echo -e "\n${YELLOW}Note:${NC} Some manual adjustments may still be needed for complex type issues."