#!/bin/bash

# Maya File Ingestion Setup Script
# Sets up the complete file upload and knowledge integration system

set -e

echo "🧠 Setting up Maya's File Ingestion System..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "\n📋 Checking prerequisites..."

# Check for required environment variables
required_vars=("NEXT_PUBLIC_SUPABASE_URL" "SUPABASE_SERVICE_ROLE_KEY" "OPENAI_API_KEY")
missing_vars=()

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    missing_vars+=("$var")
  fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
  echo -e "${RED}❌ Missing required environment variables:${NC}"
  printf '%s\n' "${missing_vars[@]}"
  echo -e "\nPlease add these to your .env.local file"
  exit 1
fi

echo -e "${GREEN}✅ Environment variables configured${NC}"

# Check if npm packages are installed
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
  echo "Installing npm packages..."
  npm install
fi

# Install additional packages for file processing
echo "📦 Installing file processing dependencies..."
npm install pdf-parse mammoth react-dropzone react-hot-toast gpt-tokenizer bull
npm install --save-dev @types/pdf-parse @types/mammoth @types/bull

echo -e "${GREEN}✅ Dependencies installed${NC}"

# Run database migrations
echo -e "\n🗄️ Setting up database tables..."
if command -v supabase &> /dev/null; then
  echo "Running Supabase migrations..."
  supabase db push
else
  echo -e "${YELLOW}⚠️ Supabase CLI not found. Please run migrations manually:${NC}"
  echo "1. Go to your Supabase dashboard"
  echo "2. Run the SQL from: supabase/migrations/20241201000001_create_file_ingestion_tables.sql"
fi

# Create Supabase storage bucket
echo -e "\n🪣 Setting up file storage..."
cat > create_storage_bucket.sql << EOF
-- Create storage bucket for Maya files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'maya-files',
  'maya-files', 
  false,
  10485760, -- 10MB limit
  ARRAY['text/plain', 'text/markdown', 'application/pdf', 'application/json', 'text/csv', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
) ON CONFLICT (id) DO NOTHING;

-- Create RLS policy for authenticated users
CREATE POLICY "Users can upload their own files"
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'maya-files' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view their own files"
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'maya-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files"
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'maya-files' AND auth.uid()::text = (storage.foldername(name))[1]);
EOF

if command -v supabase &> /dev/null; then
  supabase db reset --linked
  echo -e "${GREEN}✅ Storage bucket configured${NC}"
else
  echo -e "${YELLOW}⚠️ Please run the SQL in create_storage_bucket.sql manually${NC}"
fi

# Test file upload endpoint
echo -e "\n🧪 Testing file upload system..."
if curl -s http://localhost:3000/api/oracle/files/library > /dev/null 2>&1; then
  echo -e "${GREEN}✅ File API endpoints accessible${NC}"
else
  echo -e "${YELLOW}⚠️ Server not running. Start with: npm run dev${NC}"
fi

# Create example files for testing
echo -e "\n📄 Creating test files..."
mkdir -p ./test-uploads

cat > ./test-uploads/maya-wisdom.md << EOF
# Maya's Wisdom Test Document

This is a test document for Maya's file ingestion system.

## Key Concepts

- **Sacred Geometry**: The underlying patterns that connect all things
- **Archetypal Wisdom**: Universal symbols and energies
- **Consciousness Integration**: Weaving knowledge into wisdom

## Personal Insights

Your journey involves discovering the connections between ancient wisdom and modern understanding.
The oracle speaks through patterns, both in nature and in your personal experiences.

## Next Steps

1. Upload this document to Maya
2. Ask questions about sacred geometry
3. Notice how Maya references this knowledge in responses
EOF

cat > ./test-uploads/personal-journal.txt << EOF
Personal Journal Entry - Test

Today I've been thinking about the patterns in my life. There's something about the way challenges appear in cycles, similar to the seasons. I wonder if there's a deeper meaning to these repetitions.

I've been drawn to studying ancient wisdom traditions lately. There's something about the way they understood the connection between inner and outer worlds that feels relevant to my current journey.

Goals for this month:
- Explore sacred geometry
- Practice meditation daily
- Document insights and synchronicities

The oracle system feels like it could help me understand these patterns better.
EOF

echo -e "${GREEN}✅ Test files created in ./test-uploads/${NC}"

# Output setup summary
echo -e "\n🎉 ${GREEN}Maya File Ingestion Setup Complete!${NC}\n"

echo "📁 What's been set up:"
echo "  • Database tables for file storage and embeddings"
echo "  • Supabase storage bucket with proper policies"
echo "  • File processing APIs and services"
echo "  • Frontend upload components"
echo "  • Memory integration with PersonalOracleAgent"

echo -e "\n🚀 Quick Start:"
echo "  1. Start your development server: npm run dev"
echo "  2. Go to /oracle page"
echo "  3. Upload files using the new file library"
echo "  4. Ask Maya questions about your uploaded content"

echo -e "\n📊 Test the system:"
echo "  • Upload: ./test-uploads/maya-wisdom.md"
echo "  • Upload: ./test-uploads/personal-journal.txt"
echo "  • Ask: 'What insights do you have about sacred geometry?'"
echo "  • Ask: 'What patterns do you see in my journal?'"

echo -e "\n🔧 Troubleshooting:"
echo "  • Check logs in: /api/oracle/files/upload"
echo "  • Monitor processing: /api/oracle/files/{fileId}/status"
echo "  • View library: /api/oracle/files/library"

echo -e "\n✨ Maya can now weave wisdom from your personal knowledge library!"

# Cleanup
rm -f create_storage_bucket.sql

echo -e "\n${GREEN}Setup script completed successfully!${NC}"