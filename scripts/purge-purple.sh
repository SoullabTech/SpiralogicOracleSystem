#!/bin/bash
# PURGE ALL PURPLE FROM SOULLAB
# Replace with AIN Amber colors

echo "🔥 PURGING PURPLE FROM SOULLAB..."

# Find all files with purple references
FILES=$(find . -name "*.tsx" -o -name "*.ts" -o -name "*.css" -o -name "*.jsx" | xargs grep -l "purple" | grep -v node_modules | grep -v ".next" | grep -v "purge-purple.sh")

for file in $FILES; do
    echo "Fixing: $file"

    # Create backup
    cp "$file" "$file.bak"

    # Replace all purple references with amber
    sed -i '' \
        -e 's/from-purple-950/from-black/g' \
        -e 's/to-purple-950/to-\[#1a1f3a\]/g' \
        -e 's/via-purple-900/via-amber-900/g' \
        -e 's/from-purple-900/from-amber-900/g' \
        -e 's/to-purple-900/to-amber-900/g' \
        -e 's/bg-purple-900/bg-amber-900/g' \
        -e 's/text-purple-900/text-amber-900/g' \
        -e 's/border-purple-900/border-amber-900/g' \
        -e 's/from-purple-800/from-amber-800/g' \
        -e 's/to-purple-800/to-amber-800/g' \
        -e 's/bg-purple-800/bg-amber-800/g' \
        -e 's/text-purple-800/text-amber-800/g' \
        -e 's/border-purple-800/border-amber-800/g' \
        -e 's/from-purple-700/from-amber-700/g' \
        -e 's/to-purple-700/to-amber-700/g' \
        -e 's/bg-purple-700/bg-amber-700/g' \
        -e 's/text-purple-700/text-amber-700/g' \
        -e 's/border-purple-700/border-amber-700/g' \
        -e 's/from-purple-600/from-amber-600/g' \
        -e 's/to-purple-600/to-amber-600/g' \
        -e 's/bg-purple-600/bg-amber-600/g' \
        -e 's/text-purple-600/text-amber-600/g' \
        -e 's/border-purple-600/border-amber-600/g' \
        -e 's/from-purple-500/from-amber-500/g' \
        -e 's/to-purple-500/to-amber-500/g' \
        -e 's/bg-purple-500/bg-amber-500/g' \
        -e 's/text-purple-500/text-amber-500/g' \
        -e 's/border-purple-500/border-amber-500/g' \
        -e 's/from-purple-400/from-amber-400/g' \
        -e 's/to-purple-400/to-amber-400/g' \
        -e 's/bg-purple-400/bg-amber-400/g' \
        -e 's/text-purple-400/text-amber-400/g' \
        -e 's/border-purple-400/border-amber-400/g' \
        -e 's/from-purple-300/from-amber-300/g' \
        -e 's/to-purple-300/to-amber-300/g' \
        -e 's/bg-purple-300/bg-amber-300/g' \
        -e 's/text-purple-300/text-amber-300/g' \
        -e 's/border-purple-300/border-amber-300/g' \
        -e 's/from-purple-200/from-amber-200/g' \
        -e 's/to-purple-200/to-amber-200/g' \
        -e 's/bg-purple-200/bg-amber-200/g' \
        -e 's/text-purple-200/text-amber-200/g' \
        -e 's/border-purple-200/border-amber-200/g' \
        -e 's/from-purple-100/from-amber-100/g' \
        -e 's/to-purple-100/to-amber-100/g' \
        -e 's/bg-purple-100/bg-amber-100/g' \
        -e 's/text-purple-100/text-amber-100/g' \
        -e 's/border-purple-100/border-amber-100/g' \
        -e 's/from-purple-50/from-amber-50/g' \
        -e 's/to-purple-50/to-amber-50/g' \
        -e 's/bg-purple-50/bg-amber-50/g' \
        -e 's/text-purple-50/text-amber-50/g' \
        -e 's/border-purple-50/border-amber-50/g' \
        -e 's/hover:bg-purple/hover:bg-amber/g' \
        -e 's/hover:text-purple/hover:text-amber/g' \
        -e 's/hover:border-purple/hover:border-amber/g' \
        -e 's/focus:ring-purple/focus:ring-amber/g' \
        -e 's/focus:border-purple/focus:border-amber/g' \
        -e 's/ring-purple/ring-amber/g' \
        -e 's/divide-purple/divide-amber/g' \
        -e 's/placeholder-purple/placeholder-amber/g' \
        -e 's/decoration-purple/decoration-amber/g' \
        -e 's/outline-purple/outline-amber/g' \
        -e 's/shadow-purple/shadow-amber/g' \
        -e 's/accent-purple/accent-amber/g' \
        -e 's/caret-purple/caret-amber/g' \
        -e 's/fill-purple/fill-amber/g' \
        -e 's/stroke-purple/stroke-amber/g' \
        "$file"

    # Remove backup if successful
    if [ $? -eq 0 ]; then
        rm "$file.bak"
        echo "✅ Fixed: $file"
    else
        mv "$file.bak" "$file"
        echo "❌ Failed to fix: $file"
    fi
done

echo ""
echo "🎨 PURPLE PURGE COMPLETE!"
echo "✨ AIN Amber is now the way"