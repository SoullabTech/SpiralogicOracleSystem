#!/bin/bash

echo "🔧 Comprehensive Quote Escape Fix"

# Fix escaped single quotes in all TypeScript/JSX files
echo "Fixing &apos; -> ' in all files..."
find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | grep -v node_modules | grep -v .git | xargs sed -i '' "s/&apos;/'/g"

# Fix double-escaped quotes
echo "Fixing double escapes..."
find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | grep -v node_modules | grep -v .git | xargs sed -i '' "s/&amp;apos;/'/g"

echo "✅ Quote fixes complete"
echo "🧪 Running build test..."

npm run build