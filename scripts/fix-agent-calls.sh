#!/bin/bash
# fix-agent-calls.sh - Fix function call issues in agent files

set -e

echo "🔧 Fixing agent function calls..."

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
        echo "Fixing function calls in $file..."
        
        # Create a temporary Python script to handle complex replacements
        cat > /tmp/fix_agent_$$.py << 'EOF'
import re
import sys

file_path = sys.argv[1]

with open(file_path, 'r') as f:
    content = f.read()

# Fix 1: storeMemoryItem calls - convert object to function parameters
# Pattern: await storeMemoryItem({ clientId: userId, content, ... });
# To: await storeMemoryItem(userId, content, { ... });
pattern1 = r'await storeMemoryItem\({[\s\n]*clientId:\s*userId,[\s\n]*content,[\s\n]*([^}]+)\}\);'
replacement1 = r'await storeMemoryItem(userId, content, {\1});'
content = re.sub(pattern1, replacement1, content, flags=re.MULTILINE | re.DOTALL)

# Fix 2: logOracleInsight calls - restructure to match expected signature
# The function expects: userId, agentType, query, response as required fields
pattern2 = r'await logOracleInsight\({[\s\n]*anon_id:\s*userId,[\s\n]*archetype:\s*"(\w+)",[\s\n]*element:\s*"(\w+)",[\s\n]*insight:\s*{[\s\n]*message:\s*content,[\s\n]*raw_input:\s*input,[\s\n]*([^}]+)\},[\s\n]*([^}]+)\}\);'
replacement2 = r'await logOracleInsight({\n      userId: userId,\n      agentType: "\2-agent",\n      query: input,\n      response: content,\n      metadata: {\n        archetype: "\1",\n        element: "\2",\n        \3\n      }\n    });'
content = re.sub(pattern2, replacement2, content, flags=re.MULTILINE | re.DOTALL)

# Fix 3: Fix ModelService response handling
pattern3 = r'const enhancedResponse = typeof modelResponse === "string" \? { response: enhancedResponse\.content, content: modelResponse, confidence: 0\.8 } : { \.\.\.modelResponse, content: enhancedResponse\.content \|\| modelResponse\.content };'
replacement3 = r'const enhancedResponse = typeof modelResponse === "string" ? { response: modelResponse, content: modelResponse, confidence: 0.8 } : { ...modelResponse, content: modelResponse.response || modelResponse.content, response: modelResponse.response || modelResponse.content };'
content = re.sub(pattern3, replacement3, content)

# Fix 4: Fix AIResponse type issues
content = content.replace('provider: "fire-agent"', 'provider: "fire-agent" as any')
content = content.replace('provider: "water-agent"', 'provider: "water-agent" as any')
content = content.replace('provider: "earth-agent"', 'provider: "earth-agent" as any')
content = content.replace('provider: "air-agent"', 'provider: "air-agent" as any')
content = content.replace('provider: "aether-agent"', 'provider: "aether-agent" as any')

# Fix 5: Fix modelResponse.model references
content = content.replace('modelResponse.model', '(modelResponse as any).model')

with open(file_path, 'w') as f:
    f.write(content)
EOF

        python3 /tmp/fix_agent_$$.py "$file"
        echo "✓ Fixed $file"
    fi
done

rm -f /tmp/fix_agent_$$.py

echo "✅ Agent function call fixes complete!"