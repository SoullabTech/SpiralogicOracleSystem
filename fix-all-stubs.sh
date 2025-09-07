#!/bin/bash

echo "Fixing all stub imports to use centralized lib/stubs/CollectiveIntelligence..."

# Fix all imports in API routes
find app/api -name "*.ts" -type f | while read file; do
    # Replace various stub imports with the centralized one
    sed -i '' "s|import { CollectiveIntelligence, collective, Logger.*} from '\.\./\.\./collective/_stubs';|import { CollectiveIntelligence, collective, Logger, PatternRecognitionEngine, SHIFtNarrativeService, SHIFtInferenceService } from '@/lib/stubs/CollectiveIntelligence';|g" "$file"
    sed -i '' "s|import { CollectiveIntelligence, collective, Logger.*} from '\.\./collective/_stubs';|import { CollectiveIntelligence, collective, Logger } from '@/lib/stubs/CollectiveIntelligence';|g" "$file"
    sed -i '' "s|import { CollectiveIntelligence, collective, Logger.*} from '\.\.\/_stubs';|import { CollectiveIntelligence, collective, Logger } from '@/lib/stubs/CollectiveIntelligence';|g" "$file"
    sed -i '' "s|import { CollectiveIntelligence, collective, Logger } from '\.\.\/_stubs';|import { CollectiveIntelligence, collective, Logger } from '@/lib/stubs/CollectiveIntelligence';|g" "$file"
    sed -i '' "s|import { CollectiveDataCollector } from '\.\.\/_stubs';|import { CollectiveDataCollector } from '@/lib/stubs/CollectiveIntelligence';|g" "$file"
done

echo "Removing duplicate CollectiveIntelligence class definitions..."

# Remove the inline class definition in contribute/route.ts
sed -i '' '/^class CollectiveIntelligence {/,/^}/d' app/api/collective/contribute/route.ts

echo "Done! All imports should now point to @/lib/stubs/CollectiveIntelligence"