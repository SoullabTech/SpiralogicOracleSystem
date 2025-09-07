#!/bin/bash

# 🌸 Sacred Core Identification Script
# Automatically identifies and lists Sacred Core components for migration

echo "🌸 Starting Sacred Core Identification..."
echo "========================================="

# Create output directory
mkdir -p ./migration-output

# Sacred Core Components to Preserve
SACRED_CORE_FILES=(
  "components/sacred/SacredHoloflower.tsx"
  "components/motion/MotionOrchestrator.tsx"
  "components/audio/SacredAudioSystem.tsx"
  "components/OracleConversation.tsx"
  "components/sacred/SacredHoloflowerWithAudio.tsx"
  "components/sacred/HoloflowerCheckIn.tsx"
)

# Wisdom Core Files
WISDOM_CORE_FILES=(
  "lib/spiralogic-facets-complete.ts"
  "lib/oracle-response.ts"
  "lib/motion-mapper.ts"
  "lib/insight-generation.ts"
  "lib/coherence-calculator.ts"
  "lib/shadow-detection.ts"
)

# Bridge Layer Files
BRIDGE_LAYER_FILES=(
  "hooks/useSacredOracle.ts"
  "hooks/useMotionState.ts"
  "hooks/useAudioContext.ts"
)

# API Routes to Unify
API_ROUTES=(
  "app/api/oracle-sacred/route.ts"
  "app/api/oracle-unified/route.ts"
  "app/api/oracle-holoflower/route.ts"
  "api/coherence/route.ts"
)

echo "✨ Sacred Core Components:"
echo "-------------------------"
for file in "${SACRED_CORE_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ Found: $file"
    echo "$file" >> ./migration-output/preserve-list.txt
  else
    echo "⚠️  Missing: $file"
  fi
done

echo ""
echo "📚 Wisdom Core Components:"
echo "-------------------------"
for file in "${WISDOM_CORE_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ Found: $file"
    echo "$file" >> ./migration-output/preserve-list.txt
  else
    echo "⚠️  Missing: $file"
  fi
done

echo ""
echo "🌉 Bridge Layer Components:"
echo "-------------------------"
for file in "${BRIDGE_LAYER_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ Found: $file"
    echo "$file" >> ./migration-output/preserve-list.txt
  else
    echo "⚠️  Missing: $file"
  fi
done

echo ""
echo "🔄 API Routes to Unify:"
echo "-------------------------"
for file in "${API_ROUTES[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ Found: $file"
    echo "$file" >> ./migration-output/api-routes-to-unify.txt
  else
    echo "⚠️  Missing: $file"
  fi
done

echo ""
echo "🔍 Finding Duplicates & Legacy Code..."
echo "--------------------------------------"

# Find duplicate Holoflower components
echo "Duplicate Holoflower components:" >> ./migration-output/prune-list.txt
find . -name "*Holoflower*.tsx" -o -name "*Holoflower*.ts" | grep -v "SacredHoloflower\|HoloflowerCheckIn" >> ./migration-output/prune-list.txt

# Find beta versions
echo "Beta versions:" >> ./migration-output/prune-list.txt
find . -path "./beta/*" -o -path "./test/*" -o -path "./legacy/*" >> ./migration-output/prune-list.txt

# Find duplicate dashboards
echo "Duplicate dashboards:" >> ./migration-output/prune-list.txt
find . -name "*Dashboard*.tsx" | grep -v "SacredDashboard" >> ./migration-output/prune-list.txt

echo ""
echo "📊 Migration Summary:"
echo "--------------------"
echo "Files to Preserve: $(wc -l < ./migration-output/preserve-list.txt)"
echo "Files to Prune: $(wc -l < ./migration-output/prune-list.txt)"
echo "API Routes to Unify: $(wc -l < ./migration-output/api-routes-to-unify.txt)"

echo ""
echo "✨ Sacred Core identification complete!"
echo "Results saved in ./migration-output/"