#!/bin/bash
# fix-metadata-props.sh - Fix metadata properties

set -e

echo "🔧 Fixing metadata properties..."

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
        
        # In logOracleInsight metadata, change element to elementalAlignment
        # This is inside the metadata object of logOracleInsight
        perl -i -pe '
            if (/logOracleInsight\(/ .. /}\);/) {
                if (/metadata:/ .. /}/) {
                    s/element: "(\w+)",/elementalAlignment: "\1",/g;
                }
            }
        ' "$file"
        
        echo "✓ Fixed $file"
    fi
done

# Fix the duplicate property in FireAgent
if [ -f "backend/src/agents/FireAgent.ts" ]; then
    echo "Fixing duplicate in FireAgent.ts..."
    # Remove the duplicate element property
    perl -i -0777 -pe '
        s/(metadata:\s*\{[^}]*?)element:\s*"Fire",\s*element:\s*"fire",/$1element: "fire",/gs
    ' "backend/src/agents/FireAgent.ts"
fi

echo "✅ Metadata property fixes complete!"