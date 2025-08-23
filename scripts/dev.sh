#!/bin/bash
# Concurrent local development - runs both frontend and backend

set -e

echo "🚀 Starting SpiralogicOracleSystem in development mode..."

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local not found. Creating template..."
    cat > .env.local <<'ENV'
# Frontend (Next.js)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=dev-anon-key
OPENAI_API_KEY=sk-xxx-replace-with-real-key

# Backend
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=dev-service-role-replace-with-real-key
ENV
    echo "📝 Please edit .env.local with your actual keys, then run this script again."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm ci
fi

if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm ci && cd ..
fi

# Check if concurrently is available
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please install Node.js"
    exit 1
fi

echo "🎬 Starting development servers..."
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:4000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Run both servers concurrently
npx concurrently \
    --kill-others \
    --prefix-colors "cyan,yellow" \
    --names "NEXT,API" \
    "npm run dev" \
    "cd backend && npm run dev"