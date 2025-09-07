#!/bin/bash

# Sacred Tech Theme Migration Script
# This script helps migrate from purple/gradient theme to Sacred Tech (cosmic navy + gold)

echo "🔮 Sacred Tech Theme Migration Starting..."
echo "========================================="

# Color mapping
declare -A color_map=(
  # Purple to Sacred Navy
  ["bg-purple-50"]="bg-gold-divine/5"
  ["bg-purple-100"]="bg-sacred-blue/20"
  ["bg-purple-200"]="bg-sacred-blue/30"
  ["bg-purple-300"]="bg-sacred-blue/40"
  ["bg-purple-400"]="bg-sacred-blue/50"
  ["bg-purple-500"]="bg-sacred-navy"
  ["bg-purple-600"]="bg-sacred-navy"
  ["bg-purple-700"]="bg-sacred-cosmic"
  ["bg-purple-800"]="bg-sacred-cosmic"
  ["bg-purple-900"]="bg-sacred-cosmic"
  
  # Text colors
  ["text-purple-100"]="text-gold-whisper"
  ["text-purple-200"]="text-gold-amber"
  ["text-purple-300"]="text-gold-amber"
  ["text-purple-400"]="text-gold-divine"
  ["text-purple-500"]="text-gold-divine"
  ["text-purple-600"]="text-gold-divine"
  ["text-purple-700"]="text-gold-divine"
  ["text-purple-800"]="text-gold-divine"
  ["text-purple-900"]="text-gold-divine"
  
  # Border colors
  ["border-purple-200"]="border-gold-divine/20"
  ["border-purple-300"]="border-gold-divine/30"
  ["border-purple-400"]="border-gold-divine/40"
  ["border-purple-500"]="border-gold-divine/50"
  ["border-purple-600"]="border-gold-divine/60"
  
  # Gradients to solid backgrounds
  ["from-purple-50"]="bg-sacred-cosmic"
  ["from-purple-500"]="bg-sacred-cosmic"
  ["from-purple-600"]="bg-sacred-cosmic"
  ["from-purple-900"]="bg-sacred-cosmic"
  ["to-purple-500"]="bg-sacred-cosmic"
  ["to-purple-600"]="bg-sacred-cosmic"
  ["to-purple-900"]="bg-sacred-cosmic"
  ["via-purple-900"]="bg-sacred-cosmic"
  
  # Orange to Gold
  ["from-orange-500"]="bg-gold-divine"
  ["to-orange-500"]="bg-gold-divine"
  ["text-orange-500"]="text-gold-divine"
  ["bg-orange-500"]="bg-gold-divine"
  
  # Slate updates
  ["from-slate-900"]="bg-sacred-cosmic"
  ["to-slate-900"]="bg-sacred-cosmic"
  ["bg-slate-800"]="bg-sacred-navy"
  ["bg-slate-900"]="bg-sacred-cosmic"
)

# Function to replace colors in a file
replace_colors() {
  local file=$1
  echo "  Processing: $file"
  
  # Create backup
  cp "$file" "${file}.backup"
  
  # Replace each color mapping
  for old_class in "${!color_map[@]}"; do
    new_class="${color_map[$old_class]}"
    sed -i '' "s/\b${old_class}\b/${new_class}/g" "$file"
  done
  
  # Remove gradient utilities
  sed -i '' 's/bg-gradient-[^ "'\'']*//g' "$file"
  
  # Update button classes
  sed -i '' 's/className="\([^"]*\)btn-primary/className="\1sacred-button/g' "$file"
  sed -i '' 's/className="\([^"]*\)btn-secondary/className="\1sacred-button-secondary/g' "$file"
}

# Find all TypeScript/JavaScript files
echo "Finding all component files..."
files=$(find . -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) \
  -not -path "./node_modules/*" \
  -not -path "./.next/*" \
  -not -path "./dist/*" \
  -not -path "./scripts/*")

total=$(echo "$files" | wc -l)
current=0

echo "Found $total files to process"
echo ""

# Process each file
for file in $files; do
  ((current++))
  printf "\r[%d/%d] Processing files..." "$current" "$total"
  
  # Check if file contains purple or gradient classes
  if grep -q -E "(purple|gradient|from-|to-|via-)" "$file" 2>/dev/null; then
    replace_colors "$file"
  fi
done

echo ""
echo ""
echo "✅ Migration complete!"
echo ""
echo "Next steps:"
echo "1. Review the changes with: git diff"
echo "2. Test your application thoroughly"
echo "3. Restore any files if needed: find . -name '*.backup' -type f"
echo "4. Clean up backup files when done: find . -name '*.backup' -type f -delete"
echo ""
echo "🌟 Welcome to the Sacred Tech aesthetic!"