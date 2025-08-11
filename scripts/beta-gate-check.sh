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
echo -e "\n${BLUE}🏥 Comprehensive Health Check${NC}"

# Load environment variables
if [ -f .env ]; then
    set -a
    source .env
    set +a
fi

HEALTH_CHECKS_PASSED=0
TOTAL_HEALTH_CHECKS=3

# 1) Backend Health Check
echo -e "   ${BLUE}Backend API${NC}"
if [ -n "$NEXT_PUBLIC_BACKEND_URL" ]; then
    if curl -fsS "$NEXT_PUBLIC_BACKEND_URL/health" > /dev/null 2>&1; then
        RESPONSE_TIME=$(curl -w "%{time_total}" -s -o /dev/null "$NEXT_PUBLIC_BACKEND_URL/health" 2>/dev/null || echo "N/A")
        echo -e "   ${GREEN}✅ Backend health OK (${RESPONSE_TIME}s)${NC}"
        HEALTH_CHECKS_PASSED=$((HEALTH_CHECKS_PASSED + 1))
    else
        echo -e "   ${RED}❌ Backend health failed${NC}"
    fi
else
    echo -e "   ${YELLOW}⚠️ Backend URL not configured${NC}"
fi

# 2) Supabase RPC Health Check
echo -e "   ${BLUE}Supabase Database${NC}"
if [ -n "$NEXT_PUBLIC_SUPABASE_URL" ] && [ -n "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    SUPABASE_HOST=$(echo "$NEXT_PUBLIC_SUPABASE_URL" | sed 's|https://||')
    RPC_RESULT=$(curl -fsS "https://$SUPABASE_HOST/rest/v1/rpc/health_check" \
        -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
        -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY" 2>/dev/null || echo "FAILED")
    
    if [ "$RPC_RESULT" = "\"ok\"" ]; then
        echo -e "   ${GREEN}✅ Supabase RPC health OK${NC}"
        HEALTH_CHECKS_PASSED=$((HEALTH_CHECKS_PASSED + 1))
    else
        echo -e "   ${RED}❌ Supabase RPC health failed ($RPC_RESULT)${NC}"
    fi
    
    # Optional richer check with BOT_JWT (uncomment if health_status is enabled)
    # if [ -n "$BOT_JWT" ]; then
    #   STATUS=$(curl -fsS "https://${SUPABASE_HOST}/rest/v1/rpc/health_status" \
    #     -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
    #     -H "Authorization: Bearer $BOT_JWT" || true)
    #   if echo "$STATUS" | grep -q '"status":"ok"'; then
    #     echo -e "   ${GREEN}✅ Supabase rpc/health_status OK${NC}"
    #   else
    #     echo -e "   ${RED}❌ Supabase rpc/health_status failed: $STATUS${NC}"; HEALTH_OK=false
    #   fi
    # fi
else
    echo -e "   ${YELLOW}⚠️ Supabase credentials not configured${NC}"
fi

# 3) Frontend Health Check (if deployed)
echo -e "   ${BLUE}Frontend Deployment${NC}"
if [ -n "$VERCEL_DOMAIN" ]; then
    if curl -fsS "https://$VERCEL_DOMAIN/api/health" > /dev/null 2>&1; then
        echo -e "   ${GREEN}✅ Frontend health OK${NC}"
        HEALTH_CHECKS_PASSED=$((HEALTH_CHECKS_PASSED + 1))
    else
        echo -e "   ${RED}❌ Frontend health failed${NC}"
    fi
else
    echo -e "   ${YELLOW}⚠️ Frontend domain not configured (local dev)${NC}"
    # Still count as passed for local development
    HEALTH_CHECKS_PASSED=$((HEALTH_CHECKS_PASSED + 1))
fi

echo -e "   ${BLUE}Health Score: $HEALTH_CHECKS_PASSED/$TOTAL_HEALTH_CHECKS${NC}"
HEALTH_OK=$( [ $HEALTH_CHECKS_PASSED -ge 2 ] && echo "true" || echo "false" )

# Overall Decision
echo -e "\n${BLUE}🎯 Beta Gate Decision${NC}"
if [ "$HIGH_VULNS" -eq 0 ] && npm run build > /dev/null 2>&1 && [ "$HEALTH_OK" = true ]; then
    echo -e "   ${GREEN}✅ GO - Ready for Beta Release${NC}"
    exit 0
else
    echo -e "   ${RED}❌ NO-GO - Issues need resolution${NC}"
    exit 1
fi