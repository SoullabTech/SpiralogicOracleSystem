#!/bin/bash

# 🌀 Spiralogic MAIA - Sacred Launch Ritual
# Complete pre-launch preparation and diagnostics

set -e

echo ""
echo "✺ ════════════════════════════════════════════════════════════════ ✺"
echo "                   🌀 MAIA Pre-Launch Ritual 🌀"
echo "✺ ════════════════════════════════════════════════════════════════ ✺"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Kill existing dev server
echo -e "${BLUE}🔄 Step 1: Clearing previous dev server...${NC}"
if lsof -ti:3000 > /dev/null 2>&1; then
  echo "   Stopping existing server on port 3000..."
  lsof -ti:3000 | xargs kill -9 2>/dev/null || true
  sleep 2
  echo -e "${GREEN}   ✓ Server stopped${NC}"
else
  echo -e "${YELLOW}   No server running on port 3000${NC}"
fi

echo ""

# Step 2: Start dev server in background
echo -e "${BLUE}🚀 Step 2: Starting fresh dev server...${NC}"
cd apps/web
npm run dev > /tmp/maia-dev-server.log 2>&1 &
DEV_PID=$!
cd ../..

echo "   Dev server starting (PID: $DEV_PID)"
echo "   Waiting for server to be ready..."

# Wait for server to be ready (max 60 seconds)
TIMEOUT=60
ELAPSED=0
while ! curl -s http://localhost:3000 > /dev/null 2>&1; do
  sleep 2
  ELAPSED=$((ELAPSED + 2))
  if [ $ELAPSED -ge $TIMEOUT ]; then
    echo -e "${YELLOW}   ⚠ Server taking longer than expected to start${NC}"
    echo "   Check logs at: /tmp/maia-dev-server.log"
    break
  fi
  printf "."
done

echo ""
if [ $ELAPSED -lt $TIMEOUT ]; then
  echo -e "${GREEN}   ✓ Dev server ready at http://localhost:3000${NC}"
else
  echo -e "${YELLOW}   ⚠ Continuing with diagnostics...${NC}"
fi

echo ""

# Step 3: Run beta diagnostics
echo -e "${BLUE}🔬 Step 3: Running beta diagnostics...${NC}"
npm run test:beta
echo ""

# Step 4: Display results
if [ -f "BETA_DIAGNOSIS_REPORT.md" ]; then
  echo -e "${GREEN}✓ Diagnostic report generated: BETA_DIAGNOSIS_REPORT.md${NC}"
else
  echo -e "${YELLOW}⚠ Diagnostic report not found${NC}"
fi

echo ""

# Step 5: Open monitoring dashboard (optional)
echo -e "${BLUE}📊 Step 4: Launch monitoring dashboard?${NC}"
echo "   Dashboard URL: http://localhost:3000/maya/diagnostics"
echo ""
read -p "   Open dashboard in browser? (y/N) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  if command -v open &> /dev/null; then
    open "http://localhost:3000/maya/diagnostics"
    echo -e "${GREEN}   ✓ Dashboard opened${NC}"
  elif command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost:3000/maya/diagnostics"
    echo -e "${GREEN}   ✓ Dashboard opened${NC}"
  else
    echo -e "${YELLOW}   Please open manually: http://localhost:3000/maya/diagnostics${NC}"
  fi
fi

echo ""
echo "✺ ════════════════════════════════════════════════════════════════ ✺"
echo ""
echo -e "${GREEN}✨ MAIA is ready for launch ✨${NC}"
echo ""
echo "   📊 Diagnostics: BETA_DIAGNOSIS_REPORT.md"
echo "   🌐 Dev Server: http://localhost:3000"
echo "   📈 Monitoring: http://localhost:3000/maya/diagnostics"
echo "   📋 Checklist: LAUNCH_CHECKLIST.md"
echo ""
echo "   To stop the server: kill $DEV_PID"
echo "   To view logs: tail -f /tmp/maia-dev-server.log"
echo ""
echo "✺ ════════════════════════════════════════════════════════════════ ✺"
echo ""