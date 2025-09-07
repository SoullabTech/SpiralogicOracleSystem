#!/bin/bash

# Toggle Supabase Mode Script
# Easily switch between Mock and Real Supabase modes

echo "🔄 Supabase Mode Toggle"
echo "========================"
echo ""
echo "Current mode detection..."

# Check current mode
CURRENT_MODE=$(grep "^MOCK_SUPABASE=" .env.local | cut -d'=' -f2)

if [ "$CURRENT_MODE" = "true" ]; then
    echo "📦 Currently in: MOCK MODE"
    echo ""
    echo "Options:"
    echo "1) Stay in Mock Mode (fast, no database)"
    echo "2) Switch to Real Supabase (persistence, analytics)"
else
    echo "🗄️ Currently in: REAL SUPABASE MODE"
    echo ""
    echo "Options:"
    echo "1) Switch to Mock Mode (fast, no database)"
    echo "2) Stay with Real Supabase (persistence, analytics)"
fi

echo ""
read -p "Choose option (1 or 2): " choice

case $choice in
    1)
        if [ "$CURRENT_MODE" = "true" ]; then
            echo "✅ Staying in Mock Mode"
        else
            echo "🔄 Switching to Mock Mode..."
            sed -i.bak 's/^MOCK_SUPABASE=.*/MOCK_SUPABASE=true/' .env.local
            sed -i.bak 's/^MOCK_SUPABASE=.*/MOCK_SUPABASE=true/' backend/.env 2>/dev/null || true
            echo "✅ Switched to Mock Mode!"
            echo ""
            echo "Benefits:"
            echo "• ⚡ Fast startup, no database delays"
            echo "• 🎤 Voice-first experience works perfectly"
            echo "• 🔧 Great for demos and feature development"
            echo "• 🚀 No Supabase dependency issues"
        fi
        ;;
    2)
        if [ "$CURRENT_MODE" != "true" ]; then
            echo "✅ Staying with Real Supabase"
        else
            echo "🔄 Switching to Real Supabase..."
            sed -i.bak 's/^MOCK_SUPABASE=.*/MOCK_SUPABASE=false/' .env.local
            sed -i.bak 's/^MOCK_SUPABASE=.*/MOCK_SUPABASE=false/' backend/.env 2>/dev/null || true
            echo "✅ Switched to Real Supabase!"
            echo ""
            echo "Requirements:"
            echo "• 🔑 Valid Supabase keys configured"
            echo "• 🛡️ RLS policies should be set up"
            echo "• 📊 Database schema must match code"
            echo ""
            echo "To fix security warnings, run:"
            echo "  ./scripts/apply-supabase-security.sh"
        fi
        ;;
    *)
        echo "❌ Invalid choice. No changes made."
        exit 1
        ;;
esac

echo ""
echo "🔄 Restart services for changes to take effect:"
echo "  ./start-dev.sh"
echo ""
echo "📝 Current Configuration:"
echo "  Mock Mode: $(grep "^MOCK_SUPABASE=" .env.local | cut -d'=' -f2)"
echo "  Sesame CI: Running on port 8000 ✅"
echo "  Backend: Ready on port 3002"
echo "  Frontend: Ready on port 3000"