#!/bin/bash
# Safe environment variable loading methods
# Avoid pitfalls with spaces, #, or = in values

echo "🔧 Safe Environment Loading Methods"
echo ""

# Method 1: POSIX-compliant (handles quoted values)
echo "Method 1: POSIX set -a approach"
echo "set -a"
echo ". env/.env.local" 
echo "set +a"
echo ""

# Method 2: dotenv-cli (most robust)
echo "Method 2: dotenv-cli (recommended)"
echo "npx dotenv -e env/.env.local -- node -e \"console.log(process.env.NEXT_PUBLIC_SUPABASE_URL ? 'ok' : 'missing')\""
echo ""

# Method 3: Docker Compose (no manual export)
echo "Method 3: Docker Compose"
echo "docker compose --env-file env/.env.local up -d"
echo ""

# Method 4: Quick validator (original - use with caution)
echo "Method 4: Quick validator (works if no spaces/#/= in values)"
echo "export \$(grep -v '^#' env/.env.local | xargs) && node -e \"...\""
echo ""

echo "⚠️  Security Tips:"
echo "• Don't commit real keys (.env.local is git-ignored)"
echo "• Mask secrets in shell: echo \${OPENAI_API_KEY:0:6}******"
echo "• Consider direnv for auto-loading per directory"