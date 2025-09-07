#!/bin/bash

# Script to stub all backend imports in API routes

echo "Stubbing backend imports in all API routes..."

# Find all TypeScript files in app/api that import from backend
FILES=$(grep -r "@/backend\|@\\/backend\|\.\./.*backend" app/api --include="*.ts" --include="*.tsx" -l | grep -v "// import" | grep -v "//import")

for file in $FILES; do
  echo "Processing: $file"
  
  # Create a temporary file with stubbed imports
  sed -i.bak \
    -e "s|^import .* from ['\"]@/backend/.*['\"];|// &|g" \
    -e "s|^import .* from ['\"]@\\\\/backend/.*['\"];|// &|g" \
    -e "s|^import .* from ['\"]\.\./.*backend/.*['\"];|// &|g" \
    "$file"
    
  # Check if we need to add stubs (only if file has commented imports)
  if grep -q "^// import.*backend" "$file"; then
    # Check what needs to be stubbed
    if grep -q "logger" "$file" && ! grep -q "^const logger = {" "$file"; then
      echo "Adding logger stub to $file"
      # Add logger stub after imports
      sed -i.bak '/^import.*next/a\
\
// Stub logger\
const logger = {\
  info: (message: string, data?: any) => console.log(message, data),\
  error: (message: string, data?: any) => console.error(message, data),\
  warn: (message: string, data?: any) => console.warn(message, data),\
  debug: (message: string, data?: any) => console.debug(message, data)\
};' "$file"
    fi
    
    if grep -q "memoryStore" "$file" && ! grep -q "^const memoryStore = {" "$file"; then
      echo "Adding memoryStore stub to $file"
      sed -i.bak '/^const logger = {/,/^};/a\
\
// Stub memory store\
const memoryStore = {\
  isInitialized: false,\
  init: async (dbPath: string) => {},\
  getMemories: async (userId: string, limit: number) => [],\
  getJournalEntries: async (userId: string, limit: number) => [],\
  getUploads: async (userId: string, limit: number) => [],\
  getVoiceNotes: async (userId: string, limit: number) => [],\
  getVoiceNote: async (id: string) => null,\
  saveVoiceNote: async (data: any) => ({ id: Date.now().toString(), ...data })\
};' "$file"
    fi
    
    if grep -q "llamaService" "$file" && ! grep -q "^const llamaService = {" "$file"; then
      echo "Adding llamaService stub to $file"
      sed -i.bak '/^const memoryStore = {/,/^};/a\
\
// Stub llama service\
const llamaService = {\
  isInitialized: false,\
  init: async () => {},\
  process: async (text: string) => ({ processed: text })\
};' "$file"
    fi
  fi
  
  # Remove backup files
  rm -f "$file.bak"
done

echo "Done! All backend imports have been stubbed."