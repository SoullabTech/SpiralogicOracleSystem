#!/bin/bash

# Sacred Design Verification Test
echo "🔮 Sacred Design System Verification"
echo "===================================="

# Test 1: Check if Tailwind config has Sacred colors
echo "1. Checking Tailwind Sacred colors..."
if grep -q "sacred-cosmic" tailwind.config.ts; then
    echo "   ✅ Sacred cosmic color found"
else
    echo "   ❌ Sacred cosmic color missing"
fi

if grep -q "gold-divine" tailwind.config.ts; then
    echo "   ✅ Gold divine color found"
else
    echo "   ❌ Gold divine color missing"
fi

# Test 2: Check if globals.css has Sacred styles
echo -e "\n2. Checking globals.css Sacred styles..."
if grep -q "Sacred Tech Design System" app/globals.css; then
    echo "   ✅ Sacred design system found"
else
    echo "   ❌ Sacred design system missing"
fi

if grep -q "sacred-button" app/globals.css; then
    echo "   ✅ Sacred button styles found"
else
    echo "   ❌ Sacred button styles missing"
fi

# Test 3: Check input field styling fix
echo -e "\n3. Checking input field styling..."
if grep -q "text-gold-divine" app/globals.css; then
    echo "   ✅ Gold text color for inputs found"
else
    echo "   ❌ Gold text color for inputs missing"
fi

# Test 4: Check for remaining purple/gradient issues
echo -e "\n4. Quick scan for remaining purple issues..."
purple_count=$(grep -r "text-purple\|bg-purple\|border-purple" --include="*.tsx" --include="*.jsx" components/ app/ 2>/dev/null | grep -v "// Sacred" | wc -l)
echo "   Purple references found: $purple_count"

if [ $purple_count -lt 5 ]; then
    echo "   ✅ Purple usage is minimal"
else
    echo "   ⚠️  Still some purple references to review"
fi

# Test 5: Check Oracle interface
echo -e "\n5. Checking Oracle interface..."
if [ -f "components/OracleInterface.tsx" ]; then
    if grep -q 'className="flex-1"' components/OracleInterface.tsx; then
        echo "   ✅ Input field uses global styles"
    else
        echo "   ❌ Input field still has custom classes"
    fi
else
    echo "   ❌ OracleInterface.tsx not found"
fi

echo -e "\n🎯 VERIFICATION COMPLETE"
echo "Your Sacred Tech interface should now display:"
echo "• Gold text in input fields (visible typing)"
echo "• Sacred navy/cosmic backgrounds"
echo "• Gold divine accents and highlights" 
echo "• Executive-grade Sacred Technology aesthetic"

echo -e "\n💡 Next Steps:"
echo "1. Start dev server: npm run dev"
echo "2. Open browser and test input visibility"
echo "3. Verify Sacred color palette is active"
echo "4. Hard refresh browser (Cmd+Shift+R) if needed"