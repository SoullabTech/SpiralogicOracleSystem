#!/bin/bash
# toggle-supabase.sh
# Quickly switch between mock mode and real Supabase

ENV_FILE=".env.local"
BACKEND_ENV_FILE="backend/.env"

if grep -q "^MOCK_SUPABASE=true" "$ENV_FILE"; then
  echo "🔄 Switching to REAL Supabase mode..."
  sed -i.bak 's/^MOCK_SUPABASE=true/MOCK_SUPABASE=false/' "$ENV_FILE"
  
  # Also update backend/.env if it exists
  if [ -f "$BACKEND_ENV_FILE" ]; then
    sed -i.bak 's/^MOCK_SUPABASE=true/MOCK_SUPABASE=false/' "$BACKEND_ENV_FILE" 2>/dev/null || true
  fi
  
  echo "✅ MOCK_SUPABASE=false (real Supabase enabled)"
else
  echo "🔄 Switching to MOCK Supabase mode..."
  sed -i.bak 's/^MOCK_SUPABASE=false/MOCK_SUPABASE=true/' "$ENV_FILE"
  
  # Also update backend/.env if it exists
  if [ -f "$BACKEND_ENV_FILE" ]; then
    sed -i.bak 's/^MOCK_SUPABASE=false/MOCK_SUPABASE=true/' "$BACKEND_ENV_FILE" 2>/dev/null || true
  fi
  
  echo "✅ MOCK_SUPABASE=true (mock mode enabled)"
fi

echo "👉 Restart your dev servers to apply changes."