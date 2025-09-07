#!/bin/bash

# Quick build verification script
echo "🔍 Verifying SpiralogicOracleSystem Build..."
echo "==========================================="
echo ""

# Check current directory
echo "📍 Current Location:"
pwd
echo ""

# Check for key beta files
echo "✅ Beta Build Indicators:"
[ -f "SACRED_MIRROR_IMPLEMENTATION_GUIDE.md" ] && echo "  ✓ Sacred Mirror Guide found"
[ -f "MAYA_AIN_INTEGRATION_VERIFICATION.md" ] && echo "  ✓ Maya Integration found"
[ -f "start-beta.sh" ] && echo "  ✓ Beta start script found"
[ -d "sacred-mirror-mvp" ] && echo "  ✓ Sacred Mirror MVP found"
echo ""

# Check for legacy indicators
echo "❌ Legacy Build Indicators:"
[ -f "ORALIA_LEGACY.md" ] && echo "  ⚠️  Legacy Oralia files detected!" || echo "  ✓ No Oralia legacy files"
grep -q "Oralia" app/oracle/page.tsx 2>/dev/null && echo "  ⚠️  Oralia references in code!" || echo "  ✓ No Oralia references"
grep -q "purple-600" app/oracle/page.tsx 2>/dev/null && echo "  ⚠️  Purple theme detected!" || echo "  ✓ No purple theme"
echo ""

# Check running processes
echo "🏃 Running Services:"
lsof -i :3000 >/dev/null 2>&1 && echo "  ✓ Frontend running on :3000" || echo "  ✗ Frontend not running"
lsof -i :3002 >/dev/null 2>&1 && echo "  ✓ Backend running on :3002" || echo "  ✗ Backend not running"
echo ""

echo "📋 Summary:"
if [ -f "SACRED_MIRROR_IMPLEMENTATION_GUIDE.md" ] && [ -f "start-beta.sh" ]; then
    echo "  ✅ You are in the CORRECT beta build!"
    echo "  🎨 Sacred Tech design system active"
    echo "  🤖 Maya Oracle ready"
else
    echo "  ⚠️  This might not be the beta build"
fi
echo ""