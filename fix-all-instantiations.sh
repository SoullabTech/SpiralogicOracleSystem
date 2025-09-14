#!/bin/bash

# Script to find all module-level instantiations that need fixing
echo "Finding all files with module-level instantiations..."

# Find all TypeScript files with problematic patterns
find lib -name "*.ts" -exec grep -l "export const .* = new" {} \; 2>/dev/null | sort > files-to-fix.txt

echo "Found $(wc -l < files-to-fix.txt) files with module-level instantiations:"
cat files-to-fix.txt

echo ""
echo "These files need to be converted to lazy-loading pattern:"
echo "export const x = new Class() → let _x; export const getX = () => { if (!_x) _x = new Class(); return _x; }"