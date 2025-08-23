#!/usr/bin/env python3

import os
import subprocess
import sys
from pathlib import Path

# Set working directory
os.chdir("/Volumes/T7 Shield/Projects/SpiralogicOracleSystem")

def run_command(cmd):
    """Run a command and return result"""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=300)
        return {
            'success': result.returncode == 0,
            'returncode': result.returncode,
            'stdout': result.stdout.strip() if result.stdout else '',
            'stderr': result.stderr.strip() if result.stderr else ''
        }
    except subprocess.TimeoutExpired:
        return {'success': False, 'error': 'Timeout after 5 minutes'}
    except Exception as e:
        return {'success': False, 'error': str(e)}

def check_file_sizes():
    """Check for files exceeding 600 LOC"""
    large_files = []
    ignore_dirs = {'node_modules', '.next', 'dist', 'build', '.vercel', '.git'}
    extensions = {'.ts', '.tsx'}
    
    try:
        for root, dirs, files in os.walk('.'):
            # Remove ignored directories
            dirs[:] = [d for d in dirs if d not in ignore_dirs]
            
            for file in files:
                if any(file.endswith(ext) for ext in extensions):
                    file_path = os.path.join(root, file)
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            lines = [line for line in f if line.strip()]
                            line_count = len(lines)
                            if line_count > 600:
                                large_files.append((file_path, line_count))
                    except (UnicodeDecodeError, PermissionError):
                        continue
    except Exception as e:
        return {'success': False, 'error': f'File size check failed: {e}'}
    
    if large_files:
        message = 'Files exceeding 600 LOC:\n' + '\n'.join(f' - {path} ({lines})' for path, lines in large_files)
        return {'success': False, 'message': message}
    else:
        return {'success': True, 'message': '✅ No files exceed 600 LOC.'}

def main():
    print("Running npm script checks...")
    
    scripts = [
        ('npm run doctor:size', 'File size check'),
        ('npm run doctor:deps:ci', 'Dependency validation'),
        ('npm run doctor:cycles', 'Circular dependency check'),
        ('npm run build', 'Build check')
    ]
    
    results = {}
    
    # Manual file size check first
    print("\n1. Manual file size check:")
    size_result = check_file_sizes()
    print(f"   Result: {'✓' if size_result['success'] else '✗'} {size_result.get('message', size_result.get('error', ''))}")
    
    # Run npm scripts
    for i, (script, description) in enumerate(scripts[1:], 2):  # Skip doctor:size since we did manual check
        print(f"\n{i}. {description} ({script}):")
        result = run_command(script)
        results[script] = result
        
        if result['success']:
            print(f"   Result: ✓ Success")
            if result['stdout']:
                print(f"   Output: {result['stdout'][:200]}{'...' if len(result['stdout']) > 200 else ''}")
        else:
            print(f"   Result: ✗ Failed (exit code: {result.get('returncode', 'unknown')})")
            if result.get('stderr'):
                print(f"   Error: {result['stderr'][:300]}{'...' if len(result['stderr']) > 300 else ''}")
            if result.get('stdout'):
                print(f"   Output: {result['stdout'][:300]}{'...' if len(result['stdout']) > 300 else ''}")
            if result.get('error'):
                print(f"   Error: {result['error']}")
    
    return results

if __name__ == "__main__":
    main()