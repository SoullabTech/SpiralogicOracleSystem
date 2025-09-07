#!/bin/bash

# 🔒 Security Patch Script
# Updates vulnerable dependencies across all services

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo -e "${PURPLE}🔒 Security Patch - Updating Vulnerable Dependencies${NC}\n"

# Find all requirements files
REQUIREMENTS_FILES=$(find . -name "requirements*.txt" -type f | grep -v node_modules | grep -v ".git")

echo -e "${BLUE}Found requirements files:${NC}"
echo "$REQUIREMENTS_FILES"
echo

# Update each requirements file
for file in $REQUIREMENTS_FILES; do
    echo -e "${YELLOW}Updating: $file${NC}"
    
    # Check if file exists and is writable
    if [ -w "$file" ]; then
        # Update aiohttp
        if grep -q "aiohttp" "$file"; then
            sed -i '' 's/aiohttp[<>=!]*.*/aiohttp>=3.9.5/' "$file"
            echo "  ✅ Updated aiohttp to >=3.9.5"
        fi
        
        # Update requests
        if grep -q "^requests" "$file"; then
            sed -i '' 's/^requests[<>=!]*.*/requests>=2.32.0/' "$file"
            echo "  ✅ Updated requests to >=2.32.0"
        fi
        
        # Update transformers
        if grep -q "transformers" "$file"; then
            sed -i '' 's/transformers[<>=!]*.*/transformers>=4.44.2/' "$file"
            echo "  ✅ Updated transformers to >=4.44.2"
        fi
        
        # Update fastapi (bonus security)
        if grep -q "fastapi" "$file"; then
            sed -i '' 's/fastapi[<>=!]*.*/fastapi>=0.115.0/' "$file"
            echo "  ✅ Updated fastapi to >=0.115.0"
        fi
        
        # Update uvicorn (bonus security)
        if grep -q "uvicorn" "$file"; then
            sed -i '' 's/uvicorn[<>=!]*.*/uvicorn>=0.32.0/' "$file"
            echo "  ✅ Updated uvicorn to >=0.32.0"
        fi
    else
        echo "  ⚠️  Skipping (not writable or doesn't exist)"
    fi
    echo
done

echo -e "${GREEN}✅ Security patches applied to all requirements files${NC}\n"

# Create or update Dependabot config
echo -e "${BLUE}Creating Dependabot configuration...${NC}"
mkdir -p .github
cat > .github/dependabot.yml << 'EOF'
# Dependabot configuration for automatic dependency updates
version: 2
updates:
  # Node.js dependencies
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    labels:
      - "dependencies"
      - "security"
    commit-message:
      prefix: "🔒"
    
  # Python dependencies - backend
  - package-ecosystem: "pip"
    directory: "/backend"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
    labels:
      - "dependencies"
      - "python"
      - "security"
    commit-message:
      prefix: "🔒"
    
  # Python dependencies - northflank services
  - package-ecosystem: "pip"
    directory: "/northflank-migration/memory-agent"
    schedule:
      interval: "weekly"
    labels:
      - "dependencies"
      - "python"
      - "security"
    commit-message:
      prefix: "🔒"
      
  - package-ecosystem: "pip"
    directory: "/northflank-migration/voice-agent"
    schedule:
      interval: "weekly"
    labels:
      - "dependencies"
      - "python"
      - "security"
    commit-message:
      prefix: "🔒"
      
  # GitHub Actions
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
    labels:
      - "dependencies"
      - "github-actions"
    commit-message:
      prefix: "🔒"
EOF

echo -e "${GREEN}✅ Dependabot configuration created${NC}\n"

# Summary
echo -e "${PURPLE}═══════════════════════════════════════${NC}"
echo -e "${PURPLE}🔒 Security Patch Complete${NC}"
echo -e "${PURPLE}═══════════════════════════════════════${NC}"
echo
echo -e "${GREEN}Next steps:${NC}"
echo "1. Review the changes: git diff"
echo "2. Test critical flows (voice, TTS, memory)"
echo "3. Commit: git beta-commit \"🔒 Security patch: upgraded vulnerable dependencies\""
echo
echo -e "${YELLOW}Dependencies secured:${NC}"
echo "  • aiohttp >= 3.9.5 (fixes DoS, request smuggling)"
echo "  • requests >= 2.32.0 (fixes credential leakage)"
echo "  • transformers >= 4.44.2 (fixes ReDoS)"
echo "  • axios 1.11.0 (already secure)"
echo
echo -e "${BLUE}Dependabot will now:${NC}"
echo "  • Check for updates weekly"
echo "  • Create PRs automatically"
echo "  • Label security updates"
echo "  • Use 🔒 prefix for commits"