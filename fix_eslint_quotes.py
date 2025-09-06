#!/usr/bin/env python3
"""
Fix specific unescaped entity quotes flagged by ESLint
"""
import os
import re

def fix_file(filepath, line_numbers):
    """Fix specific lines in a file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        changed = False
        for line_num in line_numbers:
            if line_num <= len(lines):
                # Fix unescaped apostrophes and quotes in JSX text content
                line = lines[line_num - 1]  # Convert to 0-based
                original_line = line
                
                # Only fix quotes/apostrophes that are in JSX text content, not in strings or attributes
                # Look for patterns like >text with ' or " here<
                line = re.sub(r'(>[^<]*?)\bYou\'ll\b([^<]*?<)', r'\1You&apos;ll\2', line)
                line = re.sub(r'(>[^<]*?)\bWe\'re\b([^<]*?<)', r'\1We&apos;re\2', line)
                line = re.sub(r'(>[^<]*?)\bworld\'s\b([^<]*?<)', r'\1world&apos;s\2', line)
                line = re.sub(r'(>[^<]*?)\bcan\'t\b([^<]*?<)', r'\1can&apos;t\2', line)
                line = re.sub(r'(>[^<]*?)\bdon\'t\b([^<]*?<)', r'\1don&apos;t\2', line)
                line = re.sub(r'(>[^<]*?)\byou\'re\b([^<]*?<)', r'\1you&apos;re\2', line)
                line = re.sub(r'(>[^<]*?)\bit\'s\b([^<]*?<)', r'\1it&apos;s\2', line)
                line = re.sub(r'(>[^<]*?)\bI\'ll\b([^<]*?<)', r'\1I&apos;ll\2', line)
                line = re.sub(r'(>[^<]*?)\bwon\'t\b([^<]*?<)', r'\1won&apos;t\2', line)
                line = re.sub(r'(>[^<]*?)\bthey\'re\b([^<]*?<)', r'\1they&apos;re\2', line)
                line = re.sub(r'(>[^<]*?)\bthat\'s\b([^<]*?<)', r'\1that&apos;s\2', line)
                line = re.sub(r'(>[^<]*?)\bdidn\'t\b([^<]*?<)', r'\1didn&apos;t\2', line)
                line = re.sub(r'(>[^<]*?)\blet\'s\b([^<]*?<)', r'\1let&apos;s\2', line)
                
                # Fix quotes in JSX text
                line = re.sub(r'(>[^<]*?)"([^"<]*?)"([^<]*?<)', r'\1&quot;\2&quot;\3', line)
                
                if line != original_line:
                    lines[line_num - 1] = line
                    changed = True
                    print(f"Fixed line {line_num} in {filepath}")
        
        if changed:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.writelines(lines)
            return True
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False
    
    return False

def main():
    """Main function to fix specific ESLint errors"""
    
    # Define the files and line numbers that have errors
    eslint_errors = {
        'app/beta/feedback/page.tsx': [127, 348],
        'app/beta/page.tsx': [38, 73],
        'app/beta-signup/page.tsx': [86, 88, 93, 96, 292],
        'app/chat/page.tsx': [269],
        'components/voice/ShapingDebugPanel.tsx': [114, 130],
        'components/voice/VoiceControls.tsx': [85, 97],
        'components/voice/OracleVoiceExample.tsx': [110],
    }
    
    fixed_files = []
    
    print("🔧 Fixing specific ESLint unescaped entity errors...")
    
    for filepath, line_numbers in eslint_errors.items():
        full_path = f"/Volumes/T7 Shield/Projects/SpiralogicOracleSystem/{filepath}"
        if os.path.exists(full_path):
            if fix_file(full_path, line_numbers):
                fixed_files.append(filepath)
        else:
            print(f"File not found: {full_path}")
    
    print(f"\n✅ Fixed {len(fixed_files)} files")
    
    if fixed_files:
        print("\nFixed files:")
        for f in fixed_files:
            print(f"  - {f}")

if __name__ == "__main__":
    main()