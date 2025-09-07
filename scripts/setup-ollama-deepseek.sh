#!/usr/bin/env bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo ""
echo "═════════════════════════════════════════════════════"
echo -e "   ${PURPLE}🚀 Ollama + DeepSeek Setup${NC}"
echo "═════════════════════════════════════════════════════"
echo ""

# 1. Install Ollama if not already installed
if ! command -v ollama &> /dev/null; then
  echo -e "${BLUE}📦 Installing Ollama...${NC}"
  curl -fsSL https://ollama.com/install.sh | sh
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Ollama installed successfully${NC}"
  else
    echo -e "${RED}❌ Ollama installation failed${NC}"
    exit 1
  fi
else
  echo -e "${GREEN}✅ Ollama already installed${NC}"
fi

# 2. Ask which DeepSeek model to pull
echo ""
echo -e "${BLUE}Which DeepSeek model do you want to install?${NC}"
echo "  1) deepseek-r1:1.5b (fastest, lightest - good for quick analysis)"
echo "  2) deepseek-r1:7b   (balanced - recommended)"
echo "  3) deepseek-r1:32b  (most powerful - needs 32GB+ RAM)"
echo ""
read -p "Choose [1-3] (default: 2): " choice

case ${choice:-2} in
  1) MODEL="deepseek-r1:1.5b" ;;
  2) MODEL="deepseek-r1:7b" ;;
  3) MODEL="deepseek-r1:32b" ;;
  *) echo -e "${YELLOW}Invalid choice. Using deepseek-r1:7b${NC}"; MODEL="deepseek-r1:7b" ;;
esac

echo ""
echo -e "${BLUE}📥 Pulling model: ${MODEL}${NC}"
echo "This may take a few minutes..."
ollama pull $MODEL

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Model pulled successfully${NC}"
else
  echo -e "${RED}❌ Failed to pull model${NC}"
  exit 1
fi

# 3. Create helper bin dir if not exists
mkdir -p ~/.local/bin

# 4. Create helper scripts
echo ""
echo -e "${BLUE}⚙️  Creating helper commands...${NC}"

# Basic deepseek command
cat > ~/.local/bin/deepseek <<EOF
#!/usr/bin/env bash
ollama run $MODEL "\$@"
EOF

# Code explanation
cat > ~/.local/bin/deepseek-explain <<EOF
#!/usr/bin/env bash
if [ -z "\$1" ]; then
  echo "Usage: deepseek-explain <file>"
  exit 1
fi
echo "🔍 Explaining \$1..."
cat "\$1" | ollama run $MODEL "Explain this code clearly. Focus on: 1) Purpose and main functionality 2) Key design patterns used 3) Important dependencies"
EOF

# Code refactoring
cat > ~/.local/bin/deepseek-refactor <<EOF
#!/usr/bin/env bash
if [ -z "\$1" ]; then
  echo "Usage: deepseek-refactor <file> [specific-request]"
  exit 1
fi
echo "⚒️  Refactoring \$1..."
REQUEST=\${2:-"Suggest improvements for clarity, performance, and maintainability"}
cat "\$1" | ollama run $MODEL "Refactor this code: \$REQUEST"
EOF

# Code review
cat > ~/.local/bin/deepseek-review <<EOF
#!/usr/bin/env bash
if [ -z "\$1" ]; then
  echo "Usage: deepseek-review <file>"
  exit 1
fi
echo "📝 Reviewing \$1..."
cat "\$1" | ollama run $MODEL "Do a thorough code review. Check for: 1) Potential bugs 2) Security issues 3) Performance bottlenecks 4) Code smells 5) Best practices violations"
EOF

# Test generation
cat > ~/.local/bin/deepseek-test <<EOF
#!/usr/bin/env bash
if [ -z "\$1" ]; then
  echo "Usage: deepseek-test <file>"
  exit 1
fi
echo "🧪 Generating tests for \$1..."
cat "\$1" | ollama run $MODEL "Generate comprehensive test cases for this file. Include unit tests, edge cases, and integration test scenarios"
EOF

# 🔮 deepseek-oracle — comprehensive analysis with summary
cat > ~/.local/bin/deepseek-oracle <<'EOF'
#!/usr/bin/env bash

MODEL="$MODEL"  # Use the model selected during setup
SUMMARY_FILE="/tmp/deepseek-oracle-summary-$$.txt"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo ""
echo "═════════════════════════════════════════════════════"
echo -e "   ${PURPLE}🔮 DeepSeek Oracle Analysis${NC}"
echo "═════════════════════════════════════════════════════"
echo ""

# If no arguments passed, use core Spiralogic files
if [ $# -eq 0 ]; then
  echo -e "${BLUE}Analyzing core Oracle system files...${NC}"
  FILES=(
    "backend/src/agents/PersonalOracleAgent.ts"
    "backend/src/agents/oracleAgent.ts"
    "backend/src/ain/AINOrchestrator.ts"
    "backend/src/memory/memoryModule.ts"
    "backend/src/types/agent.ts"
  )
else
  echo -e "${BLUE}Analyzing custom files...${NC}"
  FILES=("$@")
fi

# Initialize summary
echo "# DeepSeek Oracle Analysis Summary" > "$SUMMARY_FILE"
echo "Generated: $(date)" >> "$SUMMARY_FILE"
echo "" >> "$SUMMARY_FILE"

TOTAL=${#FILES[@]}
CURRENT=0

for FILE in "${FILES[@]}"; do
  CURRENT=$((CURRENT + 1))
  
  if [ -f "$FILE" ]; then
    echo ""
    echo -e "${GREEN}[$CURRENT/$TOTAL] Processing: $FILE${NC}"
    echo "════════════════════════════════════════════════════"
    
    # Add file to summary
    echo "## $FILE" >> "$SUMMARY_FILE"
    echo "" >> "$SUMMARY_FILE"
    
    # 1. Explanation
    echo -e "${BLUE}🔍 Explaining...${NC}"
    EXPLANATION=$(cat "$FILE" | ollama run $MODEL "Explain this file in 3-4 sentences. What is its primary purpose?")
    echo "$EXPLANATION"
    echo "### Explanation" >> "$SUMMARY_FILE"
    echo "$EXPLANATION" >> "$SUMMARY_FILE"
    echo "" >> "$SUMMARY_FILE"
    
    # 2. Key Issues
    echo ""
    echo -e "${YELLOW}⚠️  Finding issues...${NC}"
    ISSUES=$(cat "$FILE" | ollama run $MODEL "List the top 3-5 issues in this code (bugs, performance, security, maintainability). Be concise.")
    echo "$ISSUES"
    echo "### Key Issues" >> "$SUMMARY_FILE"
    echo "$ISSUES" >> "$SUMMARY_FILE"
    echo "" >> "$SUMMARY_FILE"
    
    # 3. Refactor Suggestions
    echo ""
    echo -e "${PURPLE}💡 Refactor suggestions...${NC}"
    REFACTORS=$(cat "$FILE" | ollama run $MODEL "Give 3 specific refactoring suggestions to improve this code. Focus on practical changes.")
    echo "$REFACTORS"
    echo "### Refactor Suggestions" >> "$SUMMARY_FILE"
    echo "$REFACTORS" >> "$SUMMARY_FILE"
    echo "" >> "$SUMMARY_FILE"
    echo "---" >> "$SUMMARY_FILE"
    echo "" >> "$SUMMARY_FILE"
    
  else
    echo -e "${RED}⚠️  Skipping missing file: $FILE${NC}"
    echo "## $FILE (NOT FOUND)" >> "$SUMMARY_FILE"
    echo "" >> "$SUMMARY_FILE"
  fi
done

# Generate overall summary
echo ""
echo "═════════════════════════════════════════════════════"
echo -e "${PURPLE}📊 Generating Overall Summary...${NC}"
echo "═════════════════════════════════════════════════════"

OVERALL_SUMMARY=$(cat "$SUMMARY_FILE" | ollama run $MODEL "Based on this analysis of multiple files, provide: 1) Common themes/patterns in the issues 2) Top 5 priority fixes 3) Architecture-level improvements needed. Be specific and actionable.")

echo "$OVERALL_SUMMARY"

# Add to summary file
echo "" >> "$SUMMARY_FILE"
echo "# Overall Analysis" >> "$SUMMARY_FILE"
echo "" >> "$SUMMARY_FILE"
echo "$OVERALL_SUMMARY" >> "$SUMMARY_FILE"

# Save summary
FINAL_SUMMARY="deepseek-analysis-$(date +%Y%m%d-%H%M%S).md"
cp "$SUMMARY_FILE" "$FINAL_SUMMARY"

echo ""
echo -e "${GREEN}✅ Analysis complete!${NC}"
echo -e "   Full report saved to: ${BLUE}$FINAL_SUMMARY${NC}"
echo ""

# Clean up
rm -f "$SUMMARY_FILE"
EOF

# Replace $MODEL placeholder with actual selection
sed -i '' "s/\$MODEL/$MODEL/g" ~/.local/bin/deepseek-oracle

chmod +x ~/.local/bin/deepseek*

echo -e "${GREEN}✅ Helper scripts created${NC}"

# 5. Add to PATH in shell config
SHELL_CONFIG=""
if [ -f ~/.zshrc ]; then
  SHELL_CONFIG=~/.zshrc
elif [ -f ~/.bashrc ]; then
  SHELL_CONFIG=~/.bashrc
fi

if [ -n "$SHELL_CONFIG" ]; then
  if ! grep -q 'export PATH="$HOME/.local/bin:$PATH"' "$SHELL_CONFIG"; then
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$SHELL_CONFIG"
    echo -e "${GREEN}✅ Added ~/.local/bin to PATH in $SHELL_CONFIG${NC}"
  fi
fi

# 6. Create convenient shell functions
cat > ~/.deepseek-functions <<'EOF'
# DeepSeek Shell Shortcuts
ds() { deepseek "$@"; }
ds-fix() { 
  if [ -z "$1" ]; then
    echo "Usage: ds-fix <file>"
    return 1
  fi
  cat "$1" | ollama run deepseek-r1:7b "Fix bugs in this file and show the corrected code"
}
ds-compare() { 
  if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: ds-compare <file1> <file2>"
    return 1
  fi
  diff -u "$1" "$2" | ollama run deepseek-r1:7b "Review these code differences. What are the key changes and are they improvements?"
}
ds-help() { 
  echo "🚀 DeepSeek Commands:"
  echo "  ds <prompt>              - Quick chat with DeepSeek"
  echo "  deepseek-explain <file>  - Explain code purpose and patterns"
  echo "  deepseek-review <file>   - Thorough code review"
  echo "  deepseek-refactor <file> - Get refactoring suggestions"
  echo "  deepseek-test <file>     - Generate test cases"
  echo "  deepseek-oracle [files]  - Comprehensive analysis (defaults to core files)"
  echo "  ds-fix <file>           - Fix bugs in file"
  echo "  ds-compare <f1> <f2>    - Compare two files"
}

# Oracle shortcut
oracle() { deepseek-oracle "$@"; }
EOF

if [ -n "$SHELL_CONFIG" ] && ! grep -q 'source ~/.deepseek-functions' "$SHELL_CONFIG"; then
  echo 'source ~/.deepseek-functions' >> "$SHELL_CONFIG"
  echo -e "${GREEN}✅ Added DeepSeek functions to $SHELL_CONFIG${NC}"
fi

# 7. Test the setup
echo ""
echo -e "${BLUE}🧪 Testing setup...${NC}"
if echo "Hello, DeepSeek!" | ollama run $MODEL "Respond with 'DeepSeek is ready!' if you can read this" | grep -q "ready"; then
  echo -e "${GREEN}✅ DeepSeek is responding correctly${NC}"
else
  echo -e "${YELLOW}⚠️  DeepSeek test unclear - may need to check Ollama service${NC}"
fi

# Summary
echo ""
echo "═════════════════════════════════════════════════════"
echo -e "   ${GREEN}🎉 Setup Complete!${NC}"
echo "═════════════════════════════════════════════════════"
echo ""
echo -e "${BLUE}Model installed:${NC} $MODEL"
echo -e "${BLUE}Commands available:${NC}"
echo "  • deepseek <prompt>      - Chat with DeepSeek"
echo "  • deepseek-oracle        - Analyze Oracle system (or custom files)"
echo "  • deepseek-explain       - Explain code files"
echo "  • deepseek-review        - Review code quality"
echo "  • deepseek-refactor      - Get refactor suggestions"
echo "  • deepseek-test          - Generate tests"
echo "  • ds-help                - Show all commands"
echo ""
echo -e "${YELLOW}⚡ Quick start:${NC}"
echo "  1. Restart terminal or run: source ${SHELL_CONFIG:-~/.zshrc}"
echo "  2. Try: deepseek-oracle"
echo "  3. Or:  deepseek-oracle app/oracle/page.tsx"
echo ""
echo -e "${GREEN}Happy coding with DeepSeek! 🚀${NC}"
echo "═════════════════════════════════════════════════════"