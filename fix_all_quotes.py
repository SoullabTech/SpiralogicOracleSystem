#!/usr/bin/env python3
"""
Fix all unescaped entity quotes in JSX/TSX files
"""
import os
import re
import subprocess

def fix_quotes_in_content(content):
    """Fix unescaped quotes in JSX/TSX content"""
    
    # Common contractions that need apostrophe escaping in JSX text content
    contractions = [
        r"\bWe're\b", r"\bYou're\b", r"\bI'm\b", r"\bIt's\b", r"\bThat's\b",
        r"\bWe'll\b", r"\bYou'll\b", r"\bI'll\b", r"\bThey'll\b", r"\bHe'll\b", r"\bShe'll\b",
        r"\bWon't\b", r"\bCan't\b", r"\bDon't\b", r"\bDidn't\b", r"\bHaven't\b", r"\bWasn't\b",
        r"\bAren't\b", r"\bIsn't\b", r"\bWouldn't\b", r"\bShouldn't\b", r"\bCouldn't\b",
        r"\bLet's\b", r"\bThere's\b", r"\bHere's\b", r"\bWhat's\b", r"\bWho's\b",
        r"\bworld's\b", r"\buser's\b", r"\bMaya's\b", r"\btoday's\b", r"\bsystem's\b"
    ]
    
    # Fix contractions in JSX text (between > and <)
    for contraction in contractions:
        # Replace apostrophe with HTML entity in JSX text content
        content = re.sub(
            f'(>[^<]*?){contraction}([^<]*?<)',
            lambda m: m.group(1) + re.sub(r"'", "&apos;", m.group(0)[len(m.group(1)):-len(m.group(2))]) + m.group(2),
            content,
            flags=re.IGNORECASE
        )
    
    # Fix standalone apostrophes in JSX text (but not in strings or attributes)
    # Look for patterns like >text with ' here< but avoid className='...' patterns
    content = re.sub(
        r'(>[^<]*?)([a-zA-Z])\'([a-zA-Z])([^<]*?<)',
        r"\1\2&apos;\3\4",
        content
    )
    
    # Fix quotes in JSX text content (but not in attributes)
    # Pattern: >text "quoted content" more text<
    content = re.sub(
        r'(>[^<]*?)"([^"<]+?)"([^<]*?<)',
        r'\1&quot;\2&quot;\3',
        content
    )
    
    return content

def fix_file(filepath):
    """Fix a single file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            original_content = f.read()
        
        fixed_content = fix_quotes_in_content(original_content)
        
        if fixed_content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(fixed_content)
            return True
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False
    
    return False

def get_files_with_errors():
    """Get list of files that have ESLint unescaped entity errors"""
    try:
        # Run the build command and capture ESLint errors
        result = subprocess.run(
            ['npm', 'run', 'build'],
            capture_output=True,
            text=True,
            cwd='/Volumes/T7 Shield/Projects/SpiralogicOracleSystem'
        )
        
        error_files = set()
        
        # Parse the output to find files with unescaped entity errors
        lines = result.stderr.split('\n') + result.stdout.split('\n')
        current_file = None
        
        for line in lines:
            # Look for file paths
            if line.startswith('./') and ('Error:' in line or 'Warning:' in line):
                current_file = line.split()[0].lstrip('./')
            elif 'can be escaped with' in line and current_file:
                error_files.add(current_file)
        
        return list(error_files)
    
    except Exception as e:
        print(f"Error getting files with errors: {e}")
        return []

def main():
    """Main function to fix all unescaped entity errors"""
    
    print("🔧 Finding files with ESLint unescaped entity errors...")
    
    # Get files with errors from ESLint output
    error_files = get_files_with_errors()
    
    if not error_files:
        print("No files with errors found. Scanning all TypeScript/JSX files...")
        # Fallback: scan all relevant files
        error_files = []
        for root, dirs, files in os.walk('/Volumes/T7 Shield/Projects/SpiralogicOracleSystem'):
            # Skip node_modules and .git
            dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', '.next', 'dist']]
            
            for file in files:
                if file.endswith(('.tsx', '.ts', '.jsx', '.js')):
                    filepath = os.path.join(root, file)
                    rel_path = os.path.relpath(filepath, '/Volumes/T7 Shield/Projects/SpiralogicOracleSystem')
                    error_files.append(rel_path)
    
    print(f"Found {len(error_files)} files to process...")
    
    fixed_count = 0
    
    for rel_path in error_files:
        full_path = os.path.join('/Volumes/T7 Shield/Projects/SpiralogicOracleSystem', rel_path)
        if os.path.exists(full_path):
            if fix_file(full_path):
                fixed_count += 1
                print(f"Fixed: {rel_path}")
        else:
            print(f"File not found: {full_path}")
    
    print(f"\n✅ Fixed {fixed_count} files")
    print("🧪 Testing build...")
    
    # Test the build
    try:
        result = subprocess.run(
            ['npm', 'run', 'build'],
            capture_output=True,
            text=True,
            cwd='/Volumes/T7 Shield/Projects/SpiralogicOracleSystem',
            timeout=300  # 5 minute timeout
        )
        
        if result.returncode == 0:
            print("✅ Build successful!")
        else:
            # Count remaining unescaped entity errors
            remaining_errors = result.stderr.count('can be escaped with') + result.stdout.count('can be escaped with')
            print(f"⚠️ Build completed with {remaining_errors} remaining unescaped entity errors")
            
    except subprocess.TimeoutExpired:
        print("⏱️ Build test timed out, but fixes have been applied")
    except Exception as e:
        print(f"Error testing build: {e}")

if __name__ == "__main__":
    main()