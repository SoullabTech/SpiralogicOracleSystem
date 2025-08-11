#!/bin/bash

# Quick Beta Gate Readiness Check
# Can be run standalone to verify current status

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Beta Gate Readiness Check${NC}"
echo "=================================="

# Security Check
echo -e "${BLUE}🔒 Security Status${NC}"
VULNS=$(npm audit --json 2>/dev/null | jq '.metadata.vulnerabilities.total // 999' || echo "999")
HIGH_VULNS=$(npm audit --json 2>/dev/null | jq '.metadata.vulnerabilities.high // 999' || echo "999")

if [ "$HIGH_VULNS" -eq 0 ]; then
    echo -e "   ${GREEN}✅ No high-severity vulnerabilities${NC}"
else
    echo -e "   ${RED}❌ $HIGH_VULNS high-severity vulnerabilities${NC}"
fi
echo "   Total: $VULNS vulnerabilities"

# Build Check
echo -e "\n${BLUE}🏗️ Build Status${NC}"
if npm run build > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ TypeScript compilation successful${NC}"
else
    echo -e "   ${RED}❌ Build errors detected${NC}"
fi

# Health Check
echo -e "\n${BLUE}🏥 Health Check${NC}"
cd backend
npm start > ../health-check.log 2>&1 &
PID=$!
cd ..
sleep 10

if curl -s "http://localhost:3001/health" > /dev/null 2>&1; then
    RESPONSE_TIME=$(curl -w "%{time_total}" -s -o /dev/null "http://localhost:3001/health" 2>/dev/null || echo "N/A")
    echo -e "   ${GREEN}✅ Health endpoint responding (${RESPONSE_TIME}s)${NC}"
    HEALTH_OK=true
else
    echo -e "   ${RED}❌ Health endpoint not accessible${NC}"
    HEALTH_OK=false
fi

kill $PID 2>/dev/null || true
rm -f health-check.log

# Overall Decision
echo -e "\n${BLUE}🎯 Beta Gate Decision${NC}"
if [ "$HIGH_VULNS" -eq 0 ] && npm run build > /dev/null 2>&1 && [ "$HEALTH_OK" = true ]; then
    echo -e "   ${GREEN}✅ GO - Ready for Beta Release${NC}"
    exit 0
else
    echo -e "   ${RED}❌ NO-GO - Issues need resolution${NC}"
    exit 1
fi