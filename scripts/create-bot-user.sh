#!/usr/bin/env bash
set -euo pipefail
# Create a Supabase Auth "bot" user and print a JWT you can store as a CI secret.
# REQUIRED env (export before running; DO NOT commit):
#   SUPABASE_PROJECT_URL=https://<ref>.supabase.co
#   SUPABASE_SERVICE_ROLE=<SERVICE_ROLE_KEY>   # never store in repo/CI
#   BOT_EMAIL=bot@spiralogic.system
#   BOT_PASSWORD='<STRONG_PASSWORD>'

echo "[1/2] Creating bot user ${BOT_EMAIL}"
CREATE_RES=$(
  curl -sS "${SUPABASE_PROJECT_URL}/auth/v1/admin/users" \
    -H "apikey: ${SUPABASE_SERVICE_ROLE}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE}" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"${BOT_EMAIL}\",\"password\":\"${BOT_PASSWORD}\",\"email_confirm\":true}"
)
echo "$CREATE_RES" | jq .

echo "[2/2] Exchanging credentials for JWT"
TOKEN_RES=$(
  curl -sS "${SUPABASE_PROJECT_URL}/auth/v1/token?grant_type=password" \
    -H "apikey: ${SUPABASE_SERVICE_ROLE}" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"${BOT_EMAIL}\",\"password\":\"${BOT_PASSWORD}\"}"
)
BOT_JWT=$(echo "$TOKEN_RES" | jq -r .access_token)
if [ -z "$BOT_JWT" ] || [ "$BOT_JWT" = "null" ]; then
  echo "Failed to obtain token"; echo "$TOKEN_RES"; exit 1
fi
echo "BOT_JWT=${BOT_JWT}"