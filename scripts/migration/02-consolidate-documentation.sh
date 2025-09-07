#!/bin/bash

# 📚 Documentation Consolidation Script
# Automatically reorganizes all .md files into structured /docs folder

echo "📚 Starting Documentation Consolidation..."
echo "=========================================="

# Create new documentation structure
echo "Creating new /docs structure..."
mkdir -p docs/architecture
mkdir -p docs/ux
mkdir -p docs/sacred
mkdir -p docs/developer
mkdir -p docs/business

# Function to categorize and move documentation
categorize_doc() {
  local file=$1
  local filename=$(basename "$file")
  local content=$(head -50 "$file" 2>/dev/null | tr '[:upper:]' '[:lower:]')
  
  # Categorization logic based on content
  if [[ "$filename" =~ (ARCHITECTURE|SYSTEM|API|BACKEND|INFRASTRUCTURE) ]] || 
     [[ "$content" =~ (architecture|system|api|backend|infrastructure) ]]; then
    echo "  → Architecture: $filename"
    cp "$file" "docs/architecture/$filename"
    
  elif [[ "$filename" =~ (UX|FLOW|MOTION|STORYBOARD|INTERFACE) ]] ||
       [[ "$content" =~ (ux|motion|interface|storyboard|user experience) ]]; then
    echo "  → UX: $filename"
    cp "$file" "docs/ux/$filename"
    
  elif [[ "$filename" =~ (SACRED|RITUAL|PORTAL|WHITEPAPER|CONSCIOUSNESS) ]] ||
       [[ "$content" =~ (sacred|ritual|consciousness|oracle|wisdom) ]]; then
    echo "  → Sacred: $filename"
    cp "$file" "docs/sacred/$filename"
    
  elif [[ "$filename" =~ (README|GETTING|STARTED|CONTRIBUTING|TESTING|SETUP) ]] ||
       [[ "$content" =~ (installation|setup|development|testing|contributing) ]]; then
    echo "  → Developer: $filename"
    cp "$file" "docs/developer/$filename"
    
  elif [[ "$filename" =~ (MARKET|REVENUE|BUSINESS|LAUNCH|BETA) ]] ||
       [[ "$content" =~ (market|revenue|business|launch|investor) ]]; then
    echo "  → Business: $filename"
    cp "$file" "docs/business/$filename"
    
  else
    echo "  → Developer (default): $filename"
    cp "$file" "docs/developer/$filename"
  fi
}

# Find and categorize all .md files
echo ""
echo "📂 Finding all documentation files..."
echo "-------------------------------------"

# Temporarily store all md files
mapfile -t md_files < <(find . -type f -name "*.md" -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./docs/*")

echo "Found ${#md_files[@]} documentation files"
echo ""

echo "📋 Categorizing documentation..."
echo "--------------------------------"

for file in "${md_files[@]}"; do
  categorize_doc "$file"
done

# Create index file
echo ""
echo "📝 Creating documentation index..."
cat > docs/README.md << 'EOF'
# 🌸 Spiralogic Oracle Documentation

## 📂 Documentation Structure

### 🏗️ /architecture
System architecture, API specifications, and technical infrastructure documentation.

### 🎨 /ux
User experience flows, motion states, interface guidelines, and storyboards.

### ✨ /sacred
Sacred Portal whitepapers, ritual layer guides, consciousness framework, and oracle wisdom documentation.

### 💻 /developer
Getting started guides, development setup, testing procedures, and contribution guidelines.

### 💼 /business
Market opportunity analysis, revenue models, launch strategies, and investor materials.

---

## 🔍 Quick Links

### Sacred Core Components
- [Sacred Portal Whitepaper](./sacred/SACRED_PORTAL_WHITEPAPER.md)
- [Motion Orchestration Guide](./ux/MOTION_STATES.md)
- [Oracle API Specification](./architecture/API_SPECIFICATIONS.md)

### Development
- [Getting Started](./developer/GETTING_STARTED.md)
- [Contributing Guide](./developer/CONTRIBUTING.md)
- [Testing Guide](./developer/TESTING_GUIDE.md)

### Business & Launch
- [Beta Launch Plan](./business/BETA_LAUNCH.md)
- [Market Opportunity](./business/MARKET_OPPORTUNITY.md)

---

*Documentation organized for the Sacred Core migration • Generated $(date)*
EOF

# Create migration report
echo ""
echo "📊 Creating migration report..."
cat > ./migration-output/documentation-migration.txt << EOF
Documentation Migration Report
==============================
Generated: $(date)

Files Migrated by Category:
---------------------------
Architecture: $(ls docs/architecture/*.md 2>/dev/null | wc -l)
UX/Design: $(ls docs/ux/*.md 2>/dev/null | wc -l)
Sacred/Wisdom: $(ls docs/sacred/*.md 2>/dev/null | wc -l)
Developer: $(ls docs/developer/*.md 2>/dev/null | wc -l)  
Business: $(ls docs/business/*.md 2>/dev/null | wc -l)

Total Files: ${#md_files[@]}

Documentation Structure:
$(tree docs -I 'node_modules')
EOF

echo ""
echo "✅ Documentation consolidation complete!"
echo "All .md files have been organized in /docs/"
echo "Migration report saved to ./migration-output/documentation-migration.txt"