#!/bin/bash

# 🔮 Sacred Reset Script - Complete Sacred Tech Environment Reset
# This ensures a pristine Sacred Mirror Beta environment with zero purple contamination

echo "🔮 Sacred Technology Reset Protocol"
echo "==================================="
echo "Purging all cached artifacts and rebuilding from Sacred Tech specifications"
echo ""

# 1. Kill any running processes
echo "🛑 Stopping all running processes..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "node.*backend" 2>/dev/null || true
sleep 2

# 2. Frontend Deep Clean
echo -e "\n🧹 Frontend Deep Clean..."
echo "  → Removing .next build cache"
rm -rf .next
echo "  → Removing node_modules"
rm -rf node_modules
echo "  → Removing package-lock"
rm -f package-lock.json
echo "  → Removing Next.js cache"
rm -rf .next/cache
echo "  → Removing Turbo cache"
rm -rf .turbo
echo "  → Removing SWC cache"
rm -rf .swc

# 3. Backend Deep Clean
echo -e "\n🧹 Backend Deep Clean..."
cd backend
echo "  → Removing dist folders"
rm -rf dist dist-minimal
echo "  → Removing node_modules"
rm -rf node_modules
echo "  → Removing package-lock"
rm -f package-lock.json
echo "  → Removing TypeScript build info"
rm -f tsconfig.tsbuildinfo
cd ..

# 4. Clear any system caches
echo -e "\n🧹 System Cache Clean..."
echo "  → Clearing npm cache"
npm cache clean --force 2>/dev/null || true
echo "  → Clearing pnpm cache"
pnpm store prune 2>/dev/null || true

# 5. Verify Sacred Tech files are in place
echo -e "\n✅ Verifying Sacred Tech Design System..."
if grep -q "sacred-cosmic" tailwind.config.ts; then
    echo "  → Tailwind config: Sacred Blue confirmed ✓"
else
    echo "  → ❌ Tailwind config missing Sacred colors!"
fi

if grep -q "purple: {" tailwind.config.ts; then
    echo "  → Purple override: Active ✓"
else
    echo "  → ⚠️  Purple override not found"
fi

# 6. Reinstall dependencies
echo -e "\n📦 Installing fresh dependencies..."
echo "  → Frontend packages..."
npm install --legacy-peer-deps
echo "  → Backend packages..."
cd backend && npm install --legacy-peer-deps && cd ..

# 7. Set sacred environment
echo -e "\n🔐 Setting Sacred Environment..."
if ! grep -q "NEXT_PUBLIC_BACKEND_URL" .env.local; then
    echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:3002" >> .env.local
    echo "  → Added backend URL to .env.local"
fi

# 8. Create browser cache clear helper
cat > clear-browser-sacred.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Sacred Mirror - Clear Browser Cache</title>
    <style>
        body {
            background: #0A0E27;
            color: #FFD700;
            font-family: -apple-system, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
        }
        .container {
            text-align: center;
            padding: 2rem;
            border: 1px solid #FFD700;
            border-radius: 13px;
            max-width: 500px;
        }
        button {
            background: #FFD700;
            color: #0A0E27;
            border: none;
            padding: 1rem 2rem;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            margin: 0.5rem;
        }
        button:hover {
            background: #F6AD55;
        }
        .status {
            margin-top: 1rem;
            padding: 1rem;
            border-radius: 8px;
            display: none;
        }
        .success {
            background: rgba(255, 215, 0, 0.1);
            border: 1px solid #FFD700;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔮 Sacred Mirror Reset</h1>
        <p>Click below to clear all browser caches and storage for a pure Sacred Tech experience</p>
        
        <button onclick="clearAll()">Clear All Sacred Mirror Data</button>
        <button onclick="setOnboarded()">Skip Onboarding</button>
        
        <div id="status" class="status"></div>
        
        <script>
            function clearAll() {
                // Clear localStorage
                localStorage.clear();
                
                // Clear sessionStorage
                sessionStorage.clear();
                
                // Clear cookies for localhost
                document.cookie.split(";").forEach(function(c) { 
                    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
                });
                
                // Clear IndexedDB
                if (window.indexedDB) {
                    indexedDB.databases().then(databases => {
                        databases.forEach(db => indexedDB.deleteDatabase(db.name));
                    });
                }
                
                // Clear service workers
                if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.getRegistrations().then(function(registrations) {
                        for(let registration of registrations) {
                            registration.unregister();
                        }
                    });
                }
                
                // Clear caches
                if ('caches' in window) {
                    caches.keys().then(names => {
                        names.forEach(name => caches.delete(name));
                    });
                }
                
                showStatus('✅ All Sacred Mirror browser data cleared!');
            }
            
            function setOnboarded() {
                localStorage.setItem('sacredMirrorOnboarded', 'true');
                showStatus('✅ Onboarding bypassed! Visit http://localhost:3000/oracle');
            }
            
            function showStatus(message) {
                const status = document.getElementById('status');
                status.textContent = message;
                status.className = 'status success';
                status.style.display = 'block';
            }
        </script>
    </div>
</body>
</html>
EOF

echo "  → Created browser cache clear helper: clear-browser-sacred.html"

# 9. Final instructions
echo -e "\n✨ Sacred Reset Complete!"
echo "============================"
echo ""
echo "📋 Next Steps:"
echo "1. Start backend:  cd backend && npm run dev"
echo "2. Start frontend: npm run dev"
echo "3. Open clear-browser-sacred.html in your browser to clear all caches"
echo "4. Visit http://localhost:3000/oracle"
echo ""
echo "🎯 Quick Commands:"
echo "  → Skip onboarding: localStorage.setItem('sacredMirrorOnboarded', 'true');"
echo "  → Force refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (PC)"
echo ""
echo "🔮 The Sacred Mirror Beta is now in its pure form - no purple contamination!"
echo ""
echo "💡 Pro tip: Add this to your .zshrc or .bashrc:"
echo "   alias sacred-reset='~/Projects/SpiralogicOracleSystem/sacred-reset.sh'"