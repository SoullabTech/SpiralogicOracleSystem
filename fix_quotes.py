#!/usr/bin/env python3
"""
Fix HTML entity quote escapes in TypeScript/JSX files
"""
import os
import re
import glob

def fix_quotes_in_file(filepath):
    """Fix HTML entity quotes in a single file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Fix HTML entity escapes
        content = content.replace('&apos;', "'")
        content = content.replace('&amp;apos;', "'")
        content = content.replace('&quot;', '"')
        content = content.replace('&amp;quot;', '"')
        
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False
    
    return False

def main():
    """Main function to fix quotes in all TypeScript/JSX files"""
    patterns = ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx']
    fixed_files = []
    
    print("🔧 Fixing HTML entity quotes in TypeScript/JSX files...")
    
    for pattern in patterns:
        for filepath in glob.glob(pattern, recursive=True):
            # Skip node_modules and .git directories
            if 'node_modules' in filepath or '.git' in filepath:
                continue
                
            if fix_quotes_in_file(filepath):
                fixed_files.append(filepath)
                print(f"Fixed: {filepath}")
    
    print(f"\n✅ Fixed {len(fixed_files)} files")
    
    if fixed_files:
        print("\nFixed files:")
        for f in fixed_files:
            print(f"  - {f}")

if __name__ == "__main__":
    main()