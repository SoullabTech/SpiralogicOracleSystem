#!/bin/bash

# Setup Monorepo Script
# This script sets up the pnpm workspace for the SpiralogicOracleSystem monorepo

set -e

echo "🚀 Setting up SpiralogicOracleSystem Monorepo"
echo "============================================"

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
else
    echo "✅ pnpm is already installed"
fi

# Clean up old node_modules if they exist
echo ""
echo "🧹 Cleaning up old dependencies..."
if [ -d "node_modules" ]; then
    echo "  Removing root node_modules..."
    rm -rf node_modules
fi

if [ -d "apps/web/node_modules" ]; then
    echo "  Removing apps/web/node_modules..."
    rm -rf apps/web/node_modules
fi

if [ -d "apps/api/node_modules" ]; then
    echo "  Removing apps/api/node_modules..."
    rm -rf apps/api/node_modules
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies with pnpm..."
pnpm install

# Build shared packages first
echo ""
echo "🔨 Building shared packages..."
if [ -d "packages/shared" ]; then
    cd packages/shared
    if [ -f "package.json" ]; then
        pnpm build || echo "  No build script for shared package"
    fi
    cd ../..
fi

# Set up environment files
echo ""
echo "⚙️  Setting up environment files..."

# Create .env.local for web if it doesn't exist
if [ ! -f "apps/web/.env.local" ]; then
    echo "  Creating apps/web/.env.local..."
    cat > apps/web/.env.local << EOF
# API Configuration
NEXT_PUBLIC_API_MODE=stub
NEXT_PUBLIC_API_URL=http://localhost:3002

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-key

# Feature Flags
NEXT_PUBLIC_MEMORY_REFERENCES_ENABLED=false
NEXT_PUBLIC_DISABLE_AUDIO_BANNER=true
EOF
    echo "  ✅ Created apps/web/.env.local with stub configuration"
else
    echo "  ✅ apps/web/.env.local already exists"
fi

# Create .env for API if it doesn't exist
if [ ! -f "apps/api/.env" ]; then
    echo "  Creating apps/api/.env..."
    cat > apps/api/.env << EOF
# Server Configuration
PORT=3002
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://localhost:5432/spiralogic

# External Services
OPENAI_API_KEY=your-openai-key-here
ANTHROPIC_API_KEY=your-anthropic-key-here
EOF
    echo "  ✅ Created apps/api/.env with default configuration"
else
    echo "  ✅ apps/api/.env already exists"
fi

# Create run scripts
echo ""
echo "📝 Creating convenience scripts..."

# Create run-web.sh
cat > run-web.sh << 'EOF'
#!/bin/bash
echo "🌐 Starting Web Application..."
cd apps/web && pnpm dev
EOF
chmod +x run-web.sh

# Create run-api.sh
cat > run-api.sh << 'EOF'
#!/bin/bash
echo "🔌 Starting API Server..."
cd apps/api && pnpm dev
EOF
chmod +x run-api.sh

# Create run-all.sh
cat > run-all.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting All Services..."
pnpm dev
EOF
chmod +x run-all.sh

echo ""
echo "✅ Monorepo setup complete!"
echo ""
echo "📚 Available commands:"
echo "  pnpm dev        - Run all services concurrently"
echo "  pnpm dev:web    - Run only the web application"
echo "  pnpm dev:api    - Run only the API server"
echo "  pnpm build      - Build all packages"
echo "  pnpm build:web  - Build only the web application"
echo "  pnpm build:api  - Build only the API server"
echo ""
echo "🏃 Quick start:"
echo "  ./run-all.sh    - Start everything"
echo "  ./run-web.sh    - Start just the frontend"
echo "  ./run-api.sh    - Start just the backend"
echo ""
echo "🌐 Access points:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3002"
echo ""
echo "💡 Next steps:"
echo "  1. Review and update environment variables in:"
echo "     - apps/web/.env.local"
echo "     - apps/api/.env"
echo "  2. Run 'pnpm dev:web' to start the frontend"
echo "  3. Run 'pnpm dev:api' to start the backend (when ready)"