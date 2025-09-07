#!/usr/bin/env python3

import os
import re
import glob

def fix_code_quotes(content):
    """
    Emergency fix for code syntax quotes that were incorrectly escaped.
    Only fixes quotes in code contexts that break syntax, preserves JSX text content escaping.
    """
    
    # Fix className attributes where &quot; should be "
    content = re.sub(r'className=&quot;([^&]*?)&quot;', r'className="\1"', content)
    
    # Fix other HTML attributes with &quot;
    content = re.sub(r'(\w+)=&quot;([^&]*?)&quot;', r'\1="\2"', content)
    
    # Fix object property quotes that got escaped
    content = re.sub(r'&quot;(\w+)&quot;:', r'"\1":', content)
    
    # Fix import/require statements
    content = re.sub(r"(import.*?from\s+)&quot;([^&]*?)&quot;", r'\1"\2"', content)
    content = re.sub(r"(require\()&quot;([^&]*?)&quot;", r'\1"\2"', content)
    
    # Fix string literals in variable assignments
    content = re.sub(r"(=\s*)&quot;([^&]*?)&quot;", r'\1"\2"', content)
    
    # Fix console.log and similar function calls
    content = re.sub(r"(console\.\w+\()&quot;([^&]*?)&quot;", r'\1"\2"', content)
    
    # Fix template literal syntax if it got broken
    content = re.sub(r'&quot;([^&]*?)\$\{', r'"\1${', content)
    
    return content

def fix_file(file_path):
    """Fix quotes in a single file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            original_content = f.read()
        
        fixed_content = fix_code_quotes(original_content)
        
        if fixed_content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(fixed_content)
            print(f"Fixed quotes in: {file_path}")
            return True
        return False
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    # Focus on the known problematic files first
    problematic_files = [
        "/Volumes/T7 Shield/Projects/SpiralogicOracleSystem/components/chat/BetaMinimalMirror.tsx"
    ]
    
    files_fixed = 0
    
    # Fix known problematic files first
    for file_path in problematic_files:
        if os.path.exists(file_path):
            if fix_file(file_path):
                files_fixed += 1
    
    # Then scan for other TypeScript/JavaScript files with quote issues
    patterns = [
        "/Volumes/T7 Shield/Projects/SpiralogicOracleSystem/**/*.tsx",
        "/Volumes/T7 Shield/Projects/SpiralogicOracleSystem/**/*.ts", 
        "/Volumes/T7 Shield/Projects/SpiralogicOracleSystem/**/*.jsx",
        "/Volumes/T7 Shield/Projects/SpiralogicOracleSystem/**/*.js"
    ]
    
    for pattern in patterns:
        for file_path in glob.glob(pattern, recursive=True):
            # Skip node_modules and other build directories
            if any(skip in file_path for skip in ['node_modules', '.next', 'dist', '.git']):
                continue
                
            # Only process files that likely have quote issues
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    if '&quot;' in content:
                        if fix_file(file_path):
                            files_fixed += 1
            except:
                continue
    
    print(f"\nEmergency fix completed: {files_fixed} files fixed")

if __name__ == "__main__":
    main()