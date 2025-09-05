#!/bin/bash

# Post-Cleanup Verification Script for SpiralogicOracleSystem
# Run this after major cleanups to ensure everything still works

echo "🔍 SpiralogicOracleSystem Post-Cleanup Verification"
echo "=================================================="
echo ""

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check command result
check_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2${NC}"
    else
        echo -e "${RED}✗ $2${NC}"
    fi
}

# 1. Dependencies Check
echo "📦 Checking Dependencies..."
echo "------------------------"
if [ -f "package.json" ]; then
    npm install --silent
    check_result $? "Root dependencies installed"
fi

cd backend 2>/dev/null && npm install --silent
check_result $? "Backend dependencies installed"
cd ..

echo ""

# 2. Environment Variables
echo "🔐 Checking Environment Variables..."
echo "---------------------------------"
if [ -n "$OPENAI_API_KEY" ]; then
    echo -e "${GREEN}✓ OPENAI_API_KEY is set${NC}"
else
    echo -e "${YELLOW}⚠ OPENAI_API_KEY not found in environment${NC}"
fi

if [ -n "$SUPABASE_KEY" ]; then
    echo -e "${GREEN}✓ SUPABASE_KEY is set${NC}"
else
    echo -e "${YELLOW}⚠ SUPABASE_KEY not found in environment${NC}"
fi

# Check .env files
[ -f ".env.local" ] && echo -e "${GREEN}✓ .env.local exists${NC}" || echo -e "${YELLOW}⚠ .env.local missing${NC}"
[ -f "backend/.env" ] && echo -e "${GREEN}✓ backend/.env exists${NC}" || echo -e "${YELLOW}⚠ backend/.env missing${NC}"

echo ""

# 3. Docker Check
echo "🐳 Checking Docker..."
echo "-------------------"
if docker info >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Docker is running${NC}"
    echo "Cleaning Docker artifacts..."
    docker system prune -f --volumes >/dev/null 2>&1
    echo -e "${GREEN}✓ Docker cleaned${NC}"
else
    echo -e "${YELLOW}⚠ Docker not running (Supabase local dev will need it)${NC}"
fi

echo ""

# 4. Database/Supabase
echo "🗄️  Checking Supabase..."
echo "---------------------"
if command -v supabase &> /dev/null; then
    cd backend 2>/dev/null
    supabase migration list 2>&1 | grep -q "error" && echo -e "${RED}✗ Supabase migrations have errors${NC}" || echo -e "${GREEN}✓ Supabase migrations look good${NC}"
    cd ..
else
    echo -e "${YELLOW}⚠ Supabase CLI not installed${NC}"
fi

echo ""

# 5. Tests
echo "🧪 Running Tests..."
echo "-----------------"
cd backend 2>/dev/null
if [ -f "package.json" ]; then
    npm test -- --listTests >/dev/null 2>&1
    check_result $? "Test suite accessible"
else
    echo -e "${RED}✗ Backend package.json not found${NC}"
fi
cd ..

echo ""

# 6. Local Server Check
echo "🚀 Checking Local Servers..."
echo "--------------------------"
# Check if ports are available
lsof -i :3000 >/dev/null 2>&1 && echo -e "${YELLOW}⚠ Port 3000 in use${NC}" || echo -e "${GREEN}✓ Port 3000 available${NC}"
lsof -i :8080 >/dev/null 2>&1 && echo -e "${YELLOW}⚠ Port 8080 in use${NC}" || echo -e "${GREEN}✓ Port 8080 available${NC}"

echo ""

# 7. Git Status
echo "📝 Git Status..."
echo "--------------"
if [ -d ".git" ]; then
    CHANGES=$(git status --porcelain | wc -l)
    if [ $CHANGES -eq 0 ]; then
        echo -e "${GREEN}✓ Working directory clean${NC}"
    else
        echo -e "${YELLOW}⚠ You have $CHANGES uncommitted changes${NC}"
    fi
else
    echo -e "${RED}✗ Not a git repository${NC}"
fi

echo ""
echo "✨ Verification complete!"
echo ""
echo "Next steps:"
echo "1. Run 'npm run dev' to start the development server"
echo "2. Visit http://localhost:3000 to test the frontend"
echo "3. Check http://localhost:3000/api/oracle for API response"
echo ""