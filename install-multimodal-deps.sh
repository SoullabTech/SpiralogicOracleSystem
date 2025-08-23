#!/bin/bash
# Install multimodal dependencies
echo "📦 Installing multimodal dependencies..."

npm install pdf-parse
npm install @supabase/supabase-js
npm install openai

echo "✅ Dependencies installed successfully!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with OPENAI_API_KEY"
echo "2. Run: supabase db push"
echo "3. Run: ./scripts/beta-ready-checklist.sh"