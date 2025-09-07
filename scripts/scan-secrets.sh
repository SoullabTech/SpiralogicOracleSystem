#!/usr/bin/env bash
set -euo pipefail

# scan only staged files (not deleted/binary) - macOS compatible
FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -vE '(^|/)\.husky/|(^|/)node_modules/|(^|/)dist/' || true)

[ -z "$FILES" ] && exit 0

# patterns to block
PATTERNS=(
  'sbp_[a-f0-9]{40,}'                               # Supabase PAT
  'eyJhbGciOiJI[0-9A-Za-z._-]+'                      # JWT-ish
  'SUPABASE_DB_PASSWORD *= *[^*]'                   # Real DB password (not ***REPLACE_ME***)
  'DATABASE_URL *= *postgres://[^*]'                # Real DB URL (not placeholder)
  '^[[:space:]]*SUPABASE_SERVICE_ROLE *= *[^#*<]'   # Real service role (not comment/placeholder)
)

FAILED=0
for f in $FILES; do
  [ ! -f "$f" ] && continue
  for p in "${PATTERNS[@]}"; do
    if grep -E -n "$p" "$f" >/dev/null 2>&1; then
      echo "❌ Secret-like content in $f (pattern: $p)"
      FAILED=1
    fi
  done
done

if [ $FAILED -ne 0 ]; then
  echo "Commit blocked. Remove secrets and try again."
  exit 1
fi