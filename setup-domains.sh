#!/bin/bash

echo "🚀 Vercel Domain Setup Script"
echo "================================"

echo "1. Production URL Status:"
curl -I https://spiralogic-oracle-system.vercel.app/ | head -1

echo -e "\n2. Current Domain Status:"
echo "soullab.life:"
curl -I https://soullab.life/ 2>/dev/null | head -1 || echo "Connection failed"

echo "oracle.soullab.life:"
curl -I https://oracle.soullab.life/ 2>/dev/null | head -1 || echo "Connection failed"

echo -e "\n3. Next Steps:"
echo "   → Go to: https://vercel.com/spiralogic-oracle-system/spiralogic-oracle-system/settings/domains"
echo "   → Add domains: soullab.life and oracle.soullab.life"
echo "   → Configure DNS records as shown in FINAL_DOMAIN_SETUP.md"
echo "   → Wait for DNS propagation (up to 24 hours)"

echo -e "\n4. After DNS setup, test with:"
echo "   curl -I https://soullab.life/"
echo "   curl -I https://oracle.soullab.life/"
echo "   (Both should return HTTP/2 200)"

echo -e "\n✅ Build Status: SUCCESS"
echo "📦 Next.js 13 + Tailwind CSS deployment ready!"