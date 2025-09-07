#!/bin/bash

# Fix all logger type annotations in API routes
files=(
  "app/api/collective/field-state/route.ts"
  "app/api/evolution/trajectory/route.ts"
  "app/api/patterns/emergent/route.ts"
)

for file in "${files[@]}"; do
  echo "Fixing $file..."
  perl -pi -e 's/error: \(msg, error, meta\)/error: (msg: any, error?: any, meta?: any)/g' "$file"
  perl -pi -e 's/warn: \(msg, meta\)/warn: (msg: any, meta?: any)/g' "$file"
  perl -pi -e 's/debug: \(msg, meta\)/debug: (msg: any, meta?: any)/g' "$file"
  perl -pi -e 's/info: \(msg, meta\)/info: (msg: any, meta?: any)/g' "$file"
done

echo "All logger type annotations fixed!"