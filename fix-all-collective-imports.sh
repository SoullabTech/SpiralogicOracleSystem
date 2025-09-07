#!/bin/bash

# Fix all CollectiveIntelligence imports to use the shared stub

files=(
  "app/api/collective/snapshot/route.ts"
  "app/api/collective/patterns/route.ts"
  "app/api/collective/timing/route.ts"
  "app/api/collective/summary/route.ts"
  "app/api/shift/narrative/route.ts"
  "app/api/patterns/emergent/route.ts"
)

for file in "${files[@]}"; do
  echo "Fixing $file..."
  
  # Check if import already exists
  if ! grep -q "import.*from.*_stubs" "$file"; then
    # Add import at the top after 'next/server' import
    perl -i -pe 's/(import.*from.*next\/server.*;\n)/$1import { CollectiveIntelligence, collective, Logger } from '"'"'..\/collective\/_stubs'"'"';\n/g' "$file"
  fi
  
  # Comment out any local CollectiveIntelligence instantiation
  perl -i -pe 's/^(\s*const collective = new CollectiveIntelligence.*)/\/\/ $1 - Using imported collective instead/g' "$file"
  
  # Comment out any CollectiveIntelligence class definitions
  perl -i -pe 's/^(class CollectiveIntelligence.*)/\/\/ $1/g' "$file"
done

echo "All files updated to use shared stubs!"