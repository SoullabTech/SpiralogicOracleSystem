#!/bin/bash

# Fix Database and Storage Issues for Spiralogic Oracle System
# This script synchronizes Supabase configuration and creates necessary storage buckets

echo "🔧 Fixing Database and Storage Configuration..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the correct Supabase keys from backend/.env
BACKEND_ENV="/Volumes/T7 Shield/Projects/SpiralogicOracleSystem/backend/.env"
FRONTEND_ENV="/Volumes/T7 Shield/Projects/SpiralogicOracleSystem/.env.local"

echo -e "${YELLOW}📋 Step 1: Synchronizing Supabase keys across environments${NC}"

# Extract keys from backend
SUPABASE_URL=$(grep "^SUPABASE_URL=" "$BACKEND_ENV" | cut -d'=' -f2)
SUPABASE_ANON_KEY=$(grep "^SUPABASE_ANON_KEY=" "$BACKEND_ENV" | cut -d'=' -f2)
SUPABASE_SERVICE_KEY=$(grep "^SUPABASE_SERVICE_ROLE_KEY=" "$BACKEND_ENV" | cut -d'=' -f2)

echo "Found Supabase URL: ${SUPABASE_URL:0:40}..."
echo "Found Anon Key: ${SUPABASE_ANON_KEY:0:40}..."
echo "Found Service Key: ${SUPABASE_SERVICE_KEY:0:40}..."

# Update frontend .env.local with matching keys
echo -e "${YELLOW}📝 Step 2: Updating frontend configuration${NC}"

# Check if NEXT_PUBLIC_SUPABASE_URL exists, if not add it
if ! grep -q "^NEXT_PUBLIC_SUPABASE_URL=" "$FRONTEND_ENV"; then
    echo "" >> "$FRONTEND_ENV"
    echo "# Supabase Configuration" >> "$FRONTEND_ENV"
    echo "NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL" >> "$FRONTEND_ENV"
    echo -e "${GREEN}✅ Added NEXT_PUBLIC_SUPABASE_URL${NC}"
else
    # Update existing
    sed -i '' "s|^NEXT_PUBLIC_SUPABASE_URL=.*|NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL|" "$FRONTEND_ENV"
    echo -e "${GREEN}✅ Updated NEXT_PUBLIC_SUPABASE_URL${NC}"
fi

# Check if NEXT_PUBLIC_SUPABASE_ANON_KEY exists, if not add it
if ! grep -q "^NEXT_PUBLIC_SUPABASE_ANON_KEY=" "$FRONTEND_ENV"; then
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY" >> "$FRONTEND_ENV"
    echo -e "${GREEN}✅ Added NEXT_PUBLIC_SUPABASE_ANON_KEY${NC}"
else
    # Update existing
    sed -i '' "s|^NEXT_PUBLIC_SUPABASE_ANON_KEY=.*|NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY|" "$FRONTEND_ENV"
    echo -e "${GREEN}✅ Updated NEXT_PUBLIC_SUPABASE_ANON_KEY${NC}"
fi

echo -e "${YELLOW}📦 Step 3: Creating storage bucket setup script${NC}"

# Create a Node.js script to setup storage buckets
cat > /tmp/setup-storage-buckets.js << 'EOF'
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../backend/.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupStorageBuckets() {
  const buckets = [
    { name: 'avatars', public: true },
    { name: 'recordings', public: false },
    { name: 'media', public: true },
    { name: 'voice-notes', public: false },
    { name: 'sacred-artifacts', public: false }
  ];

  console.log('Creating storage buckets...\n');

  for (const bucket of buckets) {
    try {
      // Check if bucket exists
      const { data: existingBuckets } = await supabase.storage.listBuckets();
      const exists = existingBuckets?.some(b => b.name === bucket.name);

      if (!exists) {
        const { data, error } = await supabase.storage.createBucket(bucket.name, {
          public: bucket.public,
          fileSizeLimit: 52428800, // 50MB
        });

        if (error) {
          console.error(`❌ Failed to create ${bucket.name}:`, error.message);
        } else {
          console.log(`✅ Created bucket: ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
        }
      } else {
        console.log(`✔️  Bucket already exists: ${bucket.name}`);
      }
    } catch (error) {
      console.error(`❌ Error with ${bucket.name}:`, error.message);
    }
  }

  // Set up CORS policies for public buckets
  console.log('\n📝 Setting up CORS policies...');
  
  const corsPolicy = {
    allowedOrigins: ['http://localhost:3000', 'http://localhost:3001', 'https://*.vercel.app'],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['*'],
    exposeHeaders: ['*'],
    maxAge: 3600
  };

  // Note: CORS policies need to be set via Supabase dashboard
  console.log('⚠️  CORS policies must be configured in Supabase dashboard');
  console.log('   Allowed origins:', corsPolicy.allowedOrigins.join(', '));
}

setupStorageBuckets()
  .then(() => console.log('\n✅ Storage setup complete!'))
  .catch(err => console.error('\n❌ Setup failed:', err));
EOF

echo -e "${YELLOW}📊 Step 4: Running storage setup${NC}"

# Run the storage setup script
cd backend
node /tmp/setup-storage-buckets.js

echo ""
echo -e "${YELLOW}🔄 Step 5: Testing final configuration${NC}"

# Test the connection again
node scripts/test-supabase-connection.js

echo ""
echo "================================================"
echo -e "${GREEN}✅ Database and Storage Fix Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Restart the frontend to pick up new environment variables"
echo "2. Check Supabase dashboard for any additional configuration"
echo "3. If errors persist, verify the API keys in Supabase dashboard"
echo ""
echo "Dashboard URL: ${SUPABASE_URL}"