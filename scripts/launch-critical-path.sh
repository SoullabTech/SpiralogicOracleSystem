#!/bin/bash

# Maya Beta Launch - Critical Path Script
# Run this before Monday launch

echo "🚀 Maya Beta Launch Critical Path"
echo "=================================="
echo ""

# 1. Run pattern evolution migration
echo "Step 1: Running pattern evolution database migration..."
echo "----------------------------------------"
npx supabase db push --file supabase/migrations/20250121_pattern_evolution_tracking.sql
if [ $? -eq 0 ]; then
    echo "✅ Pattern evolution tables created"
else
    echo "❌ Migration failed - check database connection"
    exit 1
fi
echo ""

# 2. Verify API endpoint accepts explorer name
echo "Step 2: Testing API endpoint for explorer name..."
echo "----------------------------------------"
curl -X POST http://localhost:3000/api/beta/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "timezone": "America/New_York",
    "explorerName": "MAYA-TEST",
    "agreementAccepted": true,
    "agreementDate": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
  }' \
  -w "\nHTTP Status: %{http_code}\n"

echo ""
echo "⚠️  If status is not 200, update the API to handle explorerName field"
echo ""

# 3. Set up email automation (manual for now)
echo "Step 3: Email automation setup..."
echo "----------------------------------------"
echo "For Week 1, run manually:"
echo ""
echo "  Day 3: node scripts/send-day3-checkins.js"
echo "  Day 7: node scripts/send-week1-summaries.js"
echo ""
echo "Or set up cron jobs:"
echo "  0 10 * * * node /path/to/scripts/check-and-send-emails.js"
echo ""

# 4. Verify all components are imported
echo "Step 4: Checking component imports..."
echo "----------------------------------------"
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Build successful - all components properly imported"
else
    echo "❌ Build failed - check for missing imports:"
    echo "  - PulseCheck component"
    echo "  - EscapeHatch component"
    echo "  - BetaAgreementModal component"
    echo "  - BetaAnalytics utils"
    exit 1
fi
echo ""

# 5. Quick smoke test
echo "Step 5: Running smoke tests..."
echo "----------------------------------------"
echo "Testing critical paths:"

# Test signup page loads
curl -s -o /dev/null -w "Signup page: %{http_code}\n" http://localhost:3000/beta-signup

# Test Maya conversation page loads
curl -s -o /dev/null -w "Maya page: %{http_code}\n" http://localhost:3000/maya

echo ""
echo "=================================="
echo "🎯 LAUNCH CHECKLIST COMPLETE"
echo ""
echo "If all steps passed:"
echo "  1. Deploy to staging"
echo "  2. Test with 1-2 team members"
echo "  3. Send invites to first 5 explorers"
echo "  4. Monitor analytics dashboard"
echo ""
echo "Remember:"
echo "  - First 24 hours are critical"
echo "  - Watch for distress markers"
echo "  - Respond to technical issues immediately"
echo "  - Day 3 check-ins are crucial for retention"
echo ""
echo "🌟 Maya is ready to meet her first explorers"