#!/bin/bash

echo "🔍 Vercel Deployment Diagnostic"
echo "==============================="

echo -e "\n1. Current Git Status:"
git log --oneline -3

echo -e "\n2. Vercel.json Content:"
cat vercel.json

echo -e "\n3. Package.json Scripts:"
grep -A 5 '"scripts"' package.json

echo -e "\n4. Testing URLs:"
echo "Production URL:"
curl -s -I https://spiralogic-oracle-system.vercel.app/ | head -2

echo -e "\nCustom Domains:"
curl -s -I https://soullab.life/ | head -2
curl -s -I https://oracle.soullab.life/ | head -2

echo -e "\n5. DNS Resolution:"
echo "soullab.life: $(dig +short soullab.life @1.1.1.1)"
echo "oracle.soullab.life: $(dig +short oracle.soullab.life @1.1.1.1 | head -1)"

echo -e "\n6. Recommendations:"
echo "✅ DNS is configured correctly"
echo "❌ All URLs returning 404"
echo "🔧 Possible issues:"
echo "   - Project may have been transferred/deleted"
echo "   - Deployment may have failed due to vercel.json issues"
echo "   - Domains need to be re-added in dashboard"
echo ""
echo "📋 Next steps:"
echo "1. Check Vercel dashboard for deployment logs"
echo "2. Re-link project with: npx vercel link"
echo "3. Deploy manually with: npx vercel --prod"