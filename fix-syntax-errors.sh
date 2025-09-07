#!/bin/bash

echo "Fixing remaining syntax errors..."

# Fix alert route
sed -i '' '153a\
    console.log('\''Voice alert received:'\'', {' app/api/voice/alert/route.ts

# Fix sesame route
sed -i '' '102a\
    console.log('\''Sesame route config:'\'', {' app/api/voice/sesame/route.ts

# Fix PersonalOracleAgent
sed -i '' 's/^}$/};/' backend/src/agents/PersonalOracleAgent.ts | head -1

# Fix CollectiveIntelligence - escape quotes properly
sed -i '' 's/"emergence", "coherence", "resonance"/"emergence", "coherence", "resonance"/' backend/src/ain/collective/CollectiveIntelligence.ts

echo "Syntax fixes applied!"